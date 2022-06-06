from enum import Enum
from typing import Optional, no_type_check

from pydantic import AnyUrl


class LogLevel(Enum):
    CRITICAL = "CRITICAL"
    FATAL = "FATAL"
    ERROR = "ERROR"
    WARN = "WARN"
    INFO = "INFO"
    DEBUG = "DEBUG"


class NATSUrl(AnyUrl):
    allowed_schemes = {"nats"}


class PostgresDsn(AnyUrl):
    allowed_schemes = {"postgresql+asyncpg", "postgres", "postgresql"}
    user_required = True

    @no_type_check
    def __new__(cls, url: Optional[str], **kwargs):
        normalized = url.replace("postgres://", "postgresql+asyncpg://").replace(
            "postgresql://", "postgresql+asyncpg://"
        )
        return super(PostgresDsn, cls).__new__(cls, normalized, **kwargs)
