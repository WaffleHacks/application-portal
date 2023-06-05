from pydantic import BaseSettings, HttpUrl


class Settings(BaseSettings):
    # The S3 bucket for storing resumes
    resume_bucket: str

    # The Algolia credentials
    algolia_app_id: str
    algolia_api_key: str

    # Where the API is publicly accessible
    public_url: HttpUrl

    # Where the frontend is publicly accessible
    app_url: HttpUrl

    # Cookie configuration options
    cookie_domain: str
    cookie_secure: bool

    # The domain emails must end with to be automatically assigned organizer permissions
    organizer_email_domain: str


SETTINGS = Settings()
