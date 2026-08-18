from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.auth import router as auth_router
from app.history import router as history_router
from app.palm import router as palm_router
from app.tarot import router as tarot_router


app = FastAPI(
    title="Palmistry & Tarot Intelligence API",
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth_router)
app.include_router(history_router)
app.include_router(palm_router)
app.include_router(tarot_router)


@app.get("/")
def root():
    return {
        "message": "Palmistry & Tarot Intelligence API is running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }