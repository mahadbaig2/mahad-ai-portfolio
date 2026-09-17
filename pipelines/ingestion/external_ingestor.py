"""External source ingestor — GitHub API, Medium RSS, CV PDF, generic web pages.

Fetches content from external sources and normalizes it into the same
NormalizedDocument format used by Sanity ingestion. All runs are idempotent:
content is re-indexed only when it has changed (SHA-256 hash comparison).

Supports:
  - github_profile : GitHub REST API — profile bio, repos, READMEs
  - medium_rss     : Medium RSS feed — full article content
  - sanity_cv_pdf  : CV PDF asset from Sanity siteSettings.resumePdf
  - web_page       : Generic HTML page with boilerplate stripping

Usage:
    from pipelines.ingestion.external_ingestor import ExternalIngestor
    ingestor = ExternalIngestor()
    documents = ingestor.fetch_all()
"""

import hashlib
import io
import logging
import re
import time
from typing import Any

import feedparser
import httpx
from bs4 import BeautifulSoup

from apps.api.core.config import get_settings
from pipelines.ingestion.contracts import DocumentSection, NormalizedDocument, SectionType

logger = logging.getLogger("ingestion.external")

# Timeout for all external HTTP requests
_HTTP_TIMEOUT = 20.0

# GitHub API base
_GITHUB_API = "https://api.github.com"

# Tags that contain boilerplate on most pages (nav, footer, ads, etc.)
_BOILERPLATE_TAGS = {"nav", "footer", "header", "aside", "script", "style", "noscript", "form"}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _clean_html(html: str, url: str = "") -> str:
    """Strip HTML boilerplate and return readable prose text."""
    soup = BeautifulSoup(html, "lxml")

    for tag in soup(_BOILERPLATE_TAGS):
        tag.decompose()

    # Remove hidden elements
    for tag in soup.find_all(attrs={"aria-hidden": "true"}):
        tag.decompose()

    text = soup.get_text(separator="\n", strip=True)
    # Collapse excessive blank lines
    text = re.sub(r"\n{3,}", "\n\n", text).strip()
    return text


def _content_hash(source_id: str, text: str) -> str:
    payload = f"{source_id}::{text}"
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


def _make_doc(
    source_id: str,
    title: str,
    canonical_url: str,
    sections: list[DocumentSection],
    source_type: str,
    label: str,
    extra_metadata: dict[str, Any] | None = None,
) -> NormalizedDocument:
    """Assemble a NormalizedDocument from external source sections."""
    raw_text = "\n\n".join(
        f"## {s.heading}\n{s.content}" if s.heading and s.heading != title else s.content
        for s in sections
    ).strip()

    content_hash = _content_hash(source_id, raw_text)

    metadata: dict[str, Any] = {
        "source": "external",
        "source_type": source_type,
        "label": label,
        **(extra_metadata or {}),
    }

    return NormalizedDocument(
        sanity_id=source_id,
        document_type=f"external_{source_type}",
        title=title,
        slug=None,
        canonical_url=canonical_url,
        language="en",
        rag_enabled=True,
        target_audiences=["general", "recruiter", "engineer", "founder"],
        content_hash=content_hash,
        raw_text=raw_text,
        sections=sections,
        metadata=metadata,
    )


# ---------------------------------------------------------------------------
# GitHub ingestor
# ---------------------------------------------------------------------------

