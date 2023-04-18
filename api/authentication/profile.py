from fastapi import APIRouter, Depends, Response
from sqlalchemy.ext.asyncio import AsyncSession

from api.session import Session, with_incomplete_profile
from common.database import Participant, ParticipantCreate, ParticipantRead, with_db

router = APIRouter()


@router.post("/complete", name="Complete profile", response_model=ParticipantRead)
async def complete(
    details: ParticipantCreate,
    response: Response,
    session: Session = Depends(with_incomplete_profile),
    db: AsyncSession = Depends(with_db),
):
    participant = Participant.from_orm(details, {"email": session.email})
    db.add(participant)
    await db.commit()

    session.into_authenticated(participant.id)
    await session.set_cookie(response)

    return participant
