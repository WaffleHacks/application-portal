from http import HTTPStatus
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from pydantic import validate_model
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from common.database import School, SchoolCreate, SchoolRead, SchoolUpdate, with_db

router = APIRouter()


@router.get("/", response_model=List[SchoolRead])
async def read(db: AsyncSession = Depends(with_db)):
    """
    Get a list of all school.
    """

    result = await db.execute(select(School))
    return result.scalars().all()


@router.post("/", response_model=SchoolRead, status_code=HTTPStatus.CREATED)
async def create(school_create: SchoolCreate, db: AsyncSession = Depends(with_db)):
    """
    Create a new school in the database
    """
    school = School.from_orm(school_create)
    async with db.begin():
        db.add(school)

    return school


@router.patch("/{school_id}")
async def update(
    school_id: int,
    updates: SchoolUpdate,
    db: AsyncSession = Depends(with_db),
):
    """
    Update the details of a school by its ID.
    """
    school = await db.get(School, school_id)
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


@router.delete("/{school_id}", status_code=HTTPStatus.NO_CONTENT)
async def delete(school_id: int, db: AsyncSession = Depends(with_db)):
    """
    Attempt to delete a school by its ID. This method will not fail if the agreement does not exist.
    """
    school = await db.get(School, school_id)

    # Delete if exists
    if school is not None:
        await db.delete(school)
        await db.commit()
