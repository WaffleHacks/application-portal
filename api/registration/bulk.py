from http import HTTPStatus
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from opentelemetry import trace
from pydantic import BaseModel
from sqlalchemy import update
from sqlalchemy.ext.asyncio import AsyncSession

from api.permissions import Role, requires_role
from common.database import Application, ApplicationStatus, with_db
from common.tasks import broadcast

router = APIRouter()
tracer = trace.get_tracer(__name__)


class BulkSetStatus(BaseModel):
    status: ApplicationStatus
    ids: List[int]


@router.put(
    "/status",
    status_code=HTTPStatus.NO_CONTENT,
    name="Bulk update application status",
    dependencies=[Depends(requires_role(Role.Organizer))],
)
async def bulk_set_status(params: BulkSetStatus, db: AsyncSession = Depends(with_db)):
    """
    Set the status for a number of participant applications
    """

    if params.status == ApplicationStatus.PENDING:
        raise HTTPException(
            status_code=HTTPStatus.BAD_REQUEST,
            detail=f"application status cannot be set to '{params.status}'",
        )

    statement = (
        update(Application)
        .where(Application.participant_id.in_(params.ids))  # type: ignore
        .where(Application.status == ApplicationStatus.PENDING)
        .values(status=params.status)
    )
    await db.execute(statement)
    await db.commit()

    for id in params.ids:
        await broadcast("registration", params.status.value, participant_id=id)
