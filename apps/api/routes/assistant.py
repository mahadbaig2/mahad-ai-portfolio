"""FastAPI routes for Talk to Mahad Assistant (Milestone 9.4).

Provides bounded session creation, message execution, SSE streaming, and resilience protection.
"""

import asyncio
import json
import logging
import uuid
from collections.abc import AsyncIterator
from datetime import UTC, datetime, timedelta
from typing import Any

from fastapi import APIRouter, Depends, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from apps.api.core.errors import NotFoundError, RateLimitError, ServiceUnavailableError
from apps.api.core.resilience import chat_rate_limiter, groq_breaker
from apps.api.db.session import get_session_factory
from apps.api.repositories.chat_repo import ChatRepository
from apps.api.schemas.assistant import (
    AssistantChatRequest,
    AssistantChatResponse,
    ChatMessagePayload,
    ChatMessageRole,
    CreateSessionRequest,
    CreateSessionResponse,
    SessionDetailResponse,
)
from apps.api.services.assistant.graph import run_assistant_turn

logger = logging.getLogger("api.routes.assistant")

router = APIRouter(prefix="/assistant", tags=["Assistant"])

# In-memory session store fallback when database is offline
_ephemeral_sessions: dict[uuid.UUID, dict[str, Any]] = {}
_ephemeral_messages: dict[uuid.UUID, list[dict[str, Any]]] = {}

# Constants for bounding
MAX_HISTORY_TURNS = 20
MAX_SESSION_FETCH_MESSAGES = 50


async def get_db_optional() -> AsyncIterator[AsyncSession | None]:
    """Safe dependency providing AsyncSession or None if Neon database is unreachable (P9.4.5)."""
    try:
        session_maker = get_session_factory()
        session_ctx = session_maker()
    except Exception as e:
        logger.warning("Database engine unreachable, running in ephemeral mode: %s", e)
        yield None
        return

    try:
        session = await session_ctx.__aenter__()
    except Exception as e:
        logger.warning("Database connection failed, running in ephemeral mode: %s", e)
        yield None
        return

    try:
        yield session
        if session.is_active:
            try:
                await session.commit()
            except Exception:
                await session.rollback()
    except Exception:
        if session.is_active:
            try:
                await session.rollback()
            except Exception:
                pass
        raise
    finally:
        await session_ctx.__aexit__(None, None, None)


@router.post(
    "/session",
    response_model=CreateSessionResponse,
    summary="Create a bounded conversation session",
    description="Initializes a new session with affirmative consent tracking, persona selection, and TTL (P9.4.1).",
)
async def create_session(
    request: CreateSessionRequest,
    req: Request,
    db: AsyncSession | None = Depends(get_db_optional),
) -> CreateSessionResponse:
    """Create a new session record, safely handling database degradation."""
    session_id = uuid.uuid4()
    expires_at = datetime.now(UTC) + timedelta(hours=48)
    ip = req.client.host if req.client else None

    # Persist in database if available
    if db is not None:
        try:
            repo = ChatRepository(db)
            db_session = await repo.create_session(
                consent_given=request.consent_given,
                persona=request.persona,
                ip_hash=ip,
                ttl_hours=48,
            )
            session_id = db_session.id
            expires_at = db_session.expires_at
        except Exception as e:
            logger.warning("Failed to persist session in DB (using fallback): %s", e)
            try:
                await db.rollback()
            except Exception:
                pass

    # In-memory ephemeral fallback
    _ephemeral_sessions[session_id] = {
        "session_id": session_id,
        "consent_given": request.consent_given,
        "persona": request.persona,
        "expires_at": expires_at,
        "created_at": datetime.now(UTC),
    }
    _ephemeral_messages[session_id] = []

    return CreateSessionResponse(
        session_id=session_id,
        consent_given=request.consent_given,
        persona=request.persona,
        expires_at=expires_at.isoformat(),
    )


