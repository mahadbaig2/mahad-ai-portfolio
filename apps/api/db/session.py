"""Database engine and async session dependency management."""

import logging
from collections.abc import AsyncIterator

from sqlalchemy import text
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from apps.api.core.config import get_settings

logger = logging.getLogger(__name__)

_async_engine: AsyncEngine | None = None
_session_factory: async_sessionmaker[AsyncSession] | None = None


def get_engine() -> AsyncEngine:
    """Return singleton AsyncEngine configured for Neon PostgreSQL."""
    global _async_engine
    if _async_engine is None:
        settings = get_settings()
        connect_args = {}

        # Handle asyncpg SSL requirements for cloud Neon instances
        if "neon.tech" in settings.DATABASE_URL or settings.ENVIRONMENT == "production":
            connect_args["ssl"] = "require"

        _async_engine = create_async_engine(
            settings.DATABASE_URL,
            echo=False,
            pool_pre_ping=True,  # Critical for Neon wake-from-zero reconnection
            pool_size=5,
            max_overflow=5,
            connect_args=connect_args,
        )
    return _async_engine


def get_session_factory() -> async_sessionmaker[AsyncSession]:
    """Return singleton async sessionmaker."""
    global _session_factory
    if _session_factory is None:
        engine = get_engine()
        _session_factory = async_sessionmaker(
            bind=engine,
            class_=AsyncSession,
            expire_on_commit=False,
            autoflush=False,
        )
    return _session_factory


async def get_db() -> AsyncIterator[AsyncSession]:
    """FastAPI dependency yielding an async database session with auto-rollback on error."""
    session_maker = get_session_factory()
    async with session_maker() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


async def ping_database() -> bool:
    """Execute a simple SELECT 1 probe to verify database connectivity."""
    try:
        engine = get_engine()
        async with engine.connect() as conn:
            result = await conn.execute(text("SELECT 1"))
            return result.scalar() == 1
    except Exception as e:
        logger.warning("Database ping failed: %s", str(e))
        return False
