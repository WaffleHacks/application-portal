from fastapi import APIRouter, Depends

from api.permissions import Role, requires_role

from . import registration

router = APIRouter(dependencies=[Depends(requires_role(Role.Organizer))])
router.include_router(
    registration.router,
    prefix="/registration",
    tags=["Registration Statistics"],
)
