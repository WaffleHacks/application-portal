from http import HTTPStatus
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from pydantic import validate_model
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from common.authentication import is_authenticated
from common.database import (
    Application,
    School,
    SchoolCreate,
    SchoolList,
    SchoolRead,
    SchoolUpdate,
    with_db,
)
from common.permissions import Permission, requires_permission

router = APIRouter()


@router.get(
    "/",
    response_model=List[SchoolList],
    name="List schools",
    dependencies=[Depends(is_authenticated)],
)
async def list(db: AsyncSession = Depends(with_db)):
    """
    Get a list of all school.
    """
    statement = select(School).order_by(School.name)
    result = await db.execute(statement)
    return result.scalars().all()


@router.post(
    "/",
    response_model=SchoolList,
    status_code=HTTPStatus.CREATED,
    name="Create school",
    dependencies=[Depends(requires_permission(Permission.Organizer))],
)
async def create(values: SchoolCreate, db: AsyncSession = Depends(with_db)):
    """
    Create a new school in the database
    """
    school = School.from_orm(values)
    async with db.begin():
        db.add(school)

    return school


@router.get(
    "/{id}",
    name="Read school",
    response_model=SchoolRead,
    dependencies=[Depends(requires_permission(Permission.Organizer))],
)
async def read(id: str, db: AsyncSession = Depends(with_db)):
    """
    Get a school's details and a list of all associated applications
    """
    school = await db.get(
        School,
        id,
        options=[
            selectinload(School.applications).selectinload(Application.participant)
        ],
    )
    if school is None:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="not found")

    return school


@router.patch(
    "/{id}",
    name="Update school",
    dependencies=[Depends(requires_permission(Permission.Organizer))],
)
async def update(
    id: str,
    updates: SchoolUpdate,
    db: AsyncSession = Depends(with_db),
):
    """
    Update the details of a school by its ID.
    """
    school = await db.get(School, id)
    if school is None:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="not found")

    # Update each field
    updated_fields = updates.dict(exclude_unset=True)
    for key, value in updated_fields.items():
        setattr(school, key, value)

    # Ensure the updated model is valid
    *_, error = validate_model(School, school.__dict__)
    if error:
        raise error

    # Save the changes
    db.add(school)
    await db.commit()

    return school


@router.delete(
    "/{id}",
    status_code=HTTPStatus.NO_CONTENT,
    name="Delete school",
    dependencies=[Depends(requires_permission(Permission.Organizer))],
)
async def delete(id: str, db: AsyncSession = Depends(with_db)):
    """
    Attempt to delete a school by its ID. This method will not fail if the agreement does not exist.
    """
    school = await db.get(School, id)

    # Delete if exists
    if school is not None:
        await db.delete(school)
        await db.commit()
