"""Bounded canonical retrieval for small CPU deployments without embedding RAM."""

import math
import re
import time
from collections import Counter

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from apps.api.db.models.document import DocumentChunk, SourceDocument
from apps.api.services.retrieval_service import (
    GroundedCitation,
    RetrievalResult,
    RetrievalTimingMetrics,
)
from pipelines.ingestion.normalizer import derive_canonical_url

STOPWORDS = frozenset(
    "a an and are can did do does for from how in is me of on or the to what who why with mahad about tell".split()
)


def _terms(value: str) -> list[str]:
    return [word for word in re.findall(r"[\w]+", value.casefold()) if len(word) > 2 and word not in STOPWORDS]


class LexicalRetrievalService:
    """Rank public Neon chunks with BM25; retain exact project citations."""

    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def retrieve(
        self,
        query: str,
        top_k: int = 10,
        score_threshold: float = 0.40,
        max_chunks: int = 5,
        max_tokens: int = 1500,
        target_audience: str | None = None,
        project_slug: str | None = None,
        language: str | None = None,
    ) -> RetrievalResult:
        start = time.monotonic()
        stmt = (
            select(DocumentChunk)
            .join(SourceDocument)
            .options(selectinload(DocumentChunk.document))
            .where(
                DocumentChunk.is_active.is_(True),
                SourceDocument.rag_enabled.is_(True),
                SourceDocument.publish_status == "published",
            )
        )
        if project_slug:
            stmt = stmt.where(SourceDocument.slug == project_slug)
        chunks = list((await self.session.execute(stmt)).scalars().all())
        metrics = RetrievalTimingMetrics(postgres_chunks_hydrated=len(chunks))
        result = RetrievalResult(
            query=query,
            raw_hydrated_count=len(chunks),
            filters_applied={"project_slug": project_slug} if project_slug else {},
        )
        if not chunks:
            result.metrics = metrics
            return result

        query_terms = set(_terms(query))
        corpus = [Counter(_terms(chunk.chunk_text)) for chunk in chunks]
        lengths = [sum(counts.values()) for counts in corpus]
        average_length = max(sum(lengths) / len(lengths), 1.0)
        document_frequency = Counter(term for counts in corpus for term in counts)

        ranked: list[tuple[float, DocumentChunk]] = []
        for chunk, counts, length in zip(chunks, corpus, lengths, strict=True):
            bm25 = 0.0
            for term in query_terms:
                frequency = counts.get(term, 0)
                if frequency:
                    idf = math.log1p((len(chunks) - document_frequency[term] + 0.5) / (document_frequency[term] + 0.5))
                    bm25 += idf * frequency * 2.2 / (frequency + 1.2 * (0.25 + 0.75 * length / average_length))
            score = 0.9 if project_slug else bm25 / (bm25 + 1.0)
            if score >= score_threshold:
                ranked.append((score, chunk))
        ranked.sort(key=lambda item: item[0], reverse=True)

        citations: list[GroundedCitation] = []
        seen_hashes: set[str] = set()
        selected_tokens = 0
        for score, chunk in ranked[:top_k]:
            if chunk.chunk_hash in seen_hashes or len(citations) >= max_chunks:
                continue
            if citations and selected_tokens + chunk.token_count > max_tokens:
                break
            doc = chunk.document
            citations.append(
                GroundedCitation(
                    chunk_id=chunk.id,
                    chunk_index=chunk.chunk_index,
                    chunk_hash=chunk.chunk_hash,
                    document_id=chunk.document_id,
                    document_title=doc.title,
                    heading_path=chunk.heading_path,
                    canonical_url=derive_canonical_url(doc.document_type, doc.slug),
                    similarity_score=round(score, 4),
                    document_type=doc.document_type,
                    project_slug=doc.slug if doc.document_type in ("project", "caseStudy") else None,
                    content=chunk.chunk_text,
                    token_count=chunk.token_count,
                )
            )
            seen_hashes.add(chunk.chunk_hash)
            selected_tokens += chunk.token_count

        metrics.selected_chunks_count = len(citations)
        metrics.selected_tokens_count = selected_tokens
        metrics.total_retrieval_latency_ms = round((time.monotonic() - start) * 1000, 2)
        result.citations = citations
        result.metrics = metrics
        return result
