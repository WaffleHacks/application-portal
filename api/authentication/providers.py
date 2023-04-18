from http import HTTPStatus
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from api.permissions import is_admin
from api.session import Session, with_session
from common.database import (
    Participant,
    Provider,
    ProviderCreate,
    ProviderList,
    ProviderRead,
    ProviderUpdate,
    with_db,
)

router = APIRouter()


@router.get("/", name="List providers", response_model=List[ProviderList])
async def list(
    session: Session = Depends(with_session),
    db: AsyncSession = Depends(with_db),
):
    """
    List all the login providers
    """
    statement = select(Provider)
    if not session.id:
        statement = statement.where(Provider.enabled == True)
    else:
        participant = await db.get(Participant, session.id)
        assert participant is not None

        if not participant.is_admin:
            statement = statement.where(Provider.enabled == True)

    result = await db.execute(statement)
    providers = result.scalars().all()
    return providers


@router.post(
    "/",
    name="Create provider",
    response_model=ProviderRead,
    dependencies=[Depends(is_admin)],
)
async def create(details: ProviderCreate, db: AsyncSession = Depends(with_db)):
    provider = Provider.from_orm(details)
    db.add(provider)
    await db.commit()

    return provider


@router.get(
    "/{slug}",
    name="Read provider",
    response_model=ProviderRead,
    dependencies=[Depends(is_admin)],
)
async def read(slug: str, db: AsyncSession = Depends(with_db)):
    provider = await db.get(Provider, slug)
    if provider is None:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="not found")

    return provider


@router.patch(
    "/{slug}",
    name="Update provider",
    status_code=HTTPStatus.NO_CONTENT,
    dependencies=[Depends(is_admin)],
)
async def update(
    slug: str,
    details: ProviderUpdate,
    db: AsyncSession = Depends(with_db),
):
    provider = await db.get(Provider, slug)
    if provider is None:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="not found")

    updated_fields = details.dict(exclude_unset=True)
    for key, value in updated_fields.items():
        setattr(provider, key, value)

    db.add(provider)
    await db.commit()


@router.delete(
    "/{slug}",
    name="Delete provider",
    status_code=HTTPStatus.NO_CONTENT,
    dependencies=[Depends(is_admin)],
)
async def delete(slug: str, db: AsyncSession = Depends(with_db)):
    provider = await db.get(Provider, slug)
    if provider:
        await db.delete(provider)
        await db.commit()
