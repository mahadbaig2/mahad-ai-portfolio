"""Incremental CMS Synchronization Service (P6.1.1 - P6.1.5).

Implements create, update, unpublish, and delete events with atomic,
zero-downtime version transitions:
1. Write new chunks and vectors before deactivating old versions (P6.1.2)
2. Delete stale Qdrant points only after new version validation (P6.1.3)
3. Preserve previous active versions upon partial failure (P6.1.5)
4. Record every run and error summary in index_runs (P6.1.4)
"""

import asyncio
import logging
import uuid
from datetime import UTC, datetime
from typing import Any

from pydantic import BaseModel, ConfigDict
from sqlalchemy.ext.asyncio import AsyncSession

from apps.api.db.models.document import IndexRun
from apps.api.providers.base import VectorProvider
from apps.api.repositories.document_repo import DocumentRepository
from pipelines.ingestion.chunker import HeadingAwareChunker
from pipelines.ingestion.contracts import NormalizedDocument
from pipelines.ingestion.embedder import (
    BaseEmbedder,
    MultilingualE5Embedder,
)
from pipelines.ingestion.normalizer import (
    derive_canonical_url,
    normalize_sanity_document,
)

logger = logging.getLogger("ingestion.synchronizer")

# Global lock to prevent overlapping synchronization runs from corrupting versions (P6.2.5)
_SYNC_LOCK = asyncio.Lock()


class SyncEventResult(BaseModel):
    """Execution summary of an incremental synchronization event."""

    model_config = ConfigDict(extra="forbid")

    event_type: str
    sanity_id: str
    status: str
    chunks_created: int = 0
    chunks_deactivated: int = 0
    vectors_upserted: int = 0
    vectors_deleted: int = 0
    error_message: str | None = None
    duration_ms: float = 0.0


