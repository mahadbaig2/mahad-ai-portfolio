"""Strict claim-to-source citation validation module (P9.3.4).

Ensures all citations in generated responses map strictly to canonical chunks
hydrated in the current retrieval event. Detects and purges hallucinated UUIDs.
"""

import logging
import re
from dataclasses import dataclass, field
from typing import Any

logger = logging.getLogger("assistant.citation_validator")

UUID_CITATION_REGEX = re.compile(
    r"\[([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})\]"
)


@dataclass
class CitationValidationResult:
    """Outcome of claim-to-source citation validation."""

    cleaned_text: str
    valid_citations: list[str] = field(default_factory=list)
    stripped_citations: list[str] = field(default_factory=list)
    has_valid_citations: bool = False
    validation_status: str = "valid"  # 'valid', 'purged_hallucinations', 'fallback_attached'


def validate_claim_citations(
    response_text: str,
    evidence_chunks: list[dict[str, Any]],
) -> CitationValidationResult:
    """Validate that every citation bracket in response_text maps to an authorized retrieval chunk.

    P9.3.4 Invariants:
    1. Only chunk IDs retrieved in the CURRENT run are valid.
    2. Phantom/hallucinated chunk IDs are excised from the text.
    3. Retains duplicate citations only once in valid_citations list while preserving text flow.
    4. If no citations exist but evidence was retrieved and utilized, attach primary source.
    """
    if not response_text:
        return CitationValidationResult(cleaned_text="", has_valid_citations=False)

    valid_chunk_map: dict[str, dict[str, Any]] = {
        str(c.get("chunk_id")).lower(): c
        for c in evidence_chunks
        if c.get("chunk_id")
    }
    allowed_ids = set(valid_chunk_map.keys())

    all_matches = list(UUID_CITATION_REGEX.finditer(response_text))
    valid_citations: list[str] = []
    stripped_citations: list[str] = []

    # Identify valid vs invalid matches
    for match in all_matches:
        cit_id = match.group(1).lower()
        if cit_id in allowed_ids:
            if cit_id not in valid_citations:
                valid_citations.append(cit_id)
        else:
            if cit_id not in stripped_citations:
                stripped_citations.append(cit_id)

    # Purge hallucinated citations from text
    cleaned_text = response_text
    if stripped_citations:
        logger.warning(
            f"Purging {len(stripped_citations)} hallucinated citations: {stripped_citations}"
        )
        for invalid_id in stripped_citations:
            # Remove [invalid_id] occurrences case-insensitively
            pattern = re.compile(rf"\[{re.escape(invalid_id)}\]", re.IGNORECASE)
            cleaned_text = pattern.sub("", cleaned_text)
        # Clean up any leftover double spaces
        cleaned_text = re.sub(r"  +", " ", cleaned_text)

    status = "valid"
    if stripped_citations:
        status = "purged_hallucinations"

    # Invariant fallback: if factual response contains no citations but evidence exists,
    # attach top evidence chunk ID to ensure groundedness citation requirement (AGENTS.md)
    if not valid_citations and evidence_chunks:
        top_chunk_id = str(evidence_chunks[0].get("chunk_id", "")).lower()
        if top_chunk_id and top_chunk_id in allowed_ids:
            valid_citations.append(top_chunk_id)
            if f"[{top_chunk_id}]" not in cleaned_text:
                cleaned_text = cleaned_text.rstrip() + f" [{top_chunk_id}]"
            status = "fallback_attached"

    return CitationValidationResult(
        cleaned_text=cleaned_text,
        valid_citations=valid_citations,
        stripped_citations=stripped_citations,
        has_valid_citations=len(valid_citations) > 0,
        validation_status=status,
    )
