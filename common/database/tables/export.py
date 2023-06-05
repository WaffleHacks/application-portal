from datetime import datetime
from enum import Enum
from typing import List, Optional

from sqlalchemy import Column
from sqlalchemy import Enum as SQLEnum
from sqlmodel import Field, SQLModel

from .types import TimeStamp


class Status(Enum):
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class ExportBase(SQLModel):
    name: str
    requester: str

    file: Optional[str]

    status: Status = Field(
        sa_column=Column(
            SQLEnum(Status), nullable=False, server_default=Status.PROCESSING.name
        ),
        default=Status.PROCESSING,
    )

    created_at: datetime = Field(
        sa_column=Column(
            TimeStamp(timezone=True),
            default=datetime.now,
            nullable=False,
        ),
        default_factory=datetime.now,
    )
    finished_at: Optional[datetime] = Field(
        sa_column=Column(TimeStamp(timezone=True), nullable=True)
    )


class Export(ExportBase, table=True):
    __tablename__ = "exports"

    id: Optional[int] = Field(default=None, primary_key=True, nullable=False)


class ExportCreate(SQLModel):
    name: str

    # These are used by the export task
    table: str
    columns: List[str]


class ExportList(SQLModel):
    id: int
    name: str
    requester: str

    status: Status

    created_at: datetime
    finished_at: Optional[datetime]
