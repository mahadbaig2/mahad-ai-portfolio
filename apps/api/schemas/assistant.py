"""Pydantic schemas and contracts for the Talk to Mahad Assistant."""

from enum import Enum
from typing import Any
from uuid import UUID, uuid4

from pydantic import BaseModel, Field

from apps.api.schemas.router import LanguageLabel, RouteLabel


class AssistantMode(str, Enum):
    """Interaction mode for assistant."""
    TEXT = "text"
    VOICE = "voice"


class ChatMessageRole(str, Enum):
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"


class ChatMessagePayload(BaseModel):
    """A single turn in the conversation transcript."""
    role: ChatMessageRole
    content: str = Field(..., min_length=1, max_length=4000)
    timestamp: str | None = None


class EvidenceChunkPayload(BaseModel):
    """Canonical chunk returned by retrieval and verified for grounding."""
    chunk_id: str
    document_title: str
    section_heading: str | None = None
    text_content: str
    similarity_score: float
    source_url: str | None = None


class ExecutionStepPayload(BaseModel):
    """Telemetry record for execution inspector."""
    step_name: str
    duration_ms: float
    status: str = "completed"
    details: dict[str, Any] = Field(default_factory=dict)


class AssistantChatRequest(BaseModel):
    """Public incoming request to the assistant endpoint."""
    message: str = Field(..., min_length=1, max_length=1000, description="User question or prompt")
    session_id: UUID | None = Field(default_factory=uuid4, description="Session ID for tracking and consent")
    persona: str = Field(default="general", description="Audience style: general, recruiter, engineer, founder")
    mode: AssistantMode = Field(default=AssistantMode.TEXT, description="Text chat or push-to-talk voice")
    history: list[ChatMessagePayload] = Field(default_factory=list, description="Prior conversation transcript (max 20 turns)")
    consent_given: bool = Field(default=False, description="User consent to store telemetry and message logs")


class AssistantChatResponse(BaseModel):
    """Completed grounded response returned by the assistant graph."""
    session_id: UUID
    answer: str
    citations: list[str] = Field(default_factory=list, description="Referenced chunk IDs")
    route: RouteLabel
    language: LanguageLabel
    is_safe: bool = True
    mode: AssistantMode
    suggested_actions: list[dict[str, str]] = Field(default_factory=list, description="Structured links or UI actions")
    navigation_target: dict[str, str] | None = Field(default=None, description="Direct page navigation recommendation")
    execution_steps: list[ExecutionStepPayload] = Field(default_factory=list)
    errors: list[str] = Field(default_factory=list)


class CreateSessionRequest(BaseModel):
    """Payload to create a new bounded conversation session."""
    consent_given: bool = Field(default=False, description="Affirmative user consent to store logs")
    persona: str = Field(default="general", description="Target audience style persona")


class CreateSessionResponse(BaseModel):
    """Created session metadata."""
    session_id: UUID
    consent_given: bool
    persona: str
    expires_at: str


class SessionDetailResponse(BaseModel):
    """Session details and bounded message history."""
    session_id: UUID
    consent_given: bool
    persona: str
    expires_at: str
    message_count: int
    messages: list[ChatMessagePayload] = Field(default_factory=list)


class StreamStepEvent(BaseModel):
    """Safe execution progress step event emitted during streaming."""
    step_name: str
    duration_ms: float
    status: str = "completed"
    details: dict[str, Any] = Field(default_factory=dict)


class StreamTokenEvent(BaseModel):
    """Token or text delta chunk emitted during response streaming."""
    delta: str


class StreamErrorEvent(BaseModel):
    """Error event emitted during streaming."""
    code: str
    message: str

