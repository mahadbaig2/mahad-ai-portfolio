"""OpenAI-compatible request and response schemas for ElevenLabs Conversational AI custom LLM adapter.
Milestone 13P.3 - P13P.3.1 [A]
"""

from typing import Literal

from pydantic import BaseModel, Field

from apps.api.schemas.assistant import CitationDetailPayload


class OpenAIChatMessage(BaseModel):
    """Message item conforming to the OpenAI Chat Completion message specification."""

    role: Literal["system", "user", "assistant"] = Field(
        description="Role of the message sender",
    )
    content: str = Field(
        min_length=1,
        max_length=4000,
        description="Text content of the message",
    )


class OpenAIChatCompletionRequest(BaseModel):
    """Request payload sent by ElevenLabs Conversational AI or any OpenAI-compatible client."""

    messages: list[OpenAIChatMessage] = Field(
        min_length=1,
        max_length=50,
        description="List of conversation messages including prompt and history",
    )
    model: str = Field(
        default="mahad-ai-assistant",
        description="Model identifier requested by caller",
    )
    stream: bool = Field(
        default=True,
        description="Whether to stream response tokens via Server-Sent Events",
    )
    temperature: float | None = Field(
        default=None,
        ge=0.0,
        le=2.0,
        description="Sampling temperature",
    )
    max_tokens: int | None = Field(
        default=None,
        ge=1,
        le=4096,
        description="Maximum tokens to generate",
    )
    user: str | None = Field(
        default=None,
        description="Optional user or session identifier passed by the client or conversational agent",
    )


class OpenAIChoiceMessage(BaseModel):
    """Assistant message payload in a non-streaming completion choice."""

    role: Literal["assistant"] = "assistant"
    content: str = ""


class OpenAIChoice(BaseModel):
    """Individual choice element in a non-streaming response."""

    index: int = 0
    message: OpenAIChoiceMessage
    finish_reason: str = "stop"


class OpenAIUsage(BaseModel):
    """Token usage metrics."""

    prompt_tokens: int = 0
    completion_tokens: int = 0
    total_tokens: int = 0


class OpenAIChatCompletionResponse(BaseModel):
    """Complete non-streaming OpenAI chat completion payload."""

    id: str
    object: Literal["chat.completion"] = "chat.completion"
    created: int
    model: str = "mahad-ai-assistant"
    choices: list[OpenAIChoice]
    usage: OpenAIUsage = Field(default_factory=OpenAIUsage)


class OpenAIChunkDelta(BaseModel):
    """Delta payload inside a streaming chunk choice."""

    role: Literal["assistant"] | None = None
    content: str | None = None


class OpenAIChunkChoice(BaseModel):
    """Choice item in a streaming Server-Sent Event chunk."""

    index: int = 0
    delta: OpenAIChunkDelta
    finish_reason: str | None = None


class OpenAIChatCompletionChunk(BaseModel):
    """Individual chunk formatted for OpenAI SSE streaming."""

    id: str
    object: Literal["chat.completion.chunk"] = "chat.completion.chunk"
    created: int
    model: str = "mahad-ai-assistant"
    choices: list[OpenAIChunkChoice]


class VoiceConfigResponse(BaseModel):
    """Public, safe voice configuration status for client widget disclosure without secrets."""

    voice_enabled: bool
    max_session_seconds: int = 120
    inactivity_timeout_seconds: int = 15
    server_location: str = "us"
    active_voice_id: str | None = None


class VoiceTokenRequest(BaseModel):
    """Explicit client request to initiate a real-time voice session (P13P.4.3)."""

    session_id: str | None = Field(
        default=None,
        description="Optional client session identifier",
    )
    action: Literal["start_voice"] = Field(
        default="start_voice",
        description="Explicit start action required to prevent accidental token issuance",
    )


class VoiceTokenResponse(BaseModel):
    """Temporary conversation token issued to client for WebRTC / WebSocket connection (P13P.4.1)."""

    token: str = Field(description="Short-lived conversation token issued by ElevenLabs")
    signed_url: str | None = Field(default=None, description="Signed WebSocket URL for direct connection")
    agent_id: str = Field(description="Configured Conversational AI agent ID")
    max_duration_seconds: int = Field(default=120, description="Hard duration cap in seconds")
    inactivity_timeout_seconds: int = Field(default=15, description="Inactivity timeout in seconds")
    expires_at: int = Field(description="Unix timestamp when reservation expires")


class VoiceTurnCitationResponse(BaseModel):
    """Citation metadata for a specific voice turn (Milestone 13P.13: P13P.13.4 - P13P.13.5)."""

    turn_id: str = Field(description="Unique identifier for the assistant completion turn")
    session_id: str | None = Field(default=None, description="Client session ID if provided")
    conversation_id: str | None = Field(default=None, description="Provider conversation ID if provided")
    route: str = Field(default="rag_retrieval", description="Routing classification used for this turn")
    citations: list[str] = Field(default_factory=list, description="Chunk UUIDs cited in this turn")
    citation_details: list[CitationDetailPayload] = Field(
        default_factory=list,
        description="Detailed citations with title, URL, heading, and index",
    )
    timestamp: int = Field(description="Unix timestamp when turn completed")


