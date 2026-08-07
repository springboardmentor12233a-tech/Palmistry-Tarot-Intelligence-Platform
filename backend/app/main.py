from pathlib import Path

from fastapi.staticfiles import StaticFiles

from app.routes.palm_routes import (
    router as palm_router,
)
from fastapi import FastAPI
from fastapi.middleware.cors import (
    CORSMiddleware,
)

from app.routes.interpretation_routes import (
    router as interpretation_router,
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
from app.routes.scoring_routes import (
    router as scoring_router,
)
from app.routes.trend_routes import (
    router as trend_router,
)
from app.routes.tarot_routes import (
    router as tarot_router,
)


app = FastAPI(
    title=(
        "Palmistry & Tarot Intelligence "
        "Platform API"
    ),
    description=(
        "Backend API for palm analysis, tarot "
        "readings, AI interpretation, personality "
        "intelligence, recommendations, life trends "
        "and guidance scoring."
    ),
    version="1.5.0",
)
STATIC_DIRECTORY = (
    Path(__file__).resolve().parent
    / "static"
)

STATIC_DIRECTORY.mkdir(
    parents=True,
    exist_ok=True,
)

app.mount(
    "/static",
    StaticFiles(
        directory=str(STATIC_DIRECTORY)
    ),
    name="static",
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
app.include_router(
    reading_router
)
app.include_router(tarot_router)
app.include_router(palm_router)

@app.get("/")
def root():
    return {
        "message": (
            "Palmistry & Tarot Intelligence "
            "Platform API"
        ),
        "status": "running",
        "version": "1.6.0",
        "available_modules": [
            "AI Interpretation Engine",
            "Personality Intelligence Module",
            "Recommendation Engine",
            "Life Trend Analysis",
            "Guidance Scoring Engine",
            "Complete Reading Workflow",
        ],
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "success",
        "backend": "FastAPI",
        "message": (
            "Backend is working correctly."
        ),
        "modules": {
            "interpretation_engine": (
                "operational"
            ),
            "personality_intelligence": (
                "operational"
            ),
            "recommendation_engine": (
                "operational"
            ),
            "life_trend_analysis": (
                "operational"
            ),
            "guidance_scoring": (
                "operational"
            ),
            "complete_reading_workflow": (
                "operational"
            ),
        },
    }