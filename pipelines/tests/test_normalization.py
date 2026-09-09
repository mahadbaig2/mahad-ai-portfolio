"""Unit and snapshot tests for document normalization, Portable Text AST, and Urdu preservation (P4.1.7)."""

from pipelines.ingestion.contracts import NormalizedDocument, SectionType
from pipelines.ingestion.normalizer import (
    derive_canonical_url,
    normalize_sanity_document,
)
from pipelines.ingestion.portable_text import (
    parse_portable_text,
    portable_text_to_markdown,
)
from pipelines.ingestion.sanity_extractor import SanityExtractor
from pipelines.tests.fixtures.sanity_fixtures import (
    FIXTURE_ARTICLE,
    FIXTURE_PROJECT,
    FIXTURE_URDU_FAQ,
)


def test_canonical_url_derivation() -> None:
    """Verify route mappings for each Sanity document type."""
    assert derive_canonical_url("project", "cardioscan-ai") == "/work/cardioscan-ai"
    assert derive_canonical_url("caseStudy", "cardioscan-deep-dive") == "/work/cardioscan-deep-dive"
    assert derive_canonical_url("article", "building-rag-right") == "/blog/building-rag-right"
    assert derive_canonical_url("experience", "busyfile") == "/about#busyfile"
    assert derive_canonical_url("faq", None) == "/faq"
    assert derive_canonical_url("architectureDecision", "adr-001") == "/architecture/adr-001"
    assert derive_canonical_url("styleExample", None) == "/engineering"


def test_portable_text_headings_and_hierarchy() -> None:
    """Verify that headings establish sections with accurate hierarchical heading paths."""
    sections = parse_portable_text(
        FIXTURE_PROJECT["body"], document_title="CardioScan AI"
    )
    assert len(sections) >= 3

    # Find the subsection under Key Deployment Criteria
    bullet_sec = next(s for s in sections if s.section_type == SectionType.LIST)
    assert bullet_sec.heading == "Key Deployment Criteria"
    assert bullet_sec.heading_level == 3
    assert "CardioScan AI" in bullet_sec.heading_path
    assert "Model Architecture & Optimization" in bullet_sec.heading_path
    assert "Key Deployment Criteria" in bullet_sec.heading_path
    assert "- Deterministic memory allocation (< 100MB)" in bullet_sec.content


def test_code_block_and_image_preservation() -> None:
    """Verify code blocks retain language, filename, and format, and images preserve captions."""
    sections = parse_portable_text(
        FIXTURE_PROJECT["body"], document_title="CardioScan AI"
    )

    code_sec = next(s for s in sections if s.section_type == SectionType.CODE)
    assert "```python:model/infer.py" in code_sec.content
    assert "onnxruntime as ort" in code_sec.content

    markdown = portable_text_to_markdown(FIXTURE_PROJECT["body"], document_title="CardioScan AI")
    assert "[Image: Figure 1: Neural pipeline from raw leads to triage probability.]" in markdown


def test_lists_and_callouts() -> None:
    """Verify numbered lists, callouts, and blockquotes render properly."""
    sections = parse_portable_text(FIXTURE_ARTICLE["body"], document_title=FIXTURE_ARTICLE["title"])

    callout_sec = next(s for s in sections if s.section_type == SectionType.CALLOUT)
    assert "> **[Warning]**: Never use an ephemeral cloud vector database" in callout_sec.content

    quote_sec = next(s for s in sections if s.section_type == SectionType.QUOTE)
    assert "> Indexes are derived views." in quote_sec.content

    list_sec = next(s for s in sections if s.section_type == SectionType.LIST)
    assert "1. PostgreSQL owns canonical chunk text" in list_sec.content
    assert "2. Qdrant holds vector points" in list_sec.content


def test_unicode_and_urdu_preservation() -> None:
    """P4.1.5: Verify Urdu and Roman Urdu are strictly preserved and zero-width characters removed."""
    doc = normalize_sanity_document(FIXTURE_URDU_FAQ)

    assert doc.language == "ur"
    assert doc.title == "کیا آپ اردو میں بات کر سکتے ہیں؟"
    # Zero-width spaces should be stripped
    assert "\u200b" not in doc.title
    assert "\ufeff" not in doc.raw_text

    # Urdu characters should remain intact
    assert "جی ہاں، میں اردو اور رومن اردو دونوں سمجھ سکتا ہوں" in doc.raw_text
    # Roman Urdu should remain intact
    assert "Mahad ke projects, machine learning experience" in doc.raw_text


def test_deterministic_hashing() -> None:
    """P4.1.6: Invariant: Identical content produces identical SHA-256 hashes."""
    doc1 = normalize_sanity_document(FIXTURE_PROJECT)
    doc2 = normalize_sanity_document(dict(FIXTURE_PROJECT))

    assert doc1.content_hash == doc2.content_hash
    assert len(doc1.content_hash) == 64  # SHA-256 hex digest length

    # Altering a single character must change the hash
    modified_fixture = dict(FIXTURE_PROJECT)
    modified_fixture["summary"] = "Different summary string."
    doc3 = normalize_sanity_document(modified_fixture)
    assert doc1.content_hash != doc3.content_hash


def test_normalized_document_schema_validation() -> None:
    """P4.1.1: Ensure full NormalizedDocument satisfies model validation."""
    doc = normalize_sanity_document(FIXTURE_PROJECT)

    assert isinstance(doc, NormalizedDocument)
    assert doc.sanity_id == "project-cardioscan-ai"
    assert doc.document_type == "project"
    assert doc.slug == "cardioscan-ai"
    assert doc.canonical_url == "/work/cardioscan-ai"
    assert doc.rag_enabled is True
    assert "engineer" in doc.target_audiences
    assert doc.metadata.get("techStack") == ["PyTorch", "ONNX Runtime", "FastAPI", "Docker", "Next.js"]

    # Check that key metrics section was synthesized
    metrics_sec = next((s for s in doc.sections if s.heading == "Key Metrics & Impact"), None)
    assert metrics_sec is not None
    assert "Inference Latency**: 18ms on CPU" in metrics_sec.content


def test_sanity_extractor_endpoint_building() -> None:
    """P4.1.2: Validate SanityExtractor URL and header assembly."""
    extractor = SanityExtractor(
        project_id="test-proj-123",
        dataset="staging",
        api_token="sk-fake-test-token",
        api_version="2024-03-01",
    )
    assert extractor.query_endpoint == "https://test-proj-123.api.sanity.io/v2024-03-01/data/query/staging"
    headers = extractor._headers()
    assert headers["Authorization"] == "Bearer sk-fake-test-token"
    assert headers["Content-Type"] == "application/json"
