"""FastAPI routes for ElevenLabs voice companion and custom LLM adapter.
Milestone 13P.3 - P13P.3.2 - P13P.3.14 [A]

Serves OpenAI-compatible chat completions to ElevenLabs Conversational AI,
reusing the unified LangGraph orchestrator, ONNX router, and RAG retrieval pipeline.
"""

import logging
import re
import threading
import time
import uuid
from collections import OrderedDict
from collections.abc import AsyncIterator
from typing import Any

import httpx
from fastapi import APIRouter, Depends, Header, HTTPException, Request, status
from fastapi.responses import StreamingResponse

from apps.api.core.config import Settings, get_settings
from apps.api.core.resilience import (
    elevenlabs_breaker,
    voice_concurrency_manager,
    voice_token_rate_limiter,
)
from apps.api.schemas.assistant import CitationDetailPayload
from apps.api.schemas.voice import (
    OpenAIChatCompletionChunk,
    OpenAIChatCompletionRequest,
    OpenAIChatCompletionResponse,
    OpenAIChoice,
    OpenAIChoiceMessage,
    OpenAIChunkChoice,
    OpenAIChunkDelta,
    OpenAIUsage,
    VoiceConfigResponse,
    VoiceTokenRequest,
    VoiceTokenResponse,
    VoiceTurnCitationResponse,
)
from apps.api.services.assistant.graph import run_assistant_turn
from apps.api.services.voice_formatter import format_voice_output

logger = logging.getLogger("api.routes.voice")

router = APIRouter(prefix="/voice", tags=["Voice"])


class VoiceCitationRegistry:
    """Thread-safe in-memory cache for recent voice turn citation metadata (Milestone 13P.13: P13P.13.4 - P13P.13.7)."""

    def __init__(self, max_entries: int = 100, ttl_seconds: int = 900) -> None:
        self._max_entries = max_entries
        self._ttl_seconds = ttl_seconds
        self._lock = threading.Lock()
        self._records_by_turn: OrderedDict[str, VoiceTurnCitationResponse] = OrderedDict()
        self._records_by_session: dict[str, str] = {}
        self._records_by_conversation: dict[str, str] = {}
        self._latest_turn_id: str | None = None

    def record_turn(
        self,
        turn_id: str,
        citations: list[str],
        citation_details: list[CitationDetailPayload],
        route: str,
        session_id: str | None = None,
        conversation_id: str | None = None,
    ) -> VoiceTurnCitationResponse:
        now = int(time.time())
        record = VoiceTurnCitationResponse(
            turn_id=turn_id,
            session_id=session_id,
            conversation_id=conversation_id,
            route=route,
            citations=citations,
            citation_details=citation_details,
            timestamp=now,
        )

        with self._lock:
            # Purge expired entries
            cutoff = now - self._ttl_seconds
            expired = [k for k, v in self._records_by_turn.items() if v.timestamp < cutoff]
            for k in expired:
                del self._records_by_turn[k]

            # Bounded cache size
            if len(self._records_by_turn) >= self._max_entries:
                oldest_k, _ = self._records_by_turn.popitem(last=False)
                self._records_by_session = {s: t for s, t in self._records_by_session.items() if t != oldest_k}
                self._records_by_conversation = {c: t for c, t in self._records_by_conversation.items() if t != oldest_k}

            self._records_by_turn[turn_id] = record
            if session_id:
                self._records_by_session[session_id] = turn_id
            if conversation_id:
                self._records_by_conversation[conversation_id] = turn_id
            self._latest_turn_id = turn_id

        return record

    def get_latest(
        self,
        session_id: str | None = None,
        conversation_id: str | None = None,
        turn_id: str | None = None,
    ) -> VoiceTurnCitationResponse | None:
        with self._lock:
            if turn_id and turn_id in self._records_by_turn:
                return self._records_by_turn[turn_id]
            if session_id and session_id in self._records_by_session:
                tid = self._records_by_session[session_id]
                return self._records_by_turn.get(tid)
            if conversation_id and conversation_id in self._records_by_conversation:
                tid = self._records_by_conversation[conversation_id]
                return self._records_by_turn.get(tid)
            if self._latest_turn_id and self._latest_turn_id in self._records_by_turn:
                return self._records_by_turn[self._latest_turn_id]
            return None