@router.get(
    "/session/{session_id}",
    response_model=SessionDetailResponse,
    summary="Retrieve session metadata and message history",
    description="Returns session configuration and consented message turns bounded to the last 50 entries (P9.4.1).",
)
async def get_session_detail(
    session_id: uuid.UUID,
    db: AsyncSession | None = Depends(get_db_optional),
) -> SessionDetailResponse:
    """Fetch session details and consented messages."""
    consent_given = False
    persona = "general"
    expires_at = (datetime.now(UTC) + timedelta(hours=48)).isoformat()
    messages: list[ChatMessagePayload] = []

    # Attempt fetching from DB
    found = False
    if db is not None:
        try:
            repo = ChatRepository(db)
            db_sess = await repo.get_session(session_id)
            if db_sess is not None:
                found = True
                consent_given = db_sess.consent_given
                persona = db_sess.persona
                expires_at = db_sess.expires_at.isoformat()
                if consent_given:
                    db_msgs = await repo.get_messages(session_id)
                    messages = [
                        ChatMessagePayload(
                            role=ChatMessageRole(m.role) if m.role in ("user", "assistant", "system") else ChatMessageRole.USER,
                            content=m.redacted_content,
                            timestamp=m.created_at.isoformat(),
                        )
                        for m in db_msgs[-MAX_SESSION_FETCH_MESSAGES:]
                    ]
        except Exception as e:
            logger.warning("Error fetching session from DB: %s", e)
            try:
                await db.rollback()
            except Exception:
                pass

    # Fallback to ephemeral store if not found in DB
    if not found:
        if session_id in _ephemeral_sessions:
            ephemeral = _ephemeral_sessions[session_id]
            consent_given = ephemeral["consent_given"]
            persona = ephemeral["persona"]
            expires_at = ephemeral["expires_at"].isoformat()
            if consent_given:
                for m in _ephemeral_messages.get(session_id, [])[-MAX_SESSION_FETCH_MESSAGES:]:
                    messages.append(
                        ChatMessagePayload(
                            role=ChatMessageRole(m["role"]),
                            content=m["content"],
                            timestamp=m["timestamp"],
                        )
                    )
        else:
            raise NotFoundError(message=f"Session {session_id} not found.")

    return SessionDetailResponse(
        session_id=session_id,
        consent_given=consent_given,
        persona=persona,
        expires_at=expires_at,
        message_count=len(messages),
        messages=messages,
    )


@router.post(
    "/chat",
    response_model=AssistantChatResponse,
    summary="Execute single grounded assistant conversation turn",
    description="Synchronous turn endpoint orchestrating LangGraph routing, RAG retrieval, recovery, and citations (P9.4.1).",
)
async def chat_endpoint(
    request: AssistantChatRequest,
    req: Request,
    db: AsyncSession | None = Depends(get_db_optional),
) -> AssistantChatResponse:
    """Execute a single assistant turn with quota, circuit-breaker, and bounding checks."""
    session_id_str = str(request.session_id or req.client.host if req.client else "anonymous")

    # 1. Rate limiting / quota protection (P9.4.4)
    chat_rate_limiter.check(session_id_str)

    # 2. Check circuit breakers (P9.4.3)
    groq_breaker.check_available()

    # 3. Bounded history input (max 20 turns)
    bounded_history = [
        {"role": h.role.value, "content": h.content}
        for h in request.history[-MAX_HISTORY_TURNS:]
    ]

    # 4. Execute assistant turn through LangGraph
    response = run_assistant_turn(
        message=request.message,
        session_id=str(request.session_id or uuid.uuid4()),
        mode=request.mode.value,
        history=bounded_history,
        persona=request.persona,
    )

    # 5. Persist message turns and retrieval events if consent is given (non-fatal)
    if request.consent_given and request.session_id:
        # Ephemeral backup
        now_iso = datetime.now(UTC).isoformat()
        if request.session_id in _ephemeral_messages:
            _ephemeral_messages[request.session_id].append({"role": "user", "content": request.message, "timestamp": now_iso})
            _ephemeral_messages[request.session_id].append({"role": "assistant", "content": response.answer, "timestamp": now_iso})

        # Database persistence
        if db is not None:
            try:
                repo = ChatRepository(db)
                # User turn
                await repo.add_message(
                    session_id=request.session_id,
                    role="user",
                    redacted_content=request.message,
                )
                # Assistant turn
                await repo.add_message(
                    session_id=request.session_id,
                    role="assistant",
                    redacted_content=response.answer,
                    language_detected=response.language.value,
                    route_taken=response.route.value,
                )
            except Exception as e:
                logger.warning("Non-fatal error persisting chat messages to DB: %s", e)

    return response


