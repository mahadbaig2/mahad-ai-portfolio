"""
Pydantic schemas and contracts for in-process query router predictions.
"""

from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field


class RouteLabel(str, Enum):
    """Execution route decided by query router."""
    RAG_RETRIEVAL = "rag_retrieval"
    DIRECT_CHAT = "direct_chat"
    REFUSAL = "refusal"


class IntentLabel(str, Enum):
    """Semantic intent of incoming user query."""
    PROJECT_TECHNICAL = "project_technical"
    PROJECT_OVERVIEW = "project_overview"
    CAREER_SKILLS = "career_skills"
    ARTICLE_DISCUSSION = "article_discussion"
    CONTACT_INFO = "contact_info"
    GREETING = "greeting"
    GENERAL_CHITCHAT = "general_chitchat"
    OUT_OF_DOMAIN = "out_of_domain"
    PROMPT_INJECTION = "prompt_injection"


class AnswerabilityLabel(str, Enum):
    """Whether query is answerable from portfolio grounding data."""
    ANSWERABLE = "answerable"
    UNANSWERABLE = "unanswerable"


class LanguageLabel(str, Enum):
    """Detected language: en (English) or ur (Roman Urdu)."""
    EN = "en"
    UR = "ur"


class RouterPredictionRequest(BaseModel):
    """Input payload for query router classification."""
    text: str = Field(..., min_length=1, max_length=1000, description="User query text")


class RouterPredictionResponse(BaseModel):
    """Prediction output from the in-process ONNX query router."""
    text: str
    route: RouteLabel
    route_confidence: float = Field(..., ge=0.0, le=1.0)
    intent: IntentLabel
    intent_confidence: float = Field(..., ge=0.0, le=1.0)
    answerability: AnswerabilityLabel
    language: LanguageLabel
    model_name: str
    model_version: str
    is_fallback: bool = False
    latency_ms: float
