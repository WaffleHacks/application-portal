from http import HTTPStatus

from fastapi import APIRouter, Depends, Response
from sqlalchemy.ext.asyncio import AsyncSession

from api.session import Session, with_incomplete_profile, with_user_id
from api.settings import SETTINGS
from common.database import (
    Participant,
    ParticipantCreate,
    ParticipantRead,
    ParticipantUpdate,
    Role,
    with_db,
)
from common.tasks import broadcast

router = APIRouter()


@router.post("/complete", name="Complete profile", response_model=ParticipantRead)
async def complete(
    details: ParticipantCreate,
    response: Response,
    session: Session = Depends(with_incomplete_profile),
    db: AsyncSession = Depends(with_db),
):
    participant = Participant.from_orm(details, {"email": session.email})
    if participant.email.endswith("@" + SETTINGS.organizer_email_domain):
        participant.role = Role.Organizer

    db.add(participant)
    await db.commit()

    session.into_authenticated(participant.id)
    await session.set_cookie(response)

    await broadcast("authentication", "sign_up", participant_id=participant.id)

    return participant


@router.patch("/", name="Update profile", status_code=HTTPStatus.NO_CONTENT)
async def update(
    details: ParticipantUpdate,
    user: int = Depends(with_user_id),
    db: AsyncSession = Depends(with_db),
):
    participant = await db.get(Participant, user)
    assert participant is not None

    updated_fields = details.dict(exclude_unset=True)
    for key, value in updated_fields.items():
        setattr(participant, key, value)

    db.add(participant)
    await db.commit()
