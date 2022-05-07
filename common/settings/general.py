from enum import Enum
from typing import Any, Dict, Optional

from pydantic import BaseModel, RedisDsn, root_validator

from .specific import (
    BaseAPI,
    CommunicationSettings,
    IntegrationsSettings,
    RegistrationSettings,
    SyncSettings,
    WorkshopsSettings,
)
from .types import NATSDsn, PostgresDsn


class App(Enum):
    Communication = "communication"
    Integrations = "integrations"
    Registration = "registration"
    Sync = "sync"
    Workshops = "workshops"

    @property
    def inner(self) -> str:
        return self.value + "_inner"


def keep(app: App, values: Dict[str, Any]) -> Dict[str, Any]:
    """
    Keep only the given app's configuration
    """
    for a in App:
        if a != app:
            del values[a.inner]
    del values["globals"]

    return values


class Settings(BaseModel):
    # The application that is being run
    app: App

    # The different application specific configurations
    communication_inner: Optional[CommunicationSettings]
    integrations_inner: Optional[IntegrationsSettings]
    registration_inner: Optional[RegistrationSettings]
    sync_inner: Optional[SyncSettings]
    workshops_inner: Optional[WorkshopsSettings]

    # The Postgres database to connect to
    database_url: PostgresDsn

    # The NATS JetStream server to connect to
    nats_url: NATSDsn

    # The Redis store to connect to
    redis_url: RedisDsn

    @root_validator
    def section_required(cls, values):
        app = values.get("app")
        if app is None:
            # This will be handled by pydantic
            return values

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
    def workshops(self) -> WorkshopsSettings:
        assert self.workshops_inner is not None
        return self.workshops_inner

    @property
    def api(self) -> BaseAPI:
        if self.app == App.Communication:
            return self.communication
        elif self.app == App.Integrations:
            return self.integrations
        elif self.app == App.Registration:
            return self.registration
        elif self.app == App.Workshops:
            return self.workshops

        raise ValueError(f"app '{self.app}' is not an API")
