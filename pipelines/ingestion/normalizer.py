"""Whitespace, Unicode, and text normalization with deterministic hashing (P4.1.5 & P4.1.6)."""

import hashlib
import json
import re
import unicodedata
from typing import Any

from pipelines.ingestion.contracts import (
    DocumentSection,
    NormalizedDocument,
    SectionType,
)
from pipelines.ingestion.portable_text import parse_portable_text

# Invisible / zero-width characters to strip
ZERO_WIDTH_CHARS = re.compile(r"[\u200B\u200C\u200D\u200E\u200F\uFEFF]")


def normalize_unicode(text: str) -> str:
    """Standardize Unicode representation using NFC to preserve Urdu and Arabic scripts."""
    if not text:
        return ""
    # NFC preserves Urdu/Arabic letterforms and diacritics
    normalized = unicodedata.normalize("NFC", text)
    # Strip zero-width and directional control characters
    return ZERO_WIDTH_CHARS.sub("", normalized)


def normalize_whitespace(text: str) -> str:
    """Normalize whitespace and line endings without damaging code blocks or list indentation."""
    if not text:
        return ""

    # Normalize CRLF to LF
    text = text.replace("\r\n", "\n").replace("\r", "\n")

    lines: list[str] = []
    in_code_block = False

    for line in text.split("\n"):
        stripped_line = line.strip()
        if stripped_line.startswith("```"):
            in_code_block = not in_code_block
            lines.append(line.rstrip())
            continue

        if in_code_block:
            lines.append(line.rstrip())
        else:
            # Preserve leading indentation for lists (2 or 4 spaces), trim trailing
            leading_spaces_len = len(line) - len(line.lstrip(" "))
            indent = " " * min(leading_spaces_len, 8)
            cleaned_line = indent + re.sub(r"[ \t]+", " ", line.strip())
            lines.append(cleaned_line)

    result = "\n".join(lines)
    # Collapse 3 or more consecutive newlines into 2
    result = re.sub(r"\n{3,}", "\n\n", result)
    return result.strip()


def compute_content_hash(
    sanity_id: str,
    document_type: str,
    title: str,
    slug: str | None,
    canonical_url: str,
    language: str,
    rag_enabled: bool,
    target_audiences: list[str],
    text_content: str,
    extra_metadata: dict[str, Any] | None = None,
) -> str:
    """P4.1.6: Compute a deterministic SHA-256 hash over canonical document fields."""
    payload = {
        "sanity_id": sanity_id,
        "document_type": document_type,
        "title": title.strip(),
        "slug": slug.strip() if slug else None,
        "canonical_url": canonical_url.strip(),
        "language": language.strip(),
        "rag_enabled": rag_enabled,
        "target_audiences": sorted(target_audiences),
        "text_content": text_content.strip(),
        "metadata": json.dumps(extra_metadata or {}, sort_keys=True),
    }

    serialized = json.dumps(payload, sort_keys=True, ensure_ascii=False)
    return hashlib.sha256(serialized.encode("utf-8")).hexdigest()


def derive_canonical_url(doc_type: str, slug: str | None) -> str:
    """Map Sanity document type and slug to public website route."""
    slug_part = slug.strip("/") if slug else ""

    if doc_type in ("project", "caseStudy"):
        return f"/work/{slug_part}" if slug_part else "/work"
    if doc_type == "article":
        return f"/blog/{slug_part}" if slug_part else "/blog"
    if doc_type in ("experience", "education", "skill", "personalStory"):
        return f"/about#{slug_part or doc_type}"
    if doc_type == "faq":
        return "/faq"
    if doc_type == "architectureDecision":
        return f"/architecture/{slug_part}" if slug_part else "/architecture"
    if doc_type == "styleExample":
        return "/engineering"
    if doc_type == "additionalContext":
        return "/about#context"

    return f"/{slug_part}" if slug_part else "/"


