"""
Transformer Fine-Tuning Pipeline for Query Router.

Tasks:
- P8.1.2: Deterministic training with checkpointing and early stopping.
- P8.1.3: Class weights for loss balancing on imbalanced intents.
- P8.1.4: Train intent, route, answerability, and language heads.
- P8.1.5: Log formal run to MLflow.
- P8.1.6: Evaluate aggregate, per-class, Roman Urdu, refusal, and latency slices.
- P8.1.7: Compare candidate against baseline using predeclared promotion rules.
"""

import json
import os
import random
import subprocess
import sys
import time
from pathlib import Path
from typing import Any, Dict, List, Tuple

# Ensure repository root is on sys.path
repo_root = str(Path(__file__).resolve().parents[2])
if repo_root not in sys.path:
    sys.path.insert(0, repo_root)

import numpy as np
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, Dataset
from transformers import AutoTokenizer, get_linear_schedule_with_warmup
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
)
from sklearn.utils.class_weight import compute_class_weight

import mlflow
from pipelines.training.transformer_router import MiniLMQueryRouter


# Stable label taxonomies
ROUTE_CLASSES = ["direct_chat", "rag_retrieval", "refusal"]
INTENT_CLASSES = [
    "article_discussion",
    "career_skills",
    "contact_info",
    "general_chitchat",
    "greeting",
    "out_of_domain",
    "project_overview",
    "project_technical",
    "prompt_injection",
]
ANS_CLASSES = ["answerable", "unanswerable"]
LANG_CLASSES = ["en", "ur"]


def set_seed(seed: int = 42):
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(seed)
    torch.backends.cudnn.deterministic = True
    torch.backends.cudnn.benchmark = False


def get_git_commit() -> str:
    try:
        commit = subprocess.check_output(
            ["git", "rev-parse", "HEAD"], stderr=subprocess.DEVNULL
        ).decode("utf-8").strip()
        return commit
    except Exception:
        return "unknown"


def load_split(file_path: Path) -> List[Dict[str, Any]]:
    with open(file_path, "r", encoding="utf-8") as f:
        return json.load(f)


class RouterDataset(Dataset):
    def __init__(
        self,
        samples: List[Dict[str, Any]],
        tokenizer: AutoTokenizer,
        max_length: int = 64,
    ):
        self.samples = samples
        self.tokenizer = tokenizer
        self.max_length = max_length

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx: int) -> Dict[str, torch.Tensor]:
        item = self.samples[idx]
        text = item["text"]
        enc = self.tokenizer(
            text,
            max_length=self.max_length,
            padding="max_length",
            truncation=True,
            return_tensors="pt",
        )

        route_idx = ROUTE_CLASSES.index(item["route"])
        intent_idx = INTENT_CLASSES.index(item["intent"])
        ans_idx = ANS_CLASSES.index(item["answerability"])
        lang_idx = LANG_CLASSES.index(item["language"])

        res = {
            "input_ids": enc["input_ids"].squeeze(0),
            "attention_mask": enc["attention_mask"].squeeze(0),
            "route_label": torch.tensor(route_idx, dtype=torch.long),
            "intent_label": torch.tensor(intent_idx, dtype=torch.long),
            "ans_label": torch.tensor(ans_idx, dtype=torch.long),
            "lang_label": torch.tensor(lang_idx, dtype=torch.long),
        }
        if "token_type_ids" in enc:
            res["token_type_ids"] = enc["token_type_ids"].squeeze(0)
        return res


