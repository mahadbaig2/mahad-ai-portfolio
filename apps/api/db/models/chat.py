"""SQLAlchemy models for chat sessions, redacted messages, retrieval events, and feedback."""

import uuid
from datetime import datetime

from sqlalchemy import (
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import JSON

from apps.api.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin, utc_now


class ChatSession(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Chat session metadata. Messages are persisted ONLY if consent_given is True."""

    __tablename__ = "chat_sessions"

    consent_given: Mapped[bool] = mapped_column(Boolean, default=False, index=True, nullable=False)
    persona: Mapped[str] = mapped_column(String(32), default="general", nullable=False)
    ip_hash: Mapped[str | None] = mapped_column(String(64), nullable=True)
    user_agent_preview: Mapped[str | None] = mapped_column(String(256), nullable=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True, nullable=False)

    # Relationships
    messages: Mapped[list["ChatMessage"]] = relationship(
        "ChatMessage",
        back_populates="session",
        cascade="all, delete-orphan",
        order_by="ChatMessage.created_at",
    )


class ChatMessage(Base, UUIDPrimaryKeyMixin):
    """Redacted conversation turn stored only with affirmative user consent."""

    __tablename__ = "chat_messages"

    session_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("chat_sessions.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    role: Mapped[str] = mapped_column(String(16), nullable=False)  # user, assistant, system
    redacted_content: Mapped[str] = mapped_column(Text, nullable=False)
    language_detected: Mapped[str | None] = mapped_column(String(16), nullable=True)
    intent_label: Mapped[str | None] = mapped_column(String(64), nullable=True)
    route_taken: Mapped[str | None] = mapped_column(String(32), nullable=True)
    latency_ms: Mapped[float | None] = mapped_column(Float, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)

    # Relationships
    session: Mapped["ChatSession"] = relationship("ChatSession", back_populates="messages")
    retrieval_event: Mapped["RetrievalEvent | None"] = relationship(
        "RetrievalEvent",
        back_populates="message",
        uselist=False,
        cascade="all, delete-orphan",
    )
    feedback: Mapped["ChatFeedback | None"] = relationship(
        "ChatFeedback",
        back_populates="message",
        uselist=False,
        cascade="all, delete-orphan",
    )


class RetrievalEvent(Base, UUIDPrimaryKeyMixin):
    """Audit log of vectors retrieved and citations emitted for an assistant response."""

    __tablename__ = "retrieval_events"

    message_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("chat_messages.id", ondelete="SET NULL"),
        index=True,
        nullable=True,
    )
    query_text: Mapped[str] = mapped_column(Text, nullable=False)
    rewritten_query: Mapped[str | None] = mapped_column(Text, nullable=True)
    chunks_retrieved_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    # List of chunk UUID strings cited in answer
    cited_chunk_ids: Mapped[list[str]] = mapped_column(
        JSONB().with_variant(JSON(), "sqlite"),
        default=list,
        nullable=False,
    )

    # Similarity scores of retrieved candidates
    similarity_scores: Mapped[list[float]] = mapped_column(
        JSONB().with_variant(JSON(), "sqlite"),
        default=list,
        nullable=False,
    )

    evidence_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)

    # Relationships
    message: Mapped["ChatMessage | None"] = relationship("ChatMessage", back_populates="retrieval_event")


class ChatFeedback(Base, UUIDPrimaryKeyMixin):
    """User feedback for assistant responses (thumbs up/down + optional comment)."""

    __tablename__ = "chat_feedback"

    message_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("chat_messages.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    rating: Mapped[int] = mapped_column(Integer, nullable=False)  # +1 (positive) or -1 (negative)
    feedback_reason: Mapped[str | None] = mapped_column(String(512), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)

    # Relationships
    message: Mapped["ChatMessage"] = relationship("ChatMessage", back_populates="feedback")
