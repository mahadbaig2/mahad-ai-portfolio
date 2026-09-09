"""Unit and integration tests for Qdrant vector retrieval, hydration, and version validation (Phase 5)."""

from collections.abc import AsyncGenerator

import pytest
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from apps.api.db.base import Base
from apps.api.providers.doubles import VectorStoreDouble
from apps.api.repositories.document_repo import DocumentRepository
from apps.api.services.retrieval_service import RetrievalService
from pipelines.ingestion.embedder import DeterministicMockEmbedder


@pytest.fixture
async def test_session() -> AsyncGenerator[AsyncSession, None]:
    """Create in-memory SQLite database for retrieval test isolation."""
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    session_factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with session_factory() as session:
        yield session

    await engine.dispose()


@pytest.mark.asyncio
async def test_two_phase_retrieval_and_hydration(test_session: AsyncSession) -> None:
    """P5.2.1 - P5.2.6: Test vector search followed by canonical PostgreSQL chunk hydration."""
    doc_repo = DocumentRepository(test_session)
    vector_double = VectorStoreDouble()
    embedder = DeterministicMockEmbedder()

    # 1. Seed PostgreSQL with source document and chunks
    doc = await doc_repo.upsert_source_document(
        sanity_id="project-cardioscan-ai",
        document_type="project",
        slug="cardioscan-ai",
        title="CardioScan AI",
        content_hash="hash_cardioscan",
        rag_enabled=True,
    )

    chunk_1 = await doc_repo.create_chunk(
        document_id=doc.id,
        chunk_index=0,
        chunk_text="CardioScan AI achieves 18ms inference latency on CPU using 1D ResNet.",
        token_count=18,
        heading_path="CardioScan AI > Architecture",
        chunk_hash="chunk_hash_1",
        embedding_model="intfloat/multilingual-e5-small",
        embedding_version="1.0.0",
    )

    chunk_2 = await doc_repo.create_chunk(
        document_id=doc.id,
        chunk_index=1,
        chunk_text="Clinical validation was performed on 12-lead ECGs with 0.984 AUROC.",
        token_count=16,
        heading_path="CardioScan AI > Clinical Results",
        chunk_hash="chunk_hash_2",
        embedding_model="intfloat/multilingual-e5-small",
        embedding_version="1.0.0",
    )
    await test_session.commit()

    # 2. Seed VectorStoreDouble with matching point UUIDs
    await vector_double.upsert([
        {
            "point_id": str(chunk_1.id),
            "vector": embedder.embed_passages([chunk_1.chunk_text])[0],
            "payload": {
                "document_id": str(doc.id),
                "document_type": "project",
                "project_slug": "cardioscan-ai",
                "is_active": True,
                "embedding_version": "1.0.0",
            },
        },
        {
            "point_id": str(chunk_2.id),
            "vector": embedder.embed_passages([chunk_2.chunk_text])[0],
            "payload": {
                "document_id": str(doc.id),
                "document_type": "project",
                "project_slug": "cardioscan-ai",
                "is_active": True,
                "embedding_version": "1.0.0",
            },
        },
    ])

    # 3. Execute retrieval
    service = RetrievalService(
        session=test_session,
        vector_provider=vector_double,
        embedder=embedder,
    )

    result = await service.retrieve(query="CardioScan inference latency", top_k=5, score_threshold=0.0)

    # 4. Verify Grounded Citations (P5.2.5)
    assert len(result.citations) == 2
    assert result.metrics.qdrant_points_returned == 2
    assert result.metrics.postgres_chunks_hydrated == 2
    assert result.metrics.rejected_mismatched_count == 0

    first_cit = result.citations[0]
    assert first_cit.document_title == "CardioScan AI"
    assert first_cit.canonical_url == "/work/cardioscan-ai"
    assert first_cit.project_slug == "cardioscan-ai"
    assert "CardioScan AI achieves 18ms" in first_cit.content

    # Verify timing metrics recorded (P5.2.6)
    assert result.metrics.embed_latency_ms >= 0.0
    assert result.metrics.total_retrieval_latency_ms >= 0.0


