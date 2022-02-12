from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from .application import Application


class School(SQLModel, table=True):
    __tablename__ = "schools"

    id: int = Field(primary_key=True)
    name: str

    applications: "Application" = Relationship(back_populates="school")
