import random
import string
from typing import Optional, Tuple

from fastapi.datastructures import URL
from sqlmodel import Field, SQLModel


class ProviderBase(SQLModel):
    # A human-readable name
    name: str

    # The URL to retrieve the provider icon from
    icon: str

    # Whether the provider can be used to login
    enabled: bool

    # The identifier given by the provider
    client_id: str

    # The URLs to use for the OAuth2 flow (see RFC 6749 for details)
    authorization_endpoint: str
    token_endpoint: str
    user_info_endpoint: str

    # The scopes to request when authorizing
    scope: str


class ProviderWithSensitive(ProviderBase):
    # The secret given by the provider
    client_secret: str


class Provider(ProviderWithSensitive, table=True):
    __tablename__ = "providers"

    # A unique identifier for the provider
    slug: str = Field(default=None, primary_key=True, nullable=False)

    def build_redirect_url(self, redirect: str) -> Tuple[URL, str]:
        """
        Build the URL to authorize a user
        :param redirect: the URL to redirect back to
        :return: the URL and state
        """

        state = "".join(random.choice(string.hexdigits) for _ in range(32))
        url = URL(self.authorization_endpoint).include_query_params(
            response_type="code",
            client_id=self.client_id,
            scope=self.scope,
            redirect_uri=redirect,
            state=state,
        )

        return url, state


class ProviderCreate(ProviderWithSensitive):
    slug: str


class ProviderList(SQLModel):
    slug: str
    name: str
    icon: str
    enabled: bool


class ProviderRead(ProviderBase):
    slug: str


class ProviderUpdate(SQLModel):
    name: Optional[str]
    icon: Optional[str]
    enabled: Optional[bool]

    client_id: Optional[str]
    client_secret: Optional[str]

    authorization_endpoint: Optional[str]
    token_endpoint: Optional[str]
    user_info_endpoint: Optional[str]

    scope: Optional[str]
