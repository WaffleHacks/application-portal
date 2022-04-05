from asyncio import Lock
from time import time
from typing import Any, List, Optional

from aiohttp import ClientSession
from jwt import PyJWK, PyJWKSet
from jwt.api_jwt import decode_complete


class JWKClientException(Exception):
    pass


class JWKClient(object):
    def __init__(self, uri: str, cache_ttl: int = 5 * 60):
        self.uri = uri
        self.session: Optional[ClientSession] = None

        self.lock = Lock()
        self.cache_ttl = cache_ttl
        self.last_fetch = 0
        self.signing_keys: List[PyJWK] = []

    async def __fetch_data(self) -> Any:
        if self.session is None:
            self.session = ClientSession()

        async with self.session.get(self.uri) as response:
            return await response.json(encoding="utf-8")

    async def __get_keys(self) -> List[PyJWK]:
        async with self.lock:
            jwk_set = PyJWKSet.from_dict(await self.__fetch_data())
            signing_keys = [
                jwk_set_key
                for jwk_set_key in jwk_set.keys
                if jwk_set_key.public_key_use in ["sig", None] and jwk_set_key.key_id
            ]

            if not signing_keys:
                raise JWKClientException(
                    "The JWKS endpoint did not contain any signing keys"
                )

            return signing_keys

    async def get_signing_key(self, kid: str) -> PyJWK:
        if time() - self.cache_ttl >= self.last_fetch:
            self.signing_keys = await self.__get_keys()

        for key in self.signing_keys:
            if key.key_id == kid:
                return key

        raise JWKClientException(f'Unable to find signing key "{kid}"')

    async def get_signing_key_from_jwt(self, token: str) -> PyJWK:
        unverified = decode_complete(token, options={"verify_signature": False})
        kid = unverified["header"].get("kid")
        return await self.get_signing_key(kid)
