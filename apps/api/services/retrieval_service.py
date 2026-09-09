"""RAG Retrieval and PostgreSQL Hydration Service with timing metrics and invariant enforcement (P5.2)."""

import logging
import time
import uuid
from typing import Any

from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy.ext.asyncio import AsyncSession

from apps.api.providers.base import VectorProvider
from apps.api.repositories.document_repo import DocumentRepository
from pipelines.ingestion.embedder import (
    EMBEDDING_MODEL_NAME,
    EMBEDDING_MODEL_VERSION,
    BaseEmbedder,
    MultilingualE5Embedder,
)
from pipelines.ingestion.normalizer import derive_canonical_url

logger = logging.getLogger("service.retrieval")


class GroundedCitation(BaseModel):
    """P5.2.5: Grounded source citation containing stable URL, title, and chunk identifier."""

    model_config = ConfigDict(extra="forbid")

    chunk_id: uuid.UUID
    chunk_index: int = 0
    chunk_hash: str = ""
    document_id: uuid.UUID
    document_title: str
    heading_path: str
    canonical_url: str
    similarity_score: float
    document_type: str
    project_slug: str | None = None
    content: str
    token_count: int


class RetrievalTimingMetrics(BaseModel):
    """P5.2.6: Fine-grained latency and count metrics for inspection and LangSmith tracing."""

    model_config = ConfigDict(extra="forbid")

    embed_latency_ms: float = 0.0
    qdrant_search_latency_ms: float = 0.0
    postgres_hydration_latency_ms: float = 0.0
    total_retrieval_latency_ms: float = 0.0
    qdrant_points_returned: int = 0
    postgres_chunks_hydrated: int = 0
    rejected_mismatched_count: int = 0
    deduplicated_count: int = 0
    selected_chunks_count: int = 0
    selected_tokens_count: int = 0


class RetrievalResult(BaseModel):
    """Full grounded retrieval output passed to LangGraph orchestration and inspection."""

    model_config = ConfigDict(extra="forbid")

    query: str
    citations: list[GroundedCitation] = Field(default_factory=list)
    raw_hydrated_count: int = 0
    metrics: RetrievalTimingMetrics = Field(default_factory=RetrievalTimingMetrics)
    filters_applied: dict[str, Any] = Field(default_factory=dict)



