"""
Tests for ONNX Query Router Packaging and In-Process Runtime.

P8.2.1: ONNX graph validity and dynamic shape execution.
P8.2.2: Tolerance verification against PyTorch.
P8.2.3: Quantization evaluation.
P8.2.4: Artifact package integrity (model, tokenizer, config, metrics).
"""

import json
import sys
from pathlib import Path
import numpy as np
import onnxruntime as ort
import pytest
from transformers import AutoTokenizer

repo_root = str(Path(__file__).resolve().parents[2])
if repo_root not in sys.path:
    sys.path.insert(0, repo_root)

PACKAGE_DIR = Path("pipelines/training/releases/package_v1")


def test_package_directory_structure():
    assert PACKAGE_DIR.exists()
    assert (PACKAGE_DIR / "model.onnx").exists()
    assert (PACKAGE_DIR / "config.json").exists()
    assert (PACKAGE_DIR / "metrics.json").exists()
    assert (PACKAGE_DIR / "MODEL_CARD.md").exists()
    assert (PACKAGE_DIR / "tokenizer").is_dir()


def test_package_config_and_metrics():
    with open(PACKAGE_DIR / "config.json", "r", encoding="utf-8") as f:
        config = json.load(f)
    assert config["model_name"] == "query-router-minilm"
    assert config["route_classes"] == ["direct_chat", "rag_retrieval", "refusal"]
    assert len(config["intent_classes"]) == 9
    assert config["fallback_route"] == "rag_retrieval"
    assert config["confidence_threshold"] == 0.50

    with open(PACKAGE_DIR / "metrics.json", "r", encoding="utf-8") as f:
        metrics = json.load(f)
    assert metrics["onnx_tolerance"]["tolerance_passed"] is True
    assert metrics["quantization_evaluation"]["quality_regressed"] is False


def test_tokenizer_loads_from_package():
    tokenizer = AutoTokenizer.from_pretrained(str(PACKAGE_DIR / "tokenizer"), local_files_only=True)
    sample = "Mahad ka background kya hai?"
    enc = tokenizer(sample, return_tensors="np", max_length=64, truncation=True)
    assert "input_ids" in enc
    assert "attention_mask" in enc
    assert enc["input_ids"].shape[0] == 1


def test_onnx_runtime_dynamic_inference():
    onnx_path = PACKAGE_DIR / "model.onnx"
    session = ort.InferenceSession(str(onnx_path), providers=["CPUExecutionProvider"])

    tokenizer = AutoTokenizer.from_pretrained(str(PACKAGE_DIR / "tokenizer"), local_files_only=True)

    # Test batch with varied lengths
    samples = [
        "Tell me about CardioScan AI architecture",
        "Hello!",
        "Kaun se projects pe kaam kia?",
    ]
    enc = tokenizer(samples, padding=True, truncation=True, max_length=64, return_tensors="np")

    inputs = {
        "input_ids": enc["input_ids"],
        "attention_mask": enc["attention_mask"],
    }
    outputs = session.run(None, inputs)

    # 4 output heads: route, intent, ans, lang
    assert len(outputs) == 4
    route_logits, intent_logits, ans_logits, lang_logits = outputs

    assert route_logits.shape == (3, 3)
    assert intent_logits.shape == (3, 9)
    assert ans_logits.shape == (3, 2)
    assert lang_logits.shape == (3, 2)

    # Check finite numbers
    assert np.all(np.isfinite(route_logits))
    assert np.all(np.isfinite(intent_logits))
