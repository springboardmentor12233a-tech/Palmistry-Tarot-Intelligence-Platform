from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.database.base import Base
from app.database.session import engine


# =========================================================
# IMPORT MODELS
# =========================================================

from app.models.user import User
from app.models.palmistry import PalmistryReading
from app.models.tarot import TarotReading


# =========================================================
# IMPORT ROUTES
# =========================================================

from app.routes.auth import router as auth_router
from app.routes.tarot import router as tarot_router
from app.routes.palmistry import router as palmistry_router
from app.routes.dashboard import router as dashboard_router
from app.routes.reports import router as reports_router
from app.routes.insights import router as insights_router
from app.routes.admin import router as admin_router


# =========================================================
# CREATE DATABASE TABLES
# =========================================================

Base.metadata.create_all(
    bind=engine
)


# =========================================================
# APPLICATION
# =========================================================

app = FastAPI(
    title=settings.app_name,
    version="0.4.0",
    description=(
        "Palmistry & Tarot Intelligence Platform API."
    ),
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# STATIC FILES
# =========================================================

# Tarot card images
app.mount(
    "/static",
    StaticFiles(directory="app/static"),
    name="static",
)


# =========================================================
# ROUTES
# =========================================================

# Authentication
app.include_router(
    auth_router
)

# Tarot
app.include_router(
    tarot_router
)

# Palmistry
app.include_router(
    palmistry_router
)

# User Dashboard
app.include_router(
    dashboard_router
)

# PDF Reports
app.include_router(
    reports_router
)

# AI / Personal Insights
app.include_router(
    insights_router
)

# Admin
app.include_router(
    admin_router
)


# =========================================================
# ROOT
# =========================================================

@app.get("/")
def read_root():

    return {
        "application": settings.app_name,
        "message": (
            "Palmistry & Tarot Intelligence Platform "
            "backend is running."
        ),
        "phase": (
            "Authentication + Tarot + Palmistry + "
            "Reports + Insights API"
        ),
    }


# =========================================================
# HEALTH CHECK
# =========================================================

@app.get("/health")
def health_check():

    return {
        "status": "healthy",
        "service": "backend",
        "database": "connected",
    }