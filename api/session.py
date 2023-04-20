import random
import string
from enum import Enum
from hashlib import sha256
from http import HTTPStatus
from typing import Annotated, Optional

from fastapi import Cookie, Depends, HTTPException, Response
from opentelemetry import trace
from pydantic import BaseModel, PrivateAttr

from common.kv import engine

from .settings import SETTINGS

IN_14_DAYS = 14 * 24 * 60 * 60

kv = engine.namespaced("session")


class Status(Enum):
    Unauthenticated = "unauthenticated"
    OAuth = "oauth"
    IncompleteProfile = "incomplete-profile"
    Authenticated = "authenticated"


class Session(BaseModel):
    status: Status
    _value: str = PrivateAttr()

    # Present when status == Status.OAuth
    state: Optional[str]
    provider: Optional[str]

    # Present when status == Status.IncompleteProfile
    email: Optional[str]

    # Present when status == Status.Authenticated
    id: Optional[int]

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self._value = "".join(random.choice(string.hexdigits) for _ in range(32))

    @classmethod
    def unauthenticated(cls):
        return cls(status=Status.Unauthenticated)

    def into_oauth(self, state: str, provider: str):
        self.status = Status.OAuth
        self.state = state
        self.provider = provider

        self.email = None
        self.id = None

    def into_incomplete_profile(self, email: str):
        self.status = Status.IncompleteProfile
        self.email = email

        self.state = None
        self.provider = None
        self.id = None

    def into_authenticated(self, user_id: int):
        self.status = Status.Authenticated
        self.id = user_id

        self.state = None
        self.provider = None
        self.email = None

    async def set_cookie(self, response: Response):
        """
        Set the session as a cookie on the response
        """
        response.set_cookie(
            key="session_id",
            value=self._value,
            expires=IN_14_DAYS,
            domain=SETTINGS.cookie_domain,
            secure=SETTINGS.cookie_secure,
            httponly=True,
        )

        await kv.set(
            key=kv_id_from_value(self._value),
            value=self.json(exclude_unset=True),
            expires_in=IN_14_DAYS,
        )


def kv_id_from_value(value: str) -> str:
    return sha256(value.encode("utf-8")).hexdigest()


async def with_session(
    session_id: Annotated[Optional[str], Cookie()] = None
) -> Session:
    """
    Retrieve the session from the session cookie
    """
    if session_id is None:
        return Session.unauthenticated()

    session = await kv.get(kv_id_from_value(session_id))
    if session is None:
        return Session.unauthenticated()

    session = Session.parse_raw(session)
    session._value = session_id

    if session.id:
        trace.get_current_span().set_attribute("user.id", session.id)

    return session


def with_oauth(session: Session = Depends(with_session)) -> Session:
    """
    Retrieve the current user's session, ensuring that it is in the OAuth stage
    """
    if session.status != Status.OAuth:
        raise HTTPException(status_code=HTTPStatus.UNAUTHORIZED, detail="unauthorized")

    return session


def with_incomplete_profile(session: Session = Depends(with_session)) -> Session:
    """
    Retrieve the current user's session, ensuring that it is in the incomplete profile stage
    """
    if session.status != Status.IncompleteProfile:
        raise HTTPException(status_code=HTTPStatus.UNAUTHORIZED, detail="unauthorized")

    return session


def with_authenticated(session: Session = Depends(with_session)) -> Session:
    """
    Retrieve the current user's session, ensuring that it is authenticated
    """
    if session.status != Status.Authenticated:
        raise HTTPException(status_code=HTTPStatus.UNAUTHORIZED, detail="unauthorized")

    return session


def with_user_id(session: Session = Depends(with_authenticated)) -> int:
    """
    Retrieve the current user's ID from the session
    """
    assert session.id is not None
    return session.id