@pytest.mark.asyncio
async def test_rejection_of_inactive_and_mismatched_chunks(test_session: AsyncSession) -> None:
    """P5.2.4: Reject inactive chunks, outdated embedding versions, or orphan vector points."""
    doc_repo = DocumentRepository(test_session)
    vector_double = VectorStoreDouble()
    embedder = DeterministicMockEmbedder()

    doc = await doc_repo.upsert_source_document(
        sanity_id="doc-test-rejection",
        document_type="article",
        slug="rejection-test",
        title="Rejection Test",
        content_hash="h1",
    )

    # Inactive chunk
    inactive_chunk = await doc_repo.create_chunk(
        document_id=doc.id,
        chunk_index=0,
        chunk_text="Old chunk that should be rejected",
        token_count=10,
        heading_path="Heading",
        chunk_hash="ch1",
        embedding_model="intfloat/multilingual-e5-small",
        embedding_version="1.0.0",
    )
    inactive_chunk.is_active = False

    # Mismatched model version chunk
    old_version_chunk = await doc_repo.create_chunk(
        document_id=doc.id,
        chunk_index=1,
        chunk_text="Old version chunk that should be rejected",
        token_count=10,
        heading_path="Heading",
        chunk_hash="ch2",
        embedding_model="intfloat/multilingual-e5-small",
        embedding_version="0.8.0",  # Outdated version
    )

    await test_session.commit()

    # Seed vector store with inactive chunk, old version chunk, and an orphan point
    import uuid
    orphan_uuid = uuid.uuid4()

    await vector_double.upsert([
        {"point_id": str(inactive_chunk.id), "vector": [0.1] * 384, "payload": {}},
        {"point_id": str(old_version_chunk.id), "vector": [0.2] * 384, "payload": {}},
        {"point_id": str(orphan_uuid), "vector": [0.3] * 384, "payload": {}},
    ])

    service = RetrievalService(session=test_session, vector_provider=vector_double, embedder=embedder)
    result = await service.retrieve(query="Test rejection", top_k=5, score_threshold=0.0)

    # All three must be excluded
    assert len(result.citations) == 0
    assert result.metrics.rejected_mismatched_count == 3


@pytest.mark.asyncio
async def test_empty_search_results(test_session: AsyncSession) -> None:
    """P5.2.7: Ensure empty vector search returns clean result with zero citations."""
    vector_double = VectorStoreDouble()
    embedder = DeterministicMockEmbedder()

    service = RetrievalService(session=test_session, vector_provider=vector_double, embedder=embedder)
    result = await service.retrieve(query="Nonexistent topic", top_k=5)

    assert len(result.citations) == 0
    assert result.metrics.qdrant_points_returned == 0
    assert result.metrics.postgres_chunks_hydrated == 0


