from typing import Optional

from pydantic import BaseModel, EmailStr, HttpUrl

from .types import LogLevel


class BaseAPI(BaseModel):
    """
    The base settings required for all APIs
    """

    # JWT authentication configuration
    issuer_url: HttpUrl
    jwks_url: HttpUrl


class CommunicationSettings(BaseAPI):
    # The MJML API to connect to
    mjml_api: HttpUrl


class IntegrationsSettings(BaseAPI):
    pass


class RegistrationSettings(BaseAPI):
    # The S3 bucket for storing resumes
    bucket: str

    # The algolia credentials
    algolia_app_id: str
    algolia_api_key: str


class SyncSettings(BaseModel):
    # Disables the full database sync on service startup
    disable_initial_pull: bool = False

    # The profiles service API to use for the initial sync
    profiles_api: HttpUrl = HttpUrl(url="https://api.id.wafflehacks.org")

    # The SQS queue for synchronizing the participant info
    queue: HttpUrl


class TasksSettings(BaseModel):
    # The minimum level to emit logs at
    log_level: LogLevel = LogLevel.INFO

    # The mailer service to connect to
    mailer: HttpUrl

    # The sender email and optional reply to email
    reply_to: Optional[EmailStr]
    sender: EmailStr


class WorkshopsSettings(BaseAPI):
    pass
