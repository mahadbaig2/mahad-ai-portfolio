"""SQLAlchemy model for tracking approved and deployed machine learning model releases."""

from datetime import datetime
from typing import Any

from sqlalchemy import Boolean, DateTime, Index, String
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.types import JSON

from apps.api.db.base import Base, UUIDPrimaryKeyMixin, utc_now


class ModelRelease(Base, UUIDPrimaryKeyMixin):
    """Immutable audit trail of ML models evaluated, approved, and promoted to production."""

    __tablename__ = "model_releases"

    model_name: Mapped[str] = mapped_column(String(128), index=True, nullable=False)
    model_version: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    model_type: Mapped[str] = mapped_column(String(64), nullable=False)  # baseline_tfidf, transformer_onnx, etc.
    artifact_path: Mapped[str] = mapped_column(String(512), nullable=False)

    # Evaluation results (macro F1, per-class precision/recall, latency)
    metrics_json: Mapped[dict[str, Any]] = mapped_column(
        JSONB().with_variant(JSON(), "sqlite"),
        default=dict,
        nullable=False,
    )

    is_champion: Mapped[bool] = mapped_column(Boolean, default=False, index=True, nullable=False)
    approved_by: Mapped[str | None] = mapped_column(String(128), nullable=True)
    promoted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)

    __table_args__ = (
        Index("ix_model_releases_name_champion", "model_name", "is_champion"),
    )
