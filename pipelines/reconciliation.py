"""Three-Way CMS, Database, and Vector Reconciliation Tool (P6.1.6).

Detects and repairs drift between:
1. Sanity CMS (authoring truth)
2. Neon PostgreSQL (operational truth)
3. Qdrant Cloud (derived vector index)

Usage:
    python -m pipelines.reconciliation
    python -m pipelines.reconciliation --repair
    python -m pipelines.reconciliation --mock
"""

import argparse
import asyncio
import logging
import uuid
from typing import Any

from pydantic import BaseModel, ConfigDict
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from apps.api.core.config import get_settings
from apps.api.providers.base import VectorProvider
from apps.api.providers.doubles import MockVectorProvider
from apps.api.providers.qdrant import QdrantVectorProvider
from apps.api.repositories.document_repo import DocumentRepository
from pipelines.ingestion.embedder import (
    BaseEmbedder,
    DeterministicMockEmbedder,
    MultilingualE5Embedder,
)
from pipelines.ingestion.normalizer import (
    derive_canonical_url,
    normalize_sanity_document,
)
from pipelines.ingestion.sanity_extractor import SanityExtractor

logger = logging.getLogger("reconciliation")


class ReconciliationReport(BaseModel):
    """Structured audit report of drift across Sanity, PostgreSQL, and Qdrant."""

    model_config = ConfigDict(extra="forbid")

    sanity_rag_documents_count: int = 0
    postgres_active_documents_count: int = 0
    postgres_active_chunks_count: int = 0
    qdrant_points_count: int = 0

    # Drift lists
    sanity_missing_in_postgres: list[str] = []
    content_hash_mismatches: list[str] = []
    postgres_chunks_missing_in_qdrant: list[str] = []
    qdrant_orphan_points: list[str] = []

    is_clean: bool = True
    repairs_applied: int = 0


async def run_reconciliation(
    session: AsyncSession,
    vector_provider: VectorProvider,
    embedder: BaseEmbedder,
    extractor: SanityExtractor | None = None,
    repair: bool = False,
) -> ReconciliationReport:
    """Compare Sanity, PostgreSQL, and Qdrant and optionally reconcile drift."""
    report = ReconciliationReport()
    doc_repo = DocumentRepository(session)

    # 1. Fetch from Sanity
    raw_docs: list[dict[str, Any]] = []
    if extractor:
        try:
            raw_docs = extractor.fetch_all_documents()
        except Exception as e:
            logger.warning(f"Could not extract from Sanity: {e}")

    sanity_rag_docs: dict[str, dict[str, Any]] = {}
    for d in raw_docs:
        norm = normalize_sanity_document(d)
        if norm.rag_enabled:
            sanity_rag_docs[norm.sanity_id] = {
                "norm": norm,
                "raw": d,
            }
    report.sanity_rag_documents_count = len(sanity_rag_docs)

    # 2. Fetch from PostgreSQL
    pg_docs = await doc_repo.get_all_active_documents()
    report.postgres_active_documents_count = len(pg_docs)
    pg_docs_by_sanity_id = {d.sanity_id: d for d in pg_docs}

    pg_chunks = await doc_repo.get_all_active_chunks()
    report.postgres_active_chunks_count = len(pg_chunks)
    pg_chunk_ids = {c.id for c in pg_chunks}

    # 3. Fetch from Qdrant
    qdrant_point_ids: set[uuid.UUID] = set()
    if isinstance(vector_provider, QdrantVectorProvider):
        try:
            # Scroll all point IDs
            offset = None
            while True:
                scroll_res = await vector_provider.client.scroll(
                    collection_name=vector_provider.collection_name,
                    limit=200,
                    offset=offset,
                    with_payload=False,
                    with_vectors=False,
                )
                points, next_offset = scroll_res
                for p in points:
                    try:
                        qdrant_point_ids.add(uuid.UUID(str(p.id)))
                    except ValueError:
                        pass
                if next_offset is None or not points:
                    break
                offset = next_offset
        except Exception as q_err:
            logger.warning(f"Failed to scroll Qdrant points: {q_err}")
    elif hasattr(vector_provider, "points"):
        for pid in vector_provider.points.keys():
            try:
                qdrant_point_ids.add(uuid.UUID(pid))
            except ValueError:
                pass

    report.qdrant_points_count = len(qdrant_point_ids)

    # 4. Check Drift
    # A. Sanity vs PostgreSQL
    for sid, sdata in sanity_rag_docs.items():
        if sid not in pg_docs_by_sanity_id:
            report.sanity_missing_in_postgres.append(sid)
        elif pg_docs_by_sanity_id[sid].content_hash != sdata["norm"].content_hash:
            report.content_hash_mismatches.append(sid)

    # B. PostgreSQL vs Qdrant
    for chunk_id in pg_chunk_ids:
        if chunk_id not in qdrant_point_ids:
            report.postgres_chunks_missing_in_qdrant.append(str(chunk_id))

    # C. Qdrant Orphans (Points in Qdrant with no active PostgreSQL chunk)
    for q_pid in qdrant_point_ids:
        if q_pid not in pg_chunk_ids:
            report.qdrant_orphan_points.append(str(q_pid))

    report.is_clean = (
        len(report.sanity_missing_in_postgres) == 0
        and len(report.content_hash_mismatches) == 0
        and len(report.postgres_chunks_missing_in_qdrant) == 0
        and len(report.qdrant_orphan_points) == 0
    )

    # 5. Apply Repairs if requested
    if repair and not report.is_clean:
        logger.info("Repairing detected reconciliation drift...")
        repairs = 0

        # Re-sync Sanity documents missing or drifted in PostgreSQL
        if report.sanity_missing_in_postgres or report.content_hash_mismatches:
            from pipelines.ingestion.synchronizer import IncrementalSynchronizer

            synchronizer = IncrementalSynchronizer(
                session=session,
                vector_provider=vector_provider,
                embedder=embedder,
            )
            for sid in set(report.sanity_missing_in_postgres + report.content_hash_mismatches):
                if sid in sanity_rag_docs:
                    sync_res = await synchronizer.handle_event("update", sanity_rag_docs[sid]["raw"])
                    if sync_res.status == "completed":
                        repairs += 1
                        logger.info(f"Reconciled and indexed drifted Sanity document: {sid}")

        # Purge Qdrant orphan points (P6.1.3 & P6.1.6)
        if report.qdrant_orphan_points:
            await vector_provider.delete(report.qdrant_orphan_points)
            repairs += len(report.qdrant_orphan_points)
            logger.info(f"Purged {len(report.qdrant_orphan_points)} orphan points from Qdrant.")


        # Re-index missing PG chunks into Qdrant
        if report.postgres_chunks_missing_in_qdrant:
            missing_uuids = [uuid.UUID(uid) for uid in report.postgres_chunks_missing_in_qdrant]
            missing_chunks = [c for c in pg_chunks if c.id in missing_uuids]

            if missing_chunks:
                texts = [c.chunk_text for c in missing_chunks]
                vectors = embedder.embed_passages(texts)
                points_to_add = []
                for c, vec in zip(missing_chunks, vectors, strict=True):
                    parent_doc = c.document
                    doc_type = parent_doc.document_type if parent_doc else "general"
                    slug = parent_doc.slug if parent_doc else None
                    points_to_add.append({
                        "id": str(c.id),
                        "vector": vec,
                        "payload": {
                            "document_id": str(c.document_id),
                            "document_type": doc_type,
                            "project_slug": slug,
                            "language": "en",
                            "target_audiences": ["general"],
                            "heading_path": c.heading_path,
                            "canonical_url": derive_canonical_url(doc_type, slug),
                            "embedding_version": c.embedding_version,
                            "is_active": True,
                            "text_preview": c.chunk_text[:160],
                        },
                    })
                upserted = await vector_provider.upsert(points_to_add)
                repairs += upserted
                logger.info(f"Restored {upserted} missing chunks to Qdrant.")

        report.repairs_applied = repairs

    return report


