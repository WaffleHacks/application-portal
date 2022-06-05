from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, RedisDsn, root_validator, validator

from .specific import (
    BaseAPI,
    CommunicationSettings,
    IntegrationsSettings,
    RegistrationSettings,
    SyncSettings,
    TasksSettings,
    WorkshopsSettings,
)
from .types import NATSUrl, PostgresDsn


class App(Enum):
    Communication = "communication"
    Integrations = "integrations"
    Registration = "registration"
    Sync = "sync"
    Tasks = "tasks"
    Workshops = "workshops"

    @property
    def inner(self) -> str:
        return self.value + "_inner"


class Settings(BaseModel):
    # The application that is being run
    apps: List[App]

    # The different application specific configurations
    communication_inner: Optional[CommunicationSettings]
    integrations_inner: Optional[IntegrationsSettings]
    registration_inner: Optional[RegistrationSettings]
    sync_inner: Optional[SyncSettings]
    tasks_inner: Optional[TasksSettings]
    workshops_inner: Optional[WorkshopsSettings]

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
    def communication(self) -> CommunicationSettings:
        assert self.communication_inner is not None
        return self.communication_inner

    @property
    def integrations(self) -> IntegrationsSettings:
        assert self.integrations_inner is not None
        return self.integrations_inner

    @property
    def registration(self) -> RegistrationSettings:
        assert self.registration_inner is not None
        return self.registration_inner

    @property
    def sync(self) -> SyncSettings:
        assert self.sync_inner is not None
        return self.sync_inner

    @property
    def tasks(self) -> TasksSettings:
        assert self.tasks_inner is not None
        return self.tasks_inner

    @property
    def workshops(self) -> WorkshopsSettings:
        assert self.workshops_inner is not None
        return self.workshops_inner

    @property
    def api(self) -> BaseAPI:
        if App.Communication in self.apps:
            return self.communication
        elif App.Integrations in self.apps:
            return self.integrations
        elif App.Registration in self.apps:
            return self.registration
        elif App.Workshops in self.apps:
            return self.workshops

        raise ValueError(f"app '{self.apps}' is not an API")
