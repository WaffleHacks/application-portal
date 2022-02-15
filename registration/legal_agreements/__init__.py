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
async def get_list(db: AsyncSession = Depends(with_db)):
    """
    Get a list of all legal agreements that must be acknowledged prior to submitting the participant's application.
    """

    result = await db.execute(select(LegalAgreement))
    return result.scalars().all()


@router.post("/", response_model=LegalAgreementRead)
async def create(agreement: LegalAgreementCreate, db: AsyncSession = Depends(with_db)):
    """
    Create a new legal agreement in the database
    """
    la = LegalAgreement.from_orm(agreement)
    async with db.begin():
        db.add(la)

    return la
