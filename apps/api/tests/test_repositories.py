"""Integration tests for SQLAlchemy repositories and session cleanup service."""

import uuid
from collections.abc import AsyncIterator
from datetime import UTC, datetime

import pytest
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from apps.api.db.base import Base
from apps.api.repositories.chat_repo import ChatRepository
from apps.api.repositories.document_repo import DocumentRepository
from apps.api.services.session_cleanup import SessionCleanupService


@pytest.fixture
async def db_session() -> AsyncIterator[AsyncSession]:
    """Provide an isolated in-memory SQLite database session for unit tests."""
    engine = create_async_engine(
        "sqlite+aiosqlite:///:memory:",
        echo=False,
    )
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    session_maker = async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)
    async with session_maker() as session:
        yield session

    await engine.dispose()


@pytest.mark.asyncio
async def test_document_repository_lifecycle(db_session: AsyncSession) -> None:
    """Test upserting documents, creating canonical chunks, and hydrating by point IDs."""
    repo = DocumentRepository(db_session)

    # 1. Upsert source document
    sanity_id = "test-doc-123"
    doc = await repo.upsert_source_document(
        sanity_id=sanity_id,
        document_type="project",
        slug="cardioscan-ai",
        title="CardioScan AI",
        content_hash="hash-abc-123",
        rag_enabled=True,
    )
    assert doc.id is not None
    assert doc.slug == "cardioscan-ai"

    # 2. Add canonical chunks
    chunk_point_id = uuid.uuid4()
    chunk = await repo.create_chunk(
        document_id=doc.id,
        chunk_index=0,
        chunk_text="CardioScan AI processes paired stress and rest myocardial perfusion images.",
        token_count=14,
        heading_path="CardioScan AI > Architecture",
        chunk_hash="chunk-hash-999",
        embedding_model="intfloat/multilingual-e5-small",
        embedding_version="1.0.0",
        chunk_id=chunk_point_id,
    )
    assert chunk.id == chunk_point_id

    # 3. Hydrate chunks by Qdrant point IDs
    hydrated = await repo.get_chunks_by_point_ids([chunk_point_id])
    assert len(hydrated) == 1
    assert hydrated[0].chunk_text == chunk.chunk_text
    assert hydrated[0].document_id == doc.id

    # 4. Deactivate chunks
    deactivated_count = await repo.deactivate_chunks(doc.id)
    assert deactivated_count == 1

    # Inactive chunks should not be hydrated
    hydrated_after = await repo.get_chunks_by_point_ids([chunk_point_id])
    assert len(hydrated_after) == 0


@pytest.mark.asyncio
async def test_chat_repository_consent_enforcement(db_session: AsyncSession) -> None:
    """Verify that messages are stored ONLY if session has affirmative user consent."""
    repo = ChatRepository(db_session)

    # 1. Session without consent
    unconsented_session = await repo.create_session(consent_given=False, persona="engineer")
    msg_unconsented = await repo.add_message(
        session_id=unconsented_session.id,
        role="user",
        redacted_content="Tell me about CardioScan",
    )
    assert msg_unconsented is None, "Messages must NOT be persisted without affirmative consent"

    # 2. Session with consent
    consented_session = await repo.create_session(consent_given=True, persona="recruiter")
    msg_consented = await repo.add_message(
        session_id=consented_session.id,
        role="user",
        redacted_content="What was Mahad's role at Busyfile?",
    )
    assert msg_consented is not None
    assert msg_consented.redacted_content == "What was Mahad's role at Busyfile?"

    # 3. Add feedback
    feedback = await repo.add_feedback(
        message_id=msg_consented.id,
        rating=1,
        feedback_reason="Accurate and grounded answer",
    )
    assert feedback.rating == 1
    assert feedback.message_id == msg_consented.id

    # 4. Record retrieval event
    retrieval = await repo.record_retrieval(
        message_id=msg_consented.id,
        query_text="What was Mahad's role at Busyfile?",
        chunks_retrieved_count=3,
        cited_chunk_ids=["chunk-1", "chunk-2"],
        similarity_scores=[0.92, 0.88],
        evidence_score=0.90,
    )
    assert retrieval.chunks_retrieved_count == 3
    assert len(retrieval.cited_chunk_ids) == 2


@pytest.mark.asyncio
async def test_session_cleanup_service(db_session: AsyncSession) -> None:
    """Test P3.2.9: Retention cleanup purges only expired sessions."""
    repo = ChatRepository(db_session)
    cleanup_service = SessionCleanupService(db_session)

    now = datetime.now(UTC)

    # 1. Create an expired session (ttl = -1 hour)
    expired_session = await repo.create_session(consent_given=True, ttl_hours=-2)
    await repo.add_message(expired_session.id, role="user", redacted_content="Old question")

    # 2. Create an active session (ttl = 48 hours)
    active_session = await repo.create_session(consent_given=True, ttl_hours=48)
    await repo.add_message(active_session.id, role="user", redacted_content="Active question")

    # 3. Run cleanup
    purged_count = await cleanup_service.cleanup_expired_sessions(reference_time=now)
    assert purged_count == 1

    # Verify expired session is gone
    assert await repo.get_session(expired_session.id) is None

    # Verify active session is still present
    assert await repo.get_session(active_session.id) is not None
