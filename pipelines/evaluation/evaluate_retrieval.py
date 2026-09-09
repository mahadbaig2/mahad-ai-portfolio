"""Retrieval Evaluation and Threshold Calibration (P5.3.2, P5.3.3).

Evaluates Hit Rate@K, Mean Reciprocal Rank (MRR), and False Positive Rate
on out-of-domain queries to calibrate optimal score threshold.

Usage:
    python -m pipelines.evaluation.evaluate_retrieval
    python -m pipelines.evaluation.evaluate_retrieval --mock
"""

import argparse
import asyncio
import json
from pathlib import Path
from typing import Any

from pydantic import BaseModel, ConfigDict
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from apps.api.core.config import get_settings
from apps.api.providers.base import VectorProvider
from apps.api.providers.doubles import MockVectorProvider
from apps.api.providers.qdrant import QdrantVectorProvider
from apps.api.services.retrieval_service import RetrievalService
from pipelines.ingestion.embedder import (
    BaseEmbedder,
    DeterministicMockEmbedder,
    MultilingualE5Embedder,
)

EVAL_DATASET_PATH = Path(__file__).parent / "data" / "retrieval_eval_dataset.json"


class ThresholdMetrics(BaseModel):
    """Metrics evaluated at a specific similarity threshold."""

    model_config = ConfigDict(extra="forbid")

    threshold: float
    total_in_domain: int = 0
    hit_at_1: int = 0
    hit_at_3: int = 0
    hit_at_5: int = 0
    hit_rate_at_1: float = 0.0
    hit_rate_at_3: float = 0.0
    hit_rate_at_5: float = 0.0
    mrr: float = 0.0
    total_out_of_domain: int = 0
    false_positives: int = 0
    out_of_domain_rejection_rate: float = 0.0


async def evaluate_threshold(
    service: RetrievalService,
    dataset: list[dict[str, Any]],
    threshold: float,
) -> ThresholdMetrics:
    metrics = ThresholdMetrics(threshold=threshold)
    reciprocal_ranks: list[float] = []

    for item in dataset:
        expected_slug = item.get("expected_document_slug")
        is_in_domain = expected_slug is not None
        query = item["query"]

        result = await service.retrieve(
            query=query,
            top_k=12,
            score_threshold=threshold,
            max_chunks=5,
        )

        retrieved_slugs = [c.project_slug for c in result.citations if c.project_slug]

        if is_in_domain:
            metrics.total_in_domain += 1
            rank = None
            for idx, slug in enumerate(retrieved_slugs, 1):
                if slug == expected_slug:
                    rank = idx
                    break

            if rank is not None:
                reciprocal_ranks.append(1.0 / rank)
                if rank <= 1:
                    metrics.hit_at_1 += 1
                if rank <= 3:
                    metrics.hit_at_3 += 1
                if rank <= 5:
                    metrics.hit_at_5 += 1
            else:
                reciprocal_ranks.append(0.0)
        else:
            metrics.total_out_of_domain += 1
            if len(result.citations) > 0:
                metrics.false_positives += 1

    if metrics.total_in_domain > 0:
        metrics.hit_rate_at_1 = round(metrics.hit_at_1 / metrics.total_in_domain, 4)
        metrics.hit_rate_at_3 = round(metrics.hit_at_3 / metrics.total_in_domain, 4)
        metrics.hit_rate_at_5 = round(metrics.hit_at_5 / metrics.total_in_domain, 4)
        metrics.mrr = round(sum(reciprocal_ranks) / len(reciprocal_ranks), 4) if reciprocal_ranks else 0.0

    if metrics.total_out_of_domain > 0:
        rejections = metrics.total_out_of_domain - metrics.false_positives
        metrics.out_of_domain_rejection_rate = round(rejections / metrics.total_out_of_domain, 4)

    return metrics


async def run_evaluation(mock: bool = False) -> list[ThresholdMetrics]:
    if not EVAL_DATASET_PATH.exists():
        raise FileNotFoundError(f"Evaluation dataset not found at {EVAL_DATASET_PATH}")

    with open(EVAL_DATASET_PATH, encoding="utf-8") as f:
        dataset = json.load(f)

    settings = get_settings()

    embedder: BaseEmbedder
    vector_provider: VectorProvider

    if mock:
        embedder = DeterministicMockEmbedder()
        vector_provider = MockVectorProvider()
        engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    else:
        embedder = MultilingualE5Embedder()
        vector_provider = QdrantVectorProvider()
        connect_args: dict[str, Any] = {}
        if "neon.tech" in settings.DATABASE_URL or settings.ENVIRONMENT == "production":
            connect_args["ssl"] = "require"
        engine = create_async_engine(settings.DATABASE_URL, connect_args=connect_args)

    session_factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    thresholds = [0.50, 0.55, 0.60, 0.65, 0.70]
    results: list[ThresholdMetrics] = []

    print(f"Loaded {len(dataset)} evaluation queries ({sum(1 for d in dataset if d.get('expected_document_slug'))} in-domain, {sum(1 for d in dataset if not d.get('expected_document_slug'))} out-of-domain).")
    print("\nEvaluating retrieval across candidate similarity thresholds...")
    print("-" * 85)
    print(f"{'Threshold':<10} | {'Hit@1':<8} | {'Hit@3':<8} | {'Hit@5':<8} | {'MRR':<8} | {'OOD Rejection':<14} | {'False Pos':<10}")
    print("-" * 85)

    async with session_factory() as session:
        service = RetrievalService(
            session=session,
            vector_provider=vector_provider,
            embedder=embedder,
        )

        for th in thresholds:
            m = await evaluate_threshold(service, dataset, th)
            results.append(m)
            print(
                f"{m.threshold:<10.2f} | {m.hit_rate_at_1:<8.3f} | {m.hit_rate_at_3:<8.3f} | "
                f"{m.hit_rate_at_5:<8.3f} | {m.mrr:<8.3f} | {m.out_of_domain_rejection_rate:<14.3f} | "
                f"{m.false_positives:<10}"
            )

    print("-" * 85)
    await engine.dispose()
    if not mock and hasattr(vector_provider, "close"):
        await vector_provider.close()

    return results


def main() -> None:
    parser = argparse.ArgumentParser(description="Retrieval Evaluation & Calibration")
    parser.add_argument("--mock", action="store_true", help="Run with mock embedder and DB")
    args = parser.parse_args()

    asyncio.run(run_evaluation(mock=args.mock))


if __name__ == "__main__":
    main()