def _fetch_github_profile(username: str, label: str) -> list[NormalizedDocument]:
    """Fetch GitHub profile bio, all public repos, and each repo's README."""
    docs: list[NormalizedDocument] = []

    headers = {"Accept": "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28"}

    with httpx.Client(timeout=_HTTP_TIMEOUT, headers=headers) as client:
        # 1. Profile
        try:
            profile_resp = client.get(f"{_GITHUB_API}/users/{username}")
            profile_resp.raise_for_status()
            profile = profile_resp.json()

            bio = profile.get("bio") or ""
            name = profile.get("name") or username
            company = profile.get("company") or ""
            location = profile.get("location") or ""
            blog = profile.get("blog") or ""
            public_repos = profile.get("public_repos", 0)
            followers = profile.get("followers", 0)

            profile_text = f"Name: {name}\n"
            if bio:
                profile_text += f"Bio: {bio}\n"
            if company:
                profile_text += f"Company: {company}\n"
            if location:
                profile_text += f"Location: {location}\n"
            if blog:
                profile_text += f"Website: {blog}\n"
            profile_text += f"Public Repositories: {public_repos}\nFollowers: {followers}"

            docs.append(_make_doc(
                source_id=f"github_profile_{username}",
                title=f"GitHub Profile — {name}",
                canonical_url=f"https://github.com/{username}",
                sections=[DocumentSection(
                    heading=f"GitHub Profile — {name}",
                    heading_level=1,
                    heading_path=[f"GitHub Profile — {name}"],
                    content=profile_text,
                    section_type=SectionType.PROSE,
                )],
                source_type="github_profile",
                label=label,
            ))
            logger.info("GitHub profile fetched for %s", username)
        except Exception as e:
            logger.warning("Failed to fetch GitHub profile for %s: %s", username, e)

        # 2. Profile README (special repo: username/username)
        try:
            readme_resp = client.get(
                f"{_GITHUB_API}/repos/{username}/{username}/readme",
                headers={**headers, "Accept": "application/vnd.github.raw+json"},
            )
            if readme_resp.status_code == 200:
                readme_text = readme_resp.text.strip()
                if readme_text:
                    docs.append(_make_doc(
                        source_id=f"github_profile_readme_{username}",
                        title=f"GitHub Profile README — {username}",
                        canonical_url=f"https://github.com/{username}",
                        sections=[DocumentSection(
                            heading="GitHub Profile README",
                            heading_level=1,
                            heading_path=["GitHub Profile README"],
                            content=readme_text,
                            section_type=SectionType.PROSE,
                        )],
                        source_type="github_profile",
                        label=f"{label} — Profile README",
                    ))
        except Exception as e:
            logger.debug("No profile README for %s: %s", username, e)

        # 3. All public repos — metadata + README
        try:
            page = 1
            all_repos: list[dict[str, Any]] = []
            while True:
                repos_resp = client.get(
                    f"{_GITHUB_API}/users/{username}/repos",
                    params={"type": "owner", "sort": "updated", "per_page": 100, "page": page},
                )
                repos_resp.raise_for_status()
                batch = repos_resp.json()
                if not batch:
                    break
                all_repos.extend(batch)
                page += 1
                if len(batch) < 100:
                    break

            logger.info("Found %d public repos for %s", len(all_repos), username)

            for repo in all_repos:
                repo_name = repo.get("name", "")
                repo_desc = repo.get("description") or ""
                repo_url = repo.get("html_url", "")
                topics = repo.get("topics") or []
                language = repo.get("language") or ""
                stars = repo.get("stargazers_count", 0)
                is_fork = repo.get("fork", False)

                # Build repo summary section
                repo_summary = f"Repository: {repo_name}\n"
                if repo_desc:
                    repo_summary += f"Description: {repo_desc}\n"
                if language:
                    repo_summary += f"Primary Language: {language}\n"
                if topics:
                    repo_summary += f"Topics: {', '.join(topics)}\n"
                repo_summary += f"Stars: {stars}\nFork: {is_fork}"

                sections = [DocumentSection(
                    heading=f"GitHub Repository — {repo_name}",
                    heading_level=1,
                    heading_path=[f"GitHub Repository — {repo_name}"],
                    content=repo_summary,
                    section_type=SectionType.PROSE,
                )]

                # Fetch README for each repo
                try:
                    time.sleep(0.1)  # be polite to GitHub API rate limits
                    readme_resp = client.get(
                        f"{_GITHUB_API}/repos/{username}/{repo_name}/readme",
                        headers={**headers, "Accept": "application/vnd.github.raw+json"},
                    )
                    if readme_resp.status_code == 200:
                        readme_md = readme_resp.text.strip()
                        if readme_md and len(readme_md) > 50:
                            sections.append(DocumentSection(
                                heading="README",
                                heading_level=2,
                                heading_path=[f"GitHub Repository — {repo_name}", "README"],
                                content=readme_md[:8000],  # cap at 8K chars per README
                                section_type=SectionType.PROSE,
                            ))
                except Exception:
                    pass

                docs.append(_make_doc(
                    source_id=f"github_repo_{username}_{repo_name}",
                    title=f"GitHub Repository — {repo_name}",
                    canonical_url=repo_url or f"https://github.com/{username}/{repo_name}",
                    sections=sections,
                    source_type="github_repo",
                    label=f"GitHub — {repo_name}",
                    extra_metadata={
                        "repo": repo_name,
                        "language": language,
                        "stars": stars,
                        "topics": topics,
                    },
                ))

        except Exception as e:
            logger.warning("Failed to fetch GitHub repos for %s: %s", username, e)

    return docs


