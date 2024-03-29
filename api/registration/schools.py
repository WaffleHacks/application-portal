from http import HTTPStatus
from typing import List

import nanoid
from algoliasearch.search_index_async import SearchIndexAsync
from fastapi import APIRouter, Depends, HTTPException
from opentelemetry import trace
from pydantic import BaseModel, parse_obj_as, validate_model
from sqlalchemy import delete, func, or_, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from api.algolia import with_schools_index
from api.permissions import Role, requires_role
from api.session import with_authenticated
from common.database import (
    Application,
    School,
    SchoolCreate,
    SchoolList,
    SchoolRead,
    SchoolUpdate,
    with_db,
)

router = APIRouter()
tracer = trace.get_tracer(__name__)


class SchoolWithCount(SchoolList):
    count: int


@router.get(
    "/",
    response_model=List[SchoolWithCount],
    name="List schools",
    dependencies=[Depends(with_authenticated)],
)
async def list_schools(db: AsyncSession = Depends(with_db)):
    """
    Get a list of all school.
    """
    statement = (
        select(
            School.id,
            School.name,
            School.needs_review,
            func.count(Application.school_id),
        )
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
    dependencies=[Depends(requires_role(Role.Organizer))],
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
    db.add(school)
    await db.commit()

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
    dependencies=[Depends(requires_role(Role.Organizer))],
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
    if params.from_ == params.into:
        raise HTTPException(
            status_code=HTTPStatus.BAD_REQUEST,
            detail="cannot merge a school into itself",
        )

    # Ensure both schools exist
    result = await db.execute(
        select(School).where(or_(School.id == params.from_, School.id == params.into))
    )
    found = list(map(lambda r: r.School, result.all()))

    try:
        school_from = next(filter(lambda s: s.id == params.from_, found))
        school_into = next(filter(lambda s: s.id == params.into, found))
    except StopIteration:
        raise HTTPException(
            status_code=HTTPStatus.NOT_FOUND,
            detail="both schools must exist",
        )

    # Update the applications
    await db.execute(
        update(Application)
        .where(Application.school_id == school_from.id)
        .values(school_id=school_into.id)
    )

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
    with tracer.start_as_current_span("delete-index"):
        index.delete_object(school_from.id)
    await db.execute(delete(School).where(School.id == school_from.id))

    db.add(school_into)
    await db.commit()


@router.get(
    "/{id}",
    name="Read school",
    response_model=SchoolRead,
    dependencies=[Depends(requires_role(Role.Organizer))],
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
    status_code=HTTPStatus.NO_CONTENT,
    dependencies=[Depends(requires_role(Role.Organizer))],
)
async def update_school(
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
        for key, value in updates.dict(exclude_unset=True).items():
            setattr(school, key, value)

    # Ensure the updated model is valid
    with tracer.start_as_current_span("validate"):
        *_, error = validate_model(School, school.__dict__)
        if error:
            raise error

    # Update the index
    with tracer.start_as_current_span("update-index"):
        index.partial_update_object(
            {
                "objectID": school.id,
                "name": school.name,
                "abbreviations": school.abbreviations,
                "alternatives": school.alternatives,
            }
        )

    # Save the changes
    db.add(school)
    await db.commit()

    return school
