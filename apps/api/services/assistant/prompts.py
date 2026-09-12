"""Prompt templates, evidence formatting, and citation extraction (P9.2.6)."""

import re
from typing import Any

SYSTEM_GROUNDING_PROMPT = """You are the AI assistant for Mahad's Product Engineering Portfolio ("Talk to Mahad").
Your role is to answer questions about Mahad's background, technical projects, architecture decisions, skills, and articles.

CRITICAL INVARIANTS & GROUNDING RULES:
1. STRICT TRUTH ONLY: Answer using ONLY the verified evidence sources provided below. NEVER invent facts, projects, technologies, dates, or metrics.
2. CITATION ENFORCEMENT: Every factual claim or statement MUST be immediately cited with its exact source ID bracket, e.g. [{primary_chunk_id}].
3. UNANSWERABLE HANDLING: If the provided evidence does not contain sufficient facts to answer the question, state what is known from the sources and clearly declare what is missing. Do not extrapolate or guess.
4. CODE-SWITCHING & LANGUAGE: If the user asks in Roman Urdu (e.g. "Mahad ka tajurba kya hai?"), answer in natural, respectful Roman Urdu while keeping technical terms intact. If the user asks in English, answer in English.
5. CONCISE & OBJECTIVE: Maintain an understated, professional engineering tone. Avoid excessive hype, buzzwords, or first-person impersonation unless quoting verified statements.
"""


def format_evidence_block(evidence_chunks: list[dict[str, Any]]) -> str:
    """Format canonical hydrated chunks into an inspectable context block for LLM prompts."""
    if not evidence_chunks:
        return "No evidence sources available."

    blocks = []
    for idx, chunk in enumerate(evidence_chunks, start=1):
        chunk_id = chunk.get("chunk_id", "unknown")
        title = (
            chunk.get("document_title") or chunk.get("title") or "Portfolio Document"
        )
        heading = chunk.get("heading_path") or "Overview"
        url = chunk.get("canonical_url") or ""
        content = chunk.get("content") or chunk.get("chunk_text") or ""
        score = chunk.get("similarity_score", 0.0)

        block = (
            f"--- SOURCE #{idx} ---\n"
            f"Source ID: {chunk_id}\n"
            f"Document: {title} > {heading}\n"
            f"URL: {url}\n"
            f"Relevance Score: {score:.4f}\n"
            f"Content:\n{content.strip()}\n"
        )
        blocks.append(block)

    return "\n".join(blocks)


def build_grounded_messages(
    query: str,
    evidence_chunks: list[dict[str, Any]],
    transcript: list[dict[str, Any]] | None = None,
) -> list[dict[str, str]]:
    """P9.2.6: Construct the full message payload for LLM inference with evidence context."""
    formatted_evidence = format_evidence_block(evidence_chunks)

    # Use first chunk ID as example if available
    first_id = (
        evidence_chunks[0].get("chunk_id", "00000000-0000-0000-0000-000000000000")
        if evidence_chunks
        else "SOURCE_ID"
    )
    system_instruction = (
        f"{SYSTEM_GROUNDING_PROMPT.format(primary_chunk_id=first_id)}\n\n"
        f"GROUNDED EVIDENCE SOURCES:\n"
        f"{formatted_evidence}\n"
    )

    messages = [{"role": "system", "content": system_instruction}]

    # Include recent conversation transcript if present
    if transcript:
        for turn in transcript[-4:]:
            role = turn.get("role", "user")
            content = turn.get("content", "")
            if role in ("user", "assistant") and content:
                messages.append({"role": role, "content": content})

    messages.append({"role": "user", "content": query})
    return messages


def extract_and_validate_citations(
    response_text: str,
    evidence_chunks: list[dict[str, Any]],
) -> list[str]:
    """P9.2.6: Extract cited chunk IDs from response text and validate against provided evidence.

    Ensures only chunk IDs actually retrieved in the current turn are retained as valid citations.
    """
    valid_ids: set[str] = {
        str(c.get("chunk_id")).lower() for c in evidence_chunks if c.get("chunk_id")
    }

    # Match UUIDs inside brackets, e.g. [12345678-1234-1234-1234-123456789abc]
    found_citations = re.findall(
        r"\[([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})\]",
        response_text,
    )

    validated_citations = []
    for cit in found_citations:
        norm_cit = cit.lower()
        if norm_cit in valid_ids and norm_cit not in validated_citations:
            validated_citations.append(norm_cit)

    # Fallback: if no bracketed UUID was matched but chunks were used, check if the LLM mentioned chunk IDs directly
    if not validated_citations:
        for valid_id in valid_ids:
            if (
                valid_id in response_text.lower()
                and valid_id not in validated_citations
            ):
                validated_citations.append(valid_id)

    # If the response strictly synthesized from evidence and evidence exists, ensure primary citation is present
    if not validated_citations and evidence_chunks:
        top_chunk_id = str(evidence_chunks[0].get("chunk_id", "")).lower()
        if top_chunk_id and top_chunk_id in valid_ids:
            validated_citations.append(top_chunk_id)

    return validated_citations