def evaluate_model(
    model: MiniLMQueryRouter,
    tokenizer: AutoTokenizer,
    samples: List[Dict[str, Any]],
    split_name: str,
    device: torch.device,
) -> Tuple[Dict[str, float], List[Dict[str, Any]], Dict[str, Any]]:
    model.eval()
    texts = [s["text"] for s in samples]
    true_routes = [s["route"] for s in samples]
    true_intents = [s["intent"] for s in samples]
    true_ans = [s["answerability"] for s in samples]
    true_langs = [s["language"] for s in samples]

    pred_routes: List[str] = []
    pred_intents: List[str] = []
    pred_ans: List[str] = []
    pred_langs: List[str] = []
    route_confs: List[float] = []
    intent_confs: List[float] = []
    latencies: List[float] = []

    softmax = nn.Softmax(dim=-1)

    with torch.no_grad():
        for text in texts:
            t0 = time.perf_counter()
            enc = tokenizer(text, return_tensors="pt", truncation=True, max_length=64).to(device)
            out = model(enc["input_ids"], enc["attention_mask"])
            t1 = time.perf_counter()
            latencies.append((t1 - t0) * 1000.0)

            r_probs = softmax(out["route_logits"])[0].cpu().numpy()
            i_probs = softmax(out["intent_logits"])[0].cpu().numpy()
            a_probs = softmax(out["ans_logits"])[0].cpu().numpy()
            l_probs = softmax(out["lang_logits"])[0].cpu().numpy()

            pred_routes.append(ROUTE_CLASSES[int(np.argmax(r_probs))])
            route_confs.append(float(np.max(r_probs)))

            pred_intents.append(INTENT_CLASSES[int(np.argmax(i_probs))])
            intent_confs.append(float(np.max(i_probs)))

            pred_ans.append(ANS_CLASSES[int(np.argmax(a_probs))])
            pred_langs.append(LANG_CLASSES[int(np.argmax(l_probs))])

    # Compute metrics
    route_macro_f1 = f1_score(true_routes, pred_routes, average="macro", zero_division=0)
    route_acc = accuracy_score(true_routes, pred_routes)
    route_report = classification_report(true_routes, pred_routes, output_dict=True, zero_division=0)
    route_cm = confusion_matrix(true_routes, pred_routes, labels=ROUTE_CLASSES).tolist()

    intent_macro_f1 = f1_score(true_intents, pred_intents, average="macro", zero_division=0)
    intent_acc = accuracy_score(true_intents, pred_intents)
    intent_report = classification_report(true_intents, pred_intents, output_dict=True, zero_division=0)

    ans_f1 = f1_score(true_ans, pred_ans, average="macro", zero_division=0)
    lang_acc = accuracy_score(true_langs, pred_langs)

    # Slice metrics: Roman Urdu vs English
    ur_idxs = [i for i, s in enumerate(samples) if s["language"] == "ur"]
    en_idxs = [i for i, s in enumerate(samples) if s["language"] == "en"]

    ur_route_f1 = (
        f1_score([true_routes[i] for i in ur_idxs], [pred_routes[i] for i in ur_idxs], average="macro", zero_division=0)
        if ur_idxs else 0.0
    )
    en_route_f1 = (
        f1_score([true_routes[i] for i in en_idxs], [pred_routes[i] for i in en_idxs], average="macro", zero_division=0)
        if en_idxs else 0.0
    )

    # Refusal recall (critical safety requirement)
    refusal_recall = route_report.get("refusal", {}).get("recall", 0.0)

    metrics = {
        f"{split_name}_route_acc": float(route_acc),
        f"{split_name}_route_macro_f1": float(route_macro_f1),
        f"{split_name}_intent_acc": float(intent_acc),
        f"{split_name}_intent_macro_f1": float(intent_macro_f1),
        f"{split_name}_ans_f1": float(ans_f1),
        f"{split_name}_lang_acc": float(lang_acc),
        f"{split_name}_roman_urdu_route_f1": float(ur_route_f1),
        f"{split_name}_english_route_f1": float(en_route_f1),
        f"{split_name}_refusal_recall": float(refusal_recall),
        f"{split_name}_p50_latency_ms": float(np.percentile(latencies, 50)),
        f"{split_name}_p95_latency_ms": float(np.percentile(latencies, 95)),
    }

    # Error collection
    errors: List[Dict[str, Any]] = []
    for idx, s in enumerate(samples):
        if pred_routes[idx] != s["route"] or pred_intents[idx] != s["intent"]:
            errors.append({
                "id": s["id"],
                "text": s["text"],
                "group_id": s["group_id"],
                "language": s["language"],
                "true_route": s["route"],
                "pred_route": pred_routes[idx],
                "route_conf": route_confs[idx],
                "true_intent": s["intent"],
                "pred_intent": pred_intents[idx],
                "intent_conf": intent_confs[idx],
                "true_answerability": s["answerability"],
                "pred_answerability": pred_ans[idx],
                "split": split_name,
            })

    artifacts = {
        "route_classes": ROUTE_CLASSES,
        "route_confusion_matrix": route_cm,
        "route_report": route_report,
        "intent_report": intent_report,
    }

    return metrics, errors, artifacts


