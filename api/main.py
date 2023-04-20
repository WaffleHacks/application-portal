from http import HTTPStatus

from fastapi import Depends, FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import UJSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.exceptions import HTTPException as StarletteHTTPException

from common import tracing
from common.database import ServiceSettings, with_db

from . import (
    authentication,
    communication,
    integrations,
    operations,
    registration,
    workshops,
)
from .settings import SETTINGS

app = FastAPI(docs_url=None, swagger_ui_oauth2_redirect_url=None, redoc_url="/docs")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[SETTINGS.app_url],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["Cookie"],
)

tracing.init(app)

app.include_router(authentication.router, prefix="/auth")
app.include_router(communication.router, prefix="/communication")
app.include_router(integrations.router, prefix="/integrations")
app.include_router(operations.router, prefix="/operations")
app.include_router(registration.router, prefix="/registration")
app.include_router(workshops.router, prefix="/workshops")


@app.get("/health", name="Healthcheck", status_code=HTTPStatus.NO_CONTENT)
async def health(db: AsyncSession = Depends(with_db)):
    entry = ServiceSettings.accepting_applications(db)
    await entry.get()


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(_request: Request, exception: StarletteHTTPException):
    return UJSONResponse(
        {"success": False, "reason": exception.detail},
        status_code=exception.status_code,
        headers=getattr(exception, "headers", None),
    )
