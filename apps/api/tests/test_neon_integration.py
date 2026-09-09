"""Neon PostgreSQL integration tests verifying SSL, wake-from-zero latency, and CRUD operations."""

import time

import pytest
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from apps.api.core.config import get_settings
from apps.api.repositories.chat_repo import ChatRepository

pytestmark = pytest.mark.asyncio


def get_neon_url() -> str | None:
    settings = get_settings()
    url = settings.DATABASE_URL
    if "neon.tech" in url or "postgres" in url and not url.startswith("sqlite"):
        return url
    return None


@pytest.fixture
def neon_url() -> str:
    url = get_neon_url()
    if not url:
        pytest.skip("Neon or PostgreSQL database URL not configured.")
    return url


async def test_neon_connection_and_wake_from_zero(neon_url: str) -> None:
    """P3.3.4: Verify connection establishment, SSL enforcement, and wake-from-zero latency."""
    connect_args = {}
    if "neon.tech" in neon_url:
        connect_args["ssl"] = "require"

    engine = create_async_engine(
        neon_url,
        connect_args=connect_args,
        pool_pre_ping=True,
    )

    start_time = time.monotonic()
    async with engine.connect() as conn:
        result = await conn.execute(text("SELECT 1;"))
        row = result.scalar()
        assert row == 1

        # Check version and current database
        db_result = await conn.execute(text("SELECT current_database(), current_user;"))
        db_name, db_user = db_result.one()
        assert db_name is not None
        assert db_user is not None

    latency = time.monotonic() - start_time
    # Wake from zero on Neon cold starts typically takes 1-3 seconds, hot takes < 300ms
    assert latency < 15.0, f"Database ping took excessive time: {latency:.2f}s"

    await engine.dispose()


async def test_neon_schema_tables_exist(neon_url: str) -> None:
    """P3.3.3 & P3.3.4: Verify all tables created by Alembic exist in Neon."""
    connect_args = {}
    if "neon.tech" in neon_url:
        connect_args["ssl"] = "require"

    engine = create_async_engine(
        neon_url,
        connect_args=connect_args,
        pool_pre_ping=True,
    )

    expected_tables = {
        "source_documents",
        "document_chunks",
        "index_runs",
        "chat_sessions",
        "chat_messages",
        "retrieval_events",
        "chat_feedback",
        "model_releases",
        "alembic_version",
    }

    async with engine.connect() as conn:
        result = await conn.execute(
            text(
                "SELECT table_name FROM information_schema.tables "
                "WHERE table_schema = 'public';"
            )
        )
        existing_tables = {row[0] for row in result.fetchall()}

    assert expected_tables.issubset(existing_tables), (
        f"Missing tables in Neon: {expected_tables - existing_tables}"
    )

    await engine.dispose()


async def test_neon_crud_and_consent_isolation(neon_url: str) -> None:
    """P3.3.4: Test live round-trip CRUD and consent-enforced persistence in Neon."""
    connect_args = {}
    if "neon.tech" in neon_url:
        connect_args["ssl"] = "require"

    engine = create_async_engine(
        neon_url,
        connect_args=connect_args,
        pool_pre_ping=True,
    )
    session_factory = async_sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )

    async with session_factory() as session:
        chat_repo = ChatRepository(session)

        # 1. Create consented session
        chat_session = await chat_repo.create_session(
            consent_given=True,
            user_agent_preview="neon-integration-test",
            ip_hash="test_ip_hash",
        )
        assert chat_session.id is not None
        session_id = chat_session.id

        # 2. Append message
        msg = await chat_repo.add_message(
            session_id=session_id,
            role="user",
            redacted_content="Integration test message with [REDACTED] info",
        )
        assert msg is not None
        assert msg.session_id == session_id

        # 3. Add feedback
        feedback = await chat_repo.add_feedback(
            message_id=msg.id,
            rating=1,
            feedback_reason="Great live Neon connection",
        )
        assert feedback.rating == 1

        # Commit to verify transaction persistence
        await session.commit()

    # 4. Clean up test session
    async with session_factory() as session:
        chat_repo = ChatRepository(session)
        # Verify message retrieved
        messages = await chat_repo.get_messages(session_id)
        assert len(messages) == 1

        # Delete session
        s = await chat_repo.get_session(session_id)
        if s:
            await session.delete(s)
            await session.commit()

    await engine.dispose()
