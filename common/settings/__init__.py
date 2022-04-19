from os import environ
from typing import Optional

from pydantic import BaseSettings, HttpUrl, RedisDsn

from .types import PostgresDsn

DOCKERIZED = environ.get("DOCKERIZED", "no").lower() == "yes"


class Settings(BaseSettings):
    # The Postgres database to connect to
    database_url: PostgresDsn

    # The Redis store to connect to
    redis_url: RedisDsn

    # JWT authentication configuration
    issuer_url: HttpUrl
    jwks_url: HttpUrl

    # The SQS queue for synchronizing the participant info
    queue: Optional[HttpUrl]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        secrets_dir = "/run/secrets" if DOCKERIZED else "/var/run"


SETTINGS: Settings = Settings()
