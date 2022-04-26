from pydantic import BaseModel, HttpUrl


class BaseAPI(BaseModel):
    """
    The base settings required for all APIs
    """

    # JWT authentication configuration
    issuer_url: HttpUrl
    jwks_url: HttpUrl


class CommunicationSettings(BaseAPI):
    pass


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
