"""Sanity content extractor resolving referenced content via GROQ API (P4.1.2)."""

import os
from typing import Any

import httpx

from apps.api.core.config import get_settings

# Comprehensive GROQ projection expanding references, images, and nested structures
DOCUMENT_PROJECTION = """{
  _id,
  _type,
  _createdAt,
  _updatedAt,
  title,
  name,
  question,
  slug,
  summary,
  shortSummary,
  description,
  featured,
  ragEnabled,
  ragMetadata,
  targetAudiences,
  language,
  techStack,
  metrics,
  publishedAt,
  body[]{
    ...,
    _type == "image" => {
      ...,
      asset->{
        _id,
        url,
        metadata { lqip, dimensions }
      }
    }
  },
  content[]{
    ...,
    _type == "image" => {
      ...,
      asset->{
        _id,
        url,
        metadata { lqip, dimensions }
      }
    }
  },
  projectRef->{
    _id,
    title,
    slug,
    summary
  }
}"""


class SanityExtractor:
    """Extracts raw content from Sanity CMS resolving referenced entities."""

    def __init__(
        self,
        project_id: str | None = None,
        dataset: str | None = None,
        api_token: str | None = None,
        api_version: str = "2024-03-01",
    ) -> None:
        settings = get_settings()
        self.project_id = project_id or settings.SANITY_PROJECT_ID or os.getenv("SANITY_STUDIO_PROJECT_ID") or os.getenv("NEXT_PUBLIC_SANITY_PROJECT_ID") or ""
        self.dataset = dataset or settings.SANITY_DATASET or os.getenv("SANITY_STUDIO_DATASET") or os.getenv("NEXT_PUBLIC_SANITY_DATASET") or "production"
        self.api_token = api_token or settings.SANITY_API_READ_TOKEN or os.getenv("SANITY_API_READ_TOKEN") or ""
        self.api_version = api_version

    @property
    def query_endpoint(self) -> str:
        return f"https://{self.project_id}.api.sanity.io/v{self.api_version}/data/query/{self.dataset}"

    def _headers(self) -> dict[str, str]:
        headers = {"Content-Type": "application/json"}
        if self.api_token:
            headers["Authorization"] = f"Bearer {self.api_token}"
        return headers

    def execute_groq(self, query: str, params: dict[str, Any] | None = None) -> list[dict[str, Any]]:
        """Execute a GROQ query against Sanity HTTP API."""
        if not self.project_id:
            raise ValueError("Sanity project ID is not configured.")

        with httpx.Client(timeout=30.0) as client:
            resp = client.get(
                self.query_endpoint,
                headers=self._headers(),
                params={"query": query, **(params or {})},
            )
            resp.raise_for_status()
            data = resp.json()
            result = data.get("result", [])
            if isinstance(result, list):
                return result
            if isinstance(result, dict):
                return [result]
            return []

    async def execute_groq_async(self, query: str, params: dict[str, Any] | None = None) -> list[dict[str, Any]]:
        """Execute a GROQ query asynchronously."""
        if not self.project_id:
            raise ValueError("Sanity project ID is not configured.")

        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.get(
                self.query_endpoint,
                headers=self._headers(),
                params={"query": query, **(params or {})},
            )
            resp.raise_for_status()
            data = resp.json()
            result = data.get("result", [])
            if isinstance(result, list):
                return result
            if isinstance(result, dict):
                return [result]
            return []

    def fetch_document_by_id(self, document_id: str) -> dict[str, Any] | None:
        """P4.1.2: Fetch a single document by Sanity ID and resolve references."""
        query = f'*[_id == "{document_id}"][0]{DOCUMENT_PROJECTION}'
        results = self.execute_groq(query)
        return results[0] if results else None

    async def fetch_document_by_id_async(self, document_id: str) -> dict[str, Any] | None:
        """P4.1.2: Fetch a single document by Sanity ID asynchronously."""
        query = f'*[_id == "{document_id}"][0]{DOCUMENT_PROJECTION}'
        results = await self.execute_groq_async(query)
        return results[0] if results else None

    def fetch_all_documents(self) -> list[dict[str, Any]]:
        """Fetch all documents eligible for portfolio or RAG indexing."""
        query = f"""*[
          !(_id in path("drafts.**")) &&
          _type in [
            "project",
            "caseStudy",
            "article",
            "experience",
            "education",
            "skill",
            "faq",
            "architectureDecision",
            "personalStory",
            "styleExample"
          ]
        ]{DOCUMENT_PROJECTION}"""
        return self.execute_groq(query)

    async def fetch_all_documents_async(self) -> list[dict[str, Any]]:
        """Fetch all documents eligible for portfolio or RAG indexing asynchronously."""
        query = f"""*[
          !(_id in path("drafts.**")) &&
          _type in [
            "project",
            "caseStudy",
            "article",
            "experience",
            "education",
            "skill",
            "faq",
            "architectureDecision",
            "personalStory",
            "styleExample"
          ]
        ]{DOCUMENT_PROJECTION}"""
        return await self.execute_groq_async(query)
