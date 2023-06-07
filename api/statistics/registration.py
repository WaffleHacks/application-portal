from datetime import datetime, timedelta
from typing import List, Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import Integer, case, cast, extract, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.sql import Select

from common.database import Application, School, with_db

router = APIRouter()


class Counts(BaseModel):
    accepted: int = 0
    pending: int = 0
    rejected: int = 0


@router.get("/", response_model=Counts)
async def status(db: AsyncSession = Depends(with_db)):
    result = await db.execute(grouped_count("status"))
    return {row.label.value: row.count for row in result.all()}


class StatisticEntry(BaseModel):
    label: str
    count: int


@router.get("/per-day", response_model=List[StatisticEntry])
async def per_day(
    start: Optional[datetime] = None,
    end: Optional[datetime] = None,
    db: AsyncSession = Depends(with_db),
):
    if end is None:
        end = datetime.utcnow()
    if start is None:
        start = end - timedelta(days=7)

    result = await db.execute(
        select(
            func.date_trunc("day", Application.created_at).label("label"),
            func.count(Application.participant_id),
        )
        .where(Application.created_at > start)  # type: ignore
        .where(Application.created_at < end)  # type: ignore
        .group_by("label")
        .order_by("label")
    )
    return [
        StatisticEntry(label=row.label.date().isoformat(), count=row.count)
        for row in result.all()
    ]


@router.get("/age", response_model=List[StatisticEntry])
async def age(db: AsyncSession = Depends(with_db)):
    result = await db.execute(
        select(
            cast(
                extract("year", func.age(Application.date_of_birth)).label("label"),
                Integer,
            ),
            func.count("label").label("count"),
        )
        .group_by("label")
        .order_by("label")
    )
    return result.all()


class SchoolStatisticEntry(BaseModel):
    id: str
    name: str
    count: int


@router.get("/school", response_model=List[SchoolStatisticEntry])
async def school(db: AsyncSession = Depends(with_db)):
    result = await db.execute(
        select(School.id, School.name, func.count(School.id))
        .join(Application.school)
        .group_by(School.id, School.name)
    )
    return result.all()


@router.get("/experience", response_model=List[StatisticEntry])
async def experience(db: AsyncSession = Depends(with_db)):
    result = await db.execute(
        select(
            case(
                (Application.hackathons_attended == 0, "None"),
                (Application.hackathons_attended.in_([1, 2]), "Beginner (1-2)"),  # type: ignore
                (Application.hackathons_attended.in_([3, 4, 5]), "Intermediate (3-5)"),  # type: ignore
                else_="Expert (6+)",
            ).label("label"),
            func.count(Application.participant_id),
        ).group_by("label")
    )
    return result.all()


@router.get("/graduation-year", response_model=List[StatisticEntry])
async def graduation_year(db: AsyncSession = Depends(with_db)):
    statement = grouped_count("graduation_year").order_by(Application.graduation_year)
    result = await db.execute(statement)
    return result.all()


@router.get("/country", response_model=List[StatisticEntry])
async def country(db: AsyncSession = Depends(with_db)):
    result = await db.execute(grouped_count("country"))
    return result.all()


@router.get("/gender", response_model=List[StatisticEntry])
async def gender(db: AsyncSession = Depends(with_db)):
    result = await db.execute(grouped_count("gender"))
    return [
        StatisticEntry(label=row.label.value, count=row.count) for row in result.all()
    ]


@router.get("/level-of-study", response_model=List[StatisticEntry])
async def level_of_study(db: AsyncSession = Depends(with_db)):
    result = await db.execute(grouped_count("level_of_study"))
    return result.all()


@router.get("/major", response_model=List[StatisticEntry])
async def major(db: AsyncSession = Depends(with_db)):
    result = await db.execute(grouped_count("major"))
    return result.all()


@router.get("/race-ethnicity", response_model=List[StatisticEntry])
async def race_ethnicity(db: AsyncSession = Depends(with_db)):
    result = await db.execute(grouped_count("race_ethnicity"))
    return [
        StatisticEntry(label=row.label.value, count=row.count) for row in result.all()
    ]


def grouped_count(column_name: str) -> Select:
    column = getattr(Application, column_name)
    return select(column.label("label"), func.count(column)).group_by(column)