def train_transformer(
    data_dir: Path,
    epochs: int = 15,
    batch_size: int = 8,
    learning_rate: float = 2e-5,
    weight_decay: float = 0.01,
    patience: int = 4,
    seed: int = 42,
) -> Dict[str, Any]:
    set_seed(seed)
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    train_data = load_split(data_dir / "train.json")
    val_data = load_split(data_dir / "val.json")
    test_data = load_split(data_dir / "test.json")

    tokenizer = AutoTokenizer.from_pretrained(
        "sentence-transformers/all-MiniLM-L6-v2", local_files_only=True
    )
    model = MiniLMQueryRouter(
        backbone_name="sentence-transformers/all-MiniLM-L6-v2",
        num_routes=len(ROUTE_CLASSES),
        num_intents=len(INTENT_CLASSES),
        num_answerabilities=len(ANS_CLASSES),
        num_languages=len(LANG_CLASSES),
        dropout_rate=0.2,
    ).to(device)

    train_ds = RouterDataset(train_data, tokenizer)
    train_loader = DataLoader(train_ds, batch_size=batch_size, shuffle=True)

    # Compute class weights for loss balancing (P8.1.3)
    train_routes = [s["route"] for s in train_data]
    train_intents = [s["intent"] for s in train_data]

    route_weights = compute_class_weight(
        "balanced", classes=np.array(ROUTE_CLASSES), y=np.array(train_routes)
    )
    intent_weights = compute_class_weight(
        "balanced", classes=np.array(INTENT_CLASSES), y=np.array(train_intents)
    )

    route_loss_fn = nn.CrossEntropyLoss(weight=torch.tensor(route_weights, dtype=torch.float).to(device))
    intent_loss_fn = nn.CrossEntropyLoss(weight=torch.tensor(intent_weights, dtype=torch.float).to(device))
    ans_loss_fn = nn.CrossEntropyLoss()
    lang_loss_fn = nn.CrossEntropyLoss()

    # Optimizer and Scheduler
    optimizer = torch.optim.AdamW(model.parameters(), lr=learning_rate, weight_decay=weight_decay)
    total_steps = len(train_loader) * epochs
    scheduler = get_linear_schedule_with_warmup(
        optimizer, num_warmup_steps=int(0.1 * total_steps), num_training_steps=total_steps
    )

    # Checkpointing and Early Stopping (P8.1.2)
    best_val_score = -1.0
    best_epoch = -1
    no_improve_count = 0
    checkpoint_dir = Path("pipelines/training/checkpoints")
    checkpoint_dir.mkdir(parents=True, exist_ok=True)
    best_model_path = checkpoint_dir / "best_minilm_router.pt"

    # MLflow tracking (P8.1.5)
    mlflow_tracking_dir = Path("mlruns").resolve()
    mlflow.set_tracking_uri(f"file:///{mlflow_tracking_dir.as_posix()}")
    mlflow.set_experiment("query-router-transformer")

    run_name = f"minilm-multitask-seed{seed}"
    with mlflow.start_run(run_name=run_name) as run:
        mlflow.log_params({
            "model_architecture": "MiniLM-L6-v2",
            "backbone": "sentence-transformers/all-MiniLM-L6-v2",
            "seed": seed,
            "epochs": epochs,
            "batch_size": batch_size,
            "learning_rate": learning_rate,
            "weight_decay": weight_decay,
            "patience": patience,
            "git_commit": get_git_commit(),
            "train_samples": len(train_data),
            "val_samples": len(val_data),
            "test_samples": len(test_data),
            "device": str(device),
        })

        for epoch in range(1, epochs + 1):
            model.train()
            total_loss = 0.0

            for batch in train_loader:
                optimizer.zero_grad()
                input_ids = batch["input_ids"].to(device)
                attention_mask = batch["attention_mask"].to(device)
                token_type_ids = batch.get("token_type_ids")
                if token_type_ids is not None:
                    token_type_ids = token_type_ids.to(device)

                outputs = model(input_ids, attention_mask, token_type_ids)

                loss_route = route_loss_fn(outputs["route_logits"], batch["route_label"].to(device))
                loss_intent = intent_loss_fn(outputs["intent_logits"], batch["intent_label"].to(device))
                loss_ans = ans_loss_fn(outputs["ans_logits"], batch["ans_label"].to(device))
                loss_lang = lang_loss_fn(outputs["lang_logits"], batch["lang_label"].to(device))

                # Multi-task loss combination (P8.1.4)
                loss = 1.0 * loss_route + 1.0 * loss_intent + 0.5 * loss_ans + 0.5 * loss_lang
                loss.backward()
                torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
                optimizer.step()
                scheduler.step()

                total_loss += loss.item()

            avg_train_loss = total_loss / len(train_loader)

            # Evaluate on validation split
            val_metrics, _, _ = evaluate_model(model, tokenizer, val_data, "val", device)
            val_combined_score = (val_metrics["val_route_macro_f1"] + val_metrics["val_intent_macro_f1"]) / 2.0

            mlflow.log_metrics({
                "train_loss": avg_train_loss,
                "val_route_macro_f1": val_metrics["val_route_macro_f1"],
                "val_intent_macro_f1": val_metrics["val_intent_macro_f1"],
                "val_combined_score": val_combined_score,
            }, step=epoch)

            print(f"Epoch {epoch:02d}/{epochs:02d} - Loss: {avg_train_loss:.4f} - Val Route F1: {val_metrics['val_route_macro_f1']:.4f} - Val Intent F1: {val_metrics['val_intent_macro_f1']:.4f}")

            # Checkpoint best model
            if val_combined_score > best_val_score:
                best_val_score = val_combined_score
                best_epoch = epoch
                no_improve_count = 0
                torch.save({
                    "epoch": epoch,
                    "model_state_dict": model.state_dict(),
                    "val_metrics": val_metrics,
                    "val_combined_score": val_combined_score,
                }, best_model_path)
            else:
                no_improve_count += 1
                if no_improve_count >= patience:
                    print(f"Early stopping triggered at epoch {epoch}. Best epoch was {best_epoch}.")
                    break

        # Load best checkpoint for final evaluation on test set (P8.1.6)
        best_ckpt = torch.load(best_model_path, map_location=device)
        model.load_state_dict(best_ckpt["model_state_dict"])
        print(f"Loaded best model from epoch {best_ckpt['epoch']} for final test evaluation.")

        train_metrics, _, _ = evaluate_model(model, tokenizer, train_data, "train", device)
        val_metrics, _, _ = evaluate_model(model, tokenizer, val_data, "val", device)
        test_metrics, test_errors, test_artifacts = evaluate_model(model, tokenizer, test_data, "test", device)

        all_metrics = {**train_metrics, **val_metrics, **test_metrics}
        mlflow.log_metrics(all_metrics)

        # Baseline comparison against promotion rules (P8.1.7)
        baseline_meta_path = Path("pipelines/training/releases/candidate_baseline_metadata.json")
        baseline_metrics = {}
        if baseline_meta_path.exists():
            with open(baseline_meta_path, "r", encoding="utf-8") as f:
                baseline_metrics = json.load(f).get("metrics", {})

        promotion_evaluation = evaluate_promotion_rules(baseline_metrics, test_metrics)

        # Save artifacts and error analysis
        reports_dir = Path("pipelines/training/reports")
        reports_dir.mkdir(parents=True, exist_ok=True)

        error_analysis_payload = {
            "model": "MiniLM-L6-v2-multitask",
            "best_epoch": best_epoch,
            "metrics": test_metrics,
            "promotion_rules": promotion_evaluation,
            "route_confusion_matrix": test_artifacts["route_confusion_matrix"],
            "route_classification_report": test_artifacts["route_report"],
            "intent_classification_report": test_artifacts["intent_report"],
            "test_errors": test_errors,
        }

        with open(reports_dir / "transformer_error_analysis.json", "w", encoding="utf-8") as f:
            json.dump(error_analysis_payload, f, indent=2)

        # Write markdown summary
        write_markdown_report(reports_dir / "transformer_error_analysis.md", error_analysis_payload)

        # Save candidate release metadata
        releases_dir = Path("pipelines/training/releases")
        releases_dir.mkdir(parents=True, exist_ok=True)
        candidate_meta = {
            "model_name": "query-router-minilm",
            "model_version": "candidate-v2",
            "role": "candidate",
            "is_champion": False,
            "backbone": "sentence-transformers/all-MiniLM-L6-v2",
            "git_commit": get_git_commit(),
            "best_epoch": best_epoch,
            "metrics": test_metrics,
            "promotion_evaluation": promotion_evaluation,
            "checkpoint_path": str(best_model_path),
            "status": "ready_for_onnx_packaging",
        }
        with open(releases_dir / "candidate_minilm_metadata.json", "w", encoding="utf-8") as f:
            json.dump(candidate_meta, f, indent=2)

        print("\n=== Training & Evaluation Complete ===")
        print(f"Test Route Macro F1 : {test_metrics['test_route_macro_f1']:.4f}")
        print(f"Test Intent Macro F1: {test_metrics['test_intent_macro_f1']:.4f}")
        print(f"Refusal Recall      : {test_metrics['test_refusal_recall']:.4f}")
        print(f"Roman Urdu Route F1 : {test_metrics['test_roman_urdu_route_f1']:.4f}")
        print(f"p95 Latency (ms)    : {test_metrics['test_p95_latency_ms']:.2f}")
        print(f"Promotion Passed    : {promotion_evaluation['all_passed']}")

        return candidate_meta


