import json
from abc import ABC, abstractmethod
from datetime import datetime
from enum import Enum
from typing import Any, Generic, Type, TypeVar

import pytz
from pydantic.json import pydantic_encoder
from sqlalchemy import Column
from sqlalchemy import Enum as SQLEnum
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import Field, SQLModel


class Key(Enum):
    ACCEPTING_APPLICATIONS = "accepting_applications"

    CHECKIN_START = "checkin_start"
    CHECKIN_END = "checkin_end"


T = TypeVar("T")
U = TypeVar("U")


class Formatter(ABC, Generic[U]):
    @staticmethod
    @abstractmethod
    def encode(value: U) -> str:
        ...

    @staticmethod
    @abstractmethod
    def decode(raw: str) -> U:
        ...


class JSONFormatter(Formatter[Any]):
    @staticmethod
    def encode(value: Any) -> str:
        return json.dumps(value, default=pydantic_encoder)

    @staticmethod
    def decode(raw: str) -> Any:
        return json.loads(raw)


class DateTimeFormatter(Formatter[datetime]):
    FORMAT = "%Y-%m-%dT%H:%M:%S.%fZ"

    @staticmethod
    def encode(value: datetime) -> str:
        return value.astimezone(pytz.utc).strftime(DateTimeFormatter.FORMAT)

    @staticmethod
    def decode(raw: str) -> datetime:
        return datetime.strptime(raw, DateTimeFormatter.FORMAT).astimezone(pytz.utc)


class Entry(Generic[T]):
    def __init__(
        self,
        key: Key,
        db: AsyncSession,
        formatter: Type[Formatter[T]] = JSONFormatter,
    ) -> None:
        self.key = key
        self.db = db

        self.formatter = formatter

    async def get(self) -> T:
        setting = await self.db.get(Settings, self.key)
        assert setting is not None

        return self.formatter.decode(setting.value)  # type: ignore

    async def set(self, value: T):
        setting = await self.db.get(Settings, self.key)
        assert setting is not None

        setting.value = self.formatter.encode(value)  # type: ignore


class Settings(SQLModel, table=True):
    __tablename__ = "settings"

    key: Key = Field(sa_column=Column(SQLEnum(Key), primary_key=True))
    value: str

    @staticmethod
    def accepting_applications(db: AsyncSession) -> Entry[bool]:
        return Entry(Key.ACCEPTING_APPLICATIONS, db)

    @staticmethod
    def checkin_start(db: AsyncSession) -> Entry[datetime]:
        return Entry(Key.CHECKIN_START, db, formatter=DateTimeFormatter)

    @staticmethod
    def checkin_end(db: AsyncSession) -> Entry[datetime]:
        return Entry(Key.CHECKIN_END, db, formatter=DateTimeFormatter)


class SettingsRead(SQLModel):
    accepting_applications: bool

    checkin_start: datetime
    checkin_end: datetime