@pytest.mark.asyncio
async def test_deduplication_of_overlapping_chunks(test_session: AsyncSession) -> None:
    """P5.2.5: Ensure identical hashes or adjacent chunks with heavy word overlap are deduplicated."""
    doc_repo = DocumentRepository(test_session)
    vector_double = VectorStoreDouble()
    embedder = DeterministicMockEmbedder()

    doc = await doc_repo.upsert_source_document(
        sanity_id="doc-dedup",
        document_type="project",
        slug="dedup-project",
        title="Dedup Project",
        content_hash="hash_dedup",
    )

    # Chunk 0
    chunk_0 = await doc_repo.create_chunk(
        document_id=doc.id,
        chunk_index=0,
        chunk_text="FastAPI backend architecture with PostgreSQL database and Qdrant vector retrieval.",
        token_count=15,
        heading_path="Overview",
        chunk_hash="hash_c0",
        embedding_model="intfloat/multilingual-e5-small",
        embedding_version="1.0.0",
    )

    # Chunk 1: Adjacent and heavily overlapping (>35% shared words)
    chunk_1 = await doc_repo.create_chunk(
        document_id=doc.id,
        chunk_index=1,
        chunk_text="FastAPI backend architecture with PostgreSQL database and Qdrant vector retrieval additional details.",
        token_count=17,
        heading_path="Overview > Details",
        chunk_hash="hash_c1",
        embedding_model="intfloat/multilingual-e5-small",
        embedding_version="1.0.0",
    )

    # Chunk 2: Non-adjacent (index 5) distinct content
    chunk_2 = await doc_repo.create_chunk(
        document_id=doc.id,
        chunk_index=5,
        chunk_text="Performance benchmarks indicate sub-50 millisecond response time under load.",
        token_count=12,
        heading_path="Benchmarks",
        chunk_hash="hash_c2",
        embedding_model="intfloat/multilingual-e5-small",
        embedding_version="1.0.0",
    )

    await test_session.commit()

    await vector_double.upsert([
        {"point_id": str(chunk_0.id), "vector": [0.1] * 384, "payload": {}},
        {"point_id": str(chunk_1.id), "vector": [0.1] * 384, "payload": {}},
        {"point_id": str(chunk_2.id), "vector": [0.1] * 384, "payload": {}},
    ])

    service = RetrievalService(session=test_session, vector_provider=vector_double, embedder=embedder)
    result = await service.retrieve(query="FastAPI architecture", top_k=10, score_threshold=0.0)

    # Chunk 1 is deduplicated because it is adjacent to Chunk 0 and shares high overlap
    assert len(result.citations) == 2
    assert result.metrics.deduplicated_count == 1
    assert result.citations[0].chunk_id == chunk_0.id
    assert result.citations[1].chunk_id == chunk_2.id


@pytest.mark.asyncio
async def test_context_token_budget_and_max_chunks_limit(test_session: AsyncSession) -> None:
    """P5.2.6: Verify retrieval selects up to max 5 chunks and respects token budget."""
    doc_repo = DocumentRepository(test_session)
    vector_double = VectorStoreDouble()
    embedder = DeterministicMockEmbedder()

    doc = await doc_repo.upsert_source_document(
        sanity_id="doc-budget",
        document_type="project",
        slug="budget-project",
        title="Budget Project",
        content_hash="hash_budget",
    )

    # Create 7 distinct chunks with completely different contents
    distinct_texts = [
        "Data ingestion pipeline processes live telemetry streams using Kafka and stores time-series records.",
        "User interface is designed in Next.js using server components and strict TypeScript type checking.",
        "Authentication and authorization protocols use OAuth2 with JWT tokens validated at the reverse proxy.",
        "Database persistence layer relies on async SQLAlchemy with PostgreSQL connection pooling enabled.",
        "Query routing classifier predicts user intent and directs traffic to specialized retrieval pathways.",
        "Observability stack collects OpenTelemetry traces and structured JSON logs for audit compliance.",
        "Model serving container runs ONNX Runtime on Linux with SIMD vector instruction acceleration.",
    ]
    chunks = []
    for i, txt in enumerate(distinct_texts):
        c = await doc_repo.create_chunk(
            document_id=doc.id,
            chunk_index=i * 3,  # non-adjacent
            chunk_text=txt,
            token_count=100,  # 100 tokens each
            heading_path=f"Section {i}",
            chunk_hash=f"hash_{i}",
            embedding_model="intfloat/multilingual-e5-small",
            embedding_version="1.0.0",
        )
        chunks.append(c)


    await test_session.commit()

    await vector_double.upsert([
        {"point_id": str(c.id), "vector": [0.1] * 384, "payload": {}}
        for c in chunks
    ])

    service = RetrievalService(session=test_session, vector_provider=vector_double, embedder=embedder)

    # Case 1: Max chunks limit = 5
    res1 = await service.retrieve(query="subsystem capabilities", top_k=10, max_chunks=5, max_tokens=10000, score_threshold=0.0)
    assert len(res1.citations) == 5
    assert res1.metrics.selected_chunks_count == 5

    # Case 2: Token budget constraint (250 tokens budget -> max 2 chunks of 100 tokens)
    res2 = await service.retrieve(query="subsystem capabilities", top_k=10, max_chunks=5, max_tokens=250, score_threshold=0.0)
    assert len(res2.citations) == 2
    assert res2.metrics.selected_tokens_count == 200

