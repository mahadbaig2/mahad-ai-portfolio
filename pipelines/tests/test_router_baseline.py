"""
Unit and integration tests for the Query Router baseline model.
"""

import json
from pathlib import Path
import joblib
import pytest


RELEASES_DIR = Path("pipelines/training/releases")
MODEL_ARTIFACT = RELEASES_DIR / "candidate_baseline_tfidf.joblib"
METADATA_FILE = RELEASES_DIR / "candidate_baseline_metadata.json"


def test_baseline_artifact_and_metadata_exist():
    assert MODEL_ARTIFACT.exists(), f"Missing model artifact {MODEL_ARTIFACT}"
    assert METADATA_FILE.exists(), f"Missing metadata file {METADATA_FILE}"

    with open(METADATA_FILE, "r", encoding="utf-8") as f:
        meta = json.load(f)

    assert meta["role"] == "candidate"
    assert meta["is_champion"] is False
    assert meta["status"] == "pending_mahad_review"
    assert "metrics" in meta
    assert meta["metrics"]["test_route_macro_f1"] > 0.5


def test_baseline_predictions_and_latency():
    model = joblib.load(MODEL_ARTIFACT)

    test_queries = [
        "What is CardioScan AI and what problem does it address?",
        "CardioScan mein kaun se deep learning models use huay thay?",
        "Hello, how are you today?",
        "Salam, kaisay hain aap?",
    ]

    for q in test_queries:
        res = model.predict_single(q)
        assert "route" in res
        assert "intent" in res
        assert "route_confidence" in res
        assert 0.0 <= res["route_confidence"] <= 1.0
        assert res["route"] in ["rag_retrieval", "direct_chat", "refusal"]
