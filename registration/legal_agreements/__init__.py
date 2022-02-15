from http import HTTPStatus
from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from common.database import (
    LegalAgreement,
    LegalAgreementCreate,
    LegalAgreementRead,
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