class IncrementalSynchronizer:
    """Manages transactional CMS-to-index synchronization with version rollback protection."""

    def __init__(
        self,
        session: AsyncSession,
        vector_provider: VectorProvider,
        embedder: BaseEmbedder | None = None,
        chunker: HeadingAwareChunker | None = None,
    ) -> None:
        self.session = session
        self.vector_provider = vector_provider
        self.embedder = embedder or MultilingualE5Embedder()
        self.chunker = chunker or HeadingAwareChunker()
        self.doc_repo = DocumentRepository(session)

    async def handle_event(
        self,
        event_type: str,
        document_data: dict[str, Any],
    ) -> SyncEventResult:
        """Route and execute incremental ingestion events with concurrency control."""
        async with _SYNC_LOCK:
            start_time = datetime.now(UTC)
            sanity_id = document_data.get("_id", document_data.get("id", "unknown"))

            # Clean draft prefix from sanity_id if present
            if sanity_id.startswith("drafts."):
                sanity_id = sanity_id.replace("drafts.", "")

            result = SyncEventResult(
                event_type=event_type,
                sanity_id=sanity_id,
                status="started",
            )

            index_run = IndexRun(
                run_type=f"incremental_{event_type}",
                status="running",
                documents_scanned=1,
                started_at=start_time,
            )
            self.session.add(index_run)
            await self.session.flush()

            try:
                if event_type in ("create", "update", "publish"):
                    await self._sync_publish_or_update(document_data, sanity_id, result)
                elif event_type in ("unpublish", "disable_rag"):
                    await self._sync_unpublish(sanity_id, result)
                elif event_type == "delete":
                    await self._sync_delete(sanity_id, result)
                else:
                    raise ValueError(f"Unsupported synchronization event: {event_type}")

                result.status = "completed"
                index_run.status = "completed"
                index_run.documents_indexed = 1 if result.chunks_created > 0 else 0
                index_run.chunks_created = result.chunks_created
                index_run.chunks_deactivated = result.chunks_deactivated
                index_run.completed_at = datetime.now(UTC)
                await self.session.commit()

            except Exception as exc:
                await self.session.rollback()
                logger.error(f"Sync event {event_type} for {sanity_id} failed: {exc}", exc_info=True)
                result.status = "failed"
                result.error_message = str(exc)

                # Record error in new transaction
                try:
                    error_run = IndexRun(
                        run_type=f"incremental_{event_type}",
                        status="failed",
                        documents_scanned=1,
                        documents_indexed=0,
                        error_summary=str(exc),
                        started_at=start_time,
                        completed_at=datetime.now(UTC),
                    )
                    self.session.add(error_run)
                    await self.session.commit()
                except Exception as log_err:
                    logger.warning(f"Could not persist error index_run: {log_err}")

            finally:
                end_time = datetime.now(UTC)
                result.duration_ms = round((end_time - start_time).total_seconds() * 1000, 2)

            return result

    async def _sync_publish_or_update(
        self,
        document_data: dict[str, Any],
        sanity_id: str,
        result: SyncEventResult,
    ) -> None:
        """P6.1.2, P6.1.3, P6.1.5: Atomic write-before-deactivate version update."""
        norm_doc: NormalizedDocument = normalize_sanity_document(document_data)

        # If document is marked rag_enabled: false, treat as unpublish from vector index
        if not norm_doc.rag_enabled:
            await self._sync_unpublish(sanity_id, result)
            return

        # Check existing document
        existing_doc = await self.doc_repo.get_by_sanity_id(sanity_id)
        if existing_doc and existing_doc.content_hash == norm_doc.content_hash:
            logger.info(f"Document {sanity_id} content unchanged (hash: {norm_doc.content_hash}). Skipping.")
            result.status = "skipped_unchanged"
            return

        # 1. Fetch stale chunk IDs before creating new ones
        stale_chunk_ids: list[uuid.UUID] = []
        next_version = 1
        if existing_doc:
            next_version = existing_doc.version + 1
            stale_chunks = await self.doc_repo.get_active_chunks_by_document(existing_doc.id)
            stale_chunk_ids = [c.id for c in stale_chunks]

        # 2. Chunk document
        chunks = self.chunker.chunk_document(norm_doc)
        if not chunks:
            logger.warning(f"Document {sanity_id} produced 0 chunks.")
            return

        # 3. Batch embed with 'passage: ' prefix
        chunk_texts = [c.content for c in chunks]
        vectors = self.embedder.embed_passages(chunk_texts, batch_size=32)

        # 4. Upsert source document manifest in PostgreSQL
        db_doc = await self.doc_repo.upsert_source_document(
            sanity_id=sanity_id,
            document_type=norm_doc.document_type,
            slug=norm_doc.slug or "",
            title=norm_doc.title,
            content_hash=norm_doc.content_hash,
            version=next_version,
            rag_enabled=True,
            publish_status="published",
            metadata_json=norm_doc.metadata,
        )

        # 5. Persist NEW chunks to PostgreSQL with is_active=True (P6.1.2)
        new_chunk_ids: list[uuid.UUID] = []
        new_points: list[dict[str, Any]] = []

        for i, c in enumerate(chunks):
            heading_str = " > ".join(c.heading_path) if c.heading_path else ""
            db_chunk = await self.doc_repo.create_chunk(
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
            new_chunk_ids.append(db_chunk.id)

            new_points.append({
                "id": str(db_chunk.id),
                "vector": vectors[i],
                "payload": {
                    "document_id": str(db_doc.id),
                    "document_type": norm_doc.document_type,
                    "project_slug": norm_doc.slug,
                    "language": norm_doc.language,
                    "target_audiences": norm_doc.target_audiences,
                    "heading_path": heading_str,
                    "canonical_url": derive_canonical_url(norm_doc.document_type, norm_doc.slug),
                    "embedding_version": self.embedder.model_version,
                    "is_active": True,
                    "text_preview": c.content[:160],
                },
            })

        result.chunks_created = len(new_chunk_ids)

        # 6. Upsert new vectors to Qdrant (P6.1.2)
        upserted_count = await self.vector_provider.upsert(new_points)
        result.vectors_upserted = upserted_count

        # 7. VALIDATION: Only after new vectors are successfully in Qdrant, deactivate stale chunks
        if stale_chunk_ids:
            deactivated_count = await self.doc_repo.deactivate_chunks_by_ids(stale_chunk_ids)
            result.chunks_deactivated = deactivated_count

            # 8. Delete stale points from Qdrant (P6.1.3)
            stale_str_ids = [str(cid) for cid in stale_chunk_ids]
            deleted_count = await self.vector_provider.delete(stale_str_ids)
            result.vectors_deleted = deleted_count

        logger.info(
            f"Successfully synchronized {sanity_id}: "
            f"+{result.chunks_created} chunks, -{result.chunks_deactivated} stale chunks."
        )

    async def _sync_unpublish(self, sanity_id: str, result: SyncEventResult) -> None:
        """Deactivate all chunks and delete vectors when content is unpublished or rag disabled."""
        existing = await self.doc_repo.get_by_sanity_id(sanity_id)
        if not existing:
            result.status = "not_found"
            return

        # Fetch active chunks to delete from Qdrant
        active_chunks = await self.doc_repo.get_active_chunks_by_document(existing.id)
        stale_ids = [str(c.id) for c in active_chunks]

        # Deactivate in PostgreSQL
        deactivated = await self.doc_repo.deactivate_chunks(existing.id)
        existing.rag_enabled = False
        existing.publish_status = "unpublished"
        await self.session.flush()

        # Delete points from Qdrant
        if stale_ids:
            deleted = await self.vector_provider.delete(stale_ids)
            result.vectors_deleted = deleted

        result.chunks_deactivated = deactivated
        logger.info(f"Unpublished {sanity_id}: deactivated {deactivated} chunks, deleted {len(stale_ids)} vectors.")

    async def _sync_delete(self, sanity_id: str, result: SyncEventResult) -> None:
        """Delete document manifest and purge vectors when content is deleted in Sanity."""
        existing = await self.doc_repo.get_by_sanity_id(sanity_id)
        if not existing:
            result.status = "not_found"
            return

        active_chunks = await self.doc_repo.get_active_chunks_by_document(existing.id)
        stale_ids = [str(c.id) for c in active_chunks]

        # Delete from Qdrant
        if stale_ids:
            deleted = await self.vector_provider.delete(stale_ids)
            result.vectors_deleted = deleted

        # Delete from PostgreSQL
        await self.doc_repo.delete_document(sanity_id)
        result.chunks_deactivated = len(stale_ids)
        logger.info(f"Deleted {sanity_id}: purged {len(stale_ids)} vectors and database records.")
