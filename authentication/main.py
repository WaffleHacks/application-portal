from http import HTTPStatus

from fastapi import Depends, FastAPI, Request
from fastapi.responses import UJSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.exceptions import HTTPException as StarletteHTTPException

from common import with_user_id
from common.database import Participant, ParticipantBase, with_db

app = FastAPI(docs_url=None, swagger_ui_oauth2_redirect_url=None, redoc_url="/docs")


@app.put("/me", status_code=HTTPStatus.NO_CONTENT, name="Update current user profile")
async def update_profile(
    data: ParticipantBase,
    id: str = Depends(with_user_id),
    db: AsyncSession = Depends(with_db),
):
    """
    Create or update the participant's profile
    """
    participant = Participant.from_orm(data, update={"id": id})
    db.add(participant)
    await db.commit()


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(_request: Request, exception: StarletteHTTPException):
    return UJSONResponse(
        {"success": False, "reason": exception.detail},
        status_code=exception.status_code,
        headers=getattr(exception, "headers", None),
    )
