import logging
from pathlib import Path
from app.routes.admin_routes import (
    router as admin_router,
)
from app.routes.chat_routes import (
    router as chat_router,
)

# Tarot Reader Dashboard
from app.routes.tarot_reader_routes import (
    router as tarot_reader_router,
)

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

# Spiritual Consultant Dashboard
from app.routes.spiritual_consultant_routes import (
    router as spiritual_consultant_router,
)

# =========================================================
# CONFIGURATION
# =========================================================

from app.config import settings


# =========================================================
# DATABASE
# =========================================================

from app.core.database import (
    init_database,
)


# =========================================================
# LOGGING
# =========================================================

from app.logging_config import (
    configure_logging,
)


# =========================================================
# REQUEST MONITORING
# =========================================================

from app.middleware.request_logging import (
    RequestLoggingMiddleware,
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

# Authentication
from app.routes.auth_routes import (
    router as auth_router,
)

# Monitoring
from app.routes.monitoring_routes import (
    router as monitoring_router,
)

# AI interpretation
from app.routes.interpretation_routes import (
    router as interpretation_router,
)

# Personality intelligence
from app.routes.personality_routes import (
    router as personality_router,
)

# Recommendations
from app.routes.recommendation_routes import (
    router as recommendation_router,
)

# Life trends
from app.routes.trend_routes import (
    router as trend_router,
)

# Guidance scoring
from app.routes.scoring_routes import (
    router as scoring_router,
)

# Tarot
from app.routes.tarot_routes import (
    router as tarot_router,
)

# Palm analysis
from app.routes.palm_routes import (
    router as palm_router,
)

# Complete reading
from app.routes.reading_routes import (
    router as reading_router,
)

# Analytics
from app.routes.analytics_routes import (
    router as analytics_router,
)

# Reports
from app.routes.report_routes import (
    router as report_router,
)

# Notifications
from app.routes.notification_routes import (
    router as notification_router,
)


# =========================================================
# LOGGING INITIALIZATION
# =========================================================

configure_logging()

logger = logging.getLogger(
    __name__
)


# =========================================================
# DATABASE INITIALIZATION
# =========================================================

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


# =========================================================
# PATH CONFIGURATION
# =========================================================

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


# Ensure required static directories exist.
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

app = FastAPI(
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


# =========================================================
# CORS CONFIGURATION
# =========================================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=(
        settings.FRONTEND_URLS
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

    allowed_hosts=(
        settings.ALLOWED_HOSTS
    ),
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

# ---------------------------------------------------------
# Authentication & User Management
# ---------------------------------------------------------

app.include_router(
    auth_router
)

app.include_router(
    tarot_reader_router
)

app.include_router(
    spiritual_consultant_router
)

app.include_router(
    admin_router
)
# ---------------------------------------------------------
# Monitoring
# ---------------------------------------------------------

app.include_router(
    monitoring_router
)


# ---------------------------------------------------------
# Palm & Tarot Engines
# ---------------------------------------------------------

app.include_router(
    palm_router
)

app.include_router(
    tarot_router
)


# ---------------------------------------------------------
# AI Intelligence Modules
# ---------------------------------------------------------

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
    trend_router
)

app.include_router(
    scoring_router
)


# ---------------------------------------------------------
# Complete Reading
# ---------------------------------------------------------

app.include_router(
    reading_router
)
app.include_router(
    chat_router
)

# ---------------------------------------------------------
# Analytics & Reports
# ---------------------------------------------------------

app.include_router(
    analytics_router
)

app.include_router(
    report_router
)

app.include_router(
    notification_router
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


# =========================================================
# HEALTH ENDPOINT
# =========================================================

@app.get(
    "/api/health",
    tags=["System"],
)
def health_check():
    return {
        "status": "healthy",

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
            "api": "available",
            "database": "initialized",
            "authentication": "available",
            "monitoring": "available",
        },
    }