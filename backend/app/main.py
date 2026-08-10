from app.logging_config import configure_logging

from app.middleware.request_logging import (
    RequestLoggingMiddleware,
)

from app.routes.monitoring_routes import (
    router as monitoring_router,
)

import logging
from pathlib import Path

from fastapi import (
    FastAPI,
    HTTPException,
)

from fastapi.exceptions import (
    RequestValidationError,
)

from fastapi.middleware.cors import (
    CORSMiddleware,
)

from fastapi.middleware.trustedhost import (
    TrustedHostMiddleware,
)

from fastapi.staticfiles import (
    StaticFiles,
)


# =========================================================
# CONFIGURATION
# =========================================================

from app.config import settings


# =========================================================
# LOGGING
# =========================================================

from app.logging_config import (
    configure_logging,
)


# =========================================================
# GLOBAL ERROR HANDLERS
# =========================================================

from app.error_handlers import (
    http_exception_handler,
    unexpected_exception_handler,
    validation_exception_handler,
)


# =========================================================
# SECURITY MIDDLEWARE
# =========================================================

from app.middleware.security import (
    add_security_headers,
)


# =========================================================
# ROUTERS
# =========================================================

from app.routes.interpretation_routes import (
    router as interpretation_router,
)

from app.routes.personality_routes import (
    router as personality_router,
)

from app.routes.recommendation_routes import (
    router as recommendation_router,
)

from app.routes.trend_routes import (
    router as trend_router,
)

from app.routes.scoring_routes import (
    router as scoring_router,
)

from app.routes.tarot_routes import (
    router as tarot_router,
)

from app.routes.palm_routes import (
    router as palm_router,
)

from app.routes.reading_routes import (
    router as reading_router,
)

from app.routes.analytics_routes import (
    router as analytics_router,
)

from app.routes.report_routes import (
    router as report_router,
)


# =========================================================
# LOGGING INITIALIZATION
# =========================================================

configure_logging()

logger = logging.getLogger(__name__)


# =========================================================
# PATH CONFIGURATION
# =========================================================

APP_DIR = Path(__file__).resolve().parent

STATIC_DIR = (
    APP_DIR
    / "static"
)

PALM_RESULTS_DIR = (
    STATIC_DIR
    / "palm_results"
)


# Make sure folders exist.
STATIC_DIR.mkdir(
    parents=True,
    exist_ok=True,
)

PALM_RESULTS_DIR.mkdir(
    parents=True,
    exist_ok=True,
)


# =========================================================
# FASTAPI APPLICATION
# =========================================================
configure_logging()
app = FastAPI(
    title=settings.APP_NAME,

    version=settings.APP_VERSION,

    description=(
        "AI-powered Palmistry and Tarot "
        "Intelligence Platform using palm "
        "analysis, tarot interpretation, "
        "Gemini AI, analytics and report "
        "generation."
    ),

    docs_url=(
        "/docs"
        if not settings.is_production
        else None
    ),

    redoc_url=(
        "/redoc"
        if not settings.is_production
        else None
    ),

    openapi_url=(
        "/openapi.json"
        if not settings.is_production
        else None
    ),
)


# =========================================================
# CORS CONFIGURATION
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.FRONTEND_URLS,
    allow_credentials=True,
    allow_methods=[
        "GET",
        "POST",
        "OPTIONS",
    ],
    allow_headers=[
        "Content-Type",
        "Authorization",
    ],
)


# =========================================================
# REQUEST LOGGING / MONITORING
# =========================================================

app.add_middleware(
    RequestLoggingMiddleware
)

# =========================================================
# TRUSTED HOST PROTECTION
# =========================================================

app.add_middleware(
    TrustedHostMiddleware,

    allowed_hosts=
        settings.ALLOWED_HOSTS,
)


# =========================================================
# SECURITY HEADERS
# =========================================================

app.middleware("http")(
    add_security_headers
)


# =========================================================
# GLOBAL EXCEPTION HANDLERS
# =========================================================

app.add_exception_handler(
    HTTPException,
    http_exception_handler,
)

app.add_exception_handler(
    RequestValidationError,
    validation_exception_handler,
)

app.add_exception_handler(
    Exception,
    unexpected_exception_handler,
)


# =========================================================
# STATIC FILES
# =========================================================

app.mount(
    "/static",

    StaticFiles(
        directory=str(
            STATIC_DIR
        )
    ),

    name="static",
)


# =========================================================
# REGISTER ROUTERS
# =========================================================

app.include_router(
    interpretation_router
)

app.include_router(
    personality_router
)

app.include_router(
    recommendation_router
)

app.include_router(
    monitoring_router
)

app.include_router(
    trend_router
)

app.include_router(
    scoring_router
)

app.include_router(
    tarot_router
)

app.include_router(
    palm_router
)

app.include_router(
    reading_router
)

app.include_router(
    analytics_router
)

app.include_router(
    report_router
)


# =========================================================
# ROOT ENDPOINT
# =========================================================

@app.get(
    "/",
    tags=["System"],
)
def root():

    return {
        "message": (
            "Palmistry & Tarot "
            "Intelligence Platform API"
        ),

        "status": "running",

        "version":
            settings.APP_VERSION,

        "environment":
            settings.APP_ENV,
    }


# =========================================================
# HEALTH CHECK
# =========================================================

@app.get(
    "/api/health",
    tags=["System"],
)
def health_check():

    return {
        "status":
            "healthy",

        "application":
            settings.APP_NAME,

        "version":
            settings.APP_VERSION,

        "environment":
            settings.APP_ENV,
    }