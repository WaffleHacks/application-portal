from typing import Optional

from pydantic import BaseModel, EmailStr, HttpUrl

from .types import LogLevel


class APISettings(BaseModel):
    # JWT authentication configuration
    issuer_url: HttpUrl
    jwks_url: HttpUrl

    # The MJML API to connect to
    mjml_api: HttpUrl

    # The S3 bucket for storing resumes
    bucket: str

    # The algolia credentials
    algolia_app_id: str
    algolia_api_key: str

    # Where the api is publicly accessible
    public_url: HttpUrl

    # Where the frontend is publicly accessible
    app_url: HttpUrl

    # Cookie configuration options
    cookie_domain: str
    cookie_secure: bool


class SyncSettings(BaseModel):
    # Disables the full database sync on service startup
    disable_initial_pull: bool = False

    # The profiles service API to use for the initial sync
    profiles_api: HttpUrl = HttpUrl(
        url="https://api.id.wafflehacks.org", scheme="https"
    )

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
