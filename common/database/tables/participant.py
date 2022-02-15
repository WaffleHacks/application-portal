from typing import TYPE_CHECKING, Optional

from pydantic import EmailStr
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from .application import Application


class Participant(SQLModel, table=True):
    __tablename__ = "participants"

    id: Optional[int] = Field(default=None, primary_key=True, nullable=False)

    first_name: str
    last_name: str
    email: EmailStr

    application: "Application" = Relationship(back_populates="participant")