def print_report(rep: ReconciliationReport) -> None:
    print("=" * 80)
    print(" " * 22 + "THREE-WAY RECONCILIATION REPORT (P6.1.6)")
    print("=" * 80)
    print(f"Sanity RAG Documents:         {rep.sanity_rag_documents_count}")
    print(f"PostgreSQL Active Documents:  {rep.postgres_active_documents_count}")
    print(f"PostgreSQL Active Chunks:     {rep.postgres_active_chunks_count}")
    print(f"Qdrant Points:                {rep.qdrant_points_count}")
    print("-" * 80)
    print(f"Sanity Missing in PostgreSQL: {len(rep.sanity_missing_in_postgres)}")
    for sid in rep.sanity_missing_in_postgres:
        print(f"  - [Missing in DB] {sid}")
    print(f"Content Hash Mismatches:      {len(rep.content_hash_mismatches)}")
    for sid in rep.content_hash_mismatches:
        print(f"  - [Hash Drift]    {sid}")
    print(f"Postgres Missing in Qdrant:   {len(rep.postgres_chunks_missing_in_qdrant)}")
    for cid in rep.postgres_chunks_missing_in_qdrant[:5]:
        print(f"  - [Missing in Qdrant] {cid}")
    print(f"Qdrant Orphan Points:         {len(rep.qdrant_orphan_points)}")
    for pid in rep.qdrant_orphan_points[:5]:
        print(f"  - [Orphan in Qdrant]  {pid}")
    print("-" * 80)
    if rep.is_clean:
        print("RESULT: All three layers (Sanity, PostgreSQL, Qdrant) are IN PERFECT SYNC! [PASS]")
    else:
        print(f"RESULT: Drift detected! Repairs applied: {rep.repairs_applied}")
    print("=" * 80)


async def main() -> None:
    parser = argparse.ArgumentParser(description="Three-Way Reconciliation Tool")
    parser.add_argument("--repair", action="store_true", help="Automatically repair detected drift")
    parser.add_argument("--mock", action="store_true", help="Run with mock provider")
    args = parser.parse_args()

    settings = get_settings()

    embedder: BaseEmbedder
    vector_provider: VectorProvider
    extractor: SanityExtractor | None = None

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
        extractor = SanityExtractor()
        connect_args: dict[str, Any] = {}
        if "neon.tech" in settings.DATABASE_URL or settings.ENVIRONMENT == "production":
            connect_args["ssl"] = "require"
        engine = create_async_engine(settings.DATABASE_URL, connect_args=connect_args)

    session_factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with session_factory() as session:
        report = await run_reconciliation(
            session=session,
            vector_provider=vector_provider,
            embedder=embedder,
            extractor=extractor,
            repair=args.repair,
        )
        print_report(report)

    await engine.dispose()
    if not args.mock and hasattr(vector_provider, "close"):
        await vector_provider.close()


if __name__ == "__main__":
    asyncio.run(main())
