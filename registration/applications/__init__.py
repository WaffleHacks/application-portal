from http import HTTPStatus
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from common.database import (
    Application, 
    ApplicationCreate, 
    ApplicationRead,
    ApplicationUpdate,
    with_db
)

router = APIRouter()


@router.get("/", response_model=List[ApplicationRead])
async def list_applications(db: AsyncSession = Depends(with_db)) -> List[ApplicationRead]:
    statement = select(Application)
    result = await db.execute(statement)
    applications = result.scalars().all()
    return applications


@router.post("/", response_model=ApplicationRead, status_code=HTTPStatus.CREATED)
async def create_application(info: ApplicationCreate, db: AsyncSession = Depends(with_db)) -> ApplicationRead:
    new_app = Application.from_orm(info)
    async with db.begin():
        db.add(new_app)
    return new_app


@router.get("/{id}", response_model=Application)
async def read_application(id) -> Application:
    return


@router.put("/{id}", response_model=Application)
async def update_application(id, info) -> Application:
    return


@router.delete("/{id}")
async def delete_application(id):
    return
