# Model Card: Mahad AI Portfolio Query Router (MiniLM-L6-v2)

## Overview
- **Model Name**: `query-router-minilm`
- **Version**: `v1.0.0`
- **Architecture**: `sentence-transformers/all-MiniLM-L6-v2` with multi-task linear classification heads.
- **Runtime**: In-Process ONNX Runtime CPU (`onnxruntime==1.30.0`).
- **Format**: ONNX dynamic batch / dynamic sequence length.
- **Artifact**: `quantized` model (pipelines\training\releases\package_v1\model.onnx).

## Intended Use
Classify user queries into:
1. **Execution Route**: `rag_retrieval`, `direct_chat`, `refusal`
2. **User Intent**: 9 portfolio-specific semantic intents
3. **Answerability**: `answerable`, `unanswerable`
4. **Language**: English (`en`), Roman Urdu (`ur`)

## Verified Performance (Locked Human Test Set)
- **Route Macro F1**: 0.8322 (Baseline: 0.6623)
- **Intent Macro F1**: 0.2381 (Baseline: 0.1436)
- **Roman Urdu Route F1**: 0.8667 (Baseline: 0.7222)
- **Refusal Recall**: 62.5% (Baseline: 50.0%)
- **p95 CPU Latency**: 16.77 ms (Budget: < 25.0 ms)
- **ONNX Numerical Tolerance**: Max absolute error < 1.33e-06 (Threshold: 1e-4)

## Safe Fallback & Operational Bounds
- If route confidence is below 0.50, the request safely falls back to standard RAG retrieval.
- Multi-task predictions are served in-process inside FastAPI with zero network calls.
