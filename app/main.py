import os
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from pathlib import Path
from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api import api_router
from app.core.config import settings
from app.db.base import Base
from app.db.session import engine


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan context manager for startup and shutdown events."""
    # Create DB tables on startup (if not already created by Alembic)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("[Startup] Database tables initialized successfully")

    # Ensure output results directory exists
    settings.OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    settings.ASSETS_DIR.mkdir(parents=True, exist_ok=True)

    yield

    # Clean up DB connections on shutdown
    await engine.dispose()
    print("[Shutdown] Database connection pool disposed")


app = FastAPI(
    title="Palmistry & Tarot Intelligence Platform API",
    description="Full-stack AI/ML Intelligence Backend combining UNet Palm line analysis, 78-card Tarot engine, Groq LLM synthesis, and automated PDF/Excel reports.",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Static Directories for assets and generated reading results
if settings.ASSETS_DIR.exists():
    app.mount("/assets", StaticFiles(directory=str(settings.ASSETS_DIR)), name="assets")

if settings.OUTPUT_DIR.exists():
    app.mount("/results", StaticFiles(directory=str(settings.OUTPUT_DIR)), name="results")

# Mount all API endpoints under /api
app.include_router(api_router)


@app.get("/health", tags=["Health"], status_code=status.HTTP_200_OK)
async def health_check():
    """Health check endpoint for container orchestrators and monitoring."""
    return {
        "status": "healthy",
        "service": "palmistry_backend",
        "version": "1.0.0",
        "environment": settings.ENVIRONMENT,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@app.get("/", tags=["Root"])
async def root():
    return {
        "message": "Palmistry & Tarot Intelligence Platform API is active.",
        "docs": "/docs",
        "health": "/health",
    }


if __name__ == "__main__":
    import uvicorn

    port = int(os.environ.get("PORT", settings.PORT))
    uvicorn.run("app.main:app", host=settings.HOST, port=port, reload=settings.DEBUG)

