"""
ONNX Export, Tolerance Verification, Quantization Evaluation, and Packaging Pipeline.

Tasks:
- P8.2.1: Export candidate to ONNX with dynamic input batch and sequence length axes.
- P8.2.2: Verify ONNX predictions match framework (PyTorch) predictions within tolerance (1e-4).
- P8.2.3: Evaluate dynamic quantization; retain unquantized model if quality regresses.
- P8.2.4: Package tokenizer, labels, config, metrics, and model card.
"""

import json
import os
import shutil
import subprocess
import sys
import time
from pathlib import Path
from typing import Any, Dict, List, Tuple

repo_root = str(Path(__file__).resolve().parents[2])
if repo_root not in sys.path:
    sys.path.insert(0, repo_root)

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

import numpy as np
import onnx
import onnxruntime as ort
from onnxruntime.quantization import QuantType, quantize_dynamic
import torch
import torch.nn as nn
from transformers import AutoTokenizer

from pipelines.training.train_transformer import (
    ANS_CLASSES,
    INTENT_CLASSES,
    LANG_CLASSES,
    ROUTE_CLASSES,
    evaluate_model,
    load_split,
)
from pipelines.training.transformer_router import MiniLMQueryRouter


class OnnxExportableWrapper(nn.Module):
    """Clean inference-only wrapper for ONNX export."""

    def __init__(self, model: MiniLMQueryRouter):
        super().__init__()
        self.transformer = model.transformer
        self.route_head = model.route_head
        self.intent_head = model.intent_head
        self.ans_head = model.ans_head
        self.lang_head = model.lang_head

    def forward(self, input_ids: torch.Tensor, attention_mask: torch.Tensor) -> Tuple[torch.Tensor, torch.Tensor, torch.Tensor, torch.Tensor]:
        outputs = self.transformer(input_ids=input_ids, attention_mask=attention_mask)
        token_embeddings = outputs.last_hidden_state

        input_mask_expanded = attention_mask.unsqueeze(-1).expand(token_embeddings.size()).float()
        sum_embeddings = torch.sum(token_embeddings * input_mask_expanded, 1)
        sum_mask = torch.clamp(input_mask_expanded.sum(1), min=1e-9)
        pooled = sum_embeddings / sum_mask

        route_logits = self.route_head(pooled)
        intent_logits = self.intent_head(pooled)
        ans_logits = self.ans_head(pooled)
        lang_logits = self.lang_head(pooled)

        return route_logits, intent_logits, ans_logits, lang_logits


def export_candidate_to_onnx(
    checkpoint_path: Path,
    output_onnx_path: Path,
    tokenizer_name: str = "sentence-transformers/all-MiniLM-L6-v2",
) -> Path:
    """Export PyTorch candidate router to ONNX with dynamic shapes (P8.2.1)."""
    output_onnx_path.parent.mkdir(parents=True, exist_ok=True)

    device = torch.device("cpu")
    model = MiniLMQueryRouter(
        backbone_name=tokenizer_name,
        num_routes=len(ROUTE_CLASSES),
        num_intents=len(INTENT_CLASSES),
        num_answerabilities=len(ANS_CLASSES),
        num_languages=len(LANG_CLASSES),
    )
    checkpoint = torch.load(checkpoint_path, map_location=device)
    model.load_state_dict(checkpoint["model_state_dict"])
    model.eval()

    wrapper = OnnxExportableWrapper(model)
    wrapper.eval()

    tokenizer = AutoTokenizer.from_pretrained(tokenizer_name, local_files_only=True)
    dummy_text = "What technologies are used in CardioScan AI?"
    dummy_enc = tokenizer(dummy_text, return_tensors="pt", max_length=64, truncation=True)

    dummy_input_ids = dummy_enc["input_ids"]
    dummy_attention_mask = dummy_enc["attention_mask"]

    print(f"Exporting PyTorch model to ONNX: {output_onnx_path}...")
    torch.onnx.export(
        wrapper,
        (dummy_input_ids, dummy_attention_mask),
        str(output_onnx_path),
        input_names=["input_ids", "attention_mask"],
        output_names=["route_logits", "intent_logits", "ans_logits", "lang_logits"],
        dynamic_axes={
            "input_ids": {0: "batch_size", 1: "sequence_length"},
            "attention_mask": {0: "batch_size", 1: "sequence_length"},
            "route_logits": {0: "batch_size"},
            "intent_logits": {0: "batch_size"},
            "ans_logits": {0: "batch_size"},
            "lang_logits": {0: "batch_size"},
        },
        opset_version=17,
        do_constant_folding=True,
        dynamo=False,
    )

    # Validate ONNX graph
    onnx_model = onnx.load(str(output_onnx_path))
    onnx.checker.check_model(onnx_model)
    print("ONNX model checker validated graph successfully.")
    return output_onnx_path


