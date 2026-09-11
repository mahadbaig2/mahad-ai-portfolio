"""
Tests for Transformer Query Router Architecture and Promotion Logic.

P8.1.2: Deterministic training verification.
P8.1.4: Multi-task output heads.
P8.1.6: Slice metrics and evaluation functions.
P8.1.7: Promotion rule enforcement.
"""

import sys
from pathlib import Path
import pytest
import torch

repo_root = str(Path(__file__).resolve().parents[2])
if repo_root not in sys.path:
    sys.path.insert(0, repo_root)

from pipelines.training.transformer_router import MiniLMQueryRouter
from pipelines.training.train_transformer import (
    evaluate_promotion_rules,
    ROUTE_CLASSES,
    INTENT_CLASSES,
    ANS_CLASSES,
    LANG_CLASSES,
)


@pytest.fixture(scope="module")
def sample_model():
    model = MiniLMQueryRouter(
        backbone_name="sentence-transformers/all-MiniLM-L6-v2",
        num_routes=len(ROUTE_CLASSES),
        num_intents=len(INTENT_CLASSES),
        num_answerabilities=len(ANS_CLASSES),
        num_languages=len(LANG_CLASSES),
        dropout_rate=0.1,
    )
    model.eval()
    return model


def test_transformer_forward_shapes(sample_model):
    batch_size = 3
    seq_len = 16
    input_ids = torch.randint(100, 2000, (batch_size, seq_len))
    attention_mask = torch.ones((batch_size, seq_len), dtype=torch.long)

    with torch.no_grad():
        out = sample_model(input_ids, attention_mask)

    assert "route_logits" in out
    assert "intent_logits" in out
    assert "ans_logits" in out
    assert "lang_logits" in out
    assert "embeddings" in out

    assert out["route_logits"].shape == (batch_size, len(ROUTE_CLASSES))
    assert out["intent_logits"].shape == (batch_size, len(INTENT_CLASSES))
    assert out["ans_logits"].shape == (batch_size, len(ANS_CLASSES))
    assert out["lang_logits"].shape == (batch_size, len(LANG_CLASSES))
    assert out["embeddings"].shape == (batch_size, 384)


def test_mean_pooling_respects_padding(sample_model):
    embeddings = torch.tensor([
        [[1.0, 2.0], [3.0, 4.0], [100.0, 100.0]],
    ])
    # Ignore the 3rd token (padding)
    mask = torch.tensor([[1, 1, 0]])
    pooled = sample_model.mean_pooling(embeddings, mask)

    expected = torch.tensor([[2.0, 3.0]])
    assert torch.allclose(pooled, expected, atol=1e-5)


def test_promotion_rules_pass():
    baseline = {
        "test_route_macro_f1": 0.66,
        "test_intent_macro_f1": 0.14,
        "test_roman_urdu_route_f1": 0.72,
    }
    candidate = {
        "test_route_macro_f1": 0.85,
        "test_intent_macro_f1": 0.80,
        "test_roman_urdu_route_f1": 0.82,
        "test_refusal_recall": 1.0,
        "test_p95_latency_ms": 14.5,
    }
    res = evaluate_promotion_rules(baseline, candidate)
    assert res["all_passed"] is True
    assert res["rules"]["rule_1_route_macro_f1_superior"]["passed"] is True
    assert res["rules"]["rule_2_intent_macro_f1_superior"]["passed"] is True
    assert res["rules"]["rule_3_refusal_recall_no_regression"]["passed"] is True


def test_promotion_rules_fail_on_refusal_regression():
    baseline = {
        "test_route_macro_f1": 0.66,
        "test_intent_macro_f1": 0.14,
        "test_roman_urdu_route_f1": 0.72,
        "test_refusal_recall": 0.50,
    }
    # Fails because refusal recall is 0.40 (< baseline 0.50)
    candidate = {
        "test_route_macro_f1": 0.90,
        "test_intent_macro_f1": 0.85,
        "test_roman_urdu_route_f1": 0.85,
        "test_refusal_recall": 0.40,
        "test_p95_latency_ms": 12.0,
    }
    res = evaluate_promotion_rules(baseline, candidate)
    assert res["all_passed"] is False
    assert res["rules"]["rule_3_refusal_recall_no_regression"]["passed"] is False
