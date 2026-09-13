"""Tests for LangSmith observability, safe tracing, redaction, and quota budget (Milestone 10.1).

Verifies:
- P10.1.1: Disabled by default locally.
- P10.1.2: Trace hierarchy for execution steps.
- P10.1.3: Redaction of API keys, secrets, and raw audio payloads.
- P10.1.4: Sampling and monthly hard cap below free allowance.
- P10.1.5: User requests succeed even when LangSmith fails or is offline.
"""

from unittest.mock import MagicMock, patch

from apps.api.core.config import get_settings
from apps.api.core.observability import (
    TraceBudgetTracker,
    log_safe_trace_step,
    redact_sensitive_content,
    trace_budget_tracker,
)
from apps.api.services.assistant.graph import run_assistant_turn


def test_p10_1_1_langsmith_disabled_by_default() -> None:
    """P10.1.1: Verify LangSmith tracing is disabled by default locally to protect free tier."""
    settings = get_settings()
    assert settings.LANGSMITH_TRACING is False
    assert trace_budget_tracker.can_trace() is False


def test_p10_1_3_redaction_secrets_and_audio() -> None:
    """P10.1.3: Verify sensitive API keys, credentials, and audio payloads are redacted."""
    raw_payload = {
        "api_key": "gsk_123456789012345678901234567890",
        "system_prompt": "You are a secret internal prompt...",
        "audio_bytes": "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=",
        "query": "My credit card is 4111-2222-3333-4444 and my key is sk-abcdef1234567890abcdef123456",
        "safe_field": "CardioScan AI architecture",
    }

    sanitized = redact_sensitive_content(raw_payload)

    # Assert secret keys are redacted
    assert sanitized["api_key"] == "[REDACTED]"
    assert sanitized["system_prompt"] == "[REDACTED]"
    assert sanitized["audio_bytes"] == "<REDACTED_AUDIO_DATA>"

    # Assert inline keys and cards inside strings are redacted
    assert "[REDACTED_CC]" in sanitized["query"]
    assert "[REDACTED_KEY]" in sanitized["query"]
    assert "4111-2222-3333-4444" not in sanitized["query"]
    assert "sk-abcdef1234567890" not in sanitized["query"]

    # Safe field is untouched
    assert sanitized["safe_field"] == "CardioScan AI architecture"


def test_p10_1_4_budget_tracker_monthly_threshold() -> None:
    """P10.1.4: Verify hard-disable threshold prevents exceeding free tier quota."""
    tracker = TraceBudgetTracker()

    with patch("apps.api.core.observability.get_settings") as mock_settings:
        settings = MagicMock()
        settings.LANGSMITH_TRACING = True
        settings.LANGSMITH_API_KEY = "lsv2_pt_testkey123"
        settings.LANGSMITH_MAX_MONTHLY_TRACES = 10
        settings.LANGSMITH_SAMPLE_RATE = 1.0
        mock_settings.return_value = settings

        # Within budget
        for _ in range(10):
            assert tracker.can_trace() is True
            tracker.record_trace()

        # At or beyond budget limit (10/10) -> hard-disables
        assert tracker.can_trace() is False


def test_p10_1_4_trace_sampling() -> None:
    """P10.1.4: Verify sampling rate suppresses fraction of traces."""
    tracker = TraceBudgetTracker()

    with patch("apps.api.core.observability.get_settings") as mock_settings:
        settings = MagicMock()
        settings.LANGSMITH_TRACING = True
        settings.LANGSMITH_API_KEY = "lsv2_pt_testkey123"
        settings.LANGSMITH_MAX_MONTHLY_TRACES = 1000
        settings.LANGSMITH_SAMPLE_RATE = 0.0  # 0% sampling
        mock_settings.return_value = settings

        assert tracker.can_trace() is False


def test_p10_1_5_langsmith_failure_does_not_break_user_requests() -> None:
    """P10.1.5: Verify assistant requests succeed 100% when LangSmith throws exceptions."""
    with patch("apps.api.core.observability.get_settings") as mock_settings, \
         patch("langsmith.Client") as mock_client:
        settings = MagicMock()
        settings.LANGSMITH_TRACING = True
        settings.LANGSMITH_API_KEY = "lsv2_pt_testkey123"
        settings.LANGSMITH_ENDPOINT = "https://api.smith.langchain.com"
        settings.LANGSMITH_PROJECT = "test-project"
        settings.LANGSMITH_MAX_MONTHLY_TRACES = 5000
        settings.LANGSMITH_SAMPLE_RATE = 1.0
        mock_settings.return_value = settings

        # Simulate LangSmith network outage / 500 error
        mock_instance = MagicMock()
        mock_instance.create_run.side_effect = RuntimeError("LangSmith connection timeout (503)")
        mock_client.return_value = mock_instance

        # User request must complete normally despite LangSmith outage
        response = run_assistant_turn(
            message="What is Mahad's email address?",
            session_id="00000000-0000-0000-0000-000000000001",
            mode="text",
        )
        assert response is not None
        assert response.answer is not None
        assert len(response.answer) > 0


def test_p10_1_2_trace_hierarchy_dispatch() -> None:
    """P10.1.2: Verify step telemetry emits child runs with safe redacted data."""
    with patch("apps.api.core.observability.get_settings") as mock_settings, \
         patch("langsmith.Client") as mock_client:
        settings = MagicMock()
        settings.LANGSMITH_TRACING = True
        settings.LANGSMITH_API_KEY = "lsv2_pt_testkey123"
        settings.LANGSMITH_ENDPOINT = "https://api.smith.langchain.com"
        settings.LANGSMITH_PROJECT = "test-project"
        settings.LANGSMITH_MAX_MONTHLY_TRACES = 5000
        settings.LANGSMITH_SAMPLE_RATE = 1.0
        mock_settings.return_value = settings

        mock_instance = MagicMock()
        mock_client.return_value = mock_instance

        log_safe_trace_step(
            step_name="assistant.retrieve_evidence",
            run_type="tool",
            inputs={"query": "test query", "secret_key": "gsk_12345678901234567890"},
            outputs={"status": "completed"},
            session_id="session-123",
        )

        assert mock_instance.create_run.called
        call_kwargs = mock_instance.create_run.call_args.kwargs
        assert call_kwargs["name"] == "assistant.retrieve_evidence"
        assert call_kwargs["run_type"] == "tool"
        assert call_kwargs["inputs"]["secret_key"] == "[REDACTED]"
