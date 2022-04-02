from http import HTTPStatus
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from pydantic import validate_model
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from common.database import Application, ApplicationRead, ApplicationUpdate, with_db

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


@router.get("/{application_id}", response_model=ApplicationRead)
async def read_application(
    application_id: int, db: AsyncSession = Depends(with_db)
) -> ApplicationRead:
    """
    Returns a single application by id
    """
    application = await db.get(Application, application_id)
    if application is None:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="not found")
    return ApplicationRead.from_orm(application)


@router.put("/{application_id}", response_model=ApplicationRead)
async def update_application(
    application_id: int, info: ApplicationUpdate, db: AsyncSession = Depends(with_db)
) -> ApplicationRead:
    """
    Updates an application by id
    """
    application = await db.get(Application, application_id)
    if application is None:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="not found")

    updated_fields = info.dict(exclude_unset=True)
    for key, value in updated_fields.items():
        setattr(application, key, value)

    *_, error = validate_model(Application, application.__dict__)
    if error:
        raise error

    db.add(application)
    await db.commit()

    return ApplicationRead.from_orm(application)


@router.delete("/{application_id}", status_code=HTTPStatus.NO_CONTENT)
async def delete_application(
    application_id: int, db: AsyncSession = Depends(with_db)
) -> None:
    """
    Deletes an application by id
    """
    application = await db.get(Application, application_id)

    if application:
        await db.delete(application)
        await db.commit()
