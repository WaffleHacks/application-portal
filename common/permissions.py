from enum import Enum
from http import HTTPStatus
from typing import Callable, Dict

from fastapi import Depends, HTTPException

from common.authentication import is_authenticated


class Permission(Enum):
    """
    The different permissions that can be assigned to a user
    """

    # The three primary groups that a user can be in
    Participant = "participant"
    Sponsor = "sponsor"
    Organizer = "organizer"

    # A flag extending the permissions of an organizer
    Director = "director"

    def matches(self, value: str) -> bool:
        """
        Check if the permissions are equal
        :param value: the raw permission
        """
        return self.value == value


def requires_permission(*permissions: Permission) -> Callable[[], str]:
    """
    Check that the user has one of the specified permissions to access the route. Returns the matched permission.
    :param permissions: the permission(s) that are required
    """

    def validator(token: Dict[str, str] = Depends(is_authenticated)) -> str:
        token_permissions = set(token.get("permissions", []))

        for p in permissions:
            if p.value in token_permissions:
                return p.value

        raise HTTPException(
            status_code=HTTPStatus.FORBIDDEN, detail="invalid permissions"
        )

    return validator