def verify_onnx_predictions_tolerance(
    checkpoint_path: Path,
    onnx_path: Path,
    test_samples: List[Dict[str, Any]],
    tokenizer_name: str = "sentence-transformers/all-MiniLM-L6-v2",
    tolerance: float = 1e-4,
) -> Dict[str, Any]:
    """Verify ONNX outputs match PyTorch outputs within numerical tolerance (P8.2.2)."""
    print("Verifying ONNX numerical tolerance against PyTorch...")
    device = torch.device("cpu")
    model = MiniLMQueryRouter(
        backbone_name=tokenizer_name,
        num_routes=len(ROUTE_CLASSES),
        num_intents=len(INTENT_CLASSES),
        num_answerabilities=len(ANS_CLASSES),
        num_languages=len(LANG_CLASSES),
    )
    checkpoint = torch.load(checkpoint_path, map_location=device)
    model.load_state_dict(checkpoint["model_state_dict"])
    model.eval()

    wrapper = OnnxExportableWrapper(model)
    wrapper.eval()

    tokenizer = AutoTokenizer.from_pretrained(tokenizer_name, local_files_only=True)
    ort_session = ort.InferenceSession(str(onnx_path), providers=["CPUExecutionProvider"])

    max_diff_route = 0.0
    max_diff_intent = 0.0
    max_diff_ans = 0.0
    max_diff_lang = 0.0

    class_matches = {"route": 0, "intent": 0, "ans": 0, "lang": 0}
    total = len(test_samples)

    for sample in test_samples:
        text = sample["text"]
        enc = tokenizer(text, return_tensors="pt", max_length=64, truncation=True)
        input_ids = enc["input_ids"]
        attention_mask = enc["attention_mask"]

        with torch.no_grad():
            pt_route, pt_intent, pt_ans, pt_lang = wrapper(input_ids, attention_mask)

        ort_inputs = {
            "input_ids": input_ids.numpy(),
            "attention_mask": attention_mask.numpy(),
        }
        ort_route, ort_intent, ort_ans, ort_lang = ort_session.run(None, ort_inputs)

        diff_r = float(np.max(np.abs(pt_route.numpy() - ort_route)))
        diff_i = float(np.max(np.abs(pt_intent.numpy() - ort_intent)))
        diff_a = float(np.max(np.abs(pt_ans.numpy() - ort_ans)))
        diff_l = float(np.max(np.abs(pt_lang.numpy() - ort_lang)))

        max_diff_route = max(max_diff_route, diff_r)
        max_diff_intent = max(max_diff_intent, diff_i)
        max_diff_ans = max(max_diff_ans, diff_a)
        max_diff_lang = max(max_diff_lang, diff_l)

        if int(np.argmax(pt_route.numpy())) == int(np.argmax(ort_route)):
            class_matches["route"] += 1
        if int(np.argmax(pt_intent.numpy())) == int(np.argmax(ort_intent)):
            class_matches["intent"] += 1
        if int(np.argmax(pt_ans.numpy())) == int(np.argmax(ort_ans)):
            class_matches["ans"] += 1
        if int(np.argmax(pt_lang.numpy())) == int(np.argmax(ort_lang)):
            class_matches["lang"] += 1

    tolerance_passed = (
        max_diff_route <= tolerance
        and max_diff_intent <= tolerance
        and max_diff_ans <= tolerance
        and max_diff_lang <= tolerance
        and class_matches["route"] == total
        and class_matches["intent"] == total
    )

    results = {
        "tolerance_passed": tolerance_passed,
        "max_diff_route": max_diff_route,
        "max_diff_intent": max_diff_intent,
        "max_diff_ans": max_diff_ans,
        "max_diff_lang": max_diff_lang,
        "label_match_rate_route": class_matches["route"] / total,
        "label_match_rate_intent": class_matches["intent"] / total,
        "tolerance_threshold": tolerance,
    }

    print(f"Tolerance check: passed={tolerance_passed}, max_route_diff={max_diff_route:.2e}, max_intent_diff={max_diff_intent:.2e}")
    return results


