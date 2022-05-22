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
    pass


class RegistrationSettings(BaseAPI):
    # The S3 bucket for storing resumes
    bucket: str


class SyncSettings(BaseModel):
    # The SQS queue for synchronizing the participant info
    queue: HttpUrl


class WorkshopsSettings(BaseAPI):
    pass