# ---------------------------------------------------------------------------
# Medium RSS ingestor
# ---------------------------------------------------------------------------

def _fetch_medium_rss(feed_url: str, label: str) -> list[NormalizedDocument]:
    """Fetch all Medium articles from an RSS/Atom feed with full content."""
    docs: list[NormalizedDocument] = []

    try:
        feed = feedparser.parse(feed_url)
        entries = feed.get("entries", [])
        logger.info("Medium RSS: found %d articles from %s", len(entries), feed_url)

        for entry in entries:
            title = entry.get("title", "Untitled Article")
            link = entry.get("link", "")
            published = entry.get("published", "")
            tags = [t.get("term", "") for t in entry.get("tags", [])]

            # feedparser exposes full content in entry.content[0].value for Medium
            content_html = ""
            if entry.get("content"):
                content_html = entry["content"][0].get("value", "")
            elif entry.get("summary"):
                content_html = entry["summary"]

            # Strip HTML to readable prose
            article_text = _clean_html(content_html) if content_html else ""

            if not article_text or len(article_text) < 100:
                logger.debug("Skipping short Medium article: %s", title)
                continue

            sections = [
                DocumentSection(
                    heading=title,
                    heading_level=1,
                    heading_path=[title],
                    content=article_text,
                    section_type=SectionType.PROSE,
                )
            ]

            article_id = hashlib.md5(link.encode()).hexdigest()[:16]
            docs.append(_make_doc(
                source_id=f"medium_article_{article_id}",
                title=title,
                canonical_url=link,
                sections=sections,
                source_type="medium_rss",
                label=label,
                extra_metadata={
                    "published": published,
                    "tags": tags,
                },
            ))
            logger.info("Medium article indexed: %s", title)

    except Exception as e:
        logger.error("Failed to fetch Medium RSS from %s: %s", feed_url, e)

    return docs


# ---------------------------------------------------------------------------
# Sanity CV PDF ingestor
# ---------------------------------------------------------------------------

def _fetch_sanity_cv_pdf(label: str) -> list[NormalizedDocument]:
    """Fetch the CV PDF from Sanity siteSettings.resumePdf and extract text."""
    try:
        from pypdf import PdfReader
    except ImportError:
        logger.error("pypdf not installed — cannot extract CV PDF. Run: pip install pypdf")
        return []

    settings = get_settings()
    extractor_url = (
        f"https://{settings.SANITY_PROJECT_ID}.api.sanity.io"
        f"/v2024-03-01/data/query/{settings.SANITY_DATASET}"
    )

    headers: dict[str, str] = {"Content-Type": "application/json"}
    if settings.SANITY_API_READ_TOKEN:
        headers["Authorization"] = f"Bearer {settings.SANITY_API_READ_TOKEN}"

    try:
        with httpx.Client(timeout=30.0) as client:
            # Fetch resumePdf asset URL from siteSettings
            resp = client.get(
                extractor_url,
                headers=headers,
                params={"query": '*[_type == "siteSettings"][0]{resumePdf{asset->{url}}}'},
            )
            resp.raise_for_status()
            data = resp.json()
            result = data.get("result", {})
            pdf_url = (
                result.get("resumePdf", {})
                .get("asset", {})
                .get("url", "")
            )

            if not pdf_url:
                logger.warning("No CV PDF found in Sanity siteSettings.resumePdf")
                return []

            logger.info("Fetching CV PDF from Sanity CDN: %s", pdf_url)
            pdf_resp = client.get(pdf_url, headers=headers)
            pdf_resp.raise_for_status()
            pdf_bytes = pdf_resp.content

    except Exception as e:
        logger.error("Failed to fetch CV PDF from Sanity: %s", e)
        return []

    # Extract text page by page
    try:
        reader = PdfReader(io.BytesIO(pdf_bytes))
        sections: list[DocumentSection] = []

        for i, page in enumerate(reader.pages, start=1):
            page_text = page.extract_text() or ""
            page_text = page_text.strip()
            if page_text and len(page_text) > 20:
                sections.append(DocumentSection(
                    heading=f"CV Page {i}",
                    heading_level=2,
                    heading_path=["Curriculum Vitae", f"Page {i}"],
                    content=page_text,
                    section_type=SectionType.PROSE,
                ))

        if not sections:
            logger.warning("CV PDF extracted but contained no readable text")
            return []

        logger.info("CV PDF extracted: %d pages", len(sections))
        return [_make_doc(
            source_id="sanity_cv_pdf",
            title="Curriculum Vitae — Mahad Baig",
            canonical_url="/contact",
            sections=sections,
            source_type="sanity_cv_pdf",
            label=label,
        )]

    except Exception as e:
        logger.error("Failed to parse CV PDF: %s", e)
        return []


