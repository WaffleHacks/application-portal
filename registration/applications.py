from http import HTTPStatus
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from pydantic import validate_model
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from common.authentication import with_user_id
from common.database import (
    Application,
    ApplicationCreate,
    ApplicationRead,
    ApplicationUpdate,
    with_db,
)
from common.kv import NamespacedClient, with_kv

router = APIRouter()


@router.get("/", response_model=List[ApplicationRead], name="List applications")
async def list(
    db: AsyncSession = Depends(with_db),
) -> List[ApplicationRead]:
    """
    List all applications in db
    """
    statement = select(Application)
    result = await db.execute(statement)
    applications = result.scalars().all()
    return applications


@router.post(
    "/",
    response_model=ApplicationRead,
    status_code=HTTPStatus.CREATED,
    name="Create application",
)
async def create_application(
    values: ApplicationCreate,
    id: str = Depends(with_user_id),
    db: AsyncSession = Depends(with_db),
    kv: NamespacedClient = Depends(with_kv("autosave")),
):
    """
    Create a new application attached to the currently authenticated participant
    """
    application = Application.from_orm(values, {"participant_id": id})
    db.add(application)
    await db.commit()

    # Delete the auto-save data
    await kv.delete(str(id))

    return application


@router.get(
    "/autosave",
    response_model=ApplicationUpdate,
    name="Get an in-progress application",
)
async def get_autosave_application(
    id: str = Depends(with_user_id), kv: NamespacedClient = Depends(with_kv("autosave"))
):
    """
    Get the data for an in-progress application
    """
    autosave = await kv.get(str(id), is_json=True)
    if autosave:
        return autosave

    raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="not found")


@router.put(
    "/autosave",
    status_code=HTTPStatus.NO_CONTENT,
    name="Save an in-progress application",
)
async def autosave_application(
    values: ApplicationUpdate,
    id: str = Depends(with_user_id),
    db: AsyncSession = Depends(with_db),
    kv: NamespacedClient = Depends(with_kv("autosave")),
):
    """
    Save an in-progress application
    """
    # Prevent auto-saving if already applied
    application = await db.get(Application, id)
    if not application:
        await kv.set(
            str(id),
            values.dict(exclude_unset=True, exclude_none=True, exclude_defaults=True),
        )


@router.get("/{id}", response_model=ApplicationRead, name="Read application")
async def read(id: str, db: AsyncSession = Depends(with_db)):
    """
    Returns a single application by id
    """
    application = await db.get(Application, id)
    if application is None:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="not found")
    return application


@router.put("/{id}", response_model=ApplicationRead, name="Update application")
async def update(id: str, info: ApplicationUpdate, db: AsyncSession = Depends(with_db)):
    """
    Updates an application by id
    """
    application = await db.get(Application, id)
    if application is None:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="not found")

    updated_fields = info.dict(exclude_unset=True)
    for key, value in updated_fields.items():
        setattr(application, key, value)

    *_, error = validate_model(Application, application.__dict__)
    if error:
        raise error

    db.add(application)
    await db.commit()

    return application


@router.delete("/{id}", status_code=HTTPStatus.NO_CONTENT, name="Delete application")
async def delete(id: str, db: AsyncSession = Depends(with_db)) -> None:
    """
    Deletes an application by id
    """
    application = await db.get(Application, id)

    if application:
        await db.delete(application)
        await db.commit()
