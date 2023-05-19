import binascii
import hmac
import json
import logging
import time
from typing import Any, Dict, List, Optional, Union

from aiohttp import ClientError, ClientSession, ClientTimeout
from opentelemetry import trace
from opentelemetry.trace import StatusCode
from pydantic.json import pydantic_encoder
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from common import version
from common.database import (
    Application,
    ApplicationRead,
    Webhook,
    WebhookTrigger,
    db_context,
)

shared = True

logger = logging.getLogger(__name__)
tracer = trace.get_tracer(__name__)

_session: Optional[ClientSession] = None


async def send_application_event(
    trigger: Union[int, WebhookTrigger],
    event_slug: str,
    participant_id: int,
):
    """
    Send an application event
    """
    async with db_context() as db:
        application = await db.get(
            Application,
            participant_id,
            options=[
                selectinload(Application.participant),
                selectinload(Application.school),
            ],
        )
        if application is None:
            logger.warning(
                f"application for participant '{participant_id}' no longer exists"
            )
            return

    await send(
        trigger,
        {
            "event": event_slug,
            "application": ApplicationRead.from_orm(application),
            "timestamp": int(time.time()),
        },
    )


async def send(trigger: Union[int, WebhookTrigger], payload: Dict[str, Any]):
    """
    Send the given payload to all the enabled webhooks
    """
    client = await _get_client()

    body = json.dumps(payload, default=pydantic_encoder)

    webhooks = await webhooks_for(trigger)
    for webhook in webhooks:
        with tracer.start_as_current_span("send") as span:
            headers = {}

            if webhook.secret:
                with tracer.start_as_current_span("sign"):
                    digest = hmac.digest(
                        webhook.secret.encode(), body.encode(), "sha256"
                    )
                    headers["X-Request-Signature"] = binascii.hexlify(digest).decode()

            try:
                await client.post(webhook.url, data=body, headers=headers)
            except ClientError as e:
                logger.warning(f"failed to send webhook: {e}")
                span.record_exception(e)
                span.set_status(StatusCode.ERROR)


async def webhooks_for(trigger: Union[int, WebhookTrigger]) -> List[Webhook]:
    """
    Get all the enabled webhooks for a given trigger
    """
    async with db_context() as db:
        statement = (
            select(Webhook)
            .where(Webhook.enabled)
            .where(Webhook.triggered_by.op("&")(trigger) == trigger)  # type: ignore
        )
        result = await db.execute(statement)
        return result.scalars().all()


async def _get_client() -> ClientSession:
    global _session

    if _session is None:
        _session = ClientSession(
            timeout=ClientTimeout(total=5),
            headers={
                "Content-Type": "application/json",
                "User-Agent": f"application-portal/{version.commit}",
            },
        )

    return _session
