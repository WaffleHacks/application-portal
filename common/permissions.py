from enum import Enum
from http import HTTPStatus
from typing import Callable, Dict

from fastapi import Depends, HTTPException

from common.authentication import is_authenticated


class Permission(Enum):
    """
    The different permissions that can be assigned to a user
    """

    # Create a new application for the current user
    ApplicationsCreate = "applications:create"
    # View all applications in the database
    ApplicationsRead = "applications:read"
    # View any applications that allowed sponsors to view their information
    ApplicationsReadPublic = "applications:read:public"
    # View the application for the current user
    ApplicationsReadSelf = "applications:read:self"
    # Export applications to a CSV
    ApplicationsExport = "applications:export"
    # Change the acceptance status of an application
    ApplicationsStatus = "applications:status"
    # View all drafted and queued communications
    CommunicationsRead = "communications:read"
    # Create, update, and delete communications
    CommunicationsEdit = "communications:edit"
    # Send a drafted communication
    CommunicationsSend = "communications:send"
    # Manage communication groups
    CommunicationsGroups = "communications:groups"
    # View all event statistics
    EventStatistics = "event:statistics"
    # View details about the event
    EventDetailsRead = "event:details:read"
    # Modify details about the event
    EventDetailsEdit = "event:details:edit"
    # Modify integrations such as webhooks and API access
    IntegrationsEdit = "integrations:edit"
    # View information about the integrations
    IntegrationsView = "integrations:view"
    # View details about the workshops
    WorkshopsRead = "workshops:read"
    # Edit and create new workshops
    WorkshopsEdit = "workshops:edit"
    # Mark the attendance/feedback status for the current user
    WorkshopsAttendance = "workshops:attendance"
    # View the current user's swag status
    WorkshopsSwagRead = "workshops:swag:read"
    # Manage the swag tiers
    WorkshopsSwagManage = "workshops:swag:manage"


def requires_permissions(*permissions: Permission) -> Callable[[], None]:
    """
    Check that the user has the specified permissions to access the route
    :param permissions: the permission(s) that are required
    """
    permission_set = {p.value for p in permissions}

    def validator(token: Dict[str, str] = Depends(is_authenticated)):
        token_permissions = set(token.get("permissions", []))

        if len(token_permissions & permission_set) != len(permission_set):
            raise HTTPException(
                status_code=HTTPStatus.FORBIDDEN, detail="invalid permissions"
            )

    return validator
