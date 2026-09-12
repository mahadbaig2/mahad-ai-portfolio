"""Grounded response generation LangGraph node (P9.2.6 & P9.2.7)."""

import asyncio
import concurrent.futures
import logging
import time
from typing import Any

from apps.api.providers.base import LLMProvider
from apps.api.providers.groq import GroqLLMProvider
from apps.api.services.assistant.prompts import (
    build_grounded_messages,
    extract_and_validate_citations,
)
from apps.api.services.assistant.state import AssistantState

logger = logging.getLogger("assistant.generation_node")

_injected_llm_provider: LLMProvider | None = None


def set_llm_provider(provider: LLMProvider | None) -> None:
    """Set or override LLM provider for unit testing."""
    global _injected_llm_provider
    _injected_llm_provider = provider


def get_llm_provider() -> LLMProvider:
    """Obtain injected or default Groq LLM provider."""
    global _injected_llm_provider
    if _injected_llm_provider is not None:
        return _injected_llm_provider
    return GroqLLMProvider()


def _run_async(coro):
    """Execute async coroutine safely from sync LangGraph node."""
    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        loop = None

    if loop and loop.is_running():
        with concurrent.futures.ThreadPoolExecutor(max_workers=1) as pool:
            return pool.submit(asyncio.run, coro).result()
    else:
        return asyncio.run(coro)


def grounded_generation_node(state: AssistantState) -> dict[str, Any]:
    """P9.2.6 & P9.2.7: Generate factually grounded synthesis strictly cited from evidence chunks."""
    t0 = time.perf_counter()
    query = state.get("sanitized_query") or state.get("input_text", "")
    evidence_chunks = state.get("evidence_chunks", [])
    transcript = state.get("transcript", [])

    messages = build_grounded_messages(query, evidence_chunks, transcript)
    llm_provider = get_llm_provider()

    try:
        raw_answer = _run_async(
            llm_provider.generate(messages=messages, temperature=0.2, max_tokens=1000)
        )
    except Exception as e:
        logger.exception(f"LLM generation failed: {e}")
        raw_answer = (
            "I encountered an error while synthesizing the response from verified portfolio sources. "
            "Please try again."
        )

    # Validate citations
    citations = extract_and_validate_citations(raw_answer, evidence_chunks)

    duration_ms = (time.perf_counter() - t0) * 1000.0
    step_telemetry = {
        "step_name": "grounded_generation",
        "duration_ms": round(duration_ms, 2),
        "status": "completed",
        "details": {
            "evidence_count": len(evidence_chunks),
            "citations_found": len(citations),
            "model": getattr(llm_provider, "model", "mock"),
        },
    }

    steps = list(state.get("execution_steps", []))
    steps.append(step_telemetry)

    return {
        "draft_answer": raw_answer,
        "final_answer": raw_answer,
        "citations": citations,
        "execution_steps": steps,
    }
