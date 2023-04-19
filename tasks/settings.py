from enum import Enum
from typing import Optional

from pydantic import BaseSettings, EmailStr, HttpUrl


class LogLevel(Enum):
    CRITICAL = "CRITICAL"
    FATAL = "FATAL"
    ERROR = "ERROR"
    WARN = "WARN"
    INFO = "INFO"
    DEBUG = "DEBUG"


class Settings(BaseSettings):
    # The minimum level to emit logs at
    log_level: LogLevel

    # The mailer service to connect to
    mailer_api: HttpUrl

    # The sender email and optional reply to email
    reply_to: Optional[EmailStr]
    sender: EmailStr


SETTINGS = Settings()
