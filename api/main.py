from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import UJSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from common import tracing

from . import communication, integrations, operations, registration, workshops

app = FastAPI(docs_url=None, swagger_ui_oauth2_redirect_url=None, redoc_url="/docs")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["Authorization"],
)

tracing.init(app)

app.include_router(communication.router, prefix="/communication")
app.include_router(integrations.router, prefix="/integrations")
app.include_router(operations.router, prefix="/operations")
app.include_router(registration.router, prefix="/registration")
app.include_router(workshops.router, prefix="/workshops")


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(_request: Request, exception: StarletteHTTPException):
    return UJSONResponse(
        {"success": False, "reason": exception.detail},
        status_code=exception.status_code,
        headers=getattr(exception, "headers", None),
    )
