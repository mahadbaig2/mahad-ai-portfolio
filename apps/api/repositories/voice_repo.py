"""Repository for voice session usage persistence and quota calculations.
Milestone 13P.10 - P13P.10.1 - P13P.10.11 [A]
"""

from datetime import UTC, datetime, timedelta

from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from apps.api.db.base import utc_now
from apps.api.db.models.voice import VoiceSessionUsage


class VoiceRepository:
    """Encapsulates voice session usage queries and atomic reservations in Neon PostgreSQL."""

    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def create_reservation(
        self,
        session_id: str,
        ip_hash: str | None = None,
        reserved_seconds: int = 120,
    ) -> VoiceSessionUsage:
        """Atomically record a new voice session reservation before token issuance (P13P.10.5)."""
        record = VoiceSessionUsage(
            session_id=session_id,
            ip_hash=ip_hash,
            reserved_seconds=reserved_seconds,
            used_seconds=0,
            status="reserved",
        )
        self.session.add(record)
        await self.session.flush()
        return record

    async def get_by_session_id(self, session_id: str) -> VoiceSessionUsage | None:
        stmt = select(VoiceSessionUsage).where(VoiceSessionUsage.session_id == session_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def reconcile_session(
        self,
        session_id: str,
        used_seconds: int,
        termination_reason: str | None = None,
        provider_conversation_id: str | None = None,
    ) -> VoiceSessionUsage | None:
        """Reconcile reservation with actual duration upon session termination (P13P.10.6)."""
        record = await self.get_by_session_id(session_id)
        if not record:
            return None

        record.used_seconds = min(max(used_seconds, 0), record.reserved_seconds)
        record.status = "completed"
        record.termination_reason = termination_reason
        if provider_conversation_id:
            record.provider_conversation_id = provider_conversation_id
        record.ended_at = utc_now()
        await self.session.flush()
        return record

    async def get_monthly_usage_seconds(self) -> int:
        """Calculate total consumed voice seconds in the current calendar month (P13P.10.8)."""
        now = datetime.now(UTC)
        start_of_month = datetime(now.year, now.month, 1, tzinfo=UTC)

        stmt = select(func.coalesce(func.sum(VoiceSessionUsage.used_seconds), 0)).where(
            VoiceSessionUsage.created_at >= start_of_month,
            VoiceSessionUsage.status.in_(["completed", "reserved"]),
        )
        result = await self.session.execute(stmt)
        return int(result.scalar_one() or 0)

    async def get_daily_usage_seconds(self) -> int:
        """Calculate total consumed voice seconds for today (P13P.10.9)."""
        now = datetime.now(UTC)
        start_of_day = datetime(now.year, now.month, now.day, tzinfo=UTC)

        stmt = select(func.coalesce(func.sum(VoiceSessionUsage.used_seconds), 0)).where(
            VoiceSessionUsage.created_at >= start_of_day,
            VoiceSessionUsage.status.in_(["completed", "reserved"]),
        )
        result = await self.session.execute(stmt)
        return int(result.scalar_one() or 0)

    async def expire_abandoned_reservations(self, timeout_minutes: int = 10) -> int:
        """Mark reservations that never started or reconciled as expired (P13P.10.7)."""
        threshold = datetime.now(UTC) - timedelta(minutes=timeout_minutes)
        stmt = (
            update(VoiceSessionUsage)
            .where(
                VoiceSessionUsage.status == "reserved",
                VoiceSessionUsage.created_at < threshold,
            )
            .values(
                status="expired",
                used_seconds=0,
                termination_reason="abandoned_reservation",
                ended_at=utc_now(),
            )
        )
        result = await self.session.execute(stmt)
        return int(result.rowcount or 0)
