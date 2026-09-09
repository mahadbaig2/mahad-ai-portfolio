"""Test doubles and in-memory mocks for provider interfaces."""

from collections.abc import AsyncIterator
from typing import Any

from apps.api.providers.base import (
    ContentProvider,
    DatabaseProvider,
    LLMProvider,
    VectorProvider,
)


class MockVectorProvider(VectorProvider):
    """In-memory test double for VectorProvider."""

    def __init__(self, initial_points: list[dict[str, Any]] | None = None) -> None:
        self.points: dict[str, dict[str, Any]] = {
            p["id"]: p for p in (initial_points or [])
        }
        self.is_healthy: bool = True

    async def search(
        self,
        query_vector: list[float],
        top_k: int = 5,
        score_threshold: float = 0.0,
        filters: dict[str, Any] | None = None,
    ) -> list[dict[str, Any]]:
        # Return mock results
        results = [
            {"point_id": pid, "score": 0.95, "payload": p.get("payload", {})}
            for pid, p in list(self.points.items())[:top_k]
        ]
        return results

    async def upsert(self, points: list[dict[str, Any]]) -> int:
        for p in points:
            self.points[p["id"]] = p
        return len(points)

    async def delete(self, point_ids: list[str]) -> int:
        count = 0
        for pid in point_ids:
            if pid in self.points:
                del self.points[pid]
                count += 1
        return count

    async def health_check(self) -> bool:
        return self.is_healthy


class MockLLMProvider(LLMProvider):
    """Deterministic test double for LLMProvider."""

    def __init__(self, canned_response: str = "Mocked LLM generation") -> None:
        self.canned_response = canned_response

    async def generate(
        self,
        messages: list[dict[str, str]],
        temperature: float = 0.2,
        max_tokens: int = 1000,
    ) -> str:
        return self.canned_response

    async def stream(
        self,
        messages: list[dict[str, str]],
        temperature: float = 0.2,
        max_tokens: int = 1000,
    ) -> AsyncIterator[str]:
        tokens = self.canned_response.split(" ")
        for token in tokens:
            yield token + " "


class MockContentProvider(ContentProvider):
    """In-memory test double for Sanity CMS."""

    def __init__(self, documents: list[dict[str, Any]] | None = None) -> None:
        self.documents = documents or []

    async def fetch_documents(
        self,
        document_types: list[str],
        rag_only: bool = True,
    ) -> list[dict[str, Any]]:
        return [
            d for d in self.documents
            if d.get("_type") in document_types and (not rag_only or d.get("ragEnabled") is True)
        ]


class MockDatabaseProvider(DatabaseProvider):
    """In-memory test double for database operational status."""

    def __init__(self, is_alive: bool = True) -> None:
        self.is_alive = is_alive

    async def ping(self) -> bool:
        return self.is_alive
