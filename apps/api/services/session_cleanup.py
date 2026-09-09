"""Service implementing automated session retention and cleanup of expired records."""

import logging
from datetime import datetime

from sqlalchemy.ext.asyncio import AsyncSession

from apps.api.repositories.chat_repo import ChatRepository

logger = logging.getLogger(__name__)


class SessionCleanupService:
    """Enforces data retention policies by deleting expired chat sessions."""

    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.chat_repo = ChatRepository(session)

    async def cleanup_expired_sessions(self, reference_time: datetime | None = None) -> int:
        """Purge all chat sessions whose expires_at timestamp is in the past.

        Cascades deletion to all associated chat_messages, feedback, and events.
        """
        deleted_count = await self.chat_repo.delete_expired_sessions(reference_time=reference_time)
        if deleted_count > 0:
            logger.info("Purged %d expired chat sessions according to retention policy", deleted_count)
        return deleted_count
