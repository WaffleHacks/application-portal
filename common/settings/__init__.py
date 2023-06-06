from pydantic import BaseSettings, RedisDsn

from .types import NATSUrl, PostgresDsn


class Settings(BaseSettings):
    # The Postgres database to connect to
    database_url: PostgresDsn

    # The NATS JetStream instance to connect to
    nats_url: NATSUrl

    # The Redis store to connect to
    redis_url: RedisDsn

    # The S3 bucket for storing data exports
    export_bucket: str

    # Whether to enable OpenTelemetry observability
    otel_enable: bool = False

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


SETTINGS = Settings()
