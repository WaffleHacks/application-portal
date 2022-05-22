from http import HTTPStatus

from authlib.integrations.base_client.errors import MismatchingStateError
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import UJSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from . import discord

app = FastAPI(docs_url=None, swagger_ui_oauth2_redirect_url=None, redoc_url="/docs")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["Authorization"],
)

app.include_router(discord.router, prefix="/discord", tags=["Discord"])


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(_request: Request, exception: StarletteHTTPException):
    return UJSONResponse(
        {"success": False, "reason": exception.detail},
        status_code=exception.status_code,
        headers=getattr(exception, "headers", None),
    )


@app.exception_handler(MismatchingStateError)
async def mismatching_state_handler(_request: Request, _exc: MismatchingStateError):
    return UJSONResponse(
        {"success": False, "reason": "invalid CSRF token"},
        status_code=HTTPStatus.BAD_REQUEST,
    )
