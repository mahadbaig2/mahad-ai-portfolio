"""Repository for source documents and canonical RAG chunks."""

import uuid
from typing import Any

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from apps.api.db.models.document import DocumentChunk, SourceDocument


class DocumentRepository:
    """Encapsulates all persistence operations for documents and canonical chunks."""

    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_by_sanity_id(self, sanity_id: str) -> SourceDocument | None:
        stmt = select(SourceDocument).where(SourceDocument.sanity_id == sanity_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_slug(self, slug: str) -> SourceDocument | None:
        stmt = select(SourceDocument).where(SourceDocument.slug == slug)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def upsert_source_document(
        self,
        sanity_id: str,
        document_type: str,
        slug: str,
        title: str,
        content_hash: str,
        version: int = 1,
        rag_enabled: bool = True,
        publish_status: str = "published",
        metadata_json: dict[str, Any] | None = None,
    ) -> SourceDocument:
        """Create or update a source document manifest record."""
        doc = await self.get_by_sanity_id(sanity_id)
        if doc is None:
            doc = SourceDocument(
                sanity_id=sanity_id,
                document_type=document_type,
                slug=slug,
                title=title,
                content_hash=content_hash,
                version=version,
                rag_enabled=rag_enabled,
                publish_status=publish_status,
                metadata_json=metadata_json or {},
            )
            self.session.add(doc)
        else:
            doc.document_type = document_type
            doc.slug = slug
            doc.title = title
            doc.content_hash = content_hash
            doc.version = version
            doc.rag_enabled = rag_enabled
            doc.publish_status = publish_status
            doc.metadata_json = metadata_json or {}

        await self.session.flush()
        return doc

    async def create_chunk(
        self,
        document_id: uuid.UUID,
        chunk_index: int,
        chunk_text: str,
        token_count: int,
        heading_path: str,
        chunk_hash: str,
        embedding_model: str,
        embedding_version: str = "1.0.0",
        chunk_id: uuid.UUID | None = None,
    ) -> DocumentChunk:
        """Store a canonical text chunk. Optionally supply explicit point UUID."""
        chunk = DocumentChunk(
            id=chunk_id or uuid.uuid4(),
            document_id=document_id,
            chunk_index=chunk_index,
            chunk_text=chunk_text,
            token_count=token_count,
            heading_path=heading_path,
            chunk_hash=chunk_hash,
            embedding_model=embedding_model,
            embedding_version=embedding_version,
            is_active=True,
        )
        self.session.add(chunk)
        await self.session.flush()
        return chunk

    async def get_chunks_by_point_ids(self, point_ids: list[uuid.UUID]) -> list[DocumentChunk]:
        """Hydrate canonical chunks from PostgreSQL by Qdrant point UUIDs.

        Critical rule from AGENTS.md:
        Qdrant is only an index; full canonical chunk text lives in PostgreSQL.
        """
        if not point_ids:
            return []
        from sqlalchemy.orm import selectinload

        stmt = (
            select(DocumentChunk)
            .options(selectinload(DocumentChunk.document))
            .where(DocumentChunk.id.in_(point_ids), DocumentChunk.is_active.is_(True))
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def get_active_chunks_by_document(self, document_id: uuid.UUID) -> list[DocumentChunk]:
        """Fetch all active chunks belonging to a document ordered by chunk_index."""
        stmt = (
            select(DocumentChunk)
            .where(DocumentChunk.document_id == document_id, DocumentChunk.is_active.is_(True))
            .order_by(DocumentChunk.chunk_index.asc())
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def deactivate_chunks(self, document_id: uuid.UUID) -> int:
        """Mark all chunks for a document as inactive."""
        stmt = (
            update(DocumentChunk)
            .where(DocumentChunk.document_id == document_id)
            .values(is_active=False)
        )
        result = await self.session.execute(stmt)
        return int(getattr(result, "rowcount", 0))

    async def deactivate_chunks_by_ids(self, chunk_ids: list[uuid.UUID]) -> int:
        """Mark specific chunks as inactive (used when replacing with new version)."""
        if not chunk_ids:
            return 0
        stmt = (
            update(DocumentChunk)
            .where(DocumentChunk.id.in_(chunk_ids))
            .values(is_active=False)
        )
        result = await self.session.execute(stmt)
        return int(getattr(result, "rowcount", 0))

    async def get_all_active_documents(self) -> list[SourceDocument]:
        """Fetch all source documents where rag_enabled is True."""
        stmt = (
            select(SourceDocument)
            .where(SourceDocument.rag_enabled.is_(True))
            .order_by(SourceDocument.updated_at.desc())
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def get_all_active_chunks(self) -> list[DocumentChunk]:
        """Fetch all active chunks with loaded parent documents."""
        from sqlalchemy.orm import selectinload

        stmt = (
            select(DocumentChunk)
            .options(selectinload(DocumentChunk.document))
            .where(DocumentChunk.is_active.is_(True))
            .order_by(DocumentChunk.document_id, DocumentChunk.chunk_index)
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def delete_document(self, sanity_id: str) -> bool:
        """Delete a source document and cascade-delete its chunks."""
        doc = await self.get_by_sanity_id(sanity_id)
        if doc:
            await self.session.delete(doc)
            await self.session.flush()
            return True
        return False

