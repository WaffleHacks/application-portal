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

    # Where the frontend is publicly accessible
    app_url: HttpUrl

    # The icon to show in the Discord embed
    embed_icon_url: HttpUrl

    # Healthcheck server configuration
    healthcheck_host: str = "127.0.0.1"
    healthcheck_port: int = 8000


SETTINGS = Settings()
