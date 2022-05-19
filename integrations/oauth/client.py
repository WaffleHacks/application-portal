from typing import Dict, Optional, Tuple, Union

from aiohttp import ClientSession
from anyio import Lock
from authlib.common.urls import url_decode
from authlib.integrations.base_client.errors import InvalidTokenError, OAuthError
from authlib.integrations.starlette_client import OAuth as BaseOAuth
from authlib.integrations.starlette_client import StarletteOAuth2App
from authlib.oauth2 import ClientAuth, TokenAuth
from authlib.oauth2.client import OAuth2Client
from authlib.oidc.core.claims import UserInfo


class AsyncOAuth2Client(OAuth2Client):
    SESSION_REQUEST_PARAMS = [
        "cookies",
        "headers",
        "skip_auto_headers",
        "auth",
        "json_serialize",
        "version",
        "cookie_jar",
        "raise_for_status",
        "read_timeout",
        "conn_timeout",
        "timeout",
        "auto_decompress",
        "trust_env",
    ]

    client_auth_class = ClientAuth
    token_auth_class = TokenAuth

    def __init__(
        self,
        client_id=None,
        client_secret=None,
        token_endpoint_auth_method=None,
        revocation_endpoint_auth_method=None,
        scope=None,
        redirect_uri=None,
        token=None,
        token_placement="header",
        update_token=None,
        **kwargs,
    ):

        self._session_kwargs = self._extract_session_request_params(kwargs)
        self._session: Optional[ClientSession] = None

        self.headers: Dict[str, str] = {}

        # We use a Lock to synchronize coroutines to prevent
        # multiple concurrent attempts to refresh the same token
        self._token_refresh_lock = Lock()

        OAuth2Client.__init__(
            self,
            session=None,
            client_id=client_id,
            client_secret=client_secret,
            token_endpoint_auth_method=token_endpoint_auth_method,
            revocation_endpoint_auth_method=revocation_endpoint_auth_method,
            scope=scope,
            redirect_uri=redirect_uri,
            token=token,
            token_placement=token_placement,
            update_token=update_token,
            **kwargs,
        )

    @staticmethod
    def handle_error(error_type, error_description):
        raise OAuthError(error_type, error_description)

    async def __init_session(self):
        """
        Ensure the client session is initialized in the event loop
        """
        if self._session is None:
            self._session = ClientSession(**self._session_kwargs)

    def _prepare(
        self,
        auth: Union[ClientAuth, TokenAuth, None],
        uri: str,
        headers: Optional[Dict[str, str]],
        body: str,
        method: Optional[str] = None,
    ) -> Tuple[str, Dict[str, str], str]:
        if headers:
            merged = headers | self.headers
        else:
            merged = self.headers

        if auth is None:
            return uri, merged, body
        elif isinstance(auth, ClientAuth):
            return auth.prepare(method, uri, merged, body)
        elif isinstance(auth, TokenAuth):
            return auth.prepare(uri, merged, body)
        else:
            raise TypeError(f"unknown auth class: {auth.__name__}")

    async def ensure_active_token(self, token):
        async with self._token_refresh_lock:
            if self.token.is_expired():
                refresh_token = token.get("refresh_token")
                url = self.metadata.get("token_endpoint")
                if refresh_token and url:
                    await self.refresh_token(url, refresh_token=refresh_token)
                elif self.metadata.get("grant_type") == "client_credentials":
                    access_token = token["access_token"]
                    new_token = await self.fetch_token(
                        url, grant_type="client_credentials"
                    )
                    if self.update_token:
                        await self.update_token(new_token, access_token=access_token)
                else:
                    raise InvalidTokenError()

    async def request(
        self,
        method: str,
        url: str,
        headers: Optional[Dict[str, str]] = None,
        token: Optional[str] = None,
        parse: bool = False,
        **kwargs,
    ):
        await self.__init_session()
        assert self._session is not None

        if headers:
            merged = headers | self.headers
        else:
            merged = self.headers
        if token:
            merged["Authorization"] = f"Bearer {token}"
        elif self.token:
            await self.ensure_active_token(self.token)
            merged[
                "Authorization"
            ] = f"{self.token['token_type']} {self.token['access_token']}"

        resp = await self._session.request(method, url, headers=merged, **kwargs)

        # This is a hack to ensure the response doesn't hang
        if parse:
            await resp.json()

        return resp

    async def _fetch_token(
        self,
        url,
        body="",
        headers=None,
        auth=None,
        method="POST",
        **kwargs,
    ):
        await self.__init_session()
        assert self._session is not None

        url, headers, body = self._prepare(auth, url, headers, body, method)

        if method.upper() == "POST":
            resp = await self._session.post(
                url,
                data=dict(url_decode(body)),
                headers=headers,
                **kwargs,
            )
        else:
            if "?" in url:
                url = "&".join([url, body])
            else:
                url = "?".join([url, body])
            resp = await self._session.get(url, headers=headers, **kwargs)

        for hook in self.compliance_hook["access_token_response"]:
            resp = hook(resp)

        resp.raise_for_status()
        return self.parse_response_token(await resp.json())

    async def _refresh_token(
        self,
        url,
        refresh_token=None,
        body="",
        headers=None,
        auth=None,
        **kwargs,
    ):
        await self.__init_session()
        assert self._session is not None

        url, headers, body = self._prepare(auth, url, headers, body)
        resp = await self._session.post(
            url,
            data=dict(url_decode(body)),
            headers=headers,
            **kwargs,
        )

        for hook in self.compliance_hook["refresh_token_response"]:
            resp = hook(resp)

        resp.raise_for_status()
        token = self.parse_response_token(await resp.json())
        if "refresh_token" not in token:
            self.token["refresh_token"] = refresh_token

        if self.update_token:
            await self.update_token(self.token, refresh_token=refresh_token)

        return self.token

    async def _http_post(self, url, body=None, auth=None, headers=None, **kwargs):
        await self.__init_session()
        assert self._session is not None

        url, headers, body = self._prepare(auth, url, headers, body)
        return await self._session.post(
            url,
            data=dict(url_decode(body)),
            headers=headers,
            **kwargs,
        )

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self._session:
            await self._session.close()


class OAuth2App(StarletteOAuth2App):
    client_cls = AsyncOAuth2Client

    async def userinfo(self, **kwargs):
        metadata = await self.load_server_metadata()
        resp = await self.get(metadata["userinfo_endpoint"], parse=True, **kwargs)
        resp.raise_for_status()
        data = await resp.json()
        return UserInfo(data)


class OAuth(BaseOAuth):
    oauth2_client_cls = OAuth2App