def evaluate_onnx_model(
    session: ort.InferenceSession,
    tokenizer: AutoTokenizer,
    samples: List[Dict[str, Any]],
) -> Dict[str, float]:
    """Evaluate accuracy, F1, refusal recall, and latency on an ONNX session."""
    texts = [s["text"] for s in samples]
    true_routes = [s["route"] for s in samples]
    true_intents = [s["intent"] for s in samples]

    pred_routes: List[str] = []
    pred_intents: List[str] = []
    latencies: List[float] = []

    for text in texts:
        enc = tokenizer(text, return_tensors="np", max_length=64, truncation=True)
        inputs = {
            "input_ids": enc["input_ids"],
            "attention_mask": enc["attention_mask"],
        }
        t0 = time.perf_counter()
        outputs = session.run(None, inputs)
        t1 = time.perf_counter()
        latencies.append((t1 - t0) * 1000.0)

        r_logits = outputs[0][0]
        i_logits = outputs[1][0]

        pred_routes.append(ROUTE_CLASSES[int(np.argmax(r_logits))])
        pred_intents.append(INTENT_CLASSES[int(np.argmax(i_logits))])

    from sklearn.metrics import f1_score, accuracy_score, classification_report
    route_macro_f1 = f1_score(true_routes, pred_routes, average="macro", zero_division=0)
    intent_macro_f1 = f1_score(true_intents, pred_intents, average="macro", zero_division=0)
    rep = classification_report(true_routes, pred_routes, output_dict=True, zero_division=0)
    refusal_recall = rep.get("refusal", {}).get("recall", 0.0)

    return {
        "route_macro_f1": float(route_macro_f1),
        "intent_macro_f1": float(intent_macro_f1),
        "refusal_recall": float(refusal_recall),
        "p50_latency_ms": float(np.percentile(latencies, 50)),
        "p95_latency_ms": float(np.percentile(latencies, 95)),
    }


def evaluate_quantization_tradeoffs(
    unquantized_onnx_path: Path,
    quantized_onnx_path: Path,
    test_samples: List[Dict[str, Any]],
    tokenizer_name: str = "sentence-transformers/all-MiniLM-L6-v2",
) -> Dict[str, Any]:
    """Evaluate dynamic INT8 quantization against FP32 model (P8.2.3)."""
    print("Quantizing ONNX model dynamically to INT8...")
    quantize_dynamic(
        model_input=str(unquantized_onnx_path),
        model_output=str(quantized_onnx_path),
        weight_type=QuantType.QInt8,
    )

    tokenizer = AutoTokenizer.from_pretrained(tokenizer_name, local_files_only=True)
    unquant_sess = ort.InferenceSession(str(unquantized_onnx_path), providers=["CPUExecutionProvider"])
    quant_sess = ort.InferenceSession(str(quantized_onnx_path), providers=["CPUExecutionProvider"])

    unquant_metrics = evaluate_onnx_model(unquant_sess, tokenizer, test_samples)
    quant_metrics = evaluate_onnx_model(quant_sess, tokenizer, test_samples)

    unquant_size_bytes = os.path.getsize(unquantized_onnx_path)
    quant_size_bytes = os.path.getsize(quantized_onnx_path)

    # Decision rule: retain unquantized model if quality regresses (P8.2.3)
    route_f1_regressed = quant_metrics["route_macro_f1"] < unquant_metrics["route_macro_f1"]
    refusal_regressed = quant_metrics["refusal_recall"] < unquant_metrics["refusal_recall"]

    quality_regressed = route_f1_regressed or refusal_regressed
    selected_model = "unquantized" if quality_regressed else "quantized"

    results = {
        "unquantized": {
            "size_mb": unquant_size_bytes / (1024 * 1024),
            "metrics": unquant_metrics,
        },
        "quantized": {
            "size_mb": quant_size_bytes / (1024 * 1024),
            "metrics": quant_metrics,
        },
        "quality_regressed": quality_regressed,
        "decision": f"Retain {selected_model} model (quality_regressed={quality_regressed})",
        "selected_model": selected_model,
    }

    print(f"Quantization evaluation: size {results['unquantized']['size_mb']:.1f}MB -> {results['quantized']['size_mb']:.1f}MB.")
    print(f"Decision: {results['decision']}")
    return results


