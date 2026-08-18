from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings, STATIC_DIR
from app.database import Base, engine
from app import models  # noqa: F401 - registers models on Base
from app.routers import auth, palm, tarot, reports, chat

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Palmistry & Tarot Intelligence API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

app.include_router(auth.router)
app.include_router(palm.router)
app.include_router(tarot.router)
app.include_router(reports.router)
app.include_router(chat.router)


@app.get("/")
def root():
    return {"status": "ok", "service": "Palmistry & Tarot Intelligence API"}


@app.get("/health")
def health():
    return {"status": "healthy"}
