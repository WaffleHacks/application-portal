from datetime import datetime
from enum import Enum
from typing import Dict, Optional

from pydantic import validator
from sqlalchemy import Column
from sqlalchemy import Enum as SQLEnum
from sqlmodel import Field, SQLModel

from .types import TimeStamp

# The valid exports for each table
VALID_EXPORTS = {
    "applications": {"all", "mlh-registered", "resume-book"},
    "attendance": {"check-ins", "events", "event-feedback"},
}


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
    kind: str

    @validator("table")
    def exportable_table(cls, table: str) -> str:
        if table not in VALID_EXPORTS:
            raise ValueError(f"table {table!r} cannot be exported")

        return table

    @validator("kind")
    def valid_kind_for_table(cls, kind: str, values: Dict[str, str]):
        table = values.get("table")
        if not table:
            return kind

        if kind not in VALID_EXPORTS.get(table, set()):
            raise ValueError("unknown export for table")

        return kind


class ExportList(SQLModel):
    id: int
    name: str
    requester: str

    status: Status

    created_at: datetime
    finished_at: Optional[datetime]
