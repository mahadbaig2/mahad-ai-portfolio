"""Qdrant vector retrieval and PostgreSQL hydration LangGraph node (P9.2.4)."""

import asyncio
import concurrent.futures
import logging
import time
from typing import Any

from apps.api.services.assistant.filter_planner import plan_retrieval_filters
from apps.api.services.assistant.normalizer import normalize_query
from apps.api.services.assistant.state import AssistantState
from apps.api.services.retrieval_service import RetrievalResult, RetrievalService

logger = logging.getLogger("assistant.retrieval_node")

# Injectable retrieval service override for dependency injection / testing
_injected_retrieval_service: RetrievalService | None = None


def set_retrieval_service(service: RetrievalService | None) -> None:
    """Set or override retrieval service for unit testing."""
    global _injected_retrieval_service
    _injected_retrieval_service = service


def get_retrieval_service() -> RetrievalService | None:
    """Obtain injected or runtime retrieval service."""
    global _injected_retrieval_service
    return _injected_retrieval_service


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


def retrieve_evidence_node(state: AssistantState) -> dict[str, Any]:
    """P9.2.4: Execute two-phase retrieval (Qdrant search + PostgreSQL hydration) with timing metrics."""
    t0 = time.perf_counter()
    raw_query = (
        state.get("retrieval_query")
        or state.get("sanitized_query")
        or state.get("input_text", "")
    )
    intent = state.get("intent", "unknown")
    mode = state.get("mode", "text")
    language = state.get("language", "en")

    # 1. P9.2.2: Normalize query while preserving code-switching
    normalized = normalize_query(raw_query)
    effective_query = normalized.normalized_text

    # 2. P9.2.3: Plan retrieval filters
    filters = plan_retrieval_filters(
        query=effective_query,
        intent=intent,
        mode=mode,
        language=language,
    )

    evidence_chunks: list[dict[str, Any]] = []
    telemetry_details: dict[str, Any] = {
        "query": effective_query,
        "filters": filters.raw_filters,
        "points_returned": 0,
        "hydrated_count": 0,
    }

    retrieval_service = get_retrieval_service()

    if retrieval_service is not None:
        try:
            res: RetrievalResult = _run_async(
                retrieval_service.retrieve(
                    query=effective_query,
                    top_k=10,
                    score_threshold=0.40,
                    target_audience=filters.target_audience,
                    project_slug=filters.project_slug,
                    language=filters.language,
                )
            )
            telemetry_details["points_returned"] = res.metrics.qdrant_points_returned
            telemetry_details["hydrated_count"] = res.metrics.postgres_chunks_hydrated
            telemetry_details["deduplicated_count"] = res.metrics.deduplicated_count
            telemetry_details["selected_tokens"] = res.metrics.selected_tokens_count

            for cit in res.citations:
                evidence_chunks.append(
                    {
                        "chunk_id": str(cit.chunk_id),
                        "document_id": str(cit.document_id),
                        "document_title": cit.document_title,
                        "heading_path": cit.heading_path,
                        "canonical_url": cit.canonical_url,
                        "similarity_score": cit.similarity_score,
                        "document_type": cit.document_type,
                        "project_slug": cit.project_slug,
                        "content": cit.content,
                        "token_count": cit.token_count,
                    }
                )
        except Exception as e:
            logger.exception(f"Retrieval service execution failed: {e}")
            telemetry_details["error"] = str(e)
    else:
        telemetry_details["warning"] = "No RetrievalService instance configured"

    duration_ms = (time.perf_counter() - t0) * 1000.0
    step_telemetry = {
        "step_name": "retrieve_evidence",
        "duration_ms": round(duration_ms, 2),
        "status": "completed",
        "details": telemetry_details,
    }

    steps = list(state.get("execution_steps", []))
    steps.append(step_telemetry)

    return {
        "retrieval_query": effective_query,
        "evidence_chunks": evidence_chunks,
        "execution_steps": steps,
    }
