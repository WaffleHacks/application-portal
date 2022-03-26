from http import HTTPStatus
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from pydantic import validate_model
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from common.database import (
    Application,
    ApplicationCreate,
    ApplicationRead,
    ApplicationUpdate,
    with_db,
)

router = APIRouter()


@router.get("/", response_model=List[ApplicationRead])
async def list_applications(
    db: AsyncSession = Depends(with_db),
) -> List[ApplicationRead]:
    """
    List all applications in db
    """
    statement = select(Application)
    result = await db.execute(statement)
    applications = result.scalars().all()
    return applications


@router.post("/", response_model=ApplicationRead, status_code=HTTPStatus.CREATED)
async def create_application(
    info: ApplicationCreate, db: AsyncSession = Depends(with_db)
) -> Application:
    """
    Create a new application
    """
    application = Application.from_orm(info)

    if not application.hard_verify():
        raise HTTPException(
            status_code=HTTPStatus.UNAUTHORIZED, detail="Must be over 13 years old"
        )
    if not application.soft_verify():
        print("Failed soft verification")

    async with db.begin():
        db.add(application)
    return application


@router.get("/{id}", response_model=Application)
async def read_application(id: int, db: AsyncSession = Depends(with_db)) -> Application:
    """
    Returns a single application by id
    """
    application = await db.get(Application, id)
    if application is None:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="not found")
    return application


@router.put("/{id}", response_model=Application)
async def update_application(
    id: int, info: ApplicationUpdate, db: AsyncSession = Depends(with_db)
) -> Application:
    """
    Updates an application by id
    """
    application = await db.get(Application, id)
    if application is None:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="not found")

    updated_fields = info.dict(exclude_unset=True)
    for key, value in updated_fields.items():
        setattr(application, key, value)

    *_, error = validate_model(Application, application.__dict__)
    if error:
        raise error

    if not application.hard_verify():
        raise HTTPException(
            status_code=HTTPStatus.UNAUTHORIZED, detail="Must be over 13 years old"
        )
    if not application.soft_verify():
        print("Failed soft verification")
    
    db.add(application)
    await db.commit()

    return application


@router.delete("/{id}")
async def delete_application(id: int, db: AsyncSession = Depends(with_db)) -> None:
    """
    Deletes an application by id
    """
    application = await db.get(Application, id)

    if application:
        await db.delete(application)
        await db.commit()
