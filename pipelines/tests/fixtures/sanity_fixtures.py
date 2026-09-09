"""Comprehensive test fixtures simulating Sanity CMS documents with rich ASTs."""

from typing import Any

FIXTURE_PROJECT: dict[str, Any] = {
    "_id": "project-cardioscan-ai",
    "_type": "project",
    "title": "CardioScan AI",
    "slug": {"current": "cardioscan-ai"},
    "summary": "Edge-deployed deep learning system for rapid ECG arrhythmia detection.",
    "ragEnabled": True,
    "targetAudiences": ["recruiter", "engineer"],
    "language": "en",
    "techStack": ["PyTorch", "ONNX Runtime", "FastAPI", "Docker", "Next.js"],
    "metrics": [
        {"label": "Inference Latency", "value": "18ms on CPU"},
        {"label": "AUROC", "value": "0.984 across 12 lead sets"},
        {"label": "Model Size", "value": "14.2 MB quantized"},
    ],
    "body": [
        {
            "_type": "block",
            "style": "normal",
            "children": [
                {
                    "_type": "span",
                    "text": "CardioScan AI was designed to solve clinical latency in cardiac triage.",
                }
            ],
        },
        {
            "_type": "block",
            "style": "h2",
            "children": [
                {
                    "_type": "span",
                    "text": "Model Architecture & Optimization",
                }
            ],
        },
        {
            "_type": "block",
            "style": "normal",
            "children": [
                {
                    "_type": "span",
                    "text": "We utilized a 1D residual convolutional neural network with squeeze-and-excitation blocks.",
                }
            ],
        },
        {
            "_type": "codeBlock",
            "language": "python",
            "filename": "model/infer.py",
            "code": "import onnxruntime as ort\nsession = ort.InferenceSession('cardioscan.onnx')",
        },
        {
            "_type": "block",
            "style": "h3",
            "children": [
                {
                    "_type": "span",
                    "text": "Key Deployment Criteria",
                }
            ],
        },
        {
            "_type": "block",
            "style": "normal",
            "listItem": "bullet",
            "level": 1,
            "children": [{"_type": "span", "text": "Deterministic memory allocation (< 100MB)"}],
        },
        {
            "_type": "block",
            "style": "normal",
            "listItem": "bullet",
            "level": 1,
            "children": [{"_type": "span", "text": "Strict zero-cloud fallback for offline clinical safety"}],
        },
        {
            "_type": "image",
            "alt": "CardioScan Architecture Topology",
            "caption": "Figure 1: Neural pipeline from raw leads to triage probability.",
        },
    ],
}


FIXTURE_ARTICLE: dict[str, Any] = {
    "_id": "article-building-rag-right",
    "_type": "article",
    "title": "Building RAG Right: Why Vector DBs Shouldn't Own Your Data",
    "slug": {"current": "building-rag-right"},
    "summary": "Architectural principles for robust RAG pipelines that prevent data loss.",
    "ragEnabled": True,
    "targetAudiences": ["engineer", "founder"],
    "language": "en",
    "body": [
        {
            "_type": "block",
            "style": "normal",
            "children": [
                {
                    "_type": "span",
                    "text": "Most RAG tutorials make a fatal mistake: treating vector indexes as databases.",
                }
            ],
        },
        {
            "_type": "callout",
            "tone": "warning",
            "text": "Never use an ephemeral cloud vector database as your primary document store.",
        },
        {
            "_type": "block",
            "style": "blockquote",
            "children": [
                {
                    "_type": "span",
                    "text": "Indexes are derived views. Canonical data belongs in an ACID-compliant store.",
                }
            ],
        },
        {
            "_type": "block",
            "style": "normal",
            "listItem": "number",
            "level": 1,
            "children": [{"_type": "span", "text": "PostgreSQL owns canonical chunk text and metadata."}],
        },
        {
            "_type": "block",
            "style": "normal",
            "listItem": "number",
            "level": 1,
            "children": [{"_type": "span", "text": "Qdrant holds vector points with UUIDs matching PostgreSQL."}],
        },
    ],
}


FIXTURE_URDU_FAQ: dict[str, Any] = {
    "_id": "faq-urdu-experience",
    "_type": "faq",
    "question": "کیا آپ اردو میں بات کر سکتے ہیں؟\u200B",  # Contains zero-width space
    "language": "ur",
    "ragEnabled": True,
    "targetAudiences": ["general", "recruiter"],
    "answer": [
        {
            "_type": "block",
            "style": "normal",
            "children": [
                {
                    "_type": "span",
                    "text": "جی ہاں، میں اردو اور رومن اردو دونوں سمجھ سکتا ہوں اور جواب دے سکتا ہوں۔\uFEFF",  # Contains BOM/zero-width
                }
            ],
        },
        {
            "_type": "block",
            "style": "normal",
            "children": [
                {
                    "_type": "span",
                    "text": "Aap mujhse Mahad ke projects, machine learning experience aur AI engineering ke baare mein Roman Urdu mein bhi pooch saktay hain.",
                }
            ],
        },
    ],
}
