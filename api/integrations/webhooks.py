from http import HTTPStatus
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from opentelemetry import trace
from pydantic import validate_model
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from api.permissions import Role, requires_role
from common.database import (
    Webhook,
    WebhookCreate,
    WebhookList,
    WebhookRead,
    WebhookUpdate,
    with_db,
)

router = APIRouter(dependencies=[Depends(requires_role(Role.Organizer))])
tracer = trace.get_tracer(__name__)


@router.get("/", name="List webhooks", response_model=List[WebhookList])
async def list(db: AsyncSession = Depends(with_db)):
    """
    Get a list of all the registered webhooks
    """
    result = await db.execute(select(Webhook).order_by(Webhook.id))
    return result.scalars().all()


@router.post("/", name="Register webhook", response_model=WebhookRead)
async def create(values: WebhookCreate, db: AsyncSession = Depends(with_db)):
    """
    Creates a new webhook and sends a test
    """
    webhook = Webhook.from_orm(values)

    db.add(webhook)
    await db.commit()

    return webhook


@router.get("/{id}", name="Read webhook", response_model=WebhookRead)
async def read(id: int, db: AsyncSession = Depends(with_db)):
    """
    Get all the details about a webhook
    """
    webhook = await db.get(Webhook, id)
    if webhook is None:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="not found")

    return webhook


@router.patch("/{id}", name="Update webhook", status_code=HTTPStatus.NO_CONTENT)
async def update(id: int, params: WebhookUpdate, db: AsyncSession = Depends(with_db)):
    """
    Update the details of a webhook
    """
    webhook = await db.get(Webhook, id)
    if webhook is None:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="not found")

    with tracer.start_as_current_span("update"):
        updated_fields = params.dict(exclude_unset=True)
        for key, value in updated_fields.items():
            setattr(webhook, key, value)

    with tracer.start_as_current_span("validate"):
        *_, error = validate_model(Webhook, webhook.__dict__)
        if error:
            raise error

    db.add(webhook)
    await db.commit()


@router.delete("/{id}", name="Delete webhook", status_code=HTTPStatus.NO_CONTENT)
async def delete(id: int, db: AsyncSession = Depends(with_db)):
    """
    Delete a webhook
    """
    webhook = await db.get(Webhook, id)
    if webhook:
        await db.delete(webhook)
        await db.commit()
