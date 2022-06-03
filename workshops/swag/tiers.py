from http import HTTPStatus
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from pydantic import validate_model
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from common.database import (
    SwagTier,
    SwagTierCreate,
    SwagTierList,
    SwagTierRead,
    SwagTierUpdate,
    with_db,
)
from common.permissions import Permission, requires_permission

router = APIRouter(dependencies=[Depends(requires_permission(Permission.Organizer))])


@router.get("/", name="List swag tiers", response_model=List[SwagTierList])
async def list(db: AsyncSession = Depends(with_db)):
    """
    Get a list of all the swag tiers
    """
    result = await db.execute(
        select(SwagTier).order_by(SwagTier.required_attendance.desc())  # type: ignore
    )
    return result.scalars().all()


@router.post("/", name="Create swag tier", response_model=SwagTierRead)
async def create(params: SwagTierCreate, db: AsyncSession = Depends(with_db)):
    """
    Create a new swag tier
    """
    tier = SwagTier.from_orm(params)
    db.add(tier)
    await db.commit()

    return {**tier.dict(), "participants": []}


@router.get("/{id}", name="Read swag tier", response_model=SwagTierRead)
async def read(id: int, db: AsyncSession = Depends(with_db)):
    """
    Get the details about a swag tier, including the participants with that tier
    """
    tier = await db.get(SwagTier, id, options=[selectinload(SwagTier.participants)])
    if tier is None:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="not found")

    return tier


@router.patch("/{id}", name="Update swag tier", status_code=HTTPStatus.NO_CONTENT)
async def update(id: int, params: SwagTierUpdate, db: AsyncSession = Depends(with_db)):
    """
    Update the details of a swag tier
    """
    tier = await db.get(SwagTier, id)
    if tier is None:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="not found")

    updated_fields = params.dict(exclude_unset=True)
    for key, value in updated_fields.items():
        setattr(tier, key, value)

    *_, error = validate_model(SwagTier, tier.__dict__)
    if error:
        raise error

    db.add(tier)
    await db.commit()


@router.delete("/{id}", name="Delete swag tier", status_code=HTTPStatus.NO_CONTENT)
async def delete(id: int, db: AsyncSession = Depends(with_db)):
    """
    Delete a swag tier permantently
    """
    tier = await db.get(SwagTier, id)
    if tier is not None:
        await db.delete(tier)
        await db.commit()
