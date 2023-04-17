from http import HTTPStatus

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from common.authentication import is_internal
from common.database import Participant, ParticipantList, with_db

router = APIRouter()


@router.get(
    "/{id}",
    response_model=ParticipantList,
    name="Read participant",
    dependencies=[Depends(is_internal)],
)
async def read(id: str, db: AsyncSession = Depends(with_db)):
    """
    Get details about an individual participant
    """
    participant = await db.get(Participant, id)
    if participant is None:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="not found")

    return participant
