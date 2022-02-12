from pydantic import BaseSettings

from .types import PostgresDsn


class Settings(BaseSettings):
    # The Postgres database to connect to
    database_url: PostgresDsn

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        secrets_dir = "/run/secrets"
