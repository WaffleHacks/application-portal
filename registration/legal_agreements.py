from http import HTTPStatus
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from pydantic import validate_model
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from common.database import (
    LegalAgreement,
    LegalAgreementCreate,
    LegalAgreementRead,
    LegalAgreementUpdate,
    with_db,
)

router = APIRouter()


@router.get("/", response_model=List[LegalAgreementRead])
async def read(db: AsyncSession = Depends(with_db)):
    """
    Get a list of all legal agreements that must be acknowledged prior to submitting the participant's application.
    """

    result = await db.execute(select(LegalAgreement))
    return result.scalars().all()


@router.post("/", response_model=LegalAgreementRead, status_code=HTTPStatus.CREATED)
async def create(agreement: LegalAgreementCreate, db: AsyncSession = Depends(with_db)):
    """
    Create a new legal agreement in the database
    """
    la = LegalAgreement.from_orm(agreement)
    async with db.begin():
        db.add(la)

    return la


@router.patch("/{agreement_id}")
async def update(
    agreement_id: int,
    updates: LegalAgreementUpdate,
    db: AsyncSession = Depends(with_db),
):
    """
    Update the details of a legal agreement by its ID.
    """
    agreement = await db.get(LegalAgreement, agreement_id)
    if agreement is None:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="not found")

    # Update each field
    updated_fields = updates.dict(exclude_unset=True)
    for key, value in updated_fields.items():
        setattr(agreement, key, value)

    # Ensure the updated model is valid
    *_, error = validate_model(LegalAgreement, agreement.__dict__)
    if error:
        raise error

    # Save the changes
    db.add(agreement)
    await db.commit()

    return agreement


@router.delete("/{agreement_id}", status_code=HTTPStatus.NO_CONTENT)
async def delete(agreement_id: int, db: AsyncSession = Depends(with_db)):
    """
    Attempt to delete a legal agreement by its ID. This method will not fail if the agreement does not exist.
    """
    agreement = await db.get(LegalAgreement, agreement_id)

    # Delete if exists
    if agreement is not None:
        await db.delete(agreement)
        await db.commit()
