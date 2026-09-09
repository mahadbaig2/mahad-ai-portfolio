"""Tests for provider interfaces and test doubles."""

import pytest

from apps.api.providers.doubles import (
    MockContentProvider,
    MockDatabaseProvider,
    MockLLMProvider,
    MockVectorProvider,
)


@pytest.mark.asyncio
async def test_mock_vector_provider() -> None:
    """Verify in-memory vector provider test double."""
    provider = MockVectorProvider()
    assert await provider.health_check() is True

    # Upsert points
    points = [
        {"id": "pt-1", "vector": [0.1, 0.2], "payload": {"text": "Mahad project 1"}},
        {"id": "pt-2", "vector": [0.3, 0.4], "payload": {"text": "Mahad project 2"}},
    ]
    upserted = await provider.upsert(points)
    assert upserted == 2

    # Search
    results = await provider.search([0.1, 0.2], top_k=1)
    assert len(results) == 1
    assert results[0]["point_id"] in ("pt-1", "pt-2")

    # Delete
    deleted = await provider.delete(["pt-1"])
    assert deleted == 1
    assert len(provider.points) == 1


@pytest.mark.asyncio
async def test_mock_llm_provider() -> None:
    """Verify deterministic LLM provider test double."""
    provider = MockLLMProvider(canned_response="Hello world")
    res = await provider.generate([{"role": "user", "content": "hi"}])
    assert res == "Hello world"

    tokens: list[str] = []
    async for token in provider.stream([{"role": "user", "content": "hi"}]):
        tokens.append(token)
    assert "".join(tokens).strip() == "Hello world"


@pytest.mark.asyncio
async def test_mock_content_and_db_provider() -> None:
    """Verify content and database provider test doubles."""
    db_provider = MockDatabaseProvider(is_alive=True)
    assert await db_provider.ping() is True

    docs = [
        {"_type": "project", "title": "CardioScan", "ragEnabled": True},
        {"_type": "project", "title": "INDKOM", "ragEnabled": False},
        {"_type": "article", "title": "Portfolio Note", "ragEnabled": True},
    ]
    content_provider = MockContentProvider(documents=docs)

    rag_projects = await content_provider.fetch_documents(["project"], rag_only=True)
    assert len(rag_projects) == 1
    assert rag_projects[0]["title"] == "CardioScan"

    all_projects = await content_provider.fetch_documents(["project"], rag_only=False)
    assert len(all_projects) == 2
