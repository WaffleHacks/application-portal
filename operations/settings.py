from http import HTTPStatus
from typing import Generic, TypeVar

from fastapi import APIRouter, Depends
from pydantic.generics import GenericModel
from sqlalchemy.ext.asyncio import AsyncSession

from common.authentication import is_authenticated
from common.database import ServiceSettings, SettingsRead, with_db
from common.permissions import Permission, requires_permission

T = TypeVar("T")

router = APIRouter()


@router.get(
    "/",
    response_model=SettingsRead,
    name="Get all settings",
    dependencies=[Depends(is_authenticated)],
)
async def read(db: AsyncSession = Depends(with_db)):
    """
    Get a list of all the settings and their values
    """
    return SettingsRead(
        accepting_applications=await ServiceSettings.accepting_applications(db).get(),
    )


class UpdateRequest(GenericModel, Generic[T]):
    value: T


@router.put(
    "/accepting_applications",
    status_code=HTTPStatus.NO_CONTENT,
    name="Update accepting applications setting",
    dependencies=[Depends(requires_permission(Permission.Organizer))],
)
async def update(
    params: UpdateRequest[bool],
    db: AsyncSession = Depends(with_db),
):
    """
    Update the accepting applications setting
    """
    await ServiceSettings.accepting_applications(db).set(params.value)
    await db.commit()
