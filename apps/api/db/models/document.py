"""SQLAlchemy models for source documents, document chunks, and ingestion runs."""

import uuid
from datetime import datetime
from typing import Any

from sqlalchemy import Boolean, DateTime, ForeignKey, Index, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import JSON

from apps.api.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin, utc_now


class SourceDocument(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Authoritative manifest of documents ingested from Sanity CMS."""

    __tablename__ = "source_documents"

    sanity_id: Mapped[str] = mapped_column(String(128), unique=True, index=True, nullable=False)
    document_type: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    slug: Mapped[str] = mapped_column(String(256), index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(512), nullable=False)
    content_hash: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    version: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    rag_enabled: Mapped[bool] = mapped_column(Boolean, default=True, index=True, nullable=False)
    publish_status: Mapped[str] = mapped_column(String(32), default="published", nullable=False)

    # Optional metadata (JSONB on PostgreSQL, standard JSON fallback)
    metadata_json: Mapped[dict[str, Any]] = mapped_column(
        JSONB().with_variant(JSON(), "sqlite"),
        default=dict,
        nullable=False,
    )

    # Relationships
    chunks: Mapped[list["DocumentChunk"]] = relationship(
        "DocumentChunk",
        back_populates="document",
        cascade="all, delete-orphan",
        order_by="DocumentChunk.chunk_index",
    )


class DocumentChunk(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Canonical text chunks. The UUID `id` matches the Qdrant vector point ID."""

    __tablename__ = "document_chunks"

    document_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("source_documents.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    chunk_index: Mapped[int] = mapped_column(Integer, nullable=False)
    chunk_text: Mapped[str] = mapped_column(Text, nullable=False)
    token_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    heading_path: Mapped[str] = mapped_column(String(512), default="", nullable=False)
    chunk_hash: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    embedding_model: Mapped[str] = mapped_column(String(128), nullable=False)
    embedding_version: Mapped[str] = mapped_column(String(32), default="1.0.0", nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True, nullable=False)

    # Relationships
    document: Mapped["SourceDocument"] = relationship("SourceDocument", back_populates="chunks")

    __table_args__ = (
        Index("ix_chunks_doc_active", "document_id", "is_active"),
        Index("ix_chunks_model_version", "embedding_model", "embedding_version"),
    )


class IndexRun(Base, UUIDPrimaryKeyMixin):
    """Audit log of full or incremental RAG synchronization runs."""

    __tablename__ = "index_runs"

    run_type: Mapped[str] = mapped_column(String(32), default="incremental_sync", nullable=False)
    status: Mapped[str] = mapped_column(String(32), default="started", nullable=False)
    documents_scanned: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    documents_indexed: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    chunks_created: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    chunks_deactivated: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    error_summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
