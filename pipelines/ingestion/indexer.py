"""Offline RAG Ingestion & PostgreSQL Manifest Synchronization Pipeline (P4.3.4 - P4.3.7)."""

import argparse
import asyncio
import logging
from datetime import UTC, datetime
from typing import Any

from pydantic import BaseModel, ConfigDict
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from apps.api.core.config import get_settings
from apps.api.db.models.document import IndexRun
from apps.api.repositories.document_repo import DocumentRepository
from pipelines.ingestion.chunker import HeadingAwareChunker
from pipelines.ingestion.embedder import (
    BaseEmbedder,
    DeterministicMockEmbedder,
    MultilingualE5Embedder,
)
from pipelines.ingestion.normalizer import normalize_sanity_document
from pipelines.ingestion.sanity_extractor import SanityExtractor

logger = logging.getLogger("ingestion.pipeline")


class IngestionResult(BaseModel):
    """Execution summary of an offline ingestion run."""

    model_config = ConfigDict(extra="forbid")

    documents_scanned: int = 0
    documents_indexed: int = 0
    documents_skipped: int = 0
    chunks_created: int = 0
    chunks_deactivated: int = 0
    dry_run: bool = False
    duration_seconds: float = 0.0
    embedding_model: str = ""
    embedding_version: str = ""


class IngestionPipeline:
    """Orchestrates deterministic, idempotent Sanity extraction, chunking, embedding, and PostgreSQL persistence."""

    def __init__(
        self,
        session: AsyncSession,
        embedder: BaseEmbedder | None = None,
        chunker: HeadingAwareChunker | None = None,
        extractor: SanityExtractor | None = None,
    ) -> None:
        self.session = session
        self.embedder = embedder or MultilingualE5Embedder()
        self.chunker = chunker or HeadingAwareChunker()
        self.extractor = extractor or SanityExtractor()
        self.doc_repo = DocumentRepository(session)

    async def ingest(
        self,
        document_id: str | None = None,
        dry_run: bool = False,
        raw_documents: list[dict[str, Any]] | None = None,
    ) -> IngestionResult:
        """P4.3.4 - P4.3.7: Ingest documents from Sanity into PostgreSQL manifest with hash-skipping idempotency."""
        start_time = datetime.now(UTC)
        result = IngestionResult(
            dry_run=dry_run,
            embedding_model=self.embedder.model_name,
            embedding_version=self.embedder.model_version,
        )

        # 1. Fetch documents
        if raw_documents is not None:
            raw_docs = raw_documents
        elif document_id:
            fetched = self.extractor.fetch_document_by_id(document_id)
            raw_docs = [fetched] if fetched else []
        else:
            raw_docs = self.extractor.fetch_all_documents()

        result.documents_scanned = len(raw_docs)

        # 2. Process each document
        for raw in raw_docs:
            if not raw or not isinstance(raw, dict):
                continue

            norm_doc = normalize_sanity_document(raw)

            # Skip documents where RAG is disabled
            if not norm_doc.rag_enabled:
                result.documents_skipped += 1
                # If document previously existed in database, deactivate its chunks
                existing = await self.doc_repo.get_by_sanity_id(norm_doc.sanity_id)
                if existing and not dry_run:
                    deactivated = await self.doc_repo.deactivate_chunks(existing.id)
                    result.chunks_deactivated += deactivated
                continue

            # P4.3.5: Check existing document in PostgreSQL and compare hashes
            existing_doc = await self.doc_repo.get_by_sanity_id(norm_doc.sanity_id)
            if existing_doc and existing_doc.content_hash == norm_doc.content_hash:
                # Content has not changed: SKIP chunking and embedding (idempotency)
                result.documents_skipped += 1
                continue

            # Content is new or modified: chunk and embed
            chunks = self.chunker.chunk_document(norm_doc)
            if not chunks:
                result.documents_skipped += 1
                continue

            if dry_run:
                # In dry-run mode, compute chunks and simulate without writing to database or loading model
                result.documents_indexed += 1
                result.chunks_created += len(chunks)
                continue

            # Batch embed chunks with 'passage: ' prefix
            chunk_texts = [c.content for c in chunks]
            # Batch embedding (P4.3.3)
            _vectors = self.embedder.embed_passages(chunk_texts, batch_size=32)

            # Upsert source document manifest in PostgreSQL (P4.3.4)
            db_doc = await self.doc_repo.upsert_source_document(
                sanity_id=norm_doc.sanity_id,
                document_type=norm_doc.document_type,
                slug=norm_doc.slug or "",
                title=norm_doc.title,
                content_hash=norm_doc.content_hash,
                rag_enabled=norm_doc.rag_enabled,
                metadata_json=norm_doc.metadata,
            )

            # Deactivate previous active chunks for this document
            deactivated = await self.doc_repo.deactivate_chunks(db_doc.id)
            result.chunks_deactivated += deactivated

            # Persist new canonical chunks to PostgreSQL (P4.3.4)
            for c in chunks:
                heading_str = " > ".join(c.heading_path) if c.heading_path else ""
                await self.doc_repo.create_chunk(
                    document_id=db_doc.id,
                    chunk_index=c.chunk_index,
                    chunk_text=c.content,
                    token_count=c.token_count,
                    heading_path=heading_str,
                    chunk_hash=c.content_hash,
                    embedding_model=self.embedder.model_name,
                    embedding_version=self.embedder.model_version,
                    chunk_id=c.chunk_id,
                )
                result.chunks_created += 1

            result.documents_indexed += 1

        # 3. Record audit IndexRun if not dry-run
        if not dry_run and result.documents_scanned > 0:
            index_run = IndexRun(
                run_type="offline_ingestion",
                status="completed",
                documents_scanned=result.documents_scanned,
                documents_indexed=result.documents_indexed,
                chunks_created=result.chunks_created,
                chunks_deactivated=result.chunks_deactivated,
                started_at=start_time,
                completed_at=datetime.now(UTC),
            )
            self.session.add(index_run)
            await self.session.commit()

        end_time = datetime.now(UTC)
        result.duration_seconds = round((end_time - start_time).total_seconds(), 2)
        return result


