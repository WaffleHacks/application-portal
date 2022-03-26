from http import HTTPStatus
from typing import List

from applications import read_application
from fastapi import APIRouter, Depends, HTTPException
from pydantic import validate_model
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from common.database import Application, ApplicationRead, with_db

router = APIRouter()


@router.get("/", response_model=List[ApplicationRead])
async def list_verification_queue(
    db: AsyncSession = Depends(with_db),
) -> List[ApplicationRead]:
    """
    List all applications in db that require soft verification
    """
    statement = select(Application).where(Application.verified == False)
    result = await db.execute(statement)
    applications = result.scalars().all()
    return applications


@router.get("/{id}", response_model=Application)
async def read_application(id: int, db: AsyncSession = Depends(with_db)) -> Application:
    return await read_application(id, db)


@router.put("/{id}", response_model=Application)
async def validate_application(
    id: int, db: AsyncSession = Depends(with_db)
) -> Application:
    """
    Update soft verification for application
    """
    application = await db.get(Application, id)
    if application is None:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="not found")

    application.verified = True

    *_, error = validate_model(Application, application.__dict__)
    if error:
        raise error
    
    db.add(application)
    await db.commit()

    return application
