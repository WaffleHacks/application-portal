from http import HTTPStatus
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from common.database import (
    Application,
    ApplicationCreate,
    ApplicationRead,
    ApplicationUpdate,
    Participant,
    ParticipantRead,
    with_db,
)
from common.kv import NamespacedClient, with_kv

router = APIRouter()


@router.get("/", response_model=List[ParticipantRead], name="List Participants")
async def list(db: AsyncSession = Depends(with_db)):
    """
    List all the participants in the database
    """
    statement = select(Participant)
    result = await db.execute(statement)
    participants = result.scalars().all()
    return participants


@router.get("/{id}", response_model=ParticipantRead, name="Read participant")
async def read(id: int, db: AsyncSession = Depends(with_db)):
    """
    Get details about an individual participant
    """
    participant = await db.get(Participant, id)
    if participant is None:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="not found")

    return participant


@router.post(
    "/{id}/application",
    response_model=ApplicationRead,
    status_code=HTTPStatus.CREATED,
    tags=["Applications"],
    name="Create application",
)
async def create_application(
    id: int,
    values: ApplicationCreate,
    db: AsyncSession = Depends(with_db),
    kv: NamespacedClient = Depends(with_kv("autosave")),
):
    """
    Create a new application attached to the participant
    """
    participant = await db.get(Participant, id)
    if participant is None:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="not found")

    # Create the application
    application = Application.from_orm(values, {"participant_id": id})
    db.add(application)
    await db.commit()

    # Delete the auto-save data
    await kv.delete(str(id))

    return application


@router.get(
    "/{id}/application/autosave",
    response_model=ApplicationUpdate,
    tags=["Applications"],
    name="Get an in-progress application",
)
async def get_autosave_application(
    id: int, kv: NamespacedClient = Depends(with_kv("autosave"))
):
    """
    Get the data for an in-progress application
    """
    autosave = await kv.get(str(id), is_json=True)
    if autosave:
        return autosave

    raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="not found")


@router.put(
    "/{id}/application/autosave",
    status_code=HTTPStatus.NO_CONTENT,
    tags=["Applications"],
    name="Save an in-progress application",
)
async def autosave_application(
    id: int,
    values: ApplicationUpdate,
    kv: NamespacedClient = Depends(with_kv("autosave")),
):
    """
    Save an in-progress application
    """
    await kv.set(
        str(id),
        values.dict(exclude_unset=True, exclude_none=True, exclude_defaults=True),
    )


@router.delete("/{id}", status_code=HTTPStatus.NO_CONTENT, name="Delete participant")
async def delete(id: int, db: AsyncSession = Depends(with_db)):
    """
    Delete a participant and all their associated data
    """
    participant = await db.get(Participant, id)
    if participant:
        await db.delete(participant)
        await db.commit()
