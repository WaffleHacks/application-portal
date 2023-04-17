from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, RedisDsn, root_validator, validator

from .specific import APISettings, SyncSettings, TasksSettings
from .types import NATSUrl, PostgresDsn


class App(Enum):
    Api = "api"
    Sync = "sync"
    Tasks = "tasks"

    @property
    def inner(self) -> str:
        return self.value + "_inner"


class Settings(BaseModel):
    # The application that is being run
    apps: List[App]

    # The different application specific configurations
    api_inner: Optional[APISettings]
    sync_inner: Optional[SyncSettings]
    tasks_inner: Optional[TasksSettings]

    # The Postgres database to connect to
    database_url: PostgresDsn

    # The NATS JetStream instance to connect to
    nats_url: NATSUrl

    # The Redis store to connect to
    redis_url: RedisDsn

    # Whether to enable OpenTelemetry observability
    otel_enable: bool = False
    otel_debug: bool = False

    @validator("apps", pre=True)
    def parse_list(cls, value):
        if isinstance(value, str):
            return value.split(",")
        return value

    @root_validator
    def section_required(cls, values):
        apps = values.get("apps")
        if apps is None:
            # This will be handled by pydantic
            return values

        for app in apps:
            if values.get(app.inner) is None:
                raise ValueError(f"settings for app '{app.value}' are required")

        return values

    @property
    def sync(self) -> SyncSettings:
        assert self.sync_inner is not None
        return self.sync_inner

    @property
    def tasks(self) -> TasksSettings:
        assert self.tasks_inner is not None
        return self.tasks_inner

    @property
    def api(self) -> APISettings:
        assert self.api_inner is not None
        return self.api_inner
