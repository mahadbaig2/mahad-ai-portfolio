"""
In-Process ONNX Query Router Service.

Tasks:
- P8.3.1: Download/pin immutable model during backend build.
- P8.3.2: Load one ONNX Runtime session at application startup.
- P8.3.3: Identical training/serving preprocessing.
- P8.3.4: Return labels, confidence, model version, and safe fallback.
- P8.3.6: Configuration-based rollback to prior artifact.
"""

import json
import logging
import os
import time
from pathlib import Path
from typing import Any, Dict, List, Optional

import numpy as np
import onnxruntime as ort
from transformers import AutoTokenizer

from apps.api.core.config import ROOT_DIR, get_settings
from apps.api.schemas.router import (
    AnswerabilityLabel,
    IntentLabel,
    LanguageLabel,
    RouteLabel,
    RouterPredictionResponse,
)

logger = logging.getLogger(__name__)

_router_service_instance: Optional["QueryRouterService"] = None


class QueryRouterService:
    """In-process ONNX query classification service running directly within FastAPI."""

    def __init__(self, model_dir: Optional[Path] = None, confidence_threshold: Optional[float] = None):
        settings = get_settings()
        self.model_dir = model_dir or (ROOT_DIR / settings.MODEL_ROUTER_DIR)
        self.confidence_threshold = (
            confidence_threshold if confidence_threshold is not None else settings.MODEL_ROUTER_CONFIDENCE_THRESHOLD
        )
        self.session: Optional[ort.InferenceSession] = None
        self.tokenizer: Optional[AutoTokenizer] = None
        self.config: Dict[str, Any] = {}
        self._load_model()

    def _load_model(self):
        t0 = time.perf_counter()
        if not self.model_dir.exists():
            raise FileNotFoundError(f"Model release directory not found: {self.model_dir}")

        onnx_file = self.model_dir / "model.onnx"
        config_file = self.model_dir / "config.json"
        tokenizer_dir = self.model_dir / "tokenizer"

        if not onnx_file.exists():
            raise FileNotFoundError(f"ONNX model file not found: {onnx_file}")
        if not config_file.exists():
            raise FileNotFoundError(f"Model config file not found: {config_file}")
        if not tokenizer_dir.exists():
            raise FileNotFoundError(f"Tokenizer directory not found: {tokenizer_dir}")

        # Load config
        with open(config_file, "r", encoding="utf-8") as f:
            self.config = json.load(f)

        # Load ONNX Session (Single instance per process)
        sess_options = ort.SessionOptions()
        sess_options.intra_op_num_threads = 2
        sess_options.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL
        self.session = ort.InferenceSession(str(onnx_file), sess_options, providers=["CPUExecutionProvider"])

        # Load Tokenizer
        self.tokenizer = AutoTokenizer.from_pretrained(str(tokenizer_dir), local_files_only=True)
        t1 = time.perf_counter()
        self.load_latency_ms = (t1 - t0) * 1000.0

        logger.info(
            "Loaded in-process ONNX model %s (version=%s) from %s in %.2fms",
            self.config.get("model_name"),
            self.config.get("model_version"),
            self.model_dir,
            self.load_latency_ms,
        )

    def predict(self, text: str) -> RouterPredictionResponse:
        """Classify user query text into route, intent, answerability, and language."""
        if not self.session or not self.tokenizer:
            raise RuntimeError("QueryRouterService session not initialized")

        clean_text = text.strip()
        t0 = time.perf_counter()

        # Identical preprocessing (max_length=64, truncation=True)
        enc = self.tokenizer(
            clean_text,
            max_length=self.config.get("max_sequence_length", 64),
            truncation=True,
            return_tensors="np",
        )

        inputs = {
            "input_ids": enc["input_ids"],
            "attention_mask": enc["attention_mask"],
        }
        outputs = self.session.run(None, inputs)
        t1 = time.perf_counter()
        latency_ms = (t1 - t0) * 1000.0

        route_logits = outputs[0][0]
        intent_logits = outputs[1][0]
        ans_logits = outputs[2][0]
        lang_logits = outputs[3][0]

        # Compute softmax probabilities
        route_probs = np.exp(route_logits - np.max(route_logits))
        route_probs = route_probs / np.sum(route_probs)

        intent_probs = np.exp(intent_logits - np.max(intent_logits))
        intent_probs = intent_probs / np.sum(intent_probs)

        route_classes = self.config["route_classes"]
        intent_classes = self.config["intent_classes"]
        ans_classes = self.config["ans_classes"]
        lang_classes = self.config["lang_classes"]

        pred_route_idx = int(np.argmax(route_probs))
        pred_intent_idx = int(np.argmax(intent_probs))
        pred_ans_idx = int(np.argmax(ans_logits))
        pred_lang_idx = int(np.argmax(lang_logits))

        raw_route = route_classes[pred_route_idx]
        route_conf = float(route_probs[pred_route_idx])

        raw_intent = intent_classes[pred_intent_idx]
        intent_conf = float(intent_probs[pred_intent_idx])

        raw_ans = ans_classes[pred_ans_idx]
        raw_lang = lang_classes[pred_lang_idx]

        # Safe fallback check (P8.3.4)
        is_fallback = False
        final_route = raw_route
        if route_conf < self.confidence_threshold:
            fallback_route = self.config.get("fallback_route", "rag_retrieval")
            logger.warning(
                "Router confidence %.3f below threshold %.3f for text '%s'. Falling back to '%s'.",
                route_conf,
                self.confidence_threshold,
                clean_text,
                fallback_route,
            )
            final_route = fallback_route
            is_fallback = True

        return RouterPredictionResponse(
            text=clean_text,
            route=RouteLabel(final_route),
            route_confidence=round(route_conf, 4),
            intent=IntentLabel(raw_intent),
            intent_confidence=round(intent_conf, 4),
            answerability=AnswerabilityLabel(raw_ans),
            language=LanguageLabel(raw_lang),
            model_name=self.config.get("model_name", "query-router-minilm"),
            model_version=self.config.get("model_version", "unknown"),
            is_fallback=is_fallback,
            latency_ms=round(latency_ms, 2),
        )


def get_router_service() -> QueryRouterService:
    """Return singleton in-process query router instance."""
    global _router_service_instance
    if _router_service_instance is None:
        _router_service_instance = QueryRouterService()
    return _router_service_instance


def reset_router_service(new_model_dir: Optional[Path] = None) -> QueryRouterService:
    """Reinitialize or rollback router service to a specific artifact directory (P8.3.6)."""
    global _router_service_instance
    _router_service_instance = QueryRouterService(model_dir=new_model_dir)
    return _router_service_instance
