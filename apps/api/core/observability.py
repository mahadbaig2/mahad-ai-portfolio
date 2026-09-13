"""Observability and safe tracing integration for LangSmith and MLflow (Milestone 10.1).

Enforces:
- P10.1.1: Disabled by default locally.
- P10.1.2: Trace hierarchy for classifier, retrieval, grading, generation, and verification.
- P10.1.3: Redaction of secrets, raw audio, and sensitive user content.
- P10.1.4: Trace sampling and monthly hard-disable threshold below free allowance.
- P10.1.5: Observability failures never fail or crash user-facing requests.
"""

import logging
import random
import re
from datetime import UTC, datetime
from typing import Any, Literal

from apps.api.core.config import get_settings

logger = logging.getLogger("api.observability")

# Regex redaction patterns (P10.1.3)
API_KEY_REGEX = re.compile(r"(?:gsk_|sk-|Bearer\s+|api_key[\"':\s=]+)[a-zA-Z0-9_\-]{16,}", re.IGNORECASE)
CREDIT_CARD_REGEX = re.compile(r"\b(?:\d[ -]*?){13,16}\b")
SECRET_VALUE_REGEX = re.compile(r"(?:password|secret|token)[\"':\s=]+([^\s,}\"]+)", re.IGNORECASE)
EMAIL_SENSITIVE_REGEX = re.compile(r"\b[A-Za-z0-9._%+-]+@(?!gmail\.com|github\.com)[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b")


def redact_sensitive_content(val: Any) -> Any:
    """Recursively redact secrets, API keys, raw audio, and sensitive metadata (P10.1.3)."""
    if isinstance(val, str):
        # Redact raw audio / base64 prefixes
        if val.startswith("data:audio") or len(val) > 20000:
            return "<REDACTED_LARGE_PAYLOAD>"
        redacted = API_KEY_REGEX.sub("[REDACTED_KEY]", val)
        redacted = CREDIT_CARD_REGEX.sub("[REDACTED_CC]", redacted)
        return redacted
    elif isinstance(val, dict):
        sanitized = {}
        for k, v in val.items():
            key_lower = str(k).lower()
            if any(sub in key_lower for sub in ("api_key", "secret", "password", "token", "system_prompt")):
                sanitized[k] = "[REDACTED]"
            elif any(sub in key_lower for sub in ("audio", "audio_data", "raw_audio", "wav", "mp3")):
                sanitized[k] = "<REDACTED_AUDIO_DATA>"
            else:
                sanitized[k] = redact_sensitive_content(v)
        return sanitized
    elif isinstance(val, list):
        return [redact_sensitive_content(item) for item in val]
    return val


class TraceBudgetTracker:
    """Tracks monthly LangSmith trace volume and enforces hard-disable limits (P10.1.4)."""

    def __init__(self) -> None:
        self.current_month: str = datetime.now(UTC).strftime("%Y-%m")
        self.monthly_trace_count: int = 0

    def _refresh_month(self) -> None:
        now_month = datetime.now(UTC).strftime("%Y-%m")
        if now_month != self.current_month:
            logger.info("Month rolled over from %s to %s. Resetting trace budget.", self.current_month, now_month)
            self.current_month = now_month
            self.monthly_trace_count = 0

    def can_trace(self) -> bool:
        """Evaluate if trace should be recorded under sampling and monthly budget rules."""
        settings = get_settings()
        if not settings.LANGSMITH_TRACING or not settings.LANGSMITH_API_KEY:
            return False

        self._refresh_month()

        # Monthly quota cap (P10.1.4)
        if self.monthly_trace_count >= settings.LANGSMITH_MAX_MONTHLY_TRACES:
            logger.warning(
                "LangSmith monthly trace cap reached (%d/%d). Tracing hard-disabled to prevent billing.",
                self.monthly_trace_count,
                settings.LANGSMITH_MAX_MONTHLY_TRACES,
            )
            return False

        # Sampling rate (P10.1.4)
        if settings.LANGSMITH_SAMPLE_RATE < 1.0:
            if random.random() > settings.LANGSMITH_SAMPLE_RATE:
                return False

        return True

    def record_trace(self) -> None:
        """Increment count of recorded traces."""
        self._refresh_month()
        self.monthly_trace_count += 1

    def reset(self) -> None:
        """Reset budget counter for testing."""
        self.monthly_trace_count = 0


# Global tracker instance
trace_budget_tracker = TraceBudgetTracker()


def log_safe_trace_step(
    step_name: str,
    run_type: Literal["tool", "chain", "llm", "retriever", "embedding", "prompt", "parser"] = "chain",
    inputs: dict[str, Any] | None = None,
    outputs: dict[str, Any] | None = None,
    session_id: str | None = None,
) -> None:
    """Record safe redacted telemetry step, ensuring LangSmith never crashes user requests (P10.1.2 & P10.1.5)."""
    if not trace_budget_tracker.can_trace():
        return

    try:
        # Lazy import langsmith so local runtime has zero overhead when tracing is disabled
        from langsmith import Client

        settings = get_settings()
        client = Client(api_key=settings.LANGSMITH_API_KEY, api_url=settings.LANGSMITH_ENDPOINT)

        safe_inputs = redact_sensitive_content(inputs or {})
        safe_outputs = redact_sensitive_content(outputs or {})

        client.create_run(
            name=step_name,
            run_type=run_type,
            project_name=settings.LANGSMITH_PROJECT,
            inputs=safe_inputs,
            outputs=safe_outputs,
            extra={"session_id": session_id, "timestamp": datetime.now(UTC).isoformat()},
        )
        trace_budget_tracker.record_trace()
    except Exception as e:
        # Invariant: LangSmith failures must never fail a user request (AGENTS.md & P10.1.5)
        logger.warning("Non-fatal LangSmith trace dispatch failure: %s", e)
