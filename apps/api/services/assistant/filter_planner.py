"""Filter planning service for grounded vector retrieval (P9.2.3)."""

import re
from dataclasses import dataclass, field
from typing import Any

# Mapping of known entity aliases to canonical project slugs
PROJECT_ALIAS_MAP: dict[str, str] = {
    "cardioscan": "cardioscan-ai",
    "cardioscan ai": "cardioscan-ai",
    "cardio scan": "cardioscan-ai",
    "mimar": "mimar-studios",
    "mimar studios": "mimar-studios",
    "spatial systems": "mimar-studios",
    "ml router": "in-process-ml-router",
    "onnx router": "in-process-ml-router",
    "query router": "in-process-ml-router",
}

# Mapping of classified intent to relevant document types
INTENT_DOCUMENT_TYPES: dict[str, list[str]] = {
    "project_technical": ["project", "caseStudy"],
    "career_skills": ["experience", "skill", "education"],
    "architecture_decision": ["architectureDecision", "project", "article"],
    "experience_history": ["experience", "education"],
    "compensation_rates": ["experience", "faq"],
    "availability_hiring": ["experience", "faq"],
    "workflow_methods": ["article", "architectureDecision", "caseStudy"],
}

# Recognized audiences supported by Sanity CMS & Qdrant payload
RECOGNIZED_AUDIENCES = {"recruiter", "engineer", "founder"}


@dataclass
class PlannedFilters:
    """Planned metadata filters for Qdrant vector retrieval."""

    target_audience: str | None = None
    project_slug: str | None = None
    document_types: list[str] = field(default_factory=list)
    language: str | None = None
    raw_filters: dict[str, Any] = field(default_factory=dict)


def plan_retrieval_filters(
    query: str,
    intent: str | None = None,
    mode: str | None = None,
    language: str | None = None,
) -> PlannedFilters:
    """P9.2.3: Formulate targeted metadata filters from query text, intent, and audience context.

    - Resolves project slugs from query text mentions.
    - Maps interaction mode / audience to `target_audience`.
    - Maps classified intent to compatible `document_types`.
    - Produces a dictionary compatible with Qdrant and RetrievalService.
    """
    cleaned_query = query.lower() if query else ""
    resolved_slug: str | None = None

    # 1. Project Slug Detection
    for alias, slug in PROJECT_ALIAS_MAP.items():
        pattern = rf"\b{re.escape(alias)}\b"
        if re.search(pattern, cleaned_query):
            resolved_slug = slug
            break

    # 2. Audience Context Detection
    audience_filter: str | None = None
    if mode and mode.lower() in RECOGNIZED_AUDIENCES:
        audience_filter = mode.lower()

    # 3. Intent-based Document Type Narrowing
    doc_types: list[str] = []
    if intent and intent in INTENT_DOCUMENT_TYPES:
        doc_types = INTENT_DOCUMENT_TYPES[intent]

    # 4. Construct payload dictionary
    raw_filters: dict[str, Any] = {}
    if resolved_slug:
        raw_filters["project_slug"] = resolved_slug
    if audience_filter:
        raw_filters["target_audiences"] = audience_filter
    if doc_types:
        raw_filters["document_type"] = doc_types
    # Note: we generally keep language open for bilingual / Roman Urdu queries
    # unless an exact match is desired, because English technical docs answer Urdu questions.

    return PlannedFilters(
        target_audience=audience_filter,
        project_slug=resolved_slug,
        document_types=doc_types,
        language=language if language in ("en", "ur") else None,
        raw_filters=raw_filters,
    )