def package_model_artifacts(
    selected_onnx_path: Path,
    output_package_dir: Path,
    quantization_results: Dict[str, Any],
    tolerance_results: Dict[str, Any],
    candidate_metadata_path: Path,
    tokenizer_name: str = "sentence-transformers/all-MiniLM-L6-v2",
) -> Path:
    """Package model, tokenizer, labels, config, metrics, and model card (P8.2.4)."""
    output_package_dir.mkdir(parents=True, exist_ok=True)

    # 1. Copy model.onnx
    shutil.copy2(selected_onnx_path, output_package_dir / "model.onnx")

    # 2. Save tokenizer assets
    tokenizer_dir = output_package_dir / "tokenizer"
    tokenizer = AutoTokenizer.from_pretrained(tokenizer_name, local_files_only=True)
    tokenizer.save_pretrained(str(tokenizer_dir))

    # 3. Create config.json
    config_payload = {
        "model_name": "query-router-minilm",
        "model_version": "v1.0.0",
        "backbone": tokenizer_name,
        "input_names": ["input_ids", "attention_mask"],
        "output_names": ["route_logits", "intent_logits", "ans_logits", "lang_logits"],
        "route_classes": ROUTE_CLASSES,
        "intent_classes": INTENT_CLASSES,
        "ans_classes": ANS_CLASSES,
        "lang_classes": LANG_CLASSES,
        "confidence_threshold": 0.50,
        "fallback_route": "rag_retrieval",
        "max_sequence_length": 64,
        "quantization": quantization_results["selected_model"],
    }
    with open(output_package_dir / "config.json", "w", encoding="utf-8") as f:
        json.dump(config_payload, f, indent=2)

    # 4. Metrics & validation results
    with open(candidate_metadata_path, "r", encoding="utf-8") as f:
        meta = json.load(f)

    metrics_payload = {
        "test_metrics": meta.get("metrics", {}),
        "onnx_tolerance": tolerance_results,
        "quantization_evaluation": quantization_results,
    }
    with open(output_package_dir / "metrics.json", "w", encoding="utf-8") as f:
        json.dump(metrics_payload, f, indent=2)

    # 5. Model Card (MODEL_CARD.md)
    model_card = f"""# Model Card: Mahad AI Portfolio Query Router (MiniLM-L6-v2)

## Overview
- **Model Name**: `query-router-minilm`
- **Version**: `v1.0.0`
- **Architecture**: `sentence-transformers/all-MiniLM-L6-v2` with multi-task linear classification heads.
- **Runtime**: In-Process ONNX Runtime CPU (`onnxruntime==1.30.0`).
- **Format**: ONNX dynamic batch / dynamic sequence length.
- **Artifact**: `{quantization_results['selected_model']}` model ({output_package_dir / 'model.onnx'}).

## Intended Use
Classify user queries into:
1. **Execution Route**: `rag_retrieval`, `direct_chat`, `refusal`
2. **User Intent**: 9 portfolio-specific semantic intents
3. **Answerability**: `answerable`, `unanswerable`
4. **Language**: English (`en`), Roman Urdu (`ur`)

## Verified Performance (Locked Human Test Set)
- **Route Macro F1**: {meta['metrics']['test_route_macro_f1']:.4f} (Baseline: 0.6623)
- **Intent Macro F1**: {meta['metrics']['test_intent_macro_f1']:.4f} (Baseline: 0.1436)
- **Roman Urdu Route F1**: {meta['metrics']['test_roman_urdu_route_f1']:.4f} (Baseline: 0.7222)
- **Refusal Recall**: {meta['metrics']['test_refusal_recall'] * 100:.1f}% (Baseline: 50.0%)
- **p95 CPU Latency**: {meta['metrics']['test_p95_latency_ms']:.2f} ms (Budget: < 25.0 ms)
- **ONNX Numerical Tolerance**: Max absolute error < {tolerance_results['max_diff_route']:.2e} (Threshold: 1e-4)

## Safe Fallback & Operational Bounds
- If route confidence is below 0.50, the request safely falls back to standard RAG retrieval.
- Multi-task predictions are served in-process inside FastAPI with zero network calls.
"""
    with open(output_package_dir / "MODEL_CARD.md", "w", encoding="utf-8") as f:
        f.write(model_card)

    print(f"Successfully packaged complete model release into: {output_package_dir}")
    return output_package_dir


def run_packaging_pipeline():
    checkpoint_path = Path("pipelines/training/checkpoints/best_minilm_router.pt")
    build_dir = Path("pipelines/training/releases/build")
    build_dir.mkdir(parents=True, exist_ok=True)

    fp32_onnx_path = build_dir / "model_fp32.onnx"
    int8_onnx_path = build_dir / "model_int8.onnx"
    package_dir = Path("pipelines/training/releases/package_v1")
    candidate_meta_path = Path("pipelines/training/releases/candidate_minilm_metadata.json")

    test_data = load_split(Path("pipelines/evaluation/data/test.json"))

    # P8.2.1: Export to ONNX
    export_candidate_to_onnx(checkpoint_path, fp32_onnx_path)

    # P8.2.2: Tolerance verification
    tol_res = verify_onnx_predictions_tolerance(checkpoint_path, fp32_onnx_path, test_data)

    # P8.2.3: Quantization evaluation
    quant_res = evaluate_quantization_tradeoffs(fp32_onnx_path, int8_onnx_path, test_data)

    chosen_onnx = fp32_onnx_path if quant_res["selected_model"] == "unquantized" else int8_onnx_path

    # P8.2.4: Package artifacts
    package_model_artifacts(
        selected_onnx_path=chosen_onnx,
        output_package_dir=package_dir,
        quantization_results=quant_res,
        tolerance_results=tol_res,
        candidate_metadata_path=candidate_meta_path,
    )


if __name__ == "__main__":
    run_packaging_pipeline()
