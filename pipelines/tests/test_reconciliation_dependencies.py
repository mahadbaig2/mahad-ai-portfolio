"""Tests verifying reconciliation pipeline dependency completeness and startup."""

from pathlib import Path

import pytest
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from apps.api.db.base import Base
from apps.api.providers.doubles import MockVectorProvider
from pipelines.ingestion.embedder import DeterministicMockEmbedder
from pipelines.reconciliation import run_reconciliation

ROOT_DIR = Path(__file__).resolve().parent.parent.parent
PIPELINES_REQUIREMENTS = ROOT_DIR / "pipelines" / "requirements.txt"


def test_pipelines_requirements_declares_reconciliation_dependencies() -> None:
    """Ensure pipelines/requirements.txt includes all packages imported by pipelines.reconciliation."""
    content = PIPELINES_REQUIREMENTS.read_text(encoding="utf-8").lower()
    required_packages = [
        "pydantic",
        "pydantic-settings",
        "python-dotenv",
        "sqlalchemy",
        "asyncpg",
        "aiosqlite",
        "qdrant-client",
        "httpx",
        "sentence-transformers",
    ]
    for pkg in required_packages:
        assert pkg in content, f"Missing required reconciliation dependency '{pkg}' in pipelines/requirements.txt"


@pytest.mark.asyncio
async def test_reconciliation_mock_startup_and_execution() -> None:
    """Verify pipelines.reconciliation imports and runs end-to-end against in-memory mock providers."""
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    session_factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with session_factory() as session:
        report = await run_reconciliation(
            session=session,
            vector_provider=MockVectorProvider(),
            embedder=DeterministicMockEmbedder(),
            extractor=None,
            repair=True,
        )
        assert report.is_clean is True
        assert report.repairs_applied == 0

    await engine.dispose()

