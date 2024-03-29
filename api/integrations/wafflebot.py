from datetime import datetime
from http import HTTPStatus
from typing import List, Literal, Optional, Union

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel
from sqlalchemy import update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from api.settings import SETTINGS
from common.database import (
    Application,
    ApplicationStatus,
    Event,
    Participant,
    ServiceSettings,
    with_db,
)

token_scheme = HTTPBearer()


def requires_key(key: HTTPAuthorizationCredentials = Depends(token_scheme)):
    """
    Check that the provided bearer token is valid
    """
    if key.credentials != SETTINGS.wafflebot_key:
        raise HTTPException(status_code=HTTPStatus.UNAUTHORIZED, detail="unauthorized")


router = APIRouter(dependencies=[Depends(requires_key)])


class StatusResponse(BaseModel):
    id: int
    status: ApplicationStatus


@router.get(
    "/status",
    name="Check participant application status",
    response_model=Optional[StatusResponse],
)
async def check_status(email: str, db: AsyncSession = Depends(with_db)):
    """
    Lookup a participant's application status by email
    """
    result = await db.execute(
        select(Participant)
        .where(Participant.email == email)
        .options(selectinload(Participant.application))
    )
    participant: Optional[Participant] = result.scalar_one_or_none()

    if participant is None or participant.application is None:
        return None

    return StatusResponse(id=participant.id, status=participant.application.status)


class LookupResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: str
    link: str


@router.get(
    "/lookup",
    name="Lookup a participant's application",
    response_model=Optional[LookupResponse],
)
async def lookup(
    id: Optional[int] = None,
    email: Optional[str] = None,
    db: AsyncSession = Depends(with_db),
):
    """
    Lookup a participant's information by either ID or email. If both are specified, ID takes precedence.
    """
    if id is not None:
        participant = await db.get(Participant, id)
    elif email is not None:
        result = await db.execute(select(Participant).where(Participant.email == email))
        participant = result.scalar_one_or_none()
    else:
        raise HTTPException(
            status_code=HTTPStatus.BAD_REQUEST,
            detail="one of id or email is required",
        )

    if participant is None:
        return participant

    return LookupResponse(
        id=participant.id,
        first_name=participant.first_name,
        last_name=participant.last_name,
        email=participant.email,
        link=f"{SETTINGS.app_url}/applications/{participant.id}",
    )


class CheckInRequest(BaseModel):
    participant: Union[int, List[int]]


@router.put(
    "/check-in",
    name="Mark a participant as checked-in",
    status_code=HTTPStatus.NO_CONTENT,
)
async def check_in(request: CheckInRequest, db: AsyncSession = Depends(with_db)):
    """
    Mark a participant as checked-in from Discord
    """

    if not await ServiceSettings.can_check_in(db):
        raise HTTPException(
            status_code=HTTPStatus.BAD_REQUEST,
            detail="check in not open",
        )

    if type(request.participant) == int:
        request.participant = [request.participant]

    await db.execute(
        (
            update(Participant)
            .values(checked_in=True)
            .where(Participant.id == Application.participant_id)
            .where(Application.status == ApplicationStatus.ACCEPTED)
            .where(Participant.id.in_(request.participant))  # type: ignore
            .execution_options(synchronize_session=False)
        )
    )
    await db.commit()


class EventDetails(BaseModel):
    id: int
    name: str
    description: Optional[str]

    url: str

    start: datetime
    end: datetime

    def __init__(
        self,
        id: int,
        name: str,
        valid_from: datetime,
        valid_until: datetime,
        code: str,
        link: str,
        track_attendance: bool,
        **kwargs,
    ):
        if track_attendance or link is None:
            url = f"{SETTINGS.app_url}/workshop/{code}"
        else:
            url = link

        super().__init__(
            id=id,
            name=name,
            start=valid_from,
            end=valid_until,
            url=url,
            **kwargs,
        )


@router.get("/events", name="List events", response_model=List[EventDetails])
async def events(db: AsyncSession = Depends(with_db)):
    """
    Get a list of all workshops
    """
    result = await db.execute(
        select(Event).where(Event.enabled).order_by(Event.valid_from)
    )
    return result.scalars().all()


@router.get(
    "/events/{key}",
    name="Get event details by a key",
    response_model=Optional[EventDetails],
)
async def event_by(
    key: Union[int, str],
    by: Union[Literal["id"], Literal["code"]] = "id",
    db: AsyncSession = Depends(with_db),
):
    """
    Get the details of an event by its ID or code
    """

    if by == "id":
        if type(key) != int:
            raise HTTPException(
                status_code=HTTPStatus.BAD_REQUEST,
                detail="key must be an integer",
            )

        event = await db.get(Event, key)
        if event is None or not event.enabled:
            return None

        return event

    elif by == "code":
        result = await db.execute(
            select(Event).where(Event.code == str(key), Event.enabled)
        )
        return result.scalar_one_or_none()

    return None
