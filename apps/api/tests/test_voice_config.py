"""Tests for ElevenLabs voice configuration and provider boundary validation.
Milestone 13P.2 - Configuration and provider boundary (P13P.2.1 - P13P.2.14)
"""


from apps.api.core.config import Settings


def test_voice_settings_defaults() -> None:
    """Verify default values for ElevenLabs voice companion configuration."""
    settings = Settings(
        ENVIRONMENT="test",
        ELEVENLABS_API_KEY="",
        ELEVENLABS_AGENT_ID="",
    )
    assert settings.ELEVENLABS_VOICE_ENABLED is True
    assert settings.VOICE_SESSION_MAX_SECONDS == 120
    assert settings.VOICE_INACTIVITY_TIMEOUT_SECONDS == 15
    assert settings.VOICE_MONTHLY_BUDGET_SECONDS == 3600
    assert settings.VOICE_DAILY_BUDGET_SECONDS == 600
    assert settings.VOICE_GLOBAL_CONCURRENCY_LIMIT == 1
    assert settings.is_voice_available is False


def test_voice_available_when_credentials_present() -> None:
    """Verify voice becomes available when required server-side settings exist."""
    settings = Settings(
        ENVIRONMENT="test",
        ELEVENLABS_API_KEY="test_xi_api_key_12345",
        ELEVENLABS_AGENT_ID="agent_7601m3zc989wfnwvvd78k6kcpvpa",
        ELEVENLABS_VOICE_ID="voice_brian_123",
    )
    assert settings.is_voice_available is True
    assert settings.active_voice_id == "voice_brian_123"


def test_voice_disabled_switch_overrides_credentials() -> None:
    """Verify ELEVENLABS_VOICE_ENABLED=False disables voice even if credentials exist (P13P.2.6, P13P.2.12)."""
    settings = Settings(
        ENVIRONMENT="test",
        ELEVENLABS_API_KEY="test_xi_api_key_12345",
        ELEVENLABS_AGENT_ID="agent_7601m3zc989wfnwvvd78k6kcpvpa",
        ELEVENLABS_VOICE_ENABLED=False,
    )
    assert settings.is_voice_available is False


def test_voice_session_duration_clamped_to_120() -> None:
    """Verify VOICE_SESSION_MAX_SECONDS is clamped to 120 seconds max (P13P.2.7)."""
    settings = Settings(
        ENVIRONMENT="test",
        VOICE_SESSION_MAX_SECONDS=300,
    )
    assert settings.VOICE_SESSION_MAX_SECONDS == 120


def test_api_key_secret_not_leaked_in_repr() -> None:
    """Verify ELEVENLABS_API_KEY is excluded from repr and string conversions (P13P.2.13)."""
    secret_key = "super_secret_elevenlabs_key_xyz"
    settings = Settings(
        ENVIRONMENT="test",
        ELEVENLABS_API_KEY=secret_key,
    )
    repr_str = repr(settings)
    str_val = str(settings)
    assert secret_key not in repr_str
    assert secret_key not in str_val


def test_voice_id_fallback() -> None:
    """Verify fallback voice ID is used when primary voice ID is blank (P13P.2.4)."""
    settings = Settings(
        ENVIRONMENT="test",
        ELEVENLABS_VOICE_ID="",
        ELEVENLABS_VOICE_ID_FALLBACK="voice_fallback_adam",
    )
    assert settings.active_voice_id == "voice_fallback_adam"


def test_text_chat_unaffected_by_voice_degradation() -> None:
    """Verify missing voice config does not affect core LLM or database settings (P13P.2.12)."""
    settings = Settings(
        ENVIRONMENT="test",
        ELEVENLABS_API_KEY="",
        ELEVENLABS_AGENT_ID="",
        ELEVENLABS_VOICE_ENABLED=False,
        GROQ_API_KEY="gsk_test_123",
    )
    assert settings.is_voice_available is False
    assert settings.GROQ_API_KEY == "gsk_test_123"
    assert bool(settings.GROQ_CHAT_MODEL) is True


