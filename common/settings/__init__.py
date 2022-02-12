from os import environ

from pydantic import BaseSettings

from .types import PostgresDsn

DOCKERIZED = environ.get("DOCKERIZED", "no").lower() == "yes"


class Settings(BaseSettings):
    # The Postgres database to connect to
    database_url: PostgresDsn

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        secrets_dir = "/run/secrets" if DOCKERIZED else "/var/run"


SETTINGS: Settings = Settings()
