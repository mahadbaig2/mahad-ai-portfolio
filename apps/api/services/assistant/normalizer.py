"""Query normalization service preserving English and Roman Urdu code-switching (P9.2.2)."""

import re
import unicodedata
from dataclasses import dataclass, field

# Well-known technical entities and project names to preserve exactly
KNOWN_TECHNICAL_ENTITIES = [
    "CardioScan AI",
    "CardioScan",
    "mimAR Studios",
    "mimAR",
    "LangGraph",
    "FastAPI",
    "ONNX",
    "Qdrant",
    "PostgreSQL",
    "Neon",
    "Sanity",
    "LangSmith",
    "PyTorch",
    "OpenVoice",
    "Whisper",
    "Next.js",
    "Tailwind",
    "MiniLM",
]

# Common Roman Urdu spelling variations to normalize to canonical representations
ROMAN_URDU_NORMALIZATION_MAP = {
    r"\bkia\b": "kya",
    r"\bhy\b": "hai",
    r"\bhein\b": "hain",
    r"\bkon\b": "kaun",
    r"\bbare\s+mein\b": "baray mein",
    r"\bkaam\b": "kaam",
    r"\btajarba\b": "tajurba",
    r"\bmaloomat\b": "maloomat",
    r"\bprojecton\b": "projects",
    r"\bprojcts\b": "projects",
}


@dataclass
class NormalizedQuery:
    """Normalized query output with preserved code-switching and extracted entities."""

    raw_text: str
    normalized_text: str
    detected_entities: list[str] = field(default_factory=list)
    has_roman_urdu: bool = False


def normalize_query(text: str) -> NormalizedQuery:
    """P9.2.2: Normalize query text for vector search while preserving code-switching.

    - Applies NFKC unicode normalization.
    - Preserves capitalized technical terms and camelCase identifiers.
    - Normalizes common Roman Urdu phonetic variations to standard transliterations.
    - Strips unwanted non-semantic control characters and standardizes whitespace.
    """
    if not text:
        return NormalizedQuery(raw_text="", normalized_text="", detected_entities=[])

    # 1. NFKC Unicode normalization
    normalized = unicodedata.normalize("NFKC", text)

    # 2. Remove invisible control characters while preserving standard punctuation
    normalized = "".join(ch for ch in normalized if ch.isprintable() or ch in " \t\n")

    # 3. Detect known technical entities before lowercase transforms
    detected_entities = []
    for entity in KNOWN_TECHNICAL_ENTITIES:
        pattern = re.compile(rf"\b{re.escape(entity)}\b", re.IGNORECASE)
        if pattern.search(normalized):
            detected_entities.append(entity)

    # 4. Standardize Roman Urdu phonetics without erasing code-switched terms
    has_roman_urdu = False
    for pattern, replacement in ROMAN_URDU_NORMALIZATION_MAP.items():
        if re.search(pattern, normalized, re.IGNORECASE):
            has_roman_urdu = True
            normalized = re.sub(pattern, replacement, normalized, flags=re.IGNORECASE)

    # Secondary Roman Urdu indicator check
    urdu_markers = [
        r"\bkya\b",
        r"\bhai\b",
        r"\bhain\b",
        r"\bkaun\b",
        r"\bbaray\b",
        r"\bmein\b",
        r"\bka\b",
        r"\bki\b",
        r"\bke\b",
        r"\bkarein\b",
        r"\bbatayein\b",
    ]
    for marker in urdu_markers:
        if re.search(marker, normalized, re.IGNORECASE):
            has_roman_urdu = True
            break

    # 5. Clean redundant whitespace
    normalized = re.sub(r"\s+", " ", normalized).strip()

    return NormalizedQuery(
        raw_text=text,
        normalized_text=normalized,
        detected_entities=detected_entities,
        has_roman_urdu=has_roman_urdu,
    )
