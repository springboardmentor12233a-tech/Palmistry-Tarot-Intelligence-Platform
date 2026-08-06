from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.interpretation_routes import (
    router as interpretation_router,
)


app = FastAPI(
    title="Palmistry & Tarot Intelligence Platform API",
    description=(
        "Backend API for palm analysis, tarot readings, "
        "AI interpretation and recommendations."
    ),
    version="1.0.0",
)


allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(interpretation_router)


@app.get("/")
def root():
    return {
        "message": "Palmistry & Tarot Intelligence Platform API",
        "status": "running",
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "success",
        "backend": "FastAPI",
        "message": "Backend is working correctly.",
    }