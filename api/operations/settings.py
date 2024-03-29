from datetime import datetime
from http import HTTPStatus
from typing import Generic, TypeVar

from fastapi import APIRouter, Depends
from pydantic.generics import GenericModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from api.permissions import Role, requires_role
from api.session import with_authenticated
from common.database import ServiceSettings, SettingsRead, with_db

T = TypeVar("T")

router = APIRouter()


@router.get(
    "/",
    response_model=SettingsRead,
    name="Get all settings",
    dependencies=[Depends(with_authenticated)],
)
async def read(db: AsyncSession = Depends(with_db)):
    """
    Get a list of all the settings and their values
    """
    result = await db.execute(select(ServiceSettings))

    settings = {}
    for setting in result.scalars().all():
        key = setting.key.value
        entry = getattr(ServiceSettings, key)(db)
        settings[key] = entry.formatter.decode(setting.value)

    return settings


class UpdateRequest(GenericModel, Generic[T]):
    value: T


@router.put(
    "/accepting_applications",
    status_code=HTTPStatus.NO_CONTENT,
    name="Update accepting applications setting",
    dependencies=[Depends(requires_role(Role.Organizer))],
)
async def update_accepting_applications(
    params: UpdateRequest[bool],
    db: AsyncSession = Depends(with_db),
):
    """
    Update the accepting applications setting
    """
    await ServiceSettings.accepting_applications(db).set(params.value)
    await db.commit()


@router.put(
    "/check_in/start",
    status_code=HTTPStatus.NO_CONTENT,
    name="Update check-in start setting",
    dependencies=[Depends(requires_role(Role.Organizer))],
)
async def update_checkin_start(
    params: UpdateRequest[datetime], db: AsyncSession = Depends(with_db)
):
    """
    Update the checkin start setting
    """
    await ServiceSettings.checkin_start(db).set(params.value)
    await db.commit()


@router.put(
    "/check_in/end",
    status_code=HTTPStatus.NO_CONTENT,
    name="Update check-in end setting",
    dependencies=[Depends(requires_role(Role.Organizer))],
)
async def update_checkin_end(
    params: UpdateRequest[datetime], db: AsyncSession = Depends(with_db)
):
    """
    Update the checkin end setting
    """
    await ServiceSettings.checkin_end(db).set(params.value)
    await db.commit()
