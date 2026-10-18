"""SQLAlchemy model for voice session usage accounting and quota protection.
Milestone 13P.10 - P13P.10.1 & P13P.10.2 [A]
"""

from datetime import datetime

from sqlalchemy import (
    DateTime,
    Integer,
    String,
)
from sqlalchemy.orm import Mapped, mapped_column

from apps.api.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class VoiceSessionUsage(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Voice session usage accounting for ElevenLabs free-tier protection (P13P.10.2).

    Tracks reserved seconds, reconciled actual usage, provider conversation IDs,
    and termination reasons without storing raw audio (P13P.10.3).
    """

    __tablename__ = "voice_session_usages"

    session_id: Mapped[str] = mapped_column(String(128), index=True, unique=True, nullable=False)
    provider_conversation_id: Mapped[str | None] = mapped_column(String(128), index=True, nullable=True)
    ip_hash: Mapped[str | None] = mapped_column(String(64), index=True, nullable=True)
    reserved_seconds: Mapped[int] = mapped_column(Integer, default=120, nullable=False)
    used_seconds: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    status: Mapped[str] = mapped_column(String(32), default="reserved", index=True, nullable=False)
    termination_reason: Mapped[str | None] = mapped_column(String(128), nullable=True)
    ended_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
