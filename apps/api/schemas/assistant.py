"""Pydantic schemas and contracts for the Talk to Mahad Assistant."""

from enum import Enum
from typing import Any, Dict, List, Optional
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
    timestamp: Optional[str] = None


class EvidenceChunkPayload(BaseModel):
    """Canonical chunk returned by retrieval and verified for grounding."""
    chunk_id: str
    document_title: str
    section_heading: Optional[str] = None
    text_content: str
    similarity_score: float
    source_url: Optional[str] = None


class ExecutionStepPayload(BaseModel):
    """Telemetry record for execution inspector."""
    step_name: str
    duration_ms: float
    status: str = "completed"
    details: Dict[str, Any] = Field(default_factory=dict)


class AssistantChatRequest(BaseModel):
    """Public incoming request to the assistant endpoint."""
    message: str = Field(..., min_length=1, max_length=1000, description="User question or prompt")
    session_id: Optional[UUID] = Field(default_factory=uuid4, description="Session ID for tracking and consent")
    mode: AssistantMode = Field(default=AssistantMode.TEXT, description="Text chat or push-to-talk voice")
    history: List[ChatMessagePayload] = Field(default_factory=list, description="Prior conversation transcript")
    consent_given: bool = Field(default=False, description="User consent to store telemetry and message logs")


class AssistantChatResponse(BaseModel):
    """Completed grounded response returned by the assistant graph."""
    session_id: UUID
    answer: str
    citations: List[str] = Field(default_factory=list, description="Referenced chunk IDs")
    route: RouteLabel
    language: LanguageLabel
    is_safe: bool = True
    mode: AssistantMode
    suggested_actions: List[Dict[str, str]] = Field(default_factory=list, description="Structured links or UI actions")
    navigation_target: Optional[Dict[str, str]] = Field(default=None, description="Direct page navigation recommendation")
    execution_steps: List[ExecutionStepPayload] = Field(default_factory=list)
    errors: List[str] = Field(default_factory=list)
