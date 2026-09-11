"""Sanity CMS Webhook Endpoint with HMAC-SHA256 signature verification (P6.2.1).

Verifies Sanity webhook signatures, prevents replay attacks, and triggers
atomic incremental synchronization into PostgreSQL and Qdrant.
"""

import hashlib
import hmac
import logging
import time
from typing import Any

from fastapi import APIRouter, Depends, Header, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from apps.api.core.config import get_settings
from apps.api.db.session import get_db
from apps.api.providers.qdrant import QdrantVectorProvider
from pipelines.ingestion.synchronizer import IncrementalSynchronizer

logger = logging.getLogger("router.webhook")
router = APIRouter(prefix="/webhooks", tags=["Webhooks"])


def verify_sanity_signature(
    body: bytes,
    signature_header: str | None,
    secret: str,
    max_age_seconds: int = 300,
) -> bool:
    """Verify HMAC-SHA256 signature from Sanity webhook (P6.2.1, P6.2.8).

    Sanity signature header format:
    t=<timestamp_millis_or_seconds>,v1=<hex_hmac>
    """
    if not secret:
        # If secret is not configured in environment, disallow webhook access
        logger.error("SANITY_WEBHOOK_SECRET is not configured.")
        return False

    if not signature_header:
        return False

    parts = {}
    for item in signature_header.split(","):
        if "=" in item:
            k, v = item.split("=", 1)
            parts[k.strip()] = v.strip()

    t_str = parts.get("t")
    v1_sig = parts.get("v1")

    if not t_str or not v1_sig:
        return False

    try:
        t_int = int(t_str)
        # Handle both millisecond and second timestamps
        if t_int > 1e11:
            t_seconds = t_int / 1000.0
        else:
            t_seconds = float(t_int)
    except ValueError:
        return False

    # Prevent replay attacks: verify timestamp is within acceptable window
    now = time.time()
    if abs(now - t_seconds) > max_age_seconds:
        logger.warning(f"Rejected webhook replay: timestamp age {abs(now - t_seconds):.1f}s exceeds {max_age_seconds}s limit.")
        return False

    # Compute expected signature: HMAC_SHA256(secret, t + "." + body)
    payload_to_sign = f"{t_str}.".encode() + body
    expected_sig = hmac.new(
        secret.encode("utf-8"),
        payload_to_sign,
        hashlib.sha256,
    ).hexdigest()

    return hmac.compare_digest(expected_sig, v1_sig)


@router.post("/sanity", status_code=status.HTTP_200_OK)
async def handle_sanity_webhook(
    request: Request,
    sanity_webhook_signature: str | None = Header(None, alias="sanity-webhook-signature"),
    sanity_signature: str | None = Header(None, alias="sanity-signature"),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Receive and process Sanity published/updated/deleted webhooks."""
    settings = get_settings()
    raw_body = await request.body()
    sig_header = sanity_webhook_signature or sanity_signature

    # Verify HMAC signature
    is_valid = verify_sanity_signature(
        body=raw_body,
        signature_header=sig_header,
        secret=settings.SANITY_WEBHOOK_SECRET,
    )
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired Sanity webhook signature.",
        )

    try:
        data = await request.json()
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Malformed JSON body.",
        ) from None


    sanity_id = str(data.get("_id", data.get("id", "")))
    if not sanity_id:
        return {"status": "ignored", "reason": "missing_document_id"}

    # Draft documents are ignored until published
    if sanity_id.startswith("drafts."):
        return {"status": "ignored", "reason": "draft_document"}

    # Determine event type
    action = data.get("action", data.get("operation", "update"))
    event_type = "update"
    if action in ("create", "publish"):
        event_type = "publish"
    elif action in ("delete", "unpublish"):
        event_type = action

    # Run incremental synchronization
    vector_provider = QdrantVectorProvider()
    try:
        synchronizer = IncrementalSynchronizer(
            session=db,
            vector_provider=vector_provider,
        )
        sync_result = await synchronizer.handle_event(event_type, data)
        return {
            "status": "ok",
            "event": sync_result.model_dump(),
        }
    finally:
        await vector_provider.close()
