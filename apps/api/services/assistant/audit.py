"""Audit logging and safe retrieval event persistence (P9.3.7).

Records retrieval telemetry and cited chunk metadata into PostgreSQL according to consent rules.
Ensures database/observability failures never crash or fail a user-facing request (AGENTS.md).
"""

import asyncio
import concurrent.futures
import logging
from typing import Any

from apps.api.repositories.chat_repo import ChatRepository

logger = logging.getLogger("assistant.audit")


async def _persist_retrieval_event_async(
    query_text: str,
    rewritten_query: str | None,
    chunks_count: int,
    cited_chunk_ids: list[str],
    similarity_scores: list[float],
    evidence_score: float | None = None,
) -> None:
    """Async persistence helper writing an audit log to retrieval_events table."""
    from sqlalchemy.ext.asyncio import (
        AsyncSession,
        async_sessionmaker,
        create_async_engine,
    )
    from sqlalchemy.pool import NullPool

    from apps.api.core.config import get_settings

    settings = get_settings()
    connect_args: dict[str, Any] = {}
    if "neon.tech" in settings.DATABASE_URL or settings.ENVIRONMENT == "production":
        connect_args["ssl"] = "require"

    local_engine = create_async_engine(
        settings.DATABASE_URL,
        poolclass=NullPool,
        connect_args=connect_args,
    )
    local_sessionmaker = async_sessionmaker(
        bind=local_engine,
        class_=AsyncSession,
        expire_on_commit=False,
        autoflush=False,
    )
    try:
        async with local_sessionmaker() as session:
            repo = ChatRepository(session)
            await repo.record_retrieval(
                query_text=query_text,
                chunks_retrieved_count=chunks_count,
                cited_chunk_ids=cited_chunk_ids,
                similarity_scores=similarity_scores,
                rewritten_query=rewritten_query,
                evidence_score=evidence_score,
            )
            await session.commit()
    except Exception as e:
        # Invariant: Observability failures must not fail a user request (AGENTS.md)
        logger.warning(f"Non-fatal error persisting retrieval event: {e}")
    finally:
        await local_engine.dispose()


def record_safe_retrieval_event(
    query_text: str,
    rewritten_query: str | None,
    evidence_chunks: list[dict[str, Any]],
    cited_chunk_ids: list[str],
) -> None:
    """Record retrieval event audit log synchronously from assistant graph pipeline (P9.3.7)."""
    if not evidence_chunks and not cited_chunk_ids:
        return

    scores = [
        float(c.get("similarity_score", 0.0))
        for c in evidence_chunks
        if c.get("similarity_score") is not None
    ]
    top_score = max(scores) if scores else None

    coro = _persist_retrieval_event_async(
        query_text=query_text,
        rewritten_query=rewritten_query,
        chunks_count=len(evidence_chunks),
        cited_chunk_ids=cited_chunk_ids,
        similarity_scores=scores,
        evidence_score=top_score,
    )

    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        loop = None

    try:
        if loop and loop.is_running():
            # Fire in background thread so caller response is not blocked
            with concurrent.futures.ThreadPoolExecutor(max_workers=1) as pool:
                pool.submit(asyncio.run, coro)
        else:
            asyncio.run(coro)
    except Exception as e:
        logger.warning(f"Failed to dispatch retrieval audit record ({e}); continuing.")
