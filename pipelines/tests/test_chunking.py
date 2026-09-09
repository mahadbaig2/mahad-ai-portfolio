"""Unit tests for heading-aware recursive chunking (P4.2.7)."""

from pipelines.ingestion.chunker import ChunkingConfig, HeadingAwareChunker
from pipelines.ingestion.contracts import (
    DocumentSection,
    NormalizedDocument,
    SectionType,
)
from pipelines.ingestion.normalizer import normalize_sanity_document
from pipelines.tests.fixtures.sanity_fixtures import (
    FIXTURE_ARTICLE,
    FIXTURE_PROJECT,
    FIXTURE_URDU_FAQ,
)


def test_short_document_single_chunk() -> None:
    """Short documents produce a single, cohesive chunk."""
    doc = normalize_sanity_document(FIXTURE_URDU_FAQ)
    chunker = HeadingAwareChunker()
    chunks = chunker.chunk_document(doc)

    assert len(chunks) == 1
    chunk = chunks[0]
    assert chunk.chunk_index == 0
    assert chunk.document_sanity_id == "faq-urdu-experience"
    assert chunk.language == "ur"
    assert "کیا آپ اردو میں بات کر سکتے ہیں؟" in chunk.content
    assert "Aap mujhse Mahad ke projects" in chunk.content


def test_context_prefix_in_chunks() -> None:
    """P4.2.3: Chunks retain heading path prefix for retrieval grounding."""
    doc = normalize_sanity_document(FIXTURE_PROJECT)
    chunker = HeadingAwareChunker()
    chunks = chunker.chunk_document(doc)

    assert len(chunks) >= 1
    # Check that the first chunk includes the title in heading path context
    assert chunks[0].content.startswith("[CardioScan AI")
    assert chunks[0].project_slug == "cardioscan-ai"


def test_list_introduction_coherence() -> None:
    """P4.2.5: Keep list introductions with their lists in the same chunk."""
    sections = [
        DocumentSection(
            heading="Deployment Rules",
            heading_level=2,
            heading_path=["System", "Deployment Rules"],
            content="The critical system requirements are as follows:",
            section_type=SectionType.PROSE,
        ),
        DocumentSection(
            heading="Deployment Rules",
            heading_level=2,
            heading_path=["System", "Deployment Rules"],
            content="- Rule 1: Zero cloud egress\n- Rule 2: 100MB RAM max",
            section_type=SectionType.LIST,
        ),
    ]
    doc = NormalizedDocument(
        sanity_id="test-doc-list",
        document_type="project",
        title="System",
        canonical_url="/work/system",
        language="en",
        rag_enabled=True,
        target_audiences=["engineer"],
        content_hash="hash123",
        raw_text="System test",
        sections=sections,
    )

    chunker = HeadingAwareChunker()
    chunks = chunker.chunk_document(doc)

    assert len(chunks) == 1
    assert "The critical system requirements are as follows:\n\n- Rule 1: Zero cloud egress" in chunks[0].content


def test_long_document_recursive_splitting() -> None:
    """P4.2.1 & P4.2.2: Test recursive splitting on large documents with configurable token bounds."""
    # Create long text of 5 paragraphs
    long_paras = [
        f"Paragraph {i}: " + "Machine learning model optimization requires quantizing weights, fusing layers, and tuning memory cache. " * 15
        for i in range(5)
    ]
    sections = [
        DocumentSection(
            heading="Deep Dive",
            heading_level=2,
            heading_path=["Guide", "Deep Dive"],
            content="\n\n".join(long_paras),
            section_type=SectionType.PROSE,
        )
    ]
    doc = NormalizedDocument(
        sanity_id="test-long-doc",
        document_type="article",
        title="Guide",
        canonical_url="/blog/guide",
        language="en",
        rag_enabled=True,
        target_audiences=["engineer"],
        content_hash="hash_long",
        raw_text="\n\n".join(long_paras),
        sections=sections,
    )

    # Use small max_tokens to force splitting
    config = ChunkingConfig(min_tokens=50, max_tokens=120, overlap_tokens=30)
    chunker = HeadingAwareChunker(config=config)
    chunks = chunker.chunk_document(doc)

    assert len(chunks) > 1
    # Check that indices are strictly ascending
    for idx, c in enumerate(chunks):
        assert c.chunk_index == idx
        assert c.document_sanity_id == "test-long-doc"
        assert len(c.content_hash) == 64


def test_prevent_two_projects_sharing_a_chunk() -> None:
    """P4.2.4: Prevent two projects from sharing a chunk."""
    doc_a = normalize_sanity_document(FIXTURE_PROJECT)
    doc_b = normalize_sanity_document(FIXTURE_ARTICLE)

    chunker = HeadingAwareChunker()
    chunks_a = chunker.chunk_document(doc_a)
    chunks_b = chunker.chunk_document(doc_b)

    for ca in chunks_a:
        assert ca.project_slug == "cardioscan-ai"
        assert "Vector DBs Shouldn't Own Your Data" not in ca.content

    for cb in chunks_b:
        assert cb.project_slug != "cardioscan-ai"
        assert "CardioScan AI" not in cb.content


def test_rag_disabled_document_produces_no_chunks() -> None:
    """Documents with rag_enabled=False yield 0 chunks."""
    doc = normalize_sanity_document(FIXTURE_PROJECT)
    doc.rag_enabled = False

    chunker = HeadingAwareChunker()
    chunks = chunker.chunk_document(doc)
    assert len(chunks) == 0


def test_deterministic_chunk_ids_and_ordering() -> None:
    """P4.2.6: Repeated chunking runs yield identical UUIDs, hashes, and ordering."""
    doc = normalize_sanity_document(FIXTURE_PROJECT)
    chunker = HeadingAwareChunker()

    run_1 = chunker.chunk_document(doc)
    run_2 = chunker.chunk_document(doc)

    assert len(run_1) == len(run_2)
    for c1, c2 in zip(run_1, run_2, strict=False):
        assert c1.chunk_id == c2.chunk_id
        assert c1.chunk_index == c2.chunk_index
        assert c1.content_hash == c2.content_hash
        assert c1.content == c2.content
