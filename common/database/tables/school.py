from typing import TYPE_CHECKING, List, Optional

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from .application import Application


class SchoolBase(SQLModel):
    name: str

    applications: List["Application"] = Relationship(back_populates="school")


class School(SchoolBase, table=True):
    __tablename__ = "schools"

    id: Optional[int] = Field(default=None, primary_key=True, nullable=False)


class SchoolCreate(SchoolBase):
    pass


class SchoolRead(SchoolBase):
    id: int
