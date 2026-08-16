import logging
from pathlib import Path

from fastapi import (
    FastAPI,
    HTTPException,
)

from fastapi.exceptions import (
    RequestValidationError,
)

from fastapi.middleware.trustedhost import (
    TrustedHostMiddleware,
)

from fastapi.staticfiles import (
    StaticFiles,
)

from starlette.middleware.cors import (
    CORSMiddleware,
)


# ============================================================
# CONFIGURATION
# ============================================================

from app.config import settings


# ============================================================
# DATABASE
# ============================================================

from app.core.database import (
    init_database,
)


# ============================================================
# LOGGING
# ============================================================

from app.logging_config import (
    configure_logging,
)


# ============================================================
# REQUEST MONITORING
# ============================================================

from app.middleware.request_logging import (
    RequestLoggingMiddleware,
)


# ============================================================
# GLOBAL ERROR HANDLERS
# ============================================================

from app.error_handlers import (
    http_exception_handler,
    unexpected_exception_handler,
    validation_exception_handler,
)


# ============================================================
# SECURITY MIDDLEWARE
# ============================================================

from app.middleware.security import (
    add_security_headers,
)


# ============================================================
# ROUTERS
# ============================================================

from app.routes.admin_routes import (
    router as admin_router,
)

from app.routes.analytics_routes import (
    router as analytics_router,
)

from app.routes.auth_routes import (
    router as auth_router,
)

from app.routes.chat_routes import (
    router as chat_router,
)

from app.routes.interpretation_routes import (
    router as interpretation_router,
)

from app.routes.monitoring_routes import (
    router as monitoring_router,
)

from app.routes.notification_routes import (
    router as notification_router,
)

from app.routes.palm_routes import (
    router as palm_router,
)

from app.routes.personality_routes import (
    router as personality_router,
)

from app.routes.reading_routes import (
    router as reading_router,
)

from app.routes.recommendation_routes import (
    router as recommendation_router,
)

from app.routes.report_routes import (
    router as report_router,
)

from app.routes.scoring_routes import (
    router as scoring_router,
)

from app.routes.spiritual_consultant_routes import (
    router as spiritual_consultant_router,
)

from app.routes.tarot_reader_routes import (
    router as tarot_reader_router,
)

from app.routes.tarot_routes import (
    router as tarot_router,
)

from app.routes.trend_routes import (
    router as trend_router,
)


# ============================================================
# LOGGING INITIALIZATION
# ============================================================

configure_logging()

logger = logging.getLogger(
    __name__
)


# ============================================================
# DATABASE INITIALIZATION
# ============================================================

try:

    init_database()

    logger.info(
        "Application database initialized successfully."
    )

except Exception:

    logger.exception(
        "Application database initialization failed."
    )

    raise


# ============================================================
# PATH CONFIGURATION
# ============================================================

APP_DIR = (
    Path(__file__)
    .resolve()
    .parent
)

STATIC_DIR = (
    APP_DIR
    / "static"
)

PALM_RESULTS_DIR = (
    STATIC_DIR
    / "palm_results"
)


STATIC_DIR.mkdir(
    parents=True,
    exist_ok=True,
)

PALM_RESULTS_DIR.mkdir(
    parents=True,
    exist_ok=True,
)


# ============================================================
# CORS ORIGIN NORMALIZATION
# ============================================================

CORS_ORIGINS = []


for origin in settings.FRONTEND_URLS:

    normalized_origin = (
        origin
        .strip()
        .rstrip("/")
    )

    if (
        normalized_origin
        and normalized_origin
        not in CORS_ORIGINS
    ):

        CORS_ORIGINS.append(
            normalized_origin
        )


logger.info(
    "Configured CORS origins: %s",
    CORS_ORIGINS,
)


# ============================================================
# FASTAPI APPLICATION
# ============================================================