@router.post(
    "/chat/stream",
    summary="Stream grounded assistant response with SSE progress events and tokens",
    description="Server-Sent Events endpoint streaming execution progress steps, token deltas, and completion payload (P9.4.2).",
)
async def chat_stream_endpoint(
    request: AssistantChatRequest,
    req: Request,
    db: AsyncSession | None = Depends(get_db_optional),
) -> StreamingResponse:
    """Stream assistant conversation turn with safe SSE progress events and answer chunks."""
    session_id_str = str(request.session_id or req.client.host if req.client else "anonymous")

    # 1. Rate limiting & circuit breaker checks before streaming begins
    chat_rate_limiter.check(session_id_str)
    groq_breaker.check_available()

    bounded_history = [
        {"role": h.role.value, "content": h.content}
        for h in request.history[-MAX_HISTORY_TURNS:]
    ]

    async def event_generator() -> AsyncIterator[str]:
        try:
            # Emit initial progress event
            yield f"event: progress\ndata: {json.dumps({'step_name': 'validate_input', 'status': 'in_progress', 'details': {}})}\n\n"
            await asyncio.sleep(0.01)

            # Execute graph turn
            response = run_assistant_turn(
                message=request.message,
                session_id=str(request.session_id or uuid.uuid4()),
                mode=request.mode.value,
                history=bounded_history,
                persona=request.persona,
            )

            # Emit progress events for each recorded safe execution step
            for step in response.execution_steps:
                safe_details = {k: v for k, v in step.details.items() if k not in ("system_prompt", "prompt", "api_key")}
                step_data = {
                    "step_name": step.step_name,
                    "duration_ms": step.duration_ms,
                    "status": step.status,
                    "details": safe_details,
                }
                yield f"event: progress\ndata: {json.dumps(step_data)}\n\n"
                await asyncio.sleep(0.01)

            # Stream answer in word tokens
            words = response.answer.split(" ")
            for i, word in enumerate(words):
                delta = word if i == 0 else " " + word
                token_data = {"delta": delta}
                yield f"event: token\ndata: {json.dumps(token_data)}\n\n"
                await asyncio.sleep(0.01)

            # Emit final completion payload with citations, route, and full response
            done_payload = response.model_dump(mode="json")
            yield f"event: done\ndata: {json.dumps(done_payload)}\n\n"

            # Persist consented turns non-fatally
            if request.consent_given and request.session_id and db is not None:
                try:
                    repo = ChatRepository(db)
                    await repo.add_message(
                        session_id=request.session_id,
                        role="user",
                        redacted_content=request.message,
                    )
                    await repo.add_message(
                        session_id=request.session_id,
                        role="assistant",
                        redacted_content=response.answer,
                        language_detected=response.language.value,
                        route_taken=response.route.value,
                    )
                except Exception as e:
                    logger.warning("Non-fatal error persisting stream messages to DB: %s", e)

        except ServiceUnavailableError as sue:
            err_data = {"code": sue.code, "message": sue.message}
            yield f"event: error\ndata: {json.dumps(err_data)}\n\n"
        except RateLimitError as rle:
            err_data = {"code": rle.code, "message": rle.message}
            yield f"event: error\ndata: {json.dumps(err_data)}\n\n"
        except Exception as exc:
            logger.error("Error during streaming generation: %s", exc)
            err_data = {"code": "INTERNAL_STREAM_ERROR", "message": "An error occurred while streaming response."}
            yield f"event: error\ndata: {json.dumps(err_data)}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