async def run_cli() -> None:
    """CLI entrypoint for offline ingestion pipeline."""
    parser = argparse.ArgumentParser(description="Offline RAG Ingestion Pipeline")
    parser.add_argument("--document-id", type=str, help="Ingest a single Sanity document by ID")
    parser.add_argument("--dry-run", action="store_true", help="Simulate extraction and chunking without DB writes")
    parser.add_argument("--mock-embedder", action="store_true", help="Use deterministic mock embedder without neural weights")
    parser.add_argument("--env", type=str, default="development", help="Target environment")

    args = parser.parse_args()
    settings = get_settings()

    connect_args = {}
    if "neon.tech" in settings.DATABASE_URL or settings.ENVIRONMENT == "production":
        connect_args["ssl"] = "require"

    engine = create_async_engine(settings.DATABASE_URL, connect_args=connect_args)
    session_factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    embedder: BaseEmbedder
    if args.mock_embedder or args.dry_run:
        embedder = DeterministicMockEmbedder()
    else:
        embedder = MultilingualE5Embedder()

    async with session_factory() as session:
        pipeline = IngestionPipeline(session=session, embedder=embedder)
        print(f"=== Starting Ingestion Pipeline (dry_run={args.dry_run}) ===")
        res = await pipeline.ingest(document_id=args.document_id, dry_run=args.dry_run)
        print(f"=== Completed in {res.duration_seconds}s ===")
        print(f"Documents Scanned:     {res.documents_scanned}")
        print(f"Documents Indexed:     {res.documents_indexed}")
        print(f"Documents Skipped:     {res.documents_skipped}")
        print(f"Chunks Created:        {res.chunks_created}")
        print(f"Chunks Deactivated:    {res.chunks_deactivated}")

    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(run_cli())
