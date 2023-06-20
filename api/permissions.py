from http import HTTPStatus
from typing import Callable

from fastapi import Depends, HTTPException

from common.database import Participant, Role

from .helpers import with_current_participant


def requires_role(*roles: Role) -> Callable[[], Role]:
    """
    Check that the user has one of the specified roles to access the route.
    :param roles: the role(s) that are required
    :return: the matched role
    """

    def validator(
        participant: Participant = Depends(with_current_participant),
    ) -> Role:
        for r in roles:
            if r.value == participant.role.value:
                return participant.role

        raise HTTPException(
            status_code=HTTPStatus.FORBIDDEN, detail="permission denied"
        )

    return validator


def is_admin(participant: Participant = Depends(with_current_participant)):
    """
    Check that the user is an admin
    """
    if not participant.is_admin:
        raise HTTPException(
            status_code=HTTPStatus.FORBIDDEN, detail="permission denied"
        )
