"""Repository for chat sessions, redacted messages, citations, and feedback."""

import uuid
from datetime import UTC, datetime, timedelta

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from apps.api.db.base import utc_now
from apps.api.db.models.chat import (
    ChatFeedback,
    ChatMessage,
    ChatSession,
    RetrievalEvent,
)


class ChatRepository:
    """Encapsulates all persistence operations for consented chat sessions and audit records."""

    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def create_session(
        self,
        consent_given: bool = False,
        persona: str = "general",
        ip_hash: str | None = None,
        user_agent_preview: str | None = None,
        ttl_hours: int = 48,
    ) -> ChatSession:
        """Create a new chat session with explicit expiration."""
        expires_at = datetime.now(UTC) + timedelta(hours=ttl_hours)
        chat_session = ChatSession(
            consent_given=consent_given,
            persona=persona,
            ip_hash=ip_hash,
            user_agent_preview=user_agent_preview,
            expires_at=expires_at,
        )
        self.session.add(chat_session)
        await self.session.flush()
        return chat_session

    async def get_session(self, session_id: uuid.UUID) -> ChatSession | None:
        stmt = select(ChatSession).where(ChatSession.id == session_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def add_message(
        self,
        session_id: uuid.UUID,
        role: str,
        redacted_content: str,
        language_detected: str | None = None,
        intent_label: str | None = None,
        route_taken: str | None = None,
        latency_ms: float | None = None,
    ) -> ChatMessage | None:
        """Store a conversation message ONLY IF the session has affirmative consent."""
        chat_session = await self.get_session(session_id)
        if not chat_session or not chat_session.consent_given:
            # Per AGENTS.md: Store chat messages only when the consent field is true
            return None

        msg = ChatMessage(
            session_id=session_id,
            role=role,
            redacted_content=redacted_content,
            language_detected=language_detected,
            intent_label=intent_label,
            route_taken=route_taken,
            latency_ms=latency_ms,
        )
        self.session.add(msg)
        await self.session.flush()
        return msg

    async def record_retrieval(
        self,
        query_text: str,
        chunks_retrieved_count: int,
        cited_chunk_ids: list[str],
        similarity_scores: list[float],
        message_id: uuid.UUID | None = None,
        rewritten_query: str | None = None,
        evidence_score: float | None = None,
    ) -> RetrievalEvent:
        """Record an audit trail of retrieval candidate vectors and emitted citations."""
        event = RetrievalEvent(
            message_id=message_id,
            query_text=query_text,
            rewritten_query=rewritten_query,
            chunks_retrieved_count=chunks_retrieved_count,
            cited_chunk_ids=cited_chunk_ids,
            similarity_scores=similarity_scores,
            evidence_score=evidence_score,
        )
        self.session.add(event)
        await self.session.flush()
        return event

    async def add_feedback(
        self,
        message_id: uuid.UUID,
        rating: int,
        feedback_reason: str | None = None,
    ) -> ChatFeedback:
        """Add user feedback (+1 or -1) for an assistant message."""
        feedback = ChatFeedback(
            message_id=message_id,
            rating=rating,
            feedback_reason=feedback_reason,
        )
        self.session.add(feedback)
        await self.session.flush()
        return feedback

    async def delete_expired_sessions(self, reference_time: datetime | None = None) -> int:
        """P3.2.9: Delete expired chat sessions and cascade delete their messages and feedback."""
        cutoff = reference_time or utc_now()
        stmt = delete(ChatSession).where(ChatSession.expires_at < cutoff)
        result = await self.session.execute(stmt)
        return int(getattr(result, "rowcount", 0))