voice_citation_registry = VoiceCitationRegistry()




def verify_elevenlabs_auth(
    authorization: str | None = Header(default=None),
    settings: Settings = Depends(get_settings),
) -> None:
    """Validate Bearer authentication token from ElevenLabs (P13P.3.3)."""
    expected_secret = settings.ELEVENLABS_CUSTOM_LLM_SECRET
    if not expected_secret:
        # In development / testing or when not configured, permit requests
        return

    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Authorization header",
        )

    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization format. Expected 'Bearer <secret>'",
        )

    provided_token = parts[1]
    if provided_token != expected_secret:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
        )


@router.get("/config", response_model=VoiceConfigResponse)
async def get_voice_config(settings: Settings = Depends(get_settings)) -> VoiceConfigResponse:
    """Safe, non-secret voice configuration status for client widget disclosure (P13P.2.11)."""
    return VoiceConfigResponse(
        voice_enabled=settings.is_voice_available,
        max_session_seconds=settings.VOICE_SESSION_MAX_SECONDS,
        inactivity_timeout_seconds=settings.VOICE_INACTIVITY_TIMEOUT_SECONDS,
        server_location=settings.ELEVENLABS_SERVER_LOCATION,
        active_voice_id=settings.active_voice_id or None,
    )


async def _generate_openai_sse_stream(
    spoken_text: str,
    completion_id: str,
    model: str,
    created_ts: int,
) -> AsyncIterator[str]:
    """Yield Server-Sent Events conforming to OpenAI streaming chunk protocol (P13P.3.13)."""
    # Initial chunk with assistant role
    initial_chunk = OpenAIChatCompletionChunk(
        id=completion_id,
        created=created_ts,
        model=model,
        choices=[
            OpenAIChunkChoice(
                index=0,
                delta=OpenAIChunkDelta(role="assistant", content=""),
                finish_reason=None,
            )
        ],
    )
    yield f"data: {initial_chunk.model_dump_json()}\n\n"

    # Tokenize into word/phrase chunks for smooth speech synthesis streaming
    # Split by spaces preserving natural rhythm
    words = re.findall(r"\S+\s*", spoken_text)
    if not words:
        words = [spoken_text]

    # Stream in small groups of 2-3 words for responsive latency
    chunk_size = 2
    for i in range(0, len(words), chunk_size):
        content_delta = "".join(words[i : i + chunk_size])
        content_chunk = OpenAIChatCompletionChunk(
            id=completion_id,
            created=created_ts,
            model=model,
            choices=[
                OpenAIChunkChoice(
                    index=0,
                    delta=OpenAIChunkDelta(content=content_delta),
                    finish_reason=None,
                )
            ],
        )
        yield f"data: {content_chunk.model_dump_json()}\n\n"

    # Final finishing chunk
    final_chunk = OpenAIChatCompletionChunk(
        id=completion_id,
        created=created_ts,
        model=model,
        choices=[
            OpenAIChunkChoice(
                index=0,
                delta=OpenAIChunkDelta(),
                finish_reason="stop",
            )
        ],
    )
    yield f"data: {final_chunk.model_dump_json()}\n\n"
    yield "data: [DONE]\n\n"


