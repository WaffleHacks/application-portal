from http import HTTPStatus
from typing import Dict

import jwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt import ExpiredSignatureError, InvalidTokenError

from ..settings import SETTINGS
from .jwks import JWKClient

bearer_scheme = HTTPBearer()
client = JWKClient(SETTINGS.jwks_url)


async def is_authenticated(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> Dict[str, str]:
    """
    Determine if the requester is authenticated
    """
    token = credentials.credentials

    signing_key = await client.get_signing_key_from_jwt(token)
    try:
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            audience="https://apply.wafflehacks.tech",
            issuer=SETTINGS.issuer_url,
        )
    except ExpiredSignatureError:
        raise HTTPException(
            status_code=HTTPStatus.UNAUTHORIZED, detail="token is expired"
        )
    except InvalidTokenError:
        raise HTTPException(status_code=HTTPStatus.UNAUTHORIZED, detail="invalid JWT")

    return payload
