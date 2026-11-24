"""Verify canonical lexical retrieval used by memory-constrained deployments."""

import pytest
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from apps.api.db.base import Base
from apps.api.repositories.document_repo import DocumentRepository
from apps.api.services.lexical_retrieval import LexicalRetrievalService


@pytest.mark.asyncio
async def test_lexical_retrieval_cites_exact_public_project_and_excludes_restricted() -> None:
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.create_all)
    factory = async_sessionmaker(engine, expire_on_commit=False)
    async with factory() as session:
        repo = DocumentRepository(session)
        public = await repo.upsert_source_document(
            sanity_id="project-alder-legal",
            document_type="project",
            slug="alder-legal",
            title="Alder Legal",
            content_hash="alder-hash",
            rag_enabled=True,
        )
        restricted = await repo.upsert_source_document(
            sanity_id="project-indkom",
            document_type="project",
            slug="indkom-private",
            title="Restricted Client",
            content_hash="restricted-hash",
            rag_enabled=False,
        )
        await repo.create_chunk(
            document_id=public.id,
            chunk_index=0,
            chunk_text="Alder Legal uses mock demonstration data for its intake workflow.",
            token_count=11,
            heading_path="Alder Legal",
            chunk_hash="alder-chunk",
            embedding_model="intfloat/multilingual-e5-small",
        )
        await repo.create_chunk(
            document_id=restricted.id,
            chunk_index=0,
            chunk_text="Restricted client intake workflow uses confidential material.",
            token_count=9,
            heading_path="Restricted Client",
            chunk_hash="restricted-chunk",
            embedding_model="intfloat/multilingual-e5-small",
        )
        await session.commit()

        service = LexicalRetrievalService(session)
        exact = await service.retrieve("Does Alder Legal use mock data?", project_slug="alder-legal")
        broad = await service.retrieve("Which intake workflow uses mock demonstration data?")

        assert len(exact.citations) == 1
        assert exact.citations[0].canonical_url == "/work/alder-legal"
        assert exact.citations[0].similarity_score >= 0.55
        assert [citation.document_title for citation in broad.citations] == ["Alder Legal"]

    await engine.dispose()