@router.post(
    "/chat/completions",
    response_model=OpenAIChatCompletionResponse,
    dependencies=[Depends(verify_elevenlabs_auth)],
)
async def custom_llm_chat_completions(
    request: OpenAIChatCompletionRequest,
    raw_request: Request,
    settings: Settings = Depends(get_settings),
) -> Any:
    """Dedicated OpenAI-compatible endpoint for ElevenLabs Conversational AI Custom LLM (P13P.3.2)."""
    # P13P.3.4: Validate message history bounds and extract latest user turn
    user_messages = [m for m in request.messages if m.role == "user"]
    if not user_messages:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Request must contain at least one user message",
        )

    latest_user_message = user_messages[-1].content.strip()
    if not latest_user_message:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User message content cannot be empty",
        )

    # P13P.3.6: Bounded history extraction (last 10 previous turns)
    all_turns = request.messages[:-1]
    bounded_turns = all_turns[-10:] if len(all_turns) > 10 else all_turns
    history_payload: list[dict[str, Any]] = [
        {"role": m.role, "content": m.content}
        for m in bounded_turns
        if m.role in ("user", "assistant")
    ]

    # P13P.3.14 & P13P.13.4: Structured correlation and conversation identifiers
    completion_id = f"chatcmpl-{uuid.uuid4().hex}"
    created_ts = int(time.time())

    # Extract conversation/session identifiers from headers or body
    headers = raw_request.headers
    conversation_id = headers.get("x-conversation-id") or headers.get("x-elevenlabs-conversation-id")
    client_session_id = request.user or headers.get("x-session-id")
    internal_session_id = client_session_id or str(uuid.uuid4())

    logger.info(
        "ElevenLabs custom LLM turn received [id=%s, conv=%s, turns=%d, chars=%d]",
        completion_id,
        conversation_id or "none",
        len(request.messages),
        len(latest_user_message),
    )

    # P13P.3.5, P13P.3.7, P13P.13.1: Route to existing unified LangGraph assistant in mode="voice"
    assistant_result = run_assistant_turn(
        message=latest_user_message,
        session_id=internal_session_id,
        mode="voice",
        history=history_payload,
        consent_given=False,  # Voice turns do not persist raw private audio/chat transcripts
    )

    # P13P.13.4 & P13P.13.7: Associate voice turn with verified citations exclusively from this current retrieval run
    voice_citation_registry.record_turn(
        turn_id=completion_id,
        citations=assistant_result.citations,
        citation_details=assistant_result.citation_details,
        route=assistant_result.route.value,
        session_id=client_session_id,
        conversation_id=conversation_id,
    )

    # P13P.3.10, P13P.3.11, P13P.3.12, P13P.13.2, P13P.13.3: Format output for natural spoken delivery
    raw_answer = assistant_result.answer or "I could not find relevant information in Mahad's portfolio."
    spoken_answer = format_voice_output(raw_answer)
    if not spoken_answer:
        spoken_answer = raw_answer

    # P13P.3.13: Stream or return full JSON based on request.stream flag
    if request.stream:
        return StreamingResponse(
            _generate_openai_sse_stream(
                spoken_text=spoken_answer,
                completion_id=completion_id,
                model=request.model,
                created_ts=created_ts,
            ),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Correlation-ID": completion_id,
            },
        )

    # Non-streaming response payload
    return OpenAIChatCompletionResponse(
        id=completion_id,
        created=created_ts,
        model=request.model,
        choices=[
            OpenAIChoice(
                index=0,
                message=OpenAIChoiceMessage(
                    role="assistant",
                    content=spoken_answer,
                ),
                finish_reason="stop",
            )
        ],
        usage=OpenAIUsage(
            prompt_tokens=len(latest_user_message) // 4,
            completion_tokens=len(spoken_answer) // 4,
            total_tokens=(len(latest_user_message) + len(spoken_answer)) // 4,
        ),
    )


@router.get("/citations/latest", response_model=VoiceTurnCitationResponse | None)
async def get_latest_voice_citations(
    session_id: str | None = None,
    conversation_id: str | None = None,
    turn_id: str | None = None,
) -> VoiceTurnCitationResponse | None:
    """Retrieve verified source citation metadata for the latest voice turn (Milestone 13P.13: P13P.13.5)."""
    return voice_citation_registry.get_latest(
        session_id=session_id,
        conversation_id=conversation_id,
        turn_id=turn_id,
    )


@router.get("/citations", response_model=VoiceTurnCitationResponse | None)
async def get_voice_citations(
    session_id: str | None = None,
    conversation_id: str | None = None,
    turn_id: str | None = None,
) -> VoiceTurnCitationResponse | None:
    """Alias for /citations/latest (Milestone 13P.13: P13P.13.5)."""
    return voice_citation_registry.get_latest(
        session_id=session_id,
        conversation_id=conversation_id,
        turn_id=turn_id,
    )



