from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.interpretation_routes import (
    router as interpretation_router,
)
from app.routes.personality_routes import (
    router as personality_router,
)
from app.routes.recommendation_routes import (
    router as recommendation_router,
)

app = FastAPI(
    title="Palmistry & Tarot Intelligence Platform API",
    description=(
        "Backend API for palm analysis, tarot readings, "
        "AI interpretation, personality intelligence "
        "and recommendations."
    ),
    version="1.1.0",
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
app.include_router(personality_router)
app.include_router(recommendation_router)

@app.get("/")
def root():
    return {
        "message": (
            "Palmistry & Tarot Intelligence Platform API"
        ),
        "status": "running",
        "version": "1.2.0",
        "available_modules": [
            "AI Interpretation Engine",
            "Personality Intelligence Module",
        ],
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "success",
        "backend": "FastAPI",
        "message": "Backend is working correctly.",
        "modules": {
            "interpretation_engine": "operational",
            "personality_intelligence": "operational",
        },
    }