"""Provider-neutral Groq LLM Adapter using standard async HTTP (P9.2.7).

Per AGENTS.md:
- No provider SDK may leak through domain interfaces.
- Default to local mocks when credentials are unavailable.
"""

import json
import logging
from collections.abc import AsyncIterator

import httpx

from apps.api.core.config import get_settings
from apps.api.providers.base import LLMProvider

logger = logging.getLogger("provider.groq")

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"


class GroqLLMProvider(LLMProvider):
    """Provider-neutral implementation of LLMProvider targeting Groq inference."""

    def __init__(
        self,
        api_key: str | None = None,
        model: str | None = None,
        timeout: float = 30.0,
        mock_fallback: bool = True,
    ) -> None:
        settings = get_settings()
        self.api_key = api_key if api_key is not None else settings.GROQ_API_KEY
        self.model = model or settings.GROQ_CHAT_MODEL or "llama-3.3-70b-versatile"
        self.timeout = timeout
        self.mock_fallback = mock_fallback

    def _generate_mock_grounded_response(self, messages: list[dict[str, str]]) -> str:
        """Deterministic mock response for local testing without live API keys."""
        last_user_msg = ""
        system_msg = ""
        for m in messages:
            if m.get("role") == "user":
                last_user_msg = m.get("content", "")
            elif m.get("role") == "system":
                system_msg = m.get("content", "")

        # Look for source chunk IDs in system prompt to formulate grounded response
        import re

        source_ids = re.findall(r"Source ID:\s*([0-9a-fA-F-]+)", system_msg)
        is_roman_urdu = bool(
            re.search(
                r"\b(kya|hai|hain|kaun|baray|mein)\b", last_user_msg, re.IGNORECASE
            )
        )

        if source_ids:
            primary_id = source_ids[0]
            if is_roman_urdu:
                return (
                    f"Mahad ke portfolio ke mutabiq, yeh technical project high-scale architecture aur production ML "
                    f"par mabni hai [{primary_id}]. Mazeed tafseelat project documentation mein dastyab hain."
                )
            return (
                f"Based on Mahad's verified portfolio evidence, this work focuses on production AI systems, "
                f"reproducible pipelines, and evaluated architectures [{primary_id}]."
            )

        if is_roman_urdu:
            return "Mahad ke portfolio ke mutabiq, dastyab records mein is sawal ki tasdeeq dastyab nahi hai."
        return "Based on the provided portfolio records, there is no direct evidence to answer this question."

    async def generate(
        self,
        messages: list[dict[str, str]],
        temperature: float = 0.2,
        max_tokens: int = 1000,
    ) -> str:
        """Generate complete text completion via Groq chat API."""
        if not self.api_key:
            if self.mock_fallback:
                logger.info(
                    "GROQ_API_KEY not configured. Using deterministic mock response."
                )
                return self._generate_mock_grounded_response(messages)
            raise ValueError(
                "GROQ_API_KEY is not configured and mock_fallback is False."
            )

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
            "stream": False,
        }

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    GROQ_API_URL, headers=headers, json=payload
                )
                response.raise_for_status()
                data = response.json()
                return data["choices"][0]["message"]["content"]
        except httpx.HTTPStatusError as e:
            logger.error(
                f"Groq API HTTP error: {e.response.status_code} - {e.response.text}"
            )
            if self.mock_fallback:
                logger.warning(
                    "Falling back to mock response following Groq HTTP error."
                )
                return self._generate_mock_grounded_response(messages)
            raise
        except Exception as e:
            logger.error(f"Groq API connection error: {e}")
            if self.mock_fallback:
                logger.warning(
                    "Falling back to mock response following Groq connection error."
                )
                return self._generate_mock_grounded_response(messages)
            raise

    async def stream(
        self,
        messages: list[dict[str, str]],
        temperature: float = 0.2,
        max_tokens: int = 1000,
    ) -> AsyncIterator[str]:
        """Stream token completion chunks via SSE from Groq chat API."""
        if not self.api_key:
            mock_text = self._generate_mock_grounded_response(messages)
            for word in mock_text.split(" "):
                yield word + " "
            return

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
            "stream": True,
        }

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                async with client.stream(
                    "POST", GROQ_API_URL, headers=headers, json=payload
                ) as response:
                    response.raise_for_status()
                    async for line in response.aiter_lines():
                        if not line or not line.startswith("data: "):
                            continue
                        data_str = line[6:].strip()
                        if data_str == "[DONE]":
                            break
                        try:
                            chunk_data = json.loads(data_str)
                            delta = chunk_data.get("choices", [{}])[0].get("delta", {})
                            token = delta.get("content", "")
                            if token:
                                yield token
                        except json.JSONDecodeError:
                            continue
        except Exception as e:
            logger.error(f"Groq streaming error: {e}")
            mock_text = self._generate_mock_grounded_response(messages)
            for word in mock_text.split(" "):
                yield word + " "
