from http import HTTPStatus
from typing import Any, Dict, List

import nanoid
from algoliasearch.search_index_async import SearchIndexAsync
from fastapi import APIRouter, Depends, HTTPException
from opentelemetry import trace
from pydantic import BaseModel, parse_obj_as, validate_model
from sqlalchemy import func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from common.algolia import with_schools_index
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
tracer = trace.get_tracer(__name__)


class SchoolWithCount(SchoolList):
    count: int


@router.get(
    "/",
    response_model=List[SchoolWithCount],
    name="List schools",
    dependencies=[Depends(is_authenticated)],
)
async def list(db: AsyncSession = Depends(with_db)):
    """
    Get a list of all school.
    """
    statement = (
        select(School.id, School.name, func.count(Application.school_id))
        .join(Application, isouter=True)
        .group_by(School.id)
        .order_by(func.count(Application.school_id).desc())
    )
    result = await db.execute(statement)

    return parse_obj_as(List[SchoolWithCount], result.mappings().all())


@router.post(
    "/",
    response_model=SchoolList,
    status_code=HTTPStatus.CREATED,
    name="Create school",
    dependencies=[Depends(requires_permission(Permission.Organizer))],
)
async def create(
    values: SchoolCreate,
    db: AsyncSession = Depends(with_db),
    index: SearchIndexAsync = Depends(with_schools_index),
):
    """
    Create a new school in the database
    """
    with tracer.start_as_current_span("algolia"):
        id = nanoid.generate(size=8)
        params = values.dict()
        params["objectID"] = id
        index.save_object(params)

    school = School.from_orm(values, update={"id": id})
    async with db.begin():
        db.add(school)

    return school


class MergeRequest(BaseModel):
    from_: str
    into: str

    class Config:
        fields = {"from_": "from"}


@router.put(
    "/merge",
    status_code=HTTPStatus.NO_CONTENT,
    name="Merge schools",
    dependencies=[Depends(requires_permission(Permission.Organizer))],
)
async def merge(
    params: MergeRequest,
    db: AsyncSession = Depends(with_db),
    index: SearchIndexAsync = Depends(with_schools_index),
):
    """
    Merge two schools together. All participants of the `from` school will be migrated and then the school will be
    deleted. The `from` school's name will be added as an alternative for the `to` school.
    """
    # Ensure both schools exist
    school_from = await db.get(
        School,
        params.from_,
        options=[selectinload(School.applications)],
    )
    school_into = await db.get(School, params.into)
    if school_from is None or school_into is None:
        raise HTTPException(
            status_code=HTTPStatus.NOT_FOUND,
            detail="both schools must exist",
        )

    # Update the applications
    for application in school_from.applications:
        application.school = school_into

    # Add the school's name as an alternative
    with tracer.start_as_current_span("update-index"):
        school_into.alternatives = [
            *school_into.alternatives,
            *school_from.alternatives,
            school_from.name,
        ]
        school_into.abbreviations = [
            *school_into.abbreviations,
            *school_from.abbreviations,
        ]
        index.partial_update_object(
            {
                "objectID": school_into.id,
                "alternatives": school_into.alternatives,
                "abbreviations": school_into.abbreviations,
            }
        )

    # Delete the original school
    with tracer.start_as_current_span("delete"):
        index.delete_object(school_from.id)
        await db.delete(school_from)

    db.add(school_into)
    await db.commit()


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
    index: SearchIndexAsync = Depends(with_schools_index),
):
    """
    Update the details of a school by its ID.
    """
    school = await db.get(School, id)
    if school is None:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="not found")

    with tracer.start_as_current_span("update"):
        for key, value in updates.dict().items():
            setattr(school, key, value)

    # Ensure the updated model is valid
    with tracer.start_as_current_span("validate"):
        *_, error = validate_model(School, school.__dict__)
        if error:
            raise error

    # Update the index
    with tracer.start_as_current_span("update-index"):
        obj: Dict[str, Any] = {"objectID": school.id, "name": school.name}
        if updates.abbreviations is not None:
            obj["abbreviations"] = updates.abbreviations
        if updates.alternatives is not None:
            obj["alternatives"] = updates.alternatives
        index.partial_update_object(obj)

    # Save the changes
    db.add(school)
    await db.commit()

    return school
