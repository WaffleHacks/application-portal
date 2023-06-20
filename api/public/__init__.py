from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from common.database import Event, with_db

router = APIRouter(tags=["Public"])


class PublicEvent(BaseModel):
    id: int
    name: str
    description: Optional[str]

    start: datetime
    end: datetime

    def __init__(self, valid_from: datetime, valid_until: datetime, **kwargs):
        super().__init__(start=valid_from, end=valid_until, **kwargs)


@router.get("/events", name="Get the event schedule", response_model=List[PublicEvent])
async def events(db: AsyncSession = Depends(with_db)):
    """
    Get the public event schedule
    """
    result = await db.execute(
        select(Event).where(Event.enabled).order_by(Event.valid_from)
    )
    return result.scalars().all()
