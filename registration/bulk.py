from http import HTTPStatus
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from opentelemetry import trace
from pydantic import BaseModel
from sqlalchemy import update
from sqlalchemy.ext.asyncio import AsyncSession

from common.database import Application, Status, with_db
from common.permissions import Permission, requires_permission

router = APIRouter()
tracer = trace.get_tracer(__name__)


class BulkSetStatus(BaseModel):
    status: Status
    ids: List[str]


@router.put(
    "/status",
    status_code=HTTPStatus.NO_CONTENT,
    name="Bulk update application status",
    dependencies=[Depends(requires_permission(Permission.Organizer))],
)
async def bulk_set_status(params: BulkSetStatus, db: AsyncSession = Depends(with_db)):
    """
    Set the status for a number of participant applications
    """

    if params.status == Status.PENDING:
        raise HTTPException(
            status_code=HTTPStatus.BAD_REQUEST,
            detail=f"application status cannot be set to '{params.status}'",
        )

    statement = (
        update(Application)
        .where(Application.participant_id.in_(params.ids))  # type: ignore
        .where(Application.status == Status.PENDING)
        .values(status=params.status)
    )
    await db.execute(statement)
    await db.commit()
