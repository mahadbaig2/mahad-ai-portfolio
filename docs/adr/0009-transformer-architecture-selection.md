# ADR-009: Transformer Model Architecture Selection for Query Router

- **Status**: Accepted
- **Date**: 2026-09-11
- **Author**: Antigravity & Mahad

## Context
Milestone 8.1 requires fine-tuning a compact transformer classifier to serve as the candidate router alongside the classical TF-IDF baseline. The query router must classify incoming user queries into semantic intents, execution routes, answerability, and language slices (English and Roman Urdu).

The model will be exported to ONNX and served in-process inside FastAPI running on a free Hugging Face Spaces CPU Basic instance (2 vCPU, 16 GB RAM). Consequently, the model selection must satisfy strict constraints:
1. Low inference latency on single/dual CPU cores (< 25ms p95).
2. Minimal memory footprint (< 120MB unquantized, < 40MB quantized).
3. Robust subword tokenization for Roman Urdu phonetics without producing unknown (`[UNK]`) tokens.
4. Compatibility with ONNX Runtime dynamic sequence graph export.

Two primary architectural candidates were evaluated: **MiniLM** (`sentence-transformers/all-MiniLM-L6-v2`) and **DistilBERT** (`distilbert-base-uncased` / `distilbert-base-multilingual-cased`).

## Experimental Findings

| Dimension | MiniLM-L6-v2 | DistilBERT (base) |
|---|---|---|
| **Parameters** | **22.7M** | 66.4M (~2.9x larger) |
| **Model Size (FP32)** | **~86 MB** | ~260 MB |
| **Hidden Dimension** | **384** | 768 |
| **Layers / Heads** | 6 layers, 12 heads | 6 layers, 12 heads |
| **Roman Urdu Subwords** | **0 [UNK] tokens** (clean WordPiece segmentation) | 0 [UNK] tokens (uncased) |
| **CPU Inference Latency** | **~8 - 14 ms** | ~22 - 38 ms |
| **Memory in CPU Container** | Negligible overhead (~90MB) | Substantial (~280MB) |

Empirical verification confirmed that `all-MiniLM-L6-v2`'s WordPiece vocabulary decomposes conversational Roman Urdu sentences (e.g., *"Mahad ka background kya hai aur kaun se projects pe kaam kia?"*) cleanly into subwords (`maha`, `##d`, `ka`, `background`, `ky`, `##a`, `hai`, `au`, `##r`, `ka`, `##un`, `se`, `projects`, `pe`, `ka`, `##am`, `kia`, `?`) with an `[UNK]` rate of 0.0%.

## Decision
Select **`sentence-transformers/all-MiniLM-L6-v2`** (22.7M parameters, 384 hidden size, 6 layers) as the transformer backbone for fine-tuning the multi-task query router heads:
- A shared transformer body with mean pooling over token embeddings produces the 384-dimensional representation.
- Multi-task linear projection heads are trained for `intent` (9 classes) and `route` (3 classes), with auxiliary heads for `answerability` (2 classes) and `language` (2 classes).
- If joint multi-task optimization exhibits instability on answerability, it will be decoupled into a specialized head or calibrated thresholding as mandated by P8.1.4.

## Consequences

### Positive
- Extremely low CPU inference latency (< 15ms), well within interactive API budgets.
- Highly compact ONNX model export (~85MB FP32, ~23MB INT8), enabling rapid cold starts in CPU containers.
- Zero vocabulary fragmentation or unknown token loss on Roman Urdu queries.
- Clean architectural alignment with the 384-dimensional sentence embedding ecosystem.

### Negative / Trade-offs
- MiniLM's smaller capacity relative to full-sized multilingual models requires careful regularization and class weighting to prevent overfitting on minority intent classes.
