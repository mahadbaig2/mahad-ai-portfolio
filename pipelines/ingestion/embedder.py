"""Multilingual E5 embedding provider with passage/query conventions and L2 normalization (P4.3.1-P4.3.3)."""

import hashlib
import math
from abc import ABC, abstractmethod
from collections.abc import Sequence

# P4.3.1: Pinned model identifiers
EMBEDDING_MODEL_NAME = "intfloat/multilingual-e5-small"
EMBEDDING_MODEL_VERSION = "1.0.0"
EMBEDDING_DIMENSION = 384

# P4.3.2: E5 convention prefixes
PASSAGE_PREFIX = "passage: "
QUERY_PREFIX = "query: "


class BaseEmbedder(ABC):
    """Abstract interface for text embeddings."""

    @property
    @abstractmethod
    def model_name(self) -> str:
        """Return the embedding model identifier."""
        ...

    @property
    @abstractmethod
    def model_version(self) -> str:
        """Return the embedding model version."""
        ...

    @property
    @abstractmethod
    def dimension(self) -> int:
        """Return the vector dimensionality."""
        ...

    @abstractmethod
    def embed_passages(self, texts: Sequence[str], batch_size: int = 32) -> list[list[float]]:
        """P4.3.3: Batch embed passage texts prefixed with 'passage: ' and L2-normalized."""
        ...

    @abstractmethod
    def embed_query(self, query: str) -> list[float]:
        """P4.3.2: Embed single query text prefixed with 'query: ' and L2-normalized."""
        ...


class MultilingualE5Embedder(BaseEmbedder):
    """Production embedder using pinned intfloat/multilingual-e5-small."""

    def __init__(self, model_name: str = EMBEDDING_MODEL_NAME, device: str = "cpu") -> None:
        from sentence_transformers import SentenceTransformer

        self._model_name = model_name
        self._model_version = EMBEDDING_MODEL_VERSION
        self._dimension = EMBEDDING_DIMENSION
        # Load pinned model
        self.model = SentenceTransformer(self._model_name, device=device)

    @property
    def model_name(self) -> str:
        return self._model_name

    @property
    def model_version(self) -> str:
        return self._model_version

    @property
    def dimension(self) -> int:
        return self._dimension

    def embed_passages(self, texts: Sequence[str], batch_size: int = 32) -> list[list[float]]:
        """P4.3.2 & P4.3.3: Prefix with 'passage: ', batch encode, and L2 normalize."""
        if not texts:
            return []

        prefixed = [f"{PASSAGE_PREFIX}{t.strip()}" for t in texts]
        embeddings = self.model.encode(
            prefixed,
            batch_size=batch_size,
            normalize_embeddings=True,  # Crucial: cosine similarity equals dot product
            show_progress_bar=False,
        )
        return [vec.tolist() for vec in embeddings]

    def embed_query(self, query: str) -> list[float]:
        """P4.3.2: Prefix with 'query: ' and L2 normalize."""
        prefixed = f"{QUERY_PREFIX}{query.strip()}"
        embedding = self.model.encode(
            prefixed,
            normalize_embeddings=True,
            show_progress_bar=False,
        )
        return embedding.tolist()


class DeterministicMockEmbedder(BaseEmbedder):
    """Deterministic, fast mock embedder for tests and dry-run environments without weights."""

    def __init__(self, dimension: int = EMBEDDING_DIMENSION) -> None:
        self._model_name = EMBEDDING_MODEL_NAME
        self._model_version = EMBEDDING_MODEL_VERSION
        self._dimension = dimension

    @property
    def model_name(self) -> str:
        return self._model_name

    @property
    def model_version(self) -> str:
        return self._model_version

    @property
    def dimension(self) -> int:
        return self._dimension

    def _generate_vector(self, text: str) -> list[float]:
        """Generate a deterministic, pseudo-random L2-normalized unit vector from text hash."""
        # Use SHA-256 seed to generate deterministic floats
        hasher = hashlib.sha256(text.encode("utf-8"))
        seed_bytes = hasher.digest()

        raw_vals: list[float] = []
        for i in range(self._dimension):
            byte_idx = (i * 2) % len(seed_bytes)
            val = ((seed_bytes[byte_idx] << 8) | seed_bytes[(byte_idx + 1) % len(seed_bytes)]) / 65535.0
            # Center around 0
            raw_vals.append(val - 0.5)

        # Compute L2 norm
        norm = math.sqrt(sum(x * x for x in raw_vals))
        if norm == 0:
            return [1.0] + [0.0] * (self._dimension - 1)
        return [round(x / norm, 6) for x in raw_vals]

    def embed_passages(self, texts: Sequence[str], batch_size: int = 32) -> list[list[float]]:
        if not texts:
            return []
        prefixed = [f"{PASSAGE_PREFIX}{t.strip()}" for t in texts]
        return [self._generate_vector(p) for p in prefixed]

    def embed_query(self, query: str) -> list[float]:
        prefixed = f"{QUERY_PREFIX}{query.strip()}"
        return self._generate_vector(prefixed)
