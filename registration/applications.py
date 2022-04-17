from http import HTTPStatus
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from pydantic import validate_model
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from common import Permission, requires_permission, with_user_id
from common.database import (
    Application,
    ApplicationAutosave,
    ApplicationCreate,
    ApplicationRead,
    ApplicationUpdate,
    with_db,
)
from common.kv import NamespacedClient, with_kv

router = APIRouter()


@router.get(
    "/",
    response_model=List[ApplicationRead],
    name="List applications",
    dependencies=[Depends(requires_permission(Permission.ApplicationsRead))],
)
async def list(
    permission: str = Depends(
        requires_permission(
            Permission.ApplicationsRead, Permission.ApplicationsReadPublic
        )
    ),
    db: AsyncSession = Depends(with_db),
) -> List[ApplicationRead]:
    """
    List all applications in db
    """
    statement = select(Application)
    if Permission.ApplicationsReadPublic.matches(permission):
        statement = statement.where(Application.share_information)

    result = await db.execute(statement)
    applications = result.scalars().all()
    return applications


@router.post(
    "/",
    response_model=ApplicationRead,
    status_code=HTTPStatus.CREATED,
    name="Create application",
    dependencies=[Depends(requires_permission(Permission.ApplicationsCreate))],
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
    response_model=ApplicationAutosave,
    name="Get an in-progress application",
    dependencies=[Depends(requires_permission(Permission.ApplicationsCreate))],
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
    dependencies=[Depends(requires_permission(Permission.ApplicationsCreate))],
)
async def autosave_application(
    values: ApplicationAutosave,
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
        await kv.set(str(id), values.dict())


@router.get("/{id}", response_model=ApplicationRead, name="Read application")
async def read(
    id: str,
    requester_id: str = Depends(with_user_id),
    permission: str = Depends(
        requires_permission(
            Permission.ApplicationsRead,
            Permission.ApplicationsReadSelf,
            Permission.ApplicationsReadPublic,
        )
    ),
    db: AsyncSession = Depends(with_db),
):
    """
    Returns a single application by id
    """
    if Permission.ApplicationsReadSelf.matches(permission) and id != requester_id:
        raise HTTPException(
            status_code=HTTPStatus.FORBIDDEN, detail="invalid permissions"
        )

    application = await db.get(Application, id)
    if application is None:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="not found")
    elif (
        Permission.ApplicationsReadPublic.matches(permission)
        and not application.share_information
    ):
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="not found")

    return application


@router.put("/{id}", response_model=ApplicationRead, name="Update application")
async def update(
    id: str,
    info: ApplicationUpdate,
    requester_id: str = Depends(with_user_id),
    permission: str = Depends(
        requires_permission(
            Permission.ApplicationsEdit, Permission.ApplicationsEditSelf
        )
    ),
    db: AsyncSession = Depends(with_db),
):
    """
    Updates the requester's application
    """
    if Permission.ApplicationsEditSelf.matches(permission) and id != requester_id:
        raise HTTPException(
            status_code=HTTPStatus.FORBIDDEN, detail="invalid permissions"
        )

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
async def delete(
    id: str,
    requester_id: str = Depends(with_user_id),
    permission: str = Depends(
        requires_permission(
            Permission.ApplicationsEdit, Permission.ApplicationsEditSelf
        )
    ),
    db: AsyncSession = Depends(with_db),
) -> None:
    """
    Deletes an application by id
    """
    if Permission.ApplicationsEditSelf.matches(permission) and id != requester_id:
        raise HTTPException(
            status_code=HTTPStatus.FORBIDDEN, detail="invalid permissions"
        )

    application = await db.get(Application, id)
    if application:
        await db.delete(application)
        await db.commit()
