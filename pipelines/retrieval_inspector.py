"""CLI Retrieval Inspector (P5.2.7).

Inspect two-phase vector search in Qdrant, PostgreSQL hydration, deduplication,
context budgeting, latency metrics, and grounded citations.

Usage:
    python -m pipelines.retrieval_inspector "What is CardioScan AI?"
    python -m pipelines.retrieval_inspector "Next.js performance" --document-type article --top-k 5
    python -m pipelines.retrieval_inspector "CardioScan" --mock
"""

import argparse
import asyncio
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from apps.api.core.config import get_settings
from apps.api.providers.base import VectorProvider
from apps.api.providers.doubles import MockVectorProvider
from apps.api.providers.qdrant import QdrantVectorProvider
from apps.api.services.retrieval_service import RetrievalResult, RetrievalService
from pipelines.ingestion.embedder import (
    BaseEmbedder,
    DeterministicMockEmbedder,
    MultilingualE5Embedder,
)


def print_banner() -> None:
    print("=" * 80)
    print(" " * 24 + "RAG RETRIEVAL INSPECTOR (P5.2.7)")
    print("=" * 80)


def display_results(res: RetrievalResult) -> None:
    print(f"\nQuery: '{res.query}'")
    if res.filters_applied:
        print(f"Applied Filters: {res.filters_applied}")
    else:
        print("Applied Filters: None")

    print("\n--- TIMING & METRICS ---")
    print(f"  Embedding Latency:          {res.metrics.embed_latency_ms:>6.2f} ms")
    print(f"  Qdrant Search Latency:      {res.metrics.qdrant_search_latency_ms:>6.2f} ms")
    print(f"  PostgreSQL Hydration:       {res.metrics.postgres_hydration_latency_ms:>6.2f} ms")
    print(f"  Total Retrieval Latency:    {res.metrics.total_retrieval_latency_ms:>6.2f} ms")
    print(f"  Points Returned by Qdrant:  {res.metrics.qdrant_points_returned}")
    print(f"  Raw Hydrated from Postgres: {res.raw_hydrated_count}")
    print(f"  Rejected (version/inactive):{res.metrics.rejected_mismatched_count}")
    print(f"  Deduplicated (overlap/dup): {res.metrics.deduplicated_count}")
    print(f"  Final Selected Chunks:      {res.metrics.selected_chunks_count}")
    print(f"  Total Context Tokens:       {res.metrics.selected_tokens_count}")

    if not res.citations:
        print("\n[!] No grounded citations met the similarity threshold and filter criteria.")
        print("=" * 80)
        return

    print("\n--- GROUNDED CITATIONS ---")
    for i, cit in enumerate(res.citations, 1):
        print(f"\n[Citation #{i}] Score: {cit.similarity_score:.4f} | Type: {cit.document_type}")
        print(f"  Title:        {cit.document_title}")
        print(f"  Heading Path: {cit.heading_path or '(root)'}")
        print(f"  Canonical URL: {cit.canonical_url}")
        print(f"  Chunk UUID:   {cit.chunk_id} (Index: {cit.chunk_index}, Tokens: {cit.token_count})")
        print("  Snippet:")
        # Indent snippet
        for line in cit.content.strip().split("\n")[:4]:
            print(f"    {line}")
        if len(cit.content.strip().split("\n")) > 4:
            print("    ...")

    print("\n" + "=" * 80)


async def main() -> None:
    parser = argparse.ArgumentParser(description="CLI Retrieval Inspector")
    parser.add_argument("query", type=str, help="Search query string")
    parser.add_argument("--top-k", type=int, default=12, help="Number of points to retrieve from Qdrant")
    parser.add_argument("--score-threshold", type=float, default=0.55, help="Minimum cosine similarity threshold")
    parser.add_argument("--max-chunks", type=int, default=5, help="Maximum number of chunks to return")
    parser.add_argument("--max-tokens", type=int, default=1500, help="Maximum token budget for returned chunks")
    parser.add_argument("--target-audience", type=str, default=None, help="Audience filter")
    parser.add_argument("--project-slug", type=str, default=None, help="Filter by specific project slug")
    parser.add_argument("--language", type=str, default=None, help="Filter by language code (e.g. en, ur)")
    parser.add_argument("--mock", action="store_true", help="Run with mock embedder and vector provider")

    args = parser.parse_args()
    print_banner()

    settings = get_settings()

    embedder: BaseEmbedder
    vector_provider: VectorProvider

    if args.mock:
        embedder = DeterministicMockEmbedder()
        vector_provider = MockVectorProvider()
        engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    else:
        embedder = MultilingualE5Embedder()
        vector_provider = QdrantVectorProvider()
        connect_args: dict[str, Any] = {}
        if "neon.tech" in settings.DATABASE_URL or settings.ENVIRONMENT == "production":
            connect_args["ssl"] = "require"
        engine = create_async_engine(settings.DATABASE_URL, connect_args=connect_args)

    session_factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with session_factory() as session:
        service = RetrievalService(
            session=session,
            vector_provider=vector_provider,
            embedder=embedder,
        )

        result = await service.retrieve(
            query=args.query,
            top_k=args.top_k,
            score_threshold=args.score_threshold,
            max_chunks=args.max_chunks,
            max_tokens=args.max_tokens,
            target_audience=args.target_audience,
            project_slug=args.project_slug,
            language=args.language,
        )

        display_results(result)

    await engine.dispose()
    if not args.mock and hasattr(vector_provider, "close"):
        await vector_provider.close()


if __name__ == "__main__":
    asyncio.run(main())
