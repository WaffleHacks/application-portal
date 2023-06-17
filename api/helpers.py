from http import HTTPStatus

from fastapi import Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from common.database import Application, Participant, with_db

from .session import with_user_id


async def with_current_participant(
    id: int = Depends(with_user_id),
    db: AsyncSession = Depends(with_db),
):
    """
    Get the current participant
    """
    participant = await db.get(Participant, id)
    if participant is None:
        raise HTTPException(
            status_code=HTTPStatus.INTERNAL_SERVER_ERROR,
            detail="no participant found for token",
        )

    return participant


async def with_current_application(
    id: int = Depends(with_user_id),
    db: AsyncSession = Depends(with_db),
):
    """
    Get the current participant's application, may be None
    """
    return await db.get(Application, id)


async def require_application_accepted(
    application: Application = Depends(with_current_application),
):
    """
    Require that the participant's application was accepted
    """
    if application is None or not application.accepted:
        raise HTTPException(
            status_code=HTTPStatus.FORBIDDEN,
            detail="application must be accepted",
        )
