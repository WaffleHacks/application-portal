import json
from enum import Enum
from typing import Any

from sqlalchemy import Column
from sqlalchemy import Enum as SQLEnum
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import Field, SQLModel


class Key(Enum):
    ACCEPTING_APPLICATIONS = "accepting_applications"


class Settings(SQLModel, table=True):
    __tablename__ = "settings"

    key: Key = Field(sa_column=Column(SQLEnum(Key), primary_key=True))
    value: str

    @staticmethod
    async def set(key: Key, value: Any, db: AsyncSession):
        """
        Set the value of a setting
        :param key: the key to modify
        :param value: the value to set
        :param db: a database connection
        """
        setting = await db.get(Settings, key)
        assert setting is not None

        setting.value = json.dumps(value)

    @staticmethod
    async def accepting_applications(db: AsyncSession) -> bool:
        """
        Get the value for the accepting application
        :param db: a database connection
        :return: the status
        """
        setting = await db.get(Settings, Key.ACCEPTING_APPLICATIONS)
        assert setting is not None

        parsed = json.loads(setting.value)
        assert isinstance(parsed, bool)
        return parsed
