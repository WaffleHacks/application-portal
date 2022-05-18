from typing import Optional

from pydantic import BaseModel, EmailStr, HttpUrl


class BaseAPI(BaseModel):
    """
    The base settings required for all APIs
    """

    # JWT authentication configuration
    issuer_url: HttpUrl
    jwks_url: HttpUrl


class CommunicationSettings(BaseAPI):
    # The mailer service to connect to
    mailer: HttpUrl

    # The MJML API to connect to
    mjml_api: HttpUrl

    # The sender email and optional reply to email
    sender: EmailStr
    reply_to: Optional[EmailStr]


class IntegrationsSettings(BaseAPI):
    # The Discord app client ID and secret
    discord_client_id: str
    discord_client_secret: str

    # The domain which hosts the linking frontend
    link_domain: HttpUrl

    # A random string to secure sessions
    secret_key: str


class RegistrationSettings(BaseAPI):
    # The S3 bucket for storing resumes
    bucket: str


class SyncSettings(BaseModel):
    # The SQS queue for synchronizing the participant info
    queue: HttpUrl


class WorkshopsSettings(BaseAPI):
    pass