fastapi_app = FastAPI(

    title=settings.APP_NAME,

    version=settings.APP_VERSION,

    description=(
        "AI-powered Palmistry and Tarot "
        "Intelligence Platform using palm "
        "analysis, tarot interpretation, "
        "Gemini AI, authentication, "
        "personality intelligence, "
        "recommendations, life trends, "
        "guidance scoring, analytics, "
        "report generation and monitoring."
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


# ============================================================
# REQUEST LOGGING / MONITORING
# ============================================================

fastapi_app.add_middleware(
    RequestLoggingMiddleware
)


# ============================================================
# TRUSTED HOST PROTECTION
# ============================================================

fastapi_app.add_middleware(
    TrustedHostMiddleware,

    allowed_hosts=(
        settings.ALLOWED_HOSTS
    ),
)


# ============================================================
# SECURITY HEADERS
# ============================================================

fastapi_app.middleware(
    "http"
)(
    add_security_headers
)


# ============================================================
# GLOBAL EXCEPTION HANDLERS
# ============================================================

fastapi_app.add_exception_handler(
    HTTPException,
    http_exception_handler,
)

fastapi_app.add_exception_handler(
    RequestValidationError,
    validation_exception_handler,
)

fastapi_app.add_exception_handler(
    Exception,
    unexpected_exception_handler,
)


# ============================================================
# STATIC FILES
# ============================================================

fastapi_app.mount(

    "/static",

    StaticFiles(
        directory=str(
            STATIC_DIR
        )
    ),

    name="static",
)


# ============================================================
# REGISTER ROUTERS
# ============================================================

# ------------------------------------------------------------
# Authentication & User Management
# ------------------------------------------------------------

fastapi_app.include_router(
    auth_router
)

fastapi_app.include_router(
    tarot_reader_router
)

fastapi_app.include_router(
    spiritual_consultant_router
)

fastapi_app.include_router(
    admin_router
)


# ------------------------------------------------------------
# Monitoring
# ------------------------------------------------------------

fastapi_app.include_router(
    monitoring_router
)


# ------------------------------------------------------------
# Palm & Tarot Engines
# ------------------------------------------------------------

fastapi_app.include_router(
    palm_router
)

fastapi_app.include_router(
    tarot_router
)


# ------------------------------------------------------------
# AI Intelligence Modules
# ------------------------------------------------------------

fastapi_app.include_router(
    interpretation_router
)

fastapi_app.include_router(
    personality_router
)

fastapi_app.include_router(
    recommendation_router
)

fastapi_app.include_router(
    trend_router
)

fastapi_app.include_router(
    scoring_router
)


# ------------------------------------------------------------
# Complete Reading & Follow-up Chat
# ------------------------------------------------------------

fastapi_app.include_router(
    reading_router
)

fastapi_app.include_router(
    chat_router
)


# ------------------------------------------------------------
# Analytics / Reports / Notifications
# ------------------------------------------------------------

fastapi_app.include_router(
    analytics_router
)

fastapi_app.include_router(
    report_router
)

fastapi_app.include_router(
    notification_router
)


# ============================================================
# ROOT ENDPOINT
# ============================================================

@fastapi_app.get(
    "/",
    tags=["System"],
)
def root():

    return {

        "message": (
            "Palmistry & Tarot "
            "Intelligence Platform API"
        ),

        "version": (
            settings.APP_VERSION
        ),

        "environment": (
            settings.APP_ENV
        ),

        "health": (
            "/api/health"
        ),

        "monitoring": (
            "/api/monitoring/status"
        ),

        "authentication": {

            "register": (
                "/api/auth/register"
            ),

            "login": (
                "/api/auth/login"
            ),

            "current_user": (
                "/api/auth/me"
            ),

            "profile": (
                "/api/auth/profile"
            ),
        },

        "documentation": (
            "/docs"
            if not settings.is_production
            else "Disabled in production"
        ),
    }


# ============================================================
# HEALTH ENDPOINT
# ============================================================

@fastapi_app.get(
    "/api/health",
    tags=["System"],
)
def health_check():

    return {

        "status":
            "healthy",

        "application": (
            settings.APP_NAME
        ),

        "version": (
            settings.APP_VERSION
        ),

        "environment": (
            settings.APP_ENV
        ),

        "services": {

            "api":
                "available",

            "database":
                "initialized",

            "authentication":
                "available",

            "monitoring":
                "available",
        },
    }


# ============================================================
# GLOBAL CORS WRAPPER
# ============================================================
#
# Keep this as the OUTERMOST application layer.
#
# This ensures that CORS headers are attached not only to
# successful responses but also to authentication, validation
# and other error responses.
# ============================================================

app = CORSMiddleware(

    app=fastapi_app,

    allow_origins=(
        CORS_ORIGINS
    ),

    allow_credentials=True,

    allow_methods=[
        "GET",
        "POST",
        "PUT",
        "PATCH",
        "DELETE",
        "OPTIONS",
    ],

    allow_headers=[
        "Content-Type",
        "Authorization",
        "X-Request-ID",
    ],

    expose_headers=[
        "X-Request-ID",
        "X-Process-Time-MS",
    ],
)