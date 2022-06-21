import json
from enum import Enum
from typing import Generic, TypeVar

from sqlalchemy import Column
from sqlalchemy import Enum as SQLEnum
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import Field, SQLModel


class Key(Enum):
    ACCEPTING_APPLICATIONS = "accepting_applications"


T = TypeVar("T")


class Entry(Generic[T]):
    def __init__(self, key: Key, db: AsyncSession) -> None:
        self.key = key
        self.db = db

    async def get(self) -> T:
        setting = await self.db.get(Settings, self.key)
        assert setting is not None

        return json.loads(setting.value)

    async def set(self, value: T):
        setting = await self.db.get(Settings, self.key)
        assert setting is not None

        setting.value = json.dumps(value)


class Settings(SQLModel, table=True):
    __tablename__ = "settings"

    key: Key = Field(sa_column=Column(SQLEnum(Key), primary_key=True))
    value: str

    @staticmethod
    def accepting_applications(db: AsyncSession) -> Entry[bool]:
        return Entry(Key.ACCEPTING_APPLICATIONS, db)


class SettingsRead(SQLModel):
    accepting_applications: bool