class RetrievalService:
    """Manages two-phase retrieval: fast vector search in Qdrant followed by canonical hydration from PostgreSQL."""

    def __init__(
        self,
        session: AsyncSession,
        vector_provider: VectorProvider,
        embedder: BaseEmbedder | None = None,
    ) -> None:
        self.session = session
        self.vector_provider = vector_provider
        self.embedder = embedder or MultilingualE5Embedder()
        self.doc_repo = DocumentRepository(session)

    async def retrieve(
        self,
        query: str,
        top_k: int = 12,
        score_threshold: float = 0.55,
        max_chunks: int = 5,
        max_tokens: int = 1500,
        target_audience: str | None = None,
        project_slug: str | None = None,
        language: str | None = None,
    ) -> RetrievalResult:
        """P5.2.1 - P5.2.6: Execute two-phase retrieval with hydration, validation, deduplication, and budgeting."""
        start_time = time.monotonic()
        metrics = RetrievalTimingMetrics()
        result = RetrievalResult(query=query)

        # 1. Embed query with 'query: ' prefix (P5.2.1)
        t0 = time.monotonic()
        query_vector = self.embedder.embed_query(query)
        metrics.embed_latency_ms = round((time.monotonic() - t0) * 1000, 2)

        # 2. Build metadata filters (P5.2.2)
        filters: dict[str, Any] = {}
        if target_audience:
            filters["target_audiences"] = target_audience
        if project_slug:
            filters["project_slug"] = project_slug
        if language:
            filters["language"] = language

        result.filters_applied = filters

        # 3. Vector search in Qdrant (P5.2.2)
        t1 = time.monotonic()
        search_hits = await self.vector_provider.search(
            query_vector=query_vector,
            top_k=top_k,
            score_threshold=score_threshold,
            filters=filters,
        )
        metrics.qdrant_search_latency_ms = round((time.monotonic() - t1) * 1000, 2)
        metrics.qdrant_points_returned = len(search_hits)

        if not search_hits:
            metrics.total_retrieval_latency_ms = round((time.monotonic() - start_time) * 1000, 2)
            result.metrics = metrics
            return result

        # 4. Hydrate canonical text from PostgreSQL by point ID (P5.2.3 & P5.2.4)
        t2 = time.monotonic()
        point_ids: list[uuid.UUID] = []
        scores_by_point_id: dict[uuid.UUID, float] = {}

        for hit in search_hits:
            try:
                pid = uuid.UUID(hit["point_id"])
                point_ids.append(pid)
                scores_by_point_id[pid] = hit["score"]
            except (ValueError, KeyError) as e:
                logger.warning(f"Invalid point ID in search hit: {hit}, error: {e}")
                metrics.rejected_mismatched_count += 1

        db_chunks = await self.doc_repo.get_chunks_by_point_ids(point_ids)
        metrics.postgres_hydration_latency_ms = round((time.monotonic() - t2) * 1000, 2)

        # 5. Validate chunks (P5.2.4: Reject inactive, missing, or mismatched-version rows)
        chunk_map = {c.id: c for c in db_chunks}
        raw_citations: list[GroundedCitation] = []

        for pid in point_ids:
            chunk = chunk_map.get(pid)
            if not chunk:
                # Disagreement: Point exists in Qdrant but missing in PostgreSQL -> PostgreSQL wins, point rejected
                metrics.rejected_mismatched_count += 1
                continue

            if not chunk.is_active:
                # Inactive chunk rejected
                metrics.rejected_mismatched_count += 1
                continue

            if (
                chunk.embedding_model != EMBEDDING_MODEL_NAME
                or chunk.embedding_version != EMBEDDING_MODEL_VERSION
            ):
                # Outdated or mismatched embedding version rejected
                metrics.rejected_mismatched_count += 1
                continue

            parent_doc = chunk.document
            doc_title = parent_doc.title if parent_doc else "Portfolio Source"
            doc_type = parent_doc.document_type if parent_doc else "general"
            doc_slug = parent_doc.slug if parent_doc else None
            canonical_url = derive_canonical_url(doc_type, doc_slug)

            score = scores_by_point_id.get(pid, 0.0)

            raw_citations.append(
                GroundedCitation(
                    chunk_id=chunk.id,
                    chunk_index=chunk.chunk_index,
                    chunk_hash=chunk.chunk_hash,
                    document_id=chunk.document_id,
                    document_title=doc_title,
                    heading_path=chunk.heading_path,
                    canonical_url=canonical_url,
                    similarity_score=round(score, 4),
                    document_type=doc_type,
                    project_slug=doc_slug if doc_type in ("project", "caseStudy") else None,
                    content=chunk.chunk_text,
                    token_count=chunk.token_count,
                )
            )

        metrics.postgres_chunks_hydrated = len(raw_citations)
        result.raw_hydrated_count = len(raw_citations)

        # 6. P5.2.5: Deduplicate adjacent/near-identical chunks
        deduped_citations: list[GroundedCitation] = []
        seen_hashes: set[str] = set()

        def _is_duplicate_or_near_identical(new_cit: GroundedCitation, accepted: list[GroundedCitation]) -> bool:
            if new_cit.chunk_hash and new_cit.chunk_hash in seen_hashes:
                return True

            new_words = set(new_cit.content.lower().split())
            if not new_words:
                return False

            for acc in accepted:
                acc_words = set(acc.content.lower().split())
                if not acc_words:
                    continue
                intersection = len(new_words & acc_words)
                union = len(new_words | acc_words)
                jaccard = intersection / union if union > 0 else 0.0

                # 1. Near-identical content (> 75% word overlap)
                if jaccard >= 0.75:
                    return True

                # 2. Adjacent chunks from same document with substantial overlap (> 35% word overlap)
                if (
                    new_cit.document_id == acc.document_id
                    and abs(new_cit.chunk_index - acc.chunk_index) <= 1
                    and jaccard >= 0.35
                ):
                    return True

            return False

        for cit in raw_citations:
            if _is_duplicate_or_near_identical(cit, deduped_citations):
                metrics.deduplicated_count += 1
                continue

            seen_hashes.add(cit.chunk_hash)
            deduped_citations.append(cit)

        # 7. P5.2.6: Select up to max_chunks within configurable context token budget
        selected_citations: list[GroundedCitation] = []
        accumulated_tokens = 0

        for cit in deduped_citations:
            if len(selected_citations) >= max_chunks:
                break
            if accumulated_tokens + cit.token_count > max_tokens and len(selected_citations) > 0:
                # If adding this exceeds budget and we already have at least 1 citation, stop
                break

            selected_citations.append(cit)
            accumulated_tokens += cit.token_count

        metrics.selected_chunks_count = len(selected_citations)
        metrics.selected_tokens_count = accumulated_tokens
        metrics.total_retrieval_latency_ms = round((time.monotonic() - start_time) * 1000, 2)

        result.citations = selected_citations
        result.metrics = metrics
        return result