@router.post("/token", response_model=VoiceTokenResponse)
async def create_voice_session_token(
    payload: VoiceTokenRequest,
    request: Request,
    settings: Settings = Depends(get_settings),
) -> VoiceTokenResponse:
    """Create short-lived ElevenLabs conversation token server-side (P13P.4.1 - P13P.4.10)."""
    # P13P.4.3: Require explicit action
    if payload.action != "start_voice":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "INVALID_ACTION", "message": "Explicit start_voice action required"},
        )

    # P13P.4.10: Check voice availability
    if not settings.is_voice_available:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "code": "VOICE_DISABLED",
                "message": "Voice conversation is temporarily disabled or not configured. Please use text chat.",
            },
        )

    # P13P.4.5: Origin validation
    origin = request.headers.get("origin")
    if origin and settings.is_production:
        if origin not in settings.CORS_ORIGINS:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={"code": "ORIGIN_FORBIDDEN", "message": "Requests from this origin are not permitted"},
            )

    # P13P.4.6: Rate limiting
    client_ip = request.client.host if request.client else "unknown"
    client_key = f"voice_token:{client_ip}"
    try:
        voice_token_rate_limiter.check(client_key)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={
                "code": "RATE_LIMITED",
                "message": "Voice session rate limit reached. Please retry in a few minutes or use text chat.",
            },
        ) from e

    # P13P.4.7 & P13P.4.8: Concurrency reservation
    session_id = payload.session_id or str(uuid.uuid4())
    granted = voice_concurrency_manager.reserve(
        session_id=session_id,
        max_seconds=settings.VOICE_SESSION_MAX_SECONDS,
        limit=settings.VOICE_GLOBAL_CONCURRENCY_LIMIT,
    )
    if not granted:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={
                "code": "CONCURRENCY_LIMIT_REACHED",
                "message": "Another voice conversation is currently active. Please try again shortly or use text chat.",
            },
        )

    # P13P.4.1: Fetch token from ElevenLabs API protected by circuit breaker
    elevenlabs_breaker.check_available()
    token_url = f"https://api.elevenlabs.io/v1/convai/conversation/token?agent_id={settings.ELEVENLABS_AGENT_ID}"
    headers = {"xi-api-key": settings.ELEVENLABS_API_KEY}

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(token_url, headers=headers)
            if resp.status_code != 200:
                elevenlabs_breaker.record_failure(Exception(f"ElevenLabs HTTP {resp.status_code}"))
                voice_concurrency_manager.release(session_id)
                # Classify quota vs outage (P13P.4.10)
                if resp.status_code in (401, 403, 429) or "quota" in resp.text.lower():
                    raise HTTPException(
                        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                        detail={
                            "code": "PROVIDER_QUOTA_EXHAUSTED",
                            "message": "Voice conversation allowance reached. Please continue in text chat.",
                        },
                    )
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail={
                        "code": "PROVIDER_UNAVAILABLE",
                        "message": "Voice provider is temporarily unavailable. Please continue in text chat.",
                    },
                )

            elevenlabs_breaker.record_success()
            data = resp.json()
            token = data.get("token")
            if not token:
                voice_concurrency_manager.release(session_id)
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail={"code": "INVALID_PROVIDER_RESPONSE", "message": "Failed to obtain conversation token"},
                )

            # Also fetch signed_url for WebSocket fallback when WebRTC signal stream is unavailable
            signed_url = None
            try:
                signed_resp = await client.get(
                    f"https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id={settings.ELEVENLABS_AGENT_ID}",
                    headers=headers,
                )
                if signed_resp.status_code == 200:
                    signed_url = signed_resp.json().get("signed_url")
            except Exception as e:
                logger.warning("Failed to fetch signed_url from ElevenLabs: %s", e)

    except HTTPException:
        raise
    except Exception as e:
        elevenlabs_breaker.record_failure(e)
        voice_concurrency_manager.release(session_id)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "code": "PROVIDER_UNAVAILABLE",
                "message": "Voice service connection error. Please continue in text chat.",
            },
        ) from e

    expires_at = int(time.time()) + settings.VOICE_SESSION_MAX_SECONDS
    return VoiceTokenResponse(
        token=token,
        signed_url=signed_url,
        agent_id=settings.ELEVENLABS_AGENT_ID,
        max_duration_seconds=settings.VOICE_SESSION_MAX_SECONDS,
        inactivity_timeout_seconds=settings.VOICE_INACTIVITY_TIMEOUT_SECONDS,
        expires_at=expires_at,
    )


@router.post("/session/end")
async def end_voice_session(
    payload: VoiceTokenRequest,
) -> dict[str, Any]:
    """Explicitly release reservation when a voice session ends or is abandoned (P13P.4.9)."""
    if payload.session_id:
        voice_concurrency_manager.release(payload.session_id)
    return {"status": "released"}

