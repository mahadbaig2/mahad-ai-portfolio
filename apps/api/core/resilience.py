"""Resilience utilities: Circuit Breaker and Rate Limiter (P9.4.3 & P9.4.4).

Provides protection against cascading failures, dependency outages, and free-tier/capacity exhaustion.
"""

import logging
import time
from collections import defaultdict
from collections.abc import Callable, Coroutine
from datetime import UTC, datetime, timedelta
from enum import Enum
from typing import Any, TypeVar

from apps.api.core.errors import RateLimitError, ServiceUnavailableError

logger = logging.getLogger("api.resilience")

T = TypeVar("T")


class CircuitBreakerState(str, Enum):
    CLOSED = "CLOSED"
    OPEN = "OPEN"
    HALF_OPEN = "HALF_OPEN"


class CircuitBreaker:
    """In-memory Circuit Breaker guarding external provider dependencies."""

    def __init__(
        self,
        name: str,
        failure_threshold: int = 3,
        recovery_timeout_sec: float = 10.0,
        half_open_success_threshold: int = 2,
    ) -> None:
        self.name = name
        self.failure_threshold = failure_threshold
        self.recovery_timeout_sec = recovery_timeout_sec
        self.half_open_success_threshold = half_open_success_threshold

        self.state = CircuitBreakerState.CLOSED
        self.failure_count = 0
        self.half_open_successes = 0
        self.last_failure_time: float | None = None

    def _update_state(self) -> None:
        """Check if recovery timeout expired to transition OPEN -> HALF_OPEN."""
        if self.state == CircuitBreakerState.OPEN and self.last_failure_time is not None:
            elapsed = time.monotonic() - self.last_failure_time
            if elapsed >= self.recovery_timeout_sec:
                logger.info("Circuit breaker [%s] recovery timeout elapsed; transitioning OPEN -> HALF_OPEN", self.name)
                self.state = CircuitBreakerState.HALF_OPEN
                self.half_open_successes = 0

    def record_success(self) -> None:
        """Record a successful dependency invocation."""
        if self.state == CircuitBreakerState.HALF_OPEN:
            self.half_open_successes += 1
            if self.half_open_successes >= self.half_open_success_threshold:
                logger.info("Circuit breaker [%s] recovered; transitioning HALF_OPEN -> CLOSED", self.name)
                self.state = CircuitBreakerState.CLOSED
                self.failure_count = 0
                self.last_failure_time = None
        elif self.state == CircuitBreakerState.CLOSED:
            self.failure_count = 0

    def record_failure(self, error: Exception) -> None:
        """Record a failed dependency invocation."""
        self.last_failure_time = time.monotonic()
        self.failure_count += 1
        logger.warning(
            "Circuit breaker [%s] recorded failure (%d/%d): %s",
            self.name,
            self.failure_count,
            self.failure_threshold,
            error,
        )

        if self.state in (CircuitBreakerState.CLOSED, CircuitBreakerState.HALF_OPEN):
            if self.failure_count >= self.failure_threshold or self.state == CircuitBreakerState.HALF_OPEN:
                logger.error("Circuit breaker [%s] tripped; transitioning to OPEN", self.name)
                self.state = CircuitBreakerState.OPEN

    def check_available(self) -> None:
        """Check if circuit allows calls or raises ServiceUnavailableError."""
        self._update_state()
        if self.state == CircuitBreakerState.OPEN:
            retry_after = int(self.recovery_timeout_sec)
            if self.last_failure_time:
                remaining = max(1, int(self.recovery_timeout_sec - (time.monotonic() - self.last_failure_time)))
                retry_after = remaining
            raise ServiceUnavailableError(
                message=f"External service [{self.name}] is temporarily unavailable (circuit breaker OPEN). Please retry in {retry_after}s.",
                details={"breaker": self.name, "state": self.state.value, "retry_after": retry_after},
            )

    async def call(self, func: Callable[..., Coroutine[Any, Any, T]], *args: Any, **kwargs: Any) -> T:
        """Execute async function guarded by the circuit breaker."""
        self.check_available()
        try:
            result = await func(*args, **kwargs)
            self.record_success()
            return result
        except Exception as e:
            self.record_failure(e)
            raise

    def reset(self) -> None:
        """Manually reset circuit breaker to healthy CLOSED state."""
        self.state = CircuitBreakerState.CLOSED
        self.failure_count = 0
        self.half_open_successes = 0
        self.last_failure_time = None


# Preconfigured global breakers for critical dependencies
groq_breaker = CircuitBreaker("groq", failure_threshold=3, recovery_timeout_sec=10.0)
qdrant_breaker = CircuitBreaker("qdrant", failure_threshold=3, recovery_timeout_sec=10.0)


class SlidingWindowRateLimiter:
    """In-memory sliding-window rate limiter per client key (session / IP)."""

    def __init__(self, max_requests: int = 30, window_seconds: int = 60) -> None:
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self._history: dict[str, list[datetime]] = defaultdict(list)

    def check(self, key: str) -> None:
        """Check if key has exceeded allowed requests in the sliding window."""
        now = datetime.now(UTC)
        cutoff = now - timedelta(seconds=self.window_seconds)

        # Purge timestamps outside the window
        timestamps = [t for t in self._history[key] if t > cutoff]
        self._history[key] = timestamps

        if len(timestamps) >= self.max_requests:
            earliest = timestamps[0]
            retry_after = max(1, int((earliest + timedelta(seconds=self.window_seconds) - now).total_seconds()))
            raise RateLimitError(
                message=f"Rate limit exceeded: max {self.max_requests} requests per {self.window_seconds}s. Please retry in {retry_after}s.",
                retry_after=retry_after,
                details={"max_requests": self.max_requests, "window_seconds": self.window_seconds},
            )

        self._history[key].append(now)

    def reset(self) -> None:
        """Clear all rate limit histories."""
        self._history.clear()


# Default API rate limiter: 30 requests per minute
chat_rate_limiter = SlidingWindowRateLimiter(max_requests=30, window_seconds=60)
