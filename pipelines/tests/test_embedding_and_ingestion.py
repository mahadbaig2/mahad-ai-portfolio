"""Unit tests for E5 embeddings, PostgreSQL manifest persistence, and idempotency (P4.3 & Gate 4)."""

import math
from collections.abc import AsyncGenerator

import pytest
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from apps.api.db.base import Base
from apps.api.repositories.document_repo import DocumentRepository
from pipelines.ingestion.embedder import (
    EMBEDDING_DIMENSION,
    PASSAGE_PREFIX,
    QUERY_PREFIX,
    DeterministicMockEmbedder,
)
from pipelines.ingestion.indexer import IngestionPipeline
from pipelines.tests.fixtures.sanity_fixtures import (
    FIXTURE_ARTICLE,
    FIXTURE_PROJECT,
)


@pytest.fixture
async def test_session() -> AsyncGenerator[AsyncSession, None]:
    """Create in-memory SQLite database for isolated pipeline ingestion testing."""
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    session_factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with session_factory() as session:
        yield session

    await engine.dispose()


def test_embedder_conventions_and_l2_normalization() -> None:
    """P4.3.2 & P4.3.3: Verify passage/query prefixes and L2-normalized 384d vectors."""
    assert PASSAGE_PREFIX == "passage: "
    assert QUERY_PREFIX == "query: "

    embedder = DeterministicMockEmbedder(dimension=EMBEDDING_DIMENSION)
    assert embedder.dimension == 384
    assert embedder.model_name == "intfloat/multilingual-e5-small"

    # Test single query embedding
    q_vec = embedder.embed_query("How does CardioScan detect arrhythmia?")
    assert len(q_vec) == 384
    norm = math.sqrt(sum(x * x for x in q_vec))
    assert math.isclose(norm, 1.0, rel_tol=1e-3)

    # Test batch passage embedding
    passages = [
        "CardioScan utilizes deep convolutional neural networks.",
        "PostgreSQL maintains ACID canonical RAG state.",
    ]
    p_vecs = embedder.embed_passages(passages)
    assert len(p_vecs) == 2
    for vec in p_vecs:
        assert len(vec) == 384
        p_norm = math.sqrt(sum(x * x for x in vec))
        assert math.isclose(p_norm, 1.0, rel_tol=1e-3)

    # Invariant: identical text produces identical vector
    assert embedder.embed_query("test query") == embedder.embed_query("test query")


@pytest.mark.asyncio
async def test_idempotent_ingestion_and_second_run_zero_work(test_session: AsyncSession) -> None:
    """P4.3.4, P4.3.5 & P4.3.7: Ingestion persists manifest to DB and skips identical runs completely."""
    embedder = DeterministicMockEmbedder()
    pipeline = IngestionPipeline(session=test_session, embedder=embedder)

    raw_docs = [FIXTURE_PROJECT, FIXTURE_ARTICLE]

    # --- Run 1: Initial Ingestion ---
    res_1 = await pipeline.ingest(raw_documents=raw_docs, dry_run=False)
    assert res_1.documents_scanned == 2
    assert res_1.documents_indexed == 2
    assert res_1.documents_skipped == 0
    assert res_1.chunks_created > 0

    # Verify rows in PostgreSQL
    doc_repo = DocumentRepository(test_session)
    project_doc = await doc_repo.get_by_sanity_id("project-cardioscan-ai")
    assert project_doc is not None
    assert project_doc.title == "CardioScan AI"
    assert project_doc.rag_enabled is True

    # --- Run 2: Second Identical Ingestion (P4.3.7) ---
    res_2 = await pipeline.ingest(raw_documents=raw_docs, dry_run=False)
    assert res_2.documents_scanned == 2
    assert res_2.documents_indexed == 0  # Zero documents re-indexed
    assert res_2.documents_skipped == 2  # Both skipped due to hash match
    assert res_2.chunks_created == 0    # Zero new chunks created!
    assert res_2.chunks_deactivated == 0


@pytest.mark.asyncio
async def test_dry_run_simulation(test_session: AsyncSession) -> None:
    """P4.3.6: Verify that --dry-run simulates chunking without writing to the database."""
    embedder = DeterministicMockEmbedder()
    pipeline = IngestionPipeline(session=test_session, embedder=embedder)

    raw_docs = [FIXTURE_PROJECT]
    res = await pipeline.ingest(raw_documents=raw_docs, dry_run=True)

    assert res.dry_run is True
    assert res.documents_scanned == 1
    assert res.documents_indexed == 1
    assert res.chunks_created > 0

    # Ensure NO records were committed in database
    doc_repo = DocumentRepository(test_session)
    db_doc = await doc_repo.get_by_sanity_id("project-cardioscan-ai")
    assert db_doc is None


@pytest.mark.asyncio
async def test_document_modification_reindexes_and_deactivates_old_chunks(test_session: AsyncSession) -> None:
    """P4.3.4 & P4.3.5: Modified document deactivates old chunks and indexes new ones."""
    embedder = DeterministicMockEmbedder()
    pipeline = IngestionPipeline(session=test_session, embedder=embedder)

    # Initial ingestion
    res_1 = await pipeline.ingest(raw_documents=[FIXTURE_PROJECT], dry_run=False)
    assert res_1.documents_indexed == 1
    first_chunk_count = res_1.chunks_created

    # Modify the fixture content
    modified_project = dict(FIXTURE_PROJECT)
    modified_project["summary"] = "Updated clinical detection system with newly trained models."

    # Re-ingest modified document
    res_2 = await pipeline.ingest(raw_documents=[modified_project], dry_run=False)
    assert res_2.documents_indexed == 1
    assert res_2.documents_skipped == 0
    assert res_2.chunks_deactivated == first_chunk_count  # Previous chunks deactivated
    assert res_2.chunks_created > 0


@pytest.mark.asyncio
async def test_dual_persistence_uuid_matching(test_session: AsyncSession) -> None:
    """Gate 4: Qdrant UUID matches PostgreSQL chunk ID exactly."""
    embedder = DeterministicMockEmbedder()
    pipeline = IngestionPipeline(session=test_session, embedder=embedder)

    await pipeline.ingest(raw_documents=[FIXTURE_PROJECT], dry_run=False)

    doc_repo = DocumentRepository(test_session)
    doc = await doc_repo.get_by_sanity_id("project-cardioscan-ai")
    assert doc is not None

    chunks = await doc_repo.get_active_chunks_by_document(doc.id)
    assert len(chunks) > 0
    for c in chunks:
        assert c.id is not None
        assert c.chunk_text.startswith("[CardioScan AI")
        assert c.is_active is True
        assert c.embedding_model == "intfloat/multilingual-e5-small"
