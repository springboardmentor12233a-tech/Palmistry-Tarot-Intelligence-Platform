from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, File, UploadFile

from app.core.config import get_settings
from app.services.palm_engine import analyze_palm_image
from app.services.pdf_generator import generate_palm_pdf


router = APIRouter(prefix="/api/palm", tags=["palm"])


@router.post("/reading")
async def palm_reading(file: UploadFile = File(...)) -> dict:
    settings = get_settings()
    suffix = Path(file.filename or "palm.jpg").suffix or ".jpg"
    upload_path = settings.uploads_dir / f"{uuid4().hex}{suffix}"

    with upload_path.open("wb") as output:
        output.write(await file.read())

    analysis = analyze_palm_image(upload_path)
    pdf_path = generate_palm_pdf(analysis)
    analysis["pdf_path"] = str(pdf_path)
    analysis["pdf_url"] = f"/api/files/{pdf_path.name}"
    return analysis
