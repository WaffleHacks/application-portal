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
    # Edit all applications in the database
    ApplicationsEdit = "applications:edit"
    # Edit the application for the current user
    ApplicationsEditSelf = "applications:edit:self"
    # Export applications to a CSV
    ApplicationsExport = "applications:export"
    # Change the acceptance status of an application
    ApplicationsStatus = "applications:status"
    # Manage the legal agreements participants must agree to
    LegalAgreementsEdit = "legal_agreements:edit"
    # Manage the known schools in the database
    SchoolsEdit = "schools:edit"
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
