from http import HTTPStatus
from typing import Dict, Optional

import jwt
from fastapi import Depends, Header, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt import ExpiredSignatureError, InvalidTokenError

from ..settings import SETTINGS
from .jwks import JWKClient

bearer_scheme = HTTPBearer()
client = JWKClient(SETTINGS.api.jwks_url)


async def is_authenticated(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> Dict[str, str]:
    """
    Determine if the requester is authenticated
    """
    token = credentials.credentials

    try:
        signing_key = await client.get_signing_key_from_jwt(token)
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            audience="https://apply.wafflehacks.org",
            issuer=SETTINGS.api.issuer_url,
        )
    except ExpiredSignatureError:
        raise HTTPException(
            status_code=HTTPStatus.UNAUTHORIZED, detail="token is expired"
        )
    except InvalidTokenError:
        raise HTTPException(status_code=HTTPStatus.UNAUTHORIZED, detail="invalid JWT")

    return payload


async def with_user_id(token: Dict[str, str] = Depends(is_authenticated)) -> str:
    """
    Get the user's id from their JWT
    """
    return token["sub"]


async def is_internal(host: Optional[str] = Header(default=None)):
    """
    Determine if the request is coming from an internal client
    """
    if not host:
        raise HTTPException(status_code=HTTPStatus.UNAUTHORIZED, detail="unauthorized")

    [domain, _] = host.split(":")
    if not domain.endswith("wafflemaker.internal"):
        raise HTTPException(status_code=HTTPStatus.UNAUTHORIZED, detail="unauthorized")
