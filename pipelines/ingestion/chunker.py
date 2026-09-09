"""Heading-aware recursive chunking with context preservation and list coherence (P4.2)."""

import hashlib
import re
import uuid
from collections.abc import Callable
from typing import Any

from pydantic import BaseModel, ConfigDict, Field

from pipelines.ingestion.contracts import (
    DocumentSection,
    NormalizedChunk,
    NormalizedDocument,
    SectionType,
)

# Fixed namespace for deterministic UUIDv5 generation
RAG_CHUNK_NAMESPACE = uuid.UUID("6ba7b810-9dad-11d1-80b4-00c04fd430c8")

# Regex for sentence boundaries (supports English, Roman Urdu, and Urdu full stop '۔')
SENTENCE_SPLIT_REGEX = re.compile(r"(?<=[.!?۔])\s+")


def estimate_token_count(text: str) -> int:
    """Fast, multilingual-aware token estimation (approx 3.8 chars/token for English, 2.5 for Urdu)."""
    if not text:
        return 0
    # Count whitespace-delimited words
    words = text.split()
    # A word in English is ~1.3 tokens. In Urdu/script, words can be 1.5 - 2 tokens.
    # Total character length check prevents undercounting on dense text.
    char_estimate = max(1, len(text) // 4)
    word_estimate = max(1, int(len(words) * 1.3))
    return max(char_estimate, word_estimate)


class ChunkingConfig(BaseModel):
    """Configuration for recursive heading-aware chunking."""

    model_config = ConfigDict(extra="forbid")

    min_tokens: int = Field(default=350, ge=50, description="Target minimum tokens per chunk.")
    max_tokens: int = Field(default=500, ge=100, description="Target maximum tokens per chunk.")
    overlap_tokens: int = Field(default=60, ge=0, le=150, description="Token overlap between adjacent chunks.")
    prefix_heading_context: bool = Field(
        default=True,
        description="Prepend hierarchical heading path to chunk content for vector search.",
    )


class HeadingAwareChunker:
    """Splits NormalizedDocuments into deterministic NormalizedChunks."""

    def __init__(
        self,
        config: ChunkingConfig | None = None,
        token_counter: Callable[[str], int] | None = None,
    ) -> None:
        self.config = config or ChunkingConfig()
        self.count_tokens = token_counter or estimate_token_count

    def format_chunk_content(self, heading_path: list[str], body_text: str) -> str:
        """P4.2.3: Prepend document title and heading path context to embedding content."""
        if not self.config.prefix_heading_context or not heading_path:
            return body_text.strip()

        context_header = " > ".join(heading_path)
        return f"[{context_header}]\n\n{body_text.strip()}"

    def compute_chunk_hash(self, text: str) -> str:
        """P4.2.6: Compute deterministic SHA-256 hash of chunk content."""
        return hashlib.sha256(text.strip().encode("utf-8")).hexdigest()

    def generate_chunk_uuid(self, sanity_id: str, chunk_index: int, content_hash: str) -> uuid.UUID:
        """Generate deterministic UUIDv5 matching Qdrant point ID requirements."""
        name = f"{sanity_id}:{chunk_index}:{content_hash}"
        return uuid.uuid5(RAG_CHUNK_NAMESPACE, name)

    def split_large_text(self, text: str, max_tokens: int, overlap_tokens: int) -> list[str]:
        """Recursively split text exceeding max_tokens by paragraphs, sentences, or word windows."""
        paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
        if len(paragraphs) > 1:
            chunks: list[str] = []
            current_paras: list[str] = []
            current_tokens = 0

            for para in paragraphs:
                para_tokens = self.count_tokens(para)
                if current_tokens + para_tokens > max_tokens and current_paras:
                    chunks.append("\n\n".join(current_paras))
                    # Retain last paragraph for overlap if it fits
                    if overlap_tokens > 0 and para_tokens < max_tokens:
                        current_paras = [current_paras[-1], para]
                        current_tokens = self.count_tokens("\n\n".join(current_paras))
                    else:
                        current_paras = [para]
                        current_tokens = para_tokens
                else:
                    current_paras.append(para)
                    current_tokens += para_tokens

            if current_paras:
                chunks.append("\n\n".join(current_paras))
            return chunks

        # Single large paragraph: split by sentence
        sentences = [s.strip() for s in SENTENCE_SPLIT_REGEX.split(text) if s.strip()]
        if len(sentences) > 1:
            chunks = []
            current_sentences: list[str] = []
            current_tokens = 0

            for sentence in sentences:
                s_tokens = self.count_tokens(sentence)
                if current_tokens + s_tokens > max_tokens and current_sentences:
                    chunks.append(" ".join(current_sentences))
                    # Overlap with last sentence
                    current_sentences = [current_sentences[-1], sentence]
                    current_tokens = self.count_tokens(" ".join(current_sentences))
                else:
                    current_sentences.append(sentence)
                    current_tokens += s_tokens

            if current_sentences:
                chunks.append(" ".join(current_sentences))
            return chunks

        # Fallback: sliding word window
        words = text.split()
        chunks = []
        step = max(1, max_tokens - overlap_tokens)
        for i in range(0, len(words), step):
            window = " ".join(words[i : i + max_tokens])
            if window:
                chunks.append(window)
            if i + max_tokens >= len(words):
                break
        return chunks

    def chunk_document(self, document: NormalizedDocument) -> list[NormalizedChunk]:
        """P4.2.1 - P4.2.6: Chunk a NormalizedDocument into deterministic NormalizedChunks."""
        if not document.rag_enabled or not document.sections:
            return []

        # Determine associated project slug (P4.2.4: prevent mixing projects)
        project_slug = document.slug if document.document_type in ("project", "caseStudy") else None
        if not project_slug and "projectRef" in document.metadata:
            ref = document.metadata["projectRef"]
            if isinstance(ref, dict):
                project_slug = ref.get("slug")

        # Step 1: Pre-process sections to bundle list introductions with their lists (P4.2.5)
        processed_sections: list[DocumentSection] = []
        i = 0
        while i < len(document.sections):
            sec = document.sections[i]
            # If current is prose ending with colon and next is a list under the same heading, bundle them
            if (
                sec.section_type == SectionType.PROSE
                and sec.content.rstrip().endswith(":")
                and i + 1 < len(document.sections)
                and document.sections[i + 1].section_type == SectionType.LIST
                and document.sections[i + 1].heading == sec.heading
            ):
                next_sec = document.sections[i + 1]
                bundled_content = f"{sec.content}\n\n{next_sec.content}"
                processed_sections.append(
                    DocumentSection(
                        heading=sec.heading,
                        heading_level=sec.heading_level,
                        heading_path=sec.heading_path,
                        content=bundled_content,
                        section_type=SectionType.LIST,
                    )
                )
                i += 2
                continue

            processed_sections.append(sec)
            i += 1

        # Step 2: Group sections into token-bounded chunks
        raw_chunks: list[dict[str, Any]] = []
        current_texts: list[str] = []
        current_heading_path: list[str] = []
        current_section_type = "prose"
        current_tokens = 0

        for sec in processed_sections:
            sec_text = sec.content.strip()
            if not sec_text:
                continue

            sec_tokens = self.count_tokens(sec_text)

            # If a single section is larger than max_tokens, split it internally
            if sec_tokens > self.config.max_tokens:
                # Flush previous accumulator first
                if current_texts:
                    raw_chunks.append({
                        "text": "\n\n".join(current_texts),
                        "heading_path": current_heading_path or sec.heading_path,
                        "section_type": current_section_type,
                    })
                    current_texts = []
                    current_tokens = 0

                # Split the large section
                sub_chunks = self.split_large_text(
                    sec_text,
                    max_tokens=self.config.max_tokens,
                    overlap_tokens=self.config.overlap_tokens,
                )
                for sub in sub_chunks:
                    raw_chunks.append({
                        "text": sub,
                        "heading_path": sec.heading_path,
                        "section_type": sec.section_type.value,
                    })
                continue

            # Check if adding this section exceeds max_tokens
            # or if heading hierarchy has completely changed
            headings_compatible = (
                not current_heading_path
                or current_heading_path == sec.heading_path
                or (len(sec.heading_path) > 1 and sec.heading_path[0] == current_heading_path[0])
            )

            if (current_tokens + sec_tokens > self.config.max_tokens or not headings_compatible) and current_texts:
                raw_chunks.append({
                    "text": "\n\n".join(current_texts),
                    "heading_path": current_heading_path,
                    "section_type": current_section_type,
                })
                current_texts = [sec_text]
                current_heading_path = sec.heading_path
                current_section_type = sec.section_type.value
                current_tokens = sec_tokens
            else:
                current_texts.append(sec_text)
                if not current_heading_path:
                    current_heading_path = sec.heading_path
                current_section_type = sec.section_type.value
                current_tokens += sec_tokens

        # Flush final accumulator
        if current_texts:
            raw_chunks.append({
                "text": "\n\n".join(current_texts),
                "heading_path": current_heading_path,
                "section_type": current_section_type,
            })

        # Step 3: Convert raw chunks into canonical NormalizedChunks
        normalized_chunks: list[NormalizedChunk] = []
        for idx, raw in enumerate(raw_chunks):
            formatted_content = self.format_chunk_content(
                heading_path=raw["heading_path"],
                body_text=raw["text"],
            )
            c_hash = self.compute_chunk_hash(formatted_content)
            c_uuid = self.generate_chunk_uuid(
                sanity_id=document.sanity_id,
                chunk_index=idx,
                content_hash=c_hash,
            )
            token_cnt = self.count_tokens(formatted_content)

            chunk = NormalizedChunk(
                chunk_id=c_uuid,
                document_sanity_id=document.sanity_id,
                chunk_index=idx,
                content=formatted_content,
                content_hash=c_hash,
                token_count=token_cnt,
                heading_path=raw["heading_path"],
                section_type=raw["section_type"],
                document_type=document.document_type,
                project_slug=project_slug,
                target_audiences=document.target_audiences,
                language=document.language,
                canonical_url=document.canonical_url,
            )
            normalized_chunks.append(chunk)

        return normalized_chunks