def normalize_sanity_document(raw_doc: dict[str, Any]) -> NormalizedDocument:
    """Convert a raw Sanity document dictionary into a validated NormalizedDocument."""
    sanity_id = str(raw_doc.get("_id", ""))
    doc_type = str(raw_doc.get("_type", ""))
    if doc_type == "experience":
        role = raw_doc.get("role", "")
        company = raw_doc.get("company", "")
        raw_title = f"{role} at {company}".strip(" at ") or raw_doc.get("title", "")
    elif doc_type == "education":
        degree = raw_doc.get("degree", "")
        institution = raw_doc.get("institution", "")
        raw_title = f"{degree} - {institution}".strip(" - ") or raw_doc.get("title", "")
    else:
        raw_title = str(raw_doc.get("title") or raw_doc.get("name") or raw_doc.get("question") or "")
    title = normalize_whitespace(normalize_unicode(raw_title))

    # Extract slug
    raw_slug = raw_doc.get("slug")
    slug: str | None = None
    if isinstance(raw_slug, dict):
        slug = raw_slug.get("current")
    elif isinstance(raw_slug, str):
        slug = raw_slug

    canonical_url = derive_canonical_url(doc_type, slug)

    # RAG metadata fields
    rag_metadata = raw_doc.get("ragMetadata") or {}
    if not isinstance(rag_metadata, dict):
        rag_metadata = {}

    rag_enabled = bool(
        raw_doc.get("ragEnabled", rag_metadata.get("ragEnabled", True))
    )
    target_audiences = (
        raw_doc.get("targetAudiences")
        or rag_metadata.get("targetAudiences")
        or ["general"]
    )
    if not isinstance(target_audiences, list):
        target_audiences = [str(target_audiences)]

    language = str(
        raw_doc.get("language")
        or rag_metadata.get("language")
        or "en"
    )

    # Extract structured sections
    sections: list[DocumentSection] = []

    # 1. Summary / Description / Overview if present
    summary = (
        raw_doc.get("summary")
        or raw_doc.get("description")
        or raw_doc.get("shortSummary")
        or raw_doc.get("overview")
        or ""
    )
    if summary and isinstance(summary, str):

        clean_summary = normalize_whitespace(normalize_unicode(summary))
        sections.append(
            DocumentSection(
                heading=title,
                heading_level=1,
                heading_path=[title],
                content=clean_summary,
                section_type=SectionType.PROSE,
            )
        )

    # 2. Rich Body / Content (Portable Text)
    body = raw_doc.get("body") or raw_doc.get("content") or raw_doc.get("answer")
    # additionalContext uses contextText as its primary body field
    if doc_type == "additionalContext" and not body:
        body = raw_doc.get("contextText", "")
    if isinstance(body, list):
        parsed_sections = parse_portable_text(body, document_title=title)
        for sec in parsed_sections:
            sec.content = normalize_whitespace(normalize_unicode(sec.content))
            sections.append(sec)
    elif isinstance(body, str) and body.strip():
        sections.append(
            DocumentSection(
                heading=title,
                heading_level=1,
                heading_path=[title],
                content=normalize_whitespace(normalize_unicode(body)),
                section_type=SectionType.PROSE,
            )
        )

    # 3. Handle schema-specific structured fields
    if doc_type == "project" or doc_type == "caseStudy":
        # Metrics, stack, outcome
        metrics = raw_doc.get("metrics") or []
        if isinstance(metrics, list) and metrics:
            metric_lines = []
            for m in metrics:
                if isinstance(m, dict):
                    label = m.get("label", "")
                    val = m.get("value", "")
                    metric_lines.append(f"- **{label}**: {val}")
                elif isinstance(m, str):
                    metric_lines.append(f"- {m}")
            if metric_lines:
                sections.append(
                    DocumentSection(
                        heading="Key Metrics & Impact",
                        heading_level=2,
                        heading_path=[title, "Key Metrics & Impact"],
                        content="\n".join(metric_lines),
                        section_type=SectionType.LIST,
                    )
                )

        # Tech stack
        tech_stack = raw_doc.get("techStack") or []
        if isinstance(tech_stack, list) and tech_stack:
            sections.append(
                DocumentSection(
                    heading="Technologies Used",
                    heading_level=2,
                    heading_path=[title, "Technologies Used"],
                    content=", ".join(str(t) for t in tech_stack),
                    section_type=SectionType.PROSE,
                )
            )

    elif doc_type == "experience":
        exp_lines = []
        company = raw_doc.get("company") or ""
        role = raw_doc.get("role") or ""
        start = raw_doc.get("startDate") or ""
        end = "Present" if raw_doc.get("isCurrent") else (raw_doc.get("endDate") or "")
        loc = raw_doc.get("location") or ""
        emp_type = raw_doc.get("employmentType") or ""
        if company or role:
            exp_lines.append(f"Role: {role} at {company}".strip())
        if start or end:
            exp_lines.append(f"Duration: {start} to {end}")
        if loc:
            exp_lines.append(f"Location: {loc}")
        if emp_type:
            exp_lines.append(f"Employment Type: {emp_type}")
        summary_val = raw_doc.get("summary") or ""
        if summary_val and not any(s.content == summary_val for s in sections):
            exp_lines.append(f"Summary: {summary_val}")
        if exp_lines:
            sections.append(
                DocumentSection(
                    heading="Role & Organization",
                    heading_level=2,
                    heading_path=[title, "Role & Organization"],
                    content="\n".join(exp_lines),
                    section_type=SectionType.PROSE,
                )
            )

        highlights = raw_doc.get("highlights") or []
        if isinstance(highlights, list) and highlights:
            sections.append(
                DocumentSection(
                    heading="Key Achievements & Engineering Impact",
                    heading_level=2,
                    heading_path=[title, "Key Achievements & Engineering Impact"],
                    content="\n".join(f"- {h}" for h in highlights),
                    section_type=SectionType.LIST,
                )
            )

        technologies = raw_doc.get("technologies") or []
        if isinstance(technologies, list) and technologies:
            sections.append(
                DocumentSection(
                    heading="Technologies Used",
                    heading_level=2,
                    heading_path=[title, "Technologies Used"],
                    content=", ".join(str(t) for t in technologies),
                    section_type=SectionType.PROSE,
                )
            )

    elif doc_type == "education":
        edu_lines = []
        institution = raw_doc.get("institution") or ""
        degree = raw_doc.get("degree") or ""
        field_of_study = raw_doc.get("fieldOfStudy") or ""
        grad_year = raw_doc.get("graduationYear") or ""
        if institution:
            edu_lines.append(f"Institution: {institution}")
        if degree:
            edu_lines.append(f"Degree: {degree}")
        if field_of_study:
            edu_lines.append(f"Field of Study: {field_of_study}")
        if grad_year:
            edu_lines.append(f"Graduation Year: {grad_year}")
        if edu_lines:
            sections.append(
                DocumentSection(
                    heading="Education Details",
                    heading_level=2,
                    heading_path=[title, "Education Details"],
                    content="\n".join(edu_lines),
                    section_type=SectionType.PROSE,
                )
            )

        highlights = raw_doc.get("highlights") or []
        if isinstance(highlights, list) and highlights:
            sections.append(
                DocumentSection(
                    heading="Key Coursework & Honors",
                    heading_level=2,
                    heading_path=[title, "Key Coursework & Honors"],
                    content="\n".join(f"- {h}" for h in highlights),
                    section_type=SectionType.LIST,
                )
            )

    elif doc_type == "skill":
        skill_lines = []
        cat = raw_doc.get("category") or ""
        prof = raw_doc.get("proficiency") or ""
        desc = raw_doc.get("description") or ""
        if cat:
            skill_lines.append(f"Category: {cat}")
        if prof:
            skill_lines.append(f"Proficiency Level: {prof}")
        if desc:
            skill_lines.append(f"Context & Production Usage: {desc}")
        if skill_lines:
            sections.append(
                DocumentSection(
                    heading="Skill Overview",
                    heading_level=2,
                    heading_path=[title, "Skill Overview"],
                    content="\n".join(skill_lines),
                    section_type=SectionType.PROSE,
                )
            )

    # Fallback: if document has no body or summary yet, preserve title section
    if not sections and title:
        sections.append(
            DocumentSection(
                heading=title,
                heading_level=1,
                heading_path=[title],
                content=f"[{title}]",
                section_type=SectionType.PROSE,
            )
        )

    # Assemble full raw text
    text_blocks = []

    for sec in sections:
        if sec.heading and sec.heading != title:
            text_blocks.append(f"## {sec.heading}\n{sec.content}")
        else:
            text_blocks.append(sec.content)
    raw_text = normalize_whitespace("\n\n".join(text_blocks))

    # Metadata map
    metadata: dict[str, Any] = {
        "source": "sanity",
        "doc_type": doc_type,
    }
    if slug:
        metadata["slug"] = slug
    if "techStack" in raw_doc:
        metadata["techStack"] = raw_doc["techStack"]
    if "publishedAt" in raw_doc:
        metadata["publishedAt"] = raw_doc["publishedAt"]

    # Compute deterministic SHA-256 hash
    content_hash = compute_content_hash(
        sanity_id=sanity_id,
        document_type=doc_type,
        title=title,
        slug=slug,
        canonical_url=canonical_url,
        language=language,
        rag_enabled=rag_enabled,
        target_audiences=target_audiences,
        text_content=raw_text,
        extra_metadata=metadata,
    )

    return NormalizedDocument(
        sanity_id=sanity_id,
        document_type=doc_type,
        title=title,
        slug=slug,
        canonical_url=canonical_url,
        language=language,
        rag_enabled=rag_enabled,
        target_audiences=target_audiences,
        content_hash=content_hash,
        raw_text=raw_text,
        sections=sections,
        metadata=metadata,
    )
