"""Qdrant Cloud vector database provider adapter (P5.1)."""

import asyncio
import logging
import uuid
from typing import Any

from qdrant_client import AsyncQdrantClient
from qdrant_client.http import models as qmodels

from apps.api.core.config import get_settings
from apps.api.providers.base import VectorProvider
from pipelines.ingestion.embedder import EMBEDDING_DIMENSION, EMBEDDING_MODEL_VERSION

logger = logging.getLogger("provider.qdrant")

# Payload field names configured for fast index lookup
INDEXED_PAYLOAD_FIELDS = [
    ("document_type", qmodels.PayloadSchemaType.KEYWORD),
    ("project_slug", qmodels.PayloadSchemaType.KEYWORD),
    ("language", qmodels.PayloadSchemaType.KEYWORD),
    ("target_audiences", qmodels.PayloadSchemaType.KEYWORD),
    ("is_active", qmodels.PayloadSchemaType.BOOL),
    ("embedding_version", qmodels.PayloadSchemaType.KEYWORD),
]


class QdrantVectorProvider(VectorProvider):
    """Production vector provider managing Qdrant collection, indexes, and filtered search."""

    def __init__(
        self,
        url: str | None = None,
        api_key: str | None = None,
        collection_name: str | None = None,
        timeout: float = 20.0,
    ) -> None:
        settings = get_settings()
        self.url = url or settings.QDRANT_URL
        self.api_key = api_key or settings.QDRANT_API_KEY
        self.collection_name = collection_name or settings.QDRANT_COLLECTION_NAME
        self.timeout = timeout

        self.client = AsyncQdrantClient(
            url=self.url,
            api_key=self.api_key if self.api_key else None,
            timeout=self.timeout,
        )

    async def ensure_collection_exists(self, recreate: bool = False) -> bool:
        """P5.1.2 & P5.1.3: Verify or create Qdrant collection with cosine metric and payload indexes."""
        exists = await self.client.collection_exists(self.collection_name)

        if exists and recreate:
            logger.warning(f"Recreating Qdrant collection: {self.collection_name}")
            await self.client.delete_collection(self.collection_name)
            exists = False

        if not exists:
            logger.info(f"Creating Qdrant collection {self.collection_name} (dim={EMBEDDING_DIMENSION}, cosine)")
            await self.client.create_collection(
                collection_name=self.collection_name,
                vectors_config=qmodels.VectorParams(
                    size=EMBEDDING_DIMENSION,
                    distance=qmodels.Distance.COSINE,
                ),
            )

            # P5.1.3: Create payload indexes for metadata filtering
            for field_name, schema_type in INDEXED_PAYLOAD_FIELDS:
                try:
                    await self.client.create_payload_index(
                        collection_name=self.collection_name,
                        field_name=field_name,
                        field_schema=schema_type,
                    )
                except Exception as e:
                    logger.warning(f"Index creation for {field_name} returned: {e}")

        return True

    async def upsert(
        self,
        points: list[dict[str, Any]],
        max_retries: int = 3,
        backoff_factor: float = 1.5,
    ) -> int:
        """P5.1.4, P5.1.5, P5.1.6: Batch upsert points with PostgreSQL UUID matching and compact debug payloads."""
        if not points:
            return 0

        qdrant_points: list[qmodels.PointStruct] = []
        for p in points:
            point_id = str(p.get("id") or p.get("point_id") or uuid.uuid4())
            vector = p.get("vector", [])
            raw_payload = p.get("payload", {})

            # P5.1.5: Compact payload with only a short debug preview (full text resides in PostgreSQL)
            text_preview = p.get("text", "")[:160] if "text" in p else raw_payload.get("text_preview", "")
            compact_payload: dict[str, Any] = {
                "document_id": str(raw_payload.get("document_id", "")),
                "document_type": raw_payload.get("document_type", "general"),
                "project_slug": raw_payload.get("project_slug"),
                "language": raw_payload.get("language", "en"),
                "target_audiences": raw_payload.get("target_audiences", ["general"]),
                "heading_path": raw_payload.get("heading_path", ""),
                "canonical_url": raw_payload.get("canonical_url", ""),
                "embedding_version": raw_payload.get("embedding_version", EMBEDDING_MODEL_VERSION),
                "is_active": raw_payload.get("is_active", True),
                "text_preview": text_preview,
            }

            qdrant_points.append(
                qmodels.PointStruct(
                    id=point_id,
                    vector=vector,
                    payload=compact_payload,
                )
            )

        # Retry loop with exponential backoff (P5.1.6)
        last_exception: Exception | None = None
        for attempt in range(max_retries):
            try:
                await self.client.upsert(
                    collection_name=self.collection_name,
                    points=qdrant_points,
                    wait=True,
                )
                return len(qdrant_points)
            except Exception as e:
                last_exception = e
                logger.warning(f"Qdrant upsert attempt {attempt + 1}/{max_retries} failed: {e}")
                if attempt < max_retries - 1:
                    await asyncio.sleep(backoff_factor ** attempt)

        raise RuntimeError(f"Qdrant upsert failed after {max_retries} attempts: {last_exception}")

    async def delete(
        self,
        point_ids: list[str],
        max_retries: int = 3,
    ) -> int:
        """P5.1.6: Delete points by UUID with retries."""
        if not point_ids:
            return 0

        for attempt in range(max_retries):
            try:
                await self.client.delete(
                    collection_name=self.collection_name,
                    points_selector=qmodels.PointIdsList(points=point_ids),
                    wait=True,
                )
                return len(point_ids)
            except Exception as e:
                logger.warning(f"Qdrant delete attempt {attempt + 1} failed: {e}")
                if attempt < max_retries - 1:
                    await asyncio.sleep(1.0)
                else:
                    raise

        return 0

    async def search(
        self,
        query_vector: list[float],
        top_k: int = 12,
        score_threshold: float = 0.0,
        filters: dict[str, Any] | None = None,
    ) -> list[dict[str, Any]]:
        """P5.2.2: Retrieve top_k vector points with metadata filtering."""
        q_filter: qmodels.Filter | None = None
        if filters:
            must_conditions: list[qmodels.Condition] = []
            for k, v in filters.items():
                if v is not None:
                    if isinstance(v, list):
                        must_conditions.append(
                            qmodels.FieldCondition(
                                key=k,
                                match=qmodels.MatchAny(any=v),
                            )
                        )
                    else:
                        must_conditions.append(
                            qmodels.FieldCondition(
                                key=k,
                                match=qmodels.MatchValue(value=v),
                            )
                        )
            if must_conditions:
                q_filter = qmodels.Filter(must=must_conditions)

        # Always filter to is_active == True unless explicitly querying all
        if not filters or "is_active" not in filters:
            active_condition = qmodels.FieldCondition(
                key="is_active",
                match=qmodels.MatchValue(value=True),
            )
            if q_filter:
                q_filter.must.append(active_condition)
            else:
                q_filter = qmodels.Filter(must=[active_condition])

        response = await self.client.query_points(
            collection_name=self.collection_name,
            query=query_vector,
            limit=top_k,
            score_threshold=score_threshold if score_threshold > 0.0 else None,
            query_filter=q_filter,
            with_payload=True,
        )

        return [
            {
                "point_id": str(r.id),
                "score": float(r.score),
                "payload": r.payload or {},
            }
            for r in response.points
        ]


    async def health_check(self) -> bool:
        """Verify Qdrant connectivity and collection accessibility."""
        try:
            collections = await self.client.get_collections()
            return collections is not None
        except Exception as e:
            logger.warning(f"Qdrant health check failed: {e}")
            return False

    async def close(self) -> None:
        """Close HTTP client sessions."""
        await self.client.close()
