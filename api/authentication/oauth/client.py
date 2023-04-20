from typing import Any

from aiohttp import ClientResponse, ClientSession, FormData
from pydantic import BaseModel

from common.database import Provider


class OAuthClientException(Exception):
    pass


class OAuthClient(object):
    def __init__(self):
        self.session: ClientSession = None  # type: ignore

    async def __init_session(self):
        if self.session is None:
            self.session = ClientSession(headers={"Accept": "application/json"})

    async def exchange(self, code: str, redirect_uri: str, provider: Provider) -> str:
        await self.__init_session()

        response = await self.session.post(
            provider.token_endpoint,
            data=FormData(
                {
                    "code": code,
                    "grant_type": "authorization_code",
                    "client_id": provider.client_id,
                    "client_secret": provider.client_secret,
                    "redirect_uri": redirect_uri,
                }
            ),
        )
        credentials = await _deserialize_if_successful(response)
        credentials = CredentialsResponse.parse_obj(credentials)

        if credentials.token_type.lower() != "bearer":
            raise OAuthClientException(
                f"expected bearer token, got {credentials.token_type!r}"
            )

        # Check that the received scopes are a superset of the expected scopes
        expected = set(provider.scope.split(" "))
        received = set(credentials.scope.split(" "))
        if expected.issuperset(received) and not expected.issubset(received):
            raise OAuthClientException(
                f"did not receive all required scopes: got {credentials.scope!r}, expected {provider.scope!r}"
            )

        return credentials.access_token

    async def user_info(self, token: str, provider: Provider) -> "UserInfo":
        await self.__init_session()

        response = await self.session.get(
            provider.user_info_endpoint,
            headers={"Authorization": f"Bearer {token}"},
        )
        info = await _deserialize_if_successful(response)
        return UserInfo.parse_obj(info)


async def _deserialize_if_successful(response: ClientResponse) -> Any:
    if response.ok:
        return await response.json()
    else:
        content = await response.text()
        raise OAuthClientException(f"{content} (code: {response.status})")


class CredentialsResponse(BaseModel):
    access_token: str
    scope: str
    token_type: str


class UserInfo(BaseModel):
    email: str
    email_verified: bool = True