def evaluate_promotion_rules(
    baseline: Dict[str, float],
    candidate: Dict[str, float],
) -> Dict[str, Any]:
    """Predeclared promotion rules (P8.1.7)."""
    b_route_f1 = baseline.get("test_route_macro_f1", 0.0)
    b_intent_f1 = baseline.get("test_intent_macro_f1", 0.0)
    b_ur_f1 = baseline.get("test_roman_urdu_route_f1", 0.0)
    b_refusal_recall = baseline.get("test_refusal_recall", 0.50)

    c_route_f1 = candidate.get("test_route_macro_f1", 0.0)
    c_intent_f1 = candidate.get("test_intent_macro_f1", 0.0)
    c_ur_f1 = candidate.get("test_roman_urdu_route_f1", 0.0)
    c_refusal_recall = candidate.get("test_refusal_recall", 0.0)
    c_p95_latency = candidate.get("test_p95_latency_ms", 0.0)

    rules = {
        "rule_1_route_macro_f1_superior": {
            "description": "Candidate route macro F1 must be superior to baseline",
            "baseline": b_route_f1,
            "candidate": c_route_f1,
            "passed": bool(c_route_f1 > b_route_f1),
        },
        "rule_2_intent_macro_f1_superior": {
            "description": "Candidate intent macro F1 must be superior to baseline",
            "baseline": b_intent_f1,
            "candidate": c_intent_f1,
            "passed": bool(c_intent_f1 > b_intent_f1),
        },
        "rule_3_refusal_recall_no_regression": {
            "description": "Critical refusal/out-of-domain recall must not regress below baseline",
            "baseline": b_refusal_recall,
            "candidate": c_refusal_recall,
            "passed": bool(c_refusal_recall >= b_refusal_recall),
        },
        "rule_4_roman_urdu_no_regression": {
            "description": "Roman Urdu slice route F1 must not regress below baseline",
            "baseline": b_ur_f1,
            "candidate": c_ur_f1,
            "passed": bool(c_ur_f1 >= b_ur_f1),
        },
        "rule_5_latency_under_budget": {
            "description": "Candidate p95 latency must be under 25.0 ms",
            "budget_ms": 25.0,
            "candidate_ms": c_p95_latency,
            "passed": bool(c_p95_latency <= 25.0),
        },
    }

    all_passed = all(r["passed"] for r in rules.values())
    return {
        "all_passed": all_passed,
        "rules": rules,
    }


