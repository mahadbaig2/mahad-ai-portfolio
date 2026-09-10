"""
Unit tests for Query Router dataset, schema validation, and zero-leakage splitting.
"""

import json
from pathlib import Path
import pytest

from pipelines.evaluation.schema import (
    AnswerabilityLabel,
    IntentLabel,
    LanguageLabel,
    QueryRouterSample,
    RouteLabel,
)
from pipelines.evaluation.split_dataset import load_dataset, split_groups, verify_anti_leakage


DATA_DIR = Path("pipelines/evaluation/data")
MAIN_DATASET = DATA_DIR / "query_router_dataset.json"
TRAIN_DATASET = DATA_DIR / "train.json"
VAL_DATASET = DATA_DIR / "val.json"
TEST_DATASET = DATA_DIR / "test.json"


def test_main_dataset_exists_and_loads():
    assert MAIN_DATASET.exists(), f"Missing {MAIN_DATASET}"
    data = load_dataset(MAIN_DATASET)
    assert len(data) >= 100, f"Expected at least 100 samples, got {len(data)}"


def test_schema_validation_on_all_samples():
    data = load_dataset(MAIN_DATASET)
    seen_ids = set()

    for item in data:
        # Schema validation
        sample = QueryRouterSample(**item)
        assert sample.id not in seen_ids, f"Duplicate ID found: {sample.id}"
        seen_ids.add(sample.id)

        # Enums
        assert isinstance(sample.route, RouteLabel)
        assert isinstance(sample.intent, IntentLabel)
        assert isinstance(sample.answerability, AnswerabilityLabel)
        assert isinstance(sample.language, LanguageLabel)
        assert len(sample.text) >= 3


def test_group_aware_split_zero_leakage():
    assert TRAIN_DATASET.exists()
    assert VAL_DATASET.exists()
    assert TEST_DATASET.exists()

    train = load_dataset(TRAIN_DATASET)
    val = load_dataset(VAL_DATASET)
    test = load_dataset(TEST_DATASET)

    # Invariant: verify no group overlap
    verify_anti_leakage(train, val, test)

    train_groups = {s["group_id"] for s in train}
    val_groups = {s["group_id"] for s in val}
    test_groups = {s["group_id"] for s in test}

    assert len(train_groups & val_groups) == 0
    assert len(train_groups & test_groups) == 0
    assert len(val_groups & test_groups) == 0


def test_split_route_coverage():
    """Verify each split has representation of the primary routes and both languages."""
    for path, name in [(TRAIN_DATASET, "train"), (VAL_DATASET, "val"), (TEST_DATASET, "test")]:
        data = load_dataset(path)
        routes = {s["route"] for s in data}
        languages = {s["language"] for s in data}

        assert "rag_retrieval" in routes, f"Missing rag_retrieval in {name}"
        assert "refusal" in routes, f"Missing refusal in {name}"
        assert "direct_chat" in routes, f"Missing direct_chat in {name}"

        assert "en" in languages, f"Missing English in {name}"
        assert "ur" in languages, f"Missing Roman Urdu in {name}"
