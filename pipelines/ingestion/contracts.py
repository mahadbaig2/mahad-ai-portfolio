"""Normalized document and chunk data contracts for offline RAG ingestion."""

import uuid
from enum import Enum
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class DocumentType(str, Enum):
    PROJECT = "project"
    CASE_STUDY = "caseStudy"
    ARTICLE = "article"
    EXPERIENCE = "experience"
    EDUCATION = "education"
    SKILL = "skill"
    FAQ = "faq"
    ARCHITECTURE_DECISION = "architectureDecision"
    PERSONAL_STORY = "personalStory"
    STYLE_EXAMPLE = "styleExample"
    SITE_SETTINGS = "siteSettings"


class SectionType(str, Enum):
    PROSE = "prose"
    CODE = "code"
    LIST = "list"
    TABLE = "table"
    QUOTE = "quote"
    CALLOUT = "callout"


class DocumentSection(BaseModel):
    """Represents a discrete semantic section within a document."""

    model_config = ConfigDict(extra="forbid")

    heading: str | None = Field(default=None, description="Section heading text if present.")
    heading_level: int = Field(default=0, ge=0, le=6, description="1-6 for h1-h6, 0 for root.")
    heading_path: list[str] = Field(
        default_factory=list,
        description="Hierarchical chain of parent headings (e.g. ['CardioScan AI', 'Architecture']).",
    )
    content: str = Field(description="Normalized markdown/plain text content of the section.")
    section_type: SectionType = Field(
        default=SectionType.PROSE, description="Type of content block."
    )


class NormalizedDocument(BaseModel):
    """P4.1.1: Canonical normalized representation of a Sanity document."""

    model_config = ConfigDict(extra="forbid")

    sanity_id: str = Field(description="The Sanity _id of the document.")
    document_type: str = Field(description="Sanity document _type.")
    title: str = Field(description="Document display title.")
    slug: str | None = Field(default=None, description="URL slug if applicable.")
    canonical_url: str = Field(description="Canonical public URL path (e.g. /work/cardioscan-ai).")
    language: str = Field(default="en", description="Primary language: 'en', 'ur', 'ur-ro'.")
    rag_enabled: bool = Field(default=True, description="Whether document is eligible for RAG indexing.")
    target_audiences: list[str] = Field(
        default_factory=lambda: ["general"],
        description="Target audiences: 'recruiter', 'engineer', 'founder', 'general'.",
    )
    content_hash: str = Field(description="Deterministic SHA-256 hex digest of normalized content.")
    raw_text: str = Field(description="Full text representation combining all sections.")
    sections: list[DocumentSection] = Field(
        default_factory=list,
        description="List of structured sections preserving headings and block types.",
    )
    metadata: dict[str, Any] = Field(
        default_factory=dict,
        description="Extensible metadata (tags, dates, project reference, metrics, etc.).",
    )


class NormalizedChunk(BaseModel):
    """P4.1.1: Contract for an individual text chunk ready for embedding and persistence."""

    model_config = ConfigDict(extra="forbid")

    chunk_id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        description="UUID identifying the chunk. Must match Qdrant point ID.",
    )
    document_sanity_id: str = Field(description="Parent Sanity document _id.")
    chunk_index: int = Field(ge=0, description="0-indexed position within the document.")
    content: str = Field(
        description="Text to be embedded and retrieved. Includes title and heading prefix context.",
    )
    content_hash: str = Field(description="Deterministic SHA-256 hex digest of this chunk's content.")
    token_count: int = Field(ge=0, description="Approximate or tokenizer-derived token count.")
    heading_path: list[str] = Field(
        default_factory=list,
        description="Hierarchy of headings leading to this chunk.",
    )
    section_type: str = Field(default="prose", description="Prose, code, list, or callout.")
    document_type: str = Field(description="Parent document type.")
    project_slug: str | None = Field(
        default=None,
        description="Associated project slug if chunk belongs to or references a project.",
    )
    target_audiences: list[str] = Field(
        default_factory=lambda: ["general"],
        description="Audiences who should match this chunk.",
    )
    language: str = Field(default="en", description="Language of chunk: 'en', 'ur', 'ur-ro'.")
    canonical_url: str = Field(description="Canonical URL for citations.")