def write_markdown_report(report_path: Path, payload: Dict[str, Any]):
    m = payload["metrics"]
    promo = payload["promotion_rules"]

    md = f"""# Transformer Router (MiniLM-L6-v2) Error Analysis & Evaluation Report

- **Model**: `MiniLM-L6-v2-multitask`
- **Best Checkpoint Epoch**: {payload['best_epoch']}
- **Evaluated Split**: Locked Human-Authored Test Set (`test.json`)

## 1. Executive Summary & Metrics

| Metric | Transformer (Candidate-v2) | Target / Threshold |
|---|---|---|
| **Test Route Macro F1** | **{m['test_route_macro_f1']:.4f}** | Superior to Baseline |
| **Test Intent Macro F1** | **{m['test_intent_macro_f1']:.4f}** | Superior to Baseline |
| **Test Route Accuracy** | **{m['test_route_acc'] * 100:.1f}%** | - |
| **Test Intent Accuracy** | **{m['test_intent_acc'] * 100:.1f}%** | - |
| **Refusal Recall (Safety Gate)** | **{m['test_refusal_recall'] * 100:.1f}%** | >= Baseline (50.0%) |
| **Roman Urdu Slice Route F1** | **{m['test_roman_urdu_route_f1']:.4f}** | >= Baseline |
| **English Slice Route F1** | **{m['test_english_route_f1']:.4f}** | - |
| **Inference Latency (p50)** | **{m['test_p50_latency_ms']:.2f} ms** | < 25 ms |
| **Inference Latency (p95)** | **{m['test_p95_latency_ms']:.2f} ms** | < 25 ms |

## 2. Predeclared Promotion Rules Evaluation (P8.1.7)

Overall Promotion Recommendation: **{'RECOMMEND PROMOTION' if promo['all_passed'] else 'REJECT / HOLD'}**

"""
    for rule_id, rule_info in promo["rules"].items():
        status = "PASSED" if rule_info["passed"] else "FAILED"
        md += f"- **{rule_id}**: {status} ({rule_info['description']})\n"

    md += f"""
## 3. Route Confusion Matrix

- Labels: `{payload['route_confusion_matrix']}`

## 4. Test Split Errors ({len(payload['test_errors'])} errors)
"""
    if not payload["test_errors"]:
        md += "\nZero classification errors detected on the test set!\n"
    else:
        for err in payload["test_errors"]:
            md += f"- **[{err['id']}]** `\"{err['text']}\"` (Lang: {err['language']})\n"
            md += f"  - Route : true=`{err['true_route']}`, pred=`{err['pred_route']}` (conf={err['route_conf']:.2f})\n"
            md += f"  - Intent: true=`{err['true_intent']}`, pred=`{err['pred_intent']}` (conf={err['intent_conf']:.2f})\n"

    with open(report_path, "w", encoding="utf-8") as f:
        f.write(md)


if __name__ == "__main__":
    data_directory = Path("pipelines/evaluation/data")
    train_transformer(data_directory)
