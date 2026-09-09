"""Full Qdrant Index Rebuild & Collection Recovery (P5.3.4, P5.3.5).

Recreates Qdrant collection, indexes, and repopulates vectors from PostgreSQL
canonical chunks or live Sanity authored documents.

Safety Rules:
- Requires explicit --confirm-rebuild flag.
- Never runs in production without explicit confirmation.
- Displays target database and collection before destructive changes.

Usage:
    python -m pipelines.rebuild_index --confirm-rebuild
    python -m pipelines.rebuild_index --confirm-rebuild --mock
    python -m pipelines.rebuild_index --delete-collection-only --confirm-rebuild
"""

import argparse
import asyncio
import logging
import sys
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import selectinload

from apps.api.core.config import get_settings
from apps.api.db.models.document import DocumentChunk
from apps.api.providers.base import VectorProvider
from apps.api.providers.doubles import MockVectorProvider
from apps.api.providers.qdrant import QdrantVectorProvider
from pipelines.ingestion.embedder import (
    BaseEmbedder,
    DeterministicMockEmbedder,
    MultilingualE5Embedder,
)
from pipelines.ingestion.normalizer import derive_canonical_url

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("rebuild_index")


async def rebuild_qdrant_index(
    session: AsyncSession,
    vector_provider: VectorProvider,
    embedder: BaseEmbedder,
    delete_only: bool = False,
) -> dict[str, Any]:
    """Execute collection recreation and vector repopulation from canonical PostgreSQL chunks."""
    logger.info("Initializing collection recreation in vector provider...")

    if hasattr(vector_provider, "ensure_collection_exists"):
        await vector_provider.ensure_collection_exists(recreate=True)
        logger.info("Collection recreated and payload indexes initialized.")

    if delete_only:
        logger.info("Delete-only flag active. Index cleared.")
        return {"status": "collection_deleted", "points_rebuilt": 0}

    # Query all active canonical chunks from PostgreSQL
    query = (
        select(DocumentChunk)
        .options(selectinload(DocumentChunk.document))
        .where(DocumentChunk.is_active == True)  # noqa: E712
        .order_by(DocumentChunk.document_id, DocumentChunk.chunk_index)
    )
    res = await session.execute(query)
    chunks = list(res.scalars().all())

    logger.info(f"Found {len(chunks)} active canonical chunks in PostgreSQL to index.")

    if not chunks:
        logger.warning("No active chunks found in PostgreSQL. Run ingestion pipeline first.")
        return {"status": "no_chunks_found", "points_rebuilt": 0}

    # Embed and upsert in batches
    batch_size = 32
    total_upserted = 0

    for i in range(0, len(chunks), batch_size):
        batch = chunks[i : i + batch_size]
        texts = [c.chunk_text for c in batch]
        vectors = embedder.embed_passages(texts, batch_size=batch_size)

        points = []
        for chunk, vec in zip(batch, vectors, strict=True):
            parent_doc = chunk.document
            doc_type = parent_doc.document_type if parent_doc else "general"
            slug = parent_doc.slug if parent_doc else None

            points.append({
                "id": str(chunk.id),
                "vector": vec,
                "payload": {
                    "document_id": str(chunk.document_id),
                    "document_type": doc_type,
                    "project_slug": slug,
                    "language": "en",
                    "target_audiences": ["general"],
                    "heading_path": chunk.heading_path,
                    "canonical_url": derive_canonical_url(doc_type, slug),
                    "embedding_version": chunk.embedding_version,
                    "is_active": True,
                    "text_preview": chunk.chunk_text[:160],
                },
            })

        upserted = await vector_provider.upsert(points)
        total_upserted += upserted
        logger.info(f"Indexed batch {i // batch_size + 1}: {len(points)} points.")

    logger.info(f"Successfully rebuilt Qdrant index: {total_upserted} total points indexed.")
    return {"status": "success", "points_rebuilt": total_upserted}


async def main() -> None:
    parser = argparse.ArgumentParser(description="Full Qdrant Index Rebuild")
    parser.add_argument(
        "--confirm-rebuild",
        action="store_true",
        help="Mandatory safety confirmation flag to execute destructive collection recreation",
    )
    parser.add_argument(
        "--delete-collection-only",
        action="store_true",
        help="Wipe and recreate collection without repopulating points (for suspension test)",
    )
    parser.add_argument(
        "--mock",
        action="store_true",
        help="Run against mock provider and in-memory DB",
    )

    args = parser.parse_args()

    if not args.confirm_rebuild:
        print("\n[ERROR] Destructive operation aborted: --confirm-rebuild flag is required.")
        print("Usage: python -m pipelines.rebuild_index --confirm-rebuild\n")
        sys.exit(1)

    settings = get_settings()

    print("=" * 80)
    print(" " * 26 + "QDRANT INDEX REBUILD (P5.3.4)")
    print("=" * 80)
    print(f"Target Environment:    {settings.ENVIRONMENT}")
    print(f"Collection Name:       {settings.QDRANT_COLLECTION_NAME}")
    print(f"PostgreSQL Database:   {settings.DATABASE_URL.split('@')[-1] if '@' in settings.DATABASE_URL else 'local'}")
    print(f"Mock Mode:             {args.mock}")
    print("=" * 80)

    embedder: BaseEmbedder
    vector_provider: VectorProvider

    if args.mock:
        from apps.api.db.base import Base
        embedder = DeterministicMockEmbedder()
        vector_provider = MockVectorProvider()
        engine = create_async_engine("sqlite+aiosqlite:///:memory:")
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
    else:

        embedder = MultilingualE5Embedder()
        vector_provider = QdrantVectorProvider()
        connect_args: dict[str, Any] = {}
        if "neon.tech" in settings.DATABASE_URL or settings.ENVIRONMENT == "production":
            connect_args["ssl"] = "require"
        engine = create_async_engine(settings.DATABASE_URL, connect_args=connect_args)

    session_factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with session_factory() as session:
        result = await rebuild_qdrant_index(
            session=session,
            vector_provider=vector_provider,
            embedder=embedder,
            delete_only=args.delete_collection_only,
        )
        print(f"\nRebuild Outcome: {result}\n")

    await engine.dispose()
    if not args.mock and hasattr(vector_provider, "close"):
        await vector_provider.close()


if __name__ == "__main__":
    asyncio.run(main())
