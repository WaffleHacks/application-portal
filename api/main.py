from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse, UJSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from common import database, kv, nats, tracing, version

from . import (
    authentication,
    communication,
    integrations,
    operations,
    public,
    registration,
    statistics,
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
app.include_router(public.router, prefix="/public")
app.include_router(registration.router, prefix="/registration")
app.include_router(statistics.router, prefix="/statistics")
app.include_router(workshops.router, prefix="/workshops")


@app.on_event("startup")
async def startup():
    await database.warm_up()


@app.get("/health", name="Healthcheck", response_class=PlainTextResponse)
async def health():
    await database.healthcheck()
    await kv.healthcheck()
    await nats.healthcheck()

    return f"version: {version.commit}"


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(_request: Request, exception: StarletteHTTPException):
    return UJSONResponse(
        {"success": False, "reason": exception.detail},
        status_code=exception.status_code,
        headers=getattr(exception, "headers", None),
    )
