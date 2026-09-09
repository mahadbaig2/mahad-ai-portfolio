"""Abstract provider interfaces.

Per AGENTS.md:
No provider SDK (Qdrant, Groq, Sanity, Neon, LangSmith) may leak through domain interfaces.
"""

from abc import ABC, abstractmethod
from collections.abc import AsyncIterator
from typing import Any


class VectorPoint(ABC):
    """Normalized vector point contract."""
    id: str
    vector: list[float]
    payload: dict[str, Any]


class VectorSearchResult(ABC):
    """Normalized search result contract."""
    point_id: str
    score: float
    payload: dict[str, Any]


class VectorProvider(ABC):
    """Abstract interface for vector database operations (e.g. Qdrant)."""

    @abstractmethod
    async def search(
        self,
        query_vector: list[float],
        top_k: int = 5,
        score_threshold: float = 0.0,
        filters: dict[str, Any] | None = None,
    ) -> list[dict[str, Any]]:
        """Search vector collection by embedding."""
        ...

    @abstractmethod
    async def upsert(
        self,
        points: list[dict[str, Any]],
    ) -> int:
        """Upsert vector points. Returns count of upserted items."""
        ...

    @abstractmethod
    async def delete(
        self,
        point_ids: list[str],
    ) -> int:
        """Delete vector points by ID. Returns count of deleted items."""
        ...

    @abstractmethod
    async def health_check(self) -> bool:
        """Verify vector database connectivity."""
        ...


class LLMProvider(ABC):
    """Abstract interface for language model inference (e.g. Groq)."""

    @abstractmethod
    async def generate(
        self,
        messages: list[dict[str, str]],
        temperature: float = 0.2,
        max_tokens: int = 1000,
    ) -> str:
        """Generate full text completion."""
        ...

    @abstractmethod
    def stream(
        self,
        messages: list[dict[str, str]],
        temperature: float = 0.2,
        max_tokens: int = 1000,
    ) -> AsyncIterator[str]:
        """Stream token completion."""
        ...


class ContentProvider(ABC):
    """Abstract interface for authoring content source (e.g. Sanity)."""

    @abstractmethod
    async def fetch_documents(
        self,
        document_types: list[str],
        rag_only: bool = True,
    ) -> list[dict[str, Any]]:
        """Fetch raw authored documents."""
        ...


class DatabaseProvider(ABC):
    """Abstract interface for operational persistence (e.g. Neon PostgreSQL)."""

    @abstractmethod
    async def ping(self) -> bool:
        """Check operational database connectivity."""
        ...
