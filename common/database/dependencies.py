from http import HTTPStatus

from fastapi import Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from common.authentication import with_user_id

from .engine import with_db
from .tables import Participant


def with_current_participant(load_application=False):
    """
    Get the current participant
    :param load_application: whether to fetch the application
    """
    options = []
    if load_application:
        options.append(selectinload(Participant.application))

    async def dependency(
        id: str = Depends(with_user_id),
        db: AsyncSession = Depends(with_db),
    ):
        participant = await db.get(Participant, id, options=options)
        if participant is None:
            raise HTTPException(
                status_code=HTTPStatus.INTERNAL_SERVER_ERROR,
                detail="no participant for token",
            )

        return participant

    return dependency


async def require_application_accepted(
    participant: Participant = Depends(with_current_participant(load_application=True)),
):
    """
    Require that the participant's application was accepted
    """
    if participant.application is None or not participant.application.accepted:
        raise HTTPException(
            status_code=HTTPStatus.FORBIDDEN,
            detail="application must be accepted",
        )
