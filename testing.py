from typing import Optional

from sqlmodel import Field, Session, SQLModel, create_engine


class Hero(SQLModel):
    name: str = Field(index=True)
    secret_name: str
    age: Optional[int] = Field(default=None, index=True)


class HeroSubclass(Hero, table=True):
    __tablename__ = "abc"

    id: int = Field(primary_key=True)
