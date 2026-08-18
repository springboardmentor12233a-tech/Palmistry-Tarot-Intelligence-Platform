from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

from app.core.config import get_settings
from app.routes import palm, tarot
from app.routes.features import router as features_router


app = FastAPI(title="AI Palmistry and Tarot Intelligence API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5174", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tarot.router)
app.include_router(palm.router)
app.include_router(features_router)


@app.get("/api/health")
def health_check() -> dict:
    return {"status": "ok"}


@app.get("/api/files/{filename}")
def download_generated_file(filename: str) -> FileResponse:
    settings = get_settings()
    file_path = settings.generated_outputs_dir / filename
    if not file_path.exists() or not file_path.is_file():
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(path=Path(file_path), filename=filename)
