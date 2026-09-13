"""Bounded query rewriting and retrieval retry node (P9.3.2).

Limits rewrite attempts to strictly one retry (retrieval_retries <= 1) per AGENTS.md.
Transforms failed or ambiguous search queries into more effective semantic search expressions
preserving technical entities, multilingual context, and project identities.
"""

import asyncio
import concurrent.futures
import logging
import time
from collections.abc import Coroutine
from typing import Any, TypeVar

from apps.api.providers.base import LLMProvider
from apps.api.providers.groq import GroqLLMProvider
from apps.api.services.assistant.normalizer import normalize_query
from apps.api.services.assistant.state import AssistantState

logger = logging.getLogger("assistant.query_rewriter")

T = TypeVar("T")

REWRITER_SYSTEM_PROMPT = """You are a specialized query formulation model for Mahad's Portfolio Semantic Retrieval.
The previous search query returned insufficient or ambiguous evidence chunks from the vector database.
Your task is to rewrite the search query into a cleaner, entity-focused semantic query that optimizes vector similarity over technical projects, architecture decisions, and portfolio experience.

REWRITING RULES:
1. PRESERVE INTENT: Do not change what the user is asking.
2. PRESERVE TECHNICAL ENTITIES: Keep specific project names (e.g. CardioScan AI, INDKOM, mimAR Studios), tech stacks (LangGraph, FastAPI, ONNX, Qdrant, Neon), and architectures intact.
3. REMOVE FLUFF: Strip conversational pleasantries and conversational framing.
4. CODE-SWITCHING: If the question is in Roman Urdu, retain key context while clarifying semantic terms.
5. CONCISE OUTPUT: Return ONLY the rewritten search query string. Do not include quotes, preamble, or explanations.
"""

_injected_rewriter_llm: LLMProvider | None = None


def set_rewriter_llm_provider(provider: LLMProvider | None) -> None:
    """Set or override LLM provider for unit testing the query rewriter."""
    global _injected_rewriter_llm
    _injected_rewriter_llm = provider


def get_rewriter_llm_provider() -> LLMProvider:
    """Obtain injected or default Groq LLM provider for query rewriting."""
    global _injected_rewriter_llm
    if _injected_rewriter_llm is not None:
        return _injected_rewriter_llm
    return GroqLLMProvider()


def _run_async(coro: Coroutine[Any, Any, T]) -> T:
    """Safely execute async coroutines from synchronous LangGraph nodes."""
    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        loop = None

    if loop and loop.is_running():
        with concurrent.futures.ThreadPoolExecutor(max_workers=1) as pool:
            return pool.submit(asyncio.run, coro).result()
    else:
        return asyncio.run(coro)


def rewrite_query_node(state: AssistantState) -> dict[str, Any]:
    """P9.3.2: Execute bounded query rewrite and increment retry counter."""
    t0 = time.perf_counter()
    original_query = state.get("sanitized_query") or state.get("input_text", "")
    current_retrieval_query = state.get("retrieval_query") or original_query
    retrieval_retries = state.get("retrieval_retries", 0)
    intent = state.get("intent", "project_technical")
    transcript = state.get("transcript", [])

    # Strict AGENTS.md invariant: Version 1 allows strictly one retry
    if retrieval_retries >= 1:
        logger.warning("Query rewrite attempted but retry limit (1) already reached.")
        next_route = "clarification" if intent in ("project_technical", "career_skills") else "refusal"
        return {
            "route": next_route,
        }

    # Build context for rewriting
    context_turns = ""
    if transcript:
        context_turns = "Recent context:\n" + "\n".join(
            f"{t.get('role', 'user')}: {t.get('content', '')}" for t in transcript[-2:]
        ) + "\n\n"

    messages = [
        {"role": "system", "content": REWRITER_SYSTEM_PROMPT},
        {
            "role": "user",
            "content": f"{context_turns}Original user question: {original_query}\nPrevious failed search query: {current_retrieval_query}\nIntent: {intent}\n\nRewritten query:",
        },
    ]

    llm = get_rewriter_llm_provider()
    try:
        raw_rewritten = _run_async(
            llm.generate(messages=messages, temperature=0.1, max_tokens=100)
        )
        rewritten_text = raw_rewritten.strip().strip('"').strip("'")
        if not rewritten_text:
            rewritten_text = original_query
    except Exception as e:
        logger.exception(f"Query rewriter LLM failed ({e}); falling back to normalized query.")
        norm = normalize_query(original_query)
        rewritten_text = f"{norm.normalized_text} {' '.join(norm.detected_entities)}"

    duration_ms = (time.perf_counter() - t0) * 1000.0

    step_telemetry = {
        "step_name": "rewrite_query",
        "duration_ms": round(duration_ms, 2),
        "status": "completed",
        "details": {
            "original_query": original_query,
            "rewritten_query": rewritten_text,
            "retry_count": retrieval_retries + 1,
        },
    }
    steps = list(state.get("execution_steps", []))
    steps.append(step_telemetry)

    return {
        "retrieval_query": rewritten_text,
        "rewritten_query": rewritten_text,
        "retrieval_retries": retrieval_retries + 1,
        "route": "retrieve_evidence",
        "execution_steps": steps,
    }
