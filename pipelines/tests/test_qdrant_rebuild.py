"""Integration tests for live or mocked collection rebuild and Qdrant provider (P5.3.4, P5.3.5)."""

import pytest
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from apps.api.db.base import Base
from apps.api.providers.doubles import MockVectorProvider
from apps.api.repositories.document_repo import DocumentRepository
from pipelines.ingestion.embedder import DeterministicMockEmbedder
from pipelines.rebuild_index import rebuild_qdrant_index


@pytest.mark.asyncio
async def test_rebuild_index_pipeline() -> None:
    """P5.3.4 & P5.3.5: Prove index rebuild from canonical PostgreSQL chunks."""
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    session_factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with session_factory() as session:
        doc_repo = DocumentRepository(session)
        embedder = DeterministicMockEmbedder()
        vector_provider = MockVectorProvider()

        # Seed PostgreSQL
        doc = await doc_repo.upsert_source_document(
            sanity_id="doc-rebuild-test",
            document_type="project",
            slug="rebuild-test",
            title="Rebuild Test",
            content_hash="h_rebuild",
        )
        c1 = await doc_repo.create_chunk(
            document_id=doc.id,
            chunk_index=0,
            chunk_text="Rebuild chunk 1 text content for vector restoration.",
            token_count=10,
            heading_path="Heading 1",
            chunk_hash="ch1",
            embedding_model="intfloat/multilingual-e5-small",
            embedding_version="1.0.0",
        )
        c2 = await doc_repo.create_chunk(
            document_id=doc.id,
            chunk_index=1,
            chunk_text="Rebuild chunk 2 text content for vector restoration.",
            token_count=10,
            heading_path="Heading 2",
            chunk_hash="ch2",
            embedding_model="intfloat/multilingual-e5-small",
            embedding_version="1.0.0",
        )
        await session.commit()

        # Execute rebuild
        result = await rebuild_qdrant_index(
            session=session,
            vector_provider=vector_provider,
            embedder=embedder,
            delete_only=False,
        )

        assert result["status"] == "success"
        assert result["points_rebuilt"] == 2
        assert len(vector_provider.points) == 2
        assert str(c1.id) in vector_provider.points
        assert str(c2.id) in vector_provider.points

        # Now test delete_only
        del_result = await rebuild_qdrant_index(
            session=session,
            vector_provider=vector_provider,
            embedder=embedder,
            delete_only=True,
        )
        assert del_result["status"] == "collection_deleted"

    await engine.dispose()