# ---------------------------------------------------------------------------
# Generic web page ingestor
# ---------------------------------------------------------------------------

def _fetch_web_page(url: str, label: str) -> list[NormalizedDocument]:
    """Fetch a generic HTML page, strip boilerplate, and index prose."""
    try:
        with httpx.Client(timeout=_HTTP_TIMEOUT, follow_redirects=True) as client:
            resp = client.get(url, headers={"User-Agent": "Mahad-Portfolio-RAG-Bot/1.0"})
            resp.raise_for_status()
            text = _clean_html(resp.text, url=url)

        if not text or len(text) < 100:
            logger.warning("Web page at %s yielded no useful text", url)
            return []

        page_id = hashlib.md5(url.encode()).hexdigest()[:16]
        return [_make_doc(
            source_id=f"web_page_{page_id}",
            title=label,
            canonical_url=url,
            sections=[DocumentSection(
                heading=label,
                heading_level=1,
                heading_path=[label],
                content=text[:12000],  # cap at 12K chars
                section_type=SectionType.PROSE,
            )],
            source_type="web_page",
            label=label,
        )]
    except Exception as e:
        logger.error("Failed to fetch web page %s: %s", url, e)
        return []


# ---------------------------------------------------------------------------
# Main entrypoint
# ---------------------------------------------------------------------------

class ExternalIngestor:
    """Orchestrates fetching and normalization from all configured external sources."""

    def fetch_all(
        self, sources: list[dict[str, Any]] | None = None
    ) -> list[NormalizedDocument]:
        """Fetch and normalize all external sources. Returns list of NormalizedDocuments."""
        from pipelines.ingestion.external_sources import EXTERNAL_SOURCES

        source_list = sources or EXTERNAL_SOURCES
        all_docs: list[NormalizedDocument] = []

        for source in source_list:
            stype = source.get("type", "")
            label = source.get("label", stype)

            logger.info("Processing external source: %s (%s)", label, stype)

            try:
                if stype == "github_profile":
                    docs = _fetch_github_profile(
                        username=source["username"],
                        label=label,
                    )
                elif stype == "medium_rss":
                    docs = _fetch_medium_rss(
                        feed_url=source["url"],
                        label=label,
                    )
                elif stype == "sanity_cv_pdf":
                    docs = _fetch_sanity_cv_pdf(label=label)
                elif stype == "web_page":
                    docs = _fetch_web_page(
                        url=source["url"],
                        label=label,
                    )
                else:
                    logger.warning("Unknown external source type: %s — skipping", stype)
                    docs = []

                all_docs.extend(docs)
                logger.info("Source '%s' produced %d documents", label, len(docs))

            except Exception as e:
                logger.error("Unhandled error fetching source '%s': %s", label, e, exc_info=True)

        logger.info("External ingestor complete: %d total documents", len(all_docs))
        return all_docs
