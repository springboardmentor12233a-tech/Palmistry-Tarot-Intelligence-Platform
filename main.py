"""
FastAPI backend for the Palmistry & Tarot Intelligence Platform.

Run locally with:
    uvicorn api.main:app --reload --port 8000

Docs auto-generated at http://localhost:8000/docs
"""

import base64
import io
import json
import os
import tempfile
MAX_PALM_IMAGE_SIZE = 10 * 1024 * 1024
from pathlib import Path

from dotenv import load_dotenv

# Load .env into the process environment. Only python-dotenv actually reads
# this file for a local `uvicorn` run — docker-compose's env_file: .env does
# the equivalent for container runs, so this is a no-op (and harmless) there.
load_dotenv()

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from services import ai_interpretation_service, dashboard_service, reading_service

# --- Configuration (env-driven, no hardcoded secrets/paths) ---
TAROT_DECK_PATH = os.environ.get("TAROT_DECK_PATH", "data/tarot-images.json")
PALMISTRY_CODE_DIR = os.environ.get("PALMISTRY_CODE_DIR", "palmistry-main/code")
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")

app = FastAPI(title="Palmistry & Tarot Intelligence API", version="1.0.0")

# Allow the Streamlit frontend (different port/origin) to call this API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ.get(
       "ALLOWED_ORIGINS",
       "http://localhost:8502,http://127.0.0.1:8502",
    ).split(","),

    allow_methods=["GET", "POST", "OPTIONS"],

    allow_headers=["Content-Type"],
)


def _encode_palm_image(combined_reading: dict) -> str | None:
    """Base64-encode the annotated result.jpg (hand with detected lines drawn
    over it) so the frontend can display it without a second round trip —
    there's no session concept between requests, so embedding it directly
    in the JSON response is simpler than a separate image endpoint."""
    path = combined_reading.get("result_image_path")
    if not path or not Path(path).exists():
        return None
    return base64.b64encode(Path(path).read_bytes()).decode("utf-8")


def _run_full_pipeline(image_bytes: bytes, filename: str, question: str, spread_size: int = 3) -> tuple[dict, dict]:
    """Shared logic for both the JSON and PDF endpoints."""
    with tempfile.TemporaryDirectory() as tmp_dir:
        image_path = Path(tmp_dir) / filename
        image_path.write_bytes(image_bytes)

        combined_reading = reading_service.generate_combined_reading(
            palm_image_path=str(image_path),
            tarot_deck_path=TAROT_DECK_PATH,
            palmistry_code_dir=PALMISTRY_CODE_DIR,
            tarot_question=question,
            spread_size=spread_size,
        )
        analysis = ai_interpretation_service.generate_full_analysis(
            combined_reading, api_key=GEMINI_API_KEY
        )
        return combined_reading, analysis


@app.get("/api/v1/health")
async def health():
    return {"status": "ok"}


@app.post("/api/v1/reading")
async def create_reading(
    question: str = Form(...),
    spread_size: int = Form(3),
    palm_image: UploadFile = File(...),
):
    """Returns the full reading + AI analysis as JSON, for the Streamlit dashboard."""
    if not palm_image.content_type or not palm_image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="palm_image must be an image file")

    if not palm_image.filename:
        raise HTTPException(
            status_code=400,
            detail="Palm image filename is missing.",
        )

    image_bytes = await palm_image.read()

    if len(image_bytes) > MAX_PALM_IMAGE_SIZE:
        raise HTTPException(
            status_code=413,
            detail="Palm image is too large. Maximum allowed size is 10 MB.",
        )
    combined_reading, analysis = _run_full_pipeline(
        image_bytes, palm_image.filename, question, spread_size
    )

    return {
        "combined_reading": {
            "tarot_question": combined_reading.get("tarot_question"),
            "cards_drawn": combined_reading.get("cards_drawn"),
            "tarot_source": combined_reading.get("tarot_source"),
            "palm_success": combined_reading.get("palm_success"),
            "palm_text": combined_reading.get("palm_text"),
            "palm_error": combined_reading.get("palm_error"),
            "palm_image_base64": _encode_palm_image(combined_reading),
        },
        "analysis": analysis,
    }


@app.post("/api/v1/reading/pdf")
async def create_reading_pdf(
    question: str = Form(...),
    spread_size: int = Form(3),
    palm_image: UploadFile = File(...),
):
    """Returns the same reading as a downloadable PDF (used by the 'Download report' button)."""
    if not palm_image.content_type or not palm_image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="palm_image must be an image file")

    if not palm_image.filename:
        raise HTTPException(
            status_code=400,
            detail="Palm image filename is missing.",
        )

    image_bytes = await palm_image.read()

    if len(image_bytes) > MAX_PALM_IMAGE_SIZE:
        raise HTTPException(
            status_code=413,
            detail="Palm image is too large. Maximum allowed size is 10 MB.",
        )
    combined_reading, analysis = _run_full_pipeline(
        image_bytes, palm_image.filename, question, spread_size
    )

    with tempfile.TemporaryDirectory() as tmp_dir:
        pdf_path = Path(tmp_dir) / "dashboard_report.pdf"
        dashboard_service.save_dashboard_report(
            analysis, combined_reading=combined_reading, output_path=str(pdf_path), user_question=question
        )
        pdf_bytes = pdf_path.read_bytes()

    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=dashboard_report.pdf"},
    )

@app.post("/api/v1/reading/saved-pdf")
async def create_saved_reading_pdf(
    reading_json: str = Form(...),
    question: str = Form(""),
):
    """Generate a PDF directly from a previously saved reading."""

    try:
        saved = json.loads(reading_json)

        combined_reading = saved.get("combined_reading", {})
        analysis = saved.get("analysis", {})

        if not combined_reading:
            raise HTTPException(
                status_code=400,
                detail="Saved reading data is empty.",
            )

        palm_image_base64 = combined_reading.get(
            "palm_image_base64"
        )

        with tempfile.TemporaryDirectory() as tmp_dir:

            if palm_image_base64:

                try:
                    palm_image_bytes = base64.b64decode(
                        palm_image_base64
                    )

                    palm_image_path = (
                        Path(tmp_dir) / "saved_palm_result.jpg"
                    )

                    palm_image_path.write_bytes(
                        palm_image_bytes
                    )

                    combined_reading["result_image_path"] = str(
                        palm_image_path
                    )

                except Exception as e:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Could not decode saved palm image: {e}",
                    )

            pdf_path = Path(tmp_dir) / "dashboard_report.pdf"

            dashboard_service.save_dashboard_report(
                analysis,
                combined_reading=combined_reading,
                output_path=str(pdf_path),
                user_question=question,
            )

            pdf_bytes = pdf_path.read_bytes()

        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={
                "Content-Disposition":
                    "attachment; filename=dashboard_report.pdf"
            },
        )

    except json.JSONDecodeError:
        raise HTTPException(
            status_code=400,
            detail="Invalid saved reading JSON.",
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Could not generate saved reading PDF: {e}",
        )

@app.post("/api/v1/chat")
async def chat_with_reading(
    message: str = Form(...),
    reading_json: str = Form(...),
    chat_history: str = Form("[]"),
):
    """Answer a user's question using their current reading as context."""

    try:
        saved = json.loads(reading_json)
        history = json.loads(chat_history)

        combined_reading = saved.get(
            "combined_reading",
            {},
        )

        analysis = saved.get(
            "analysis",
            {},
        )

        if not combined_reading:
            raise HTTPException(
                status_code=400,
                detail="Reading context is empty.",
            )

        if not isinstance(history, list):
            history = []

        answer = ai_interpretation_service.generate_chat_response(
            user_message=message,
            combined_reading=combined_reading,
            analysis=analysis,
            history=history,
            api_key=GEMINI_API_KEY,
        )

        return {
            "answer": answer,
        }

    except json.JSONDecodeError:
        raise HTTPException(
            status_code=400,
            detail="Invalid reading or chat history JSON.",
        )

    except Exception as e:
        logger.error(
            "Chat endpoint failed: %s",
            e,
            exc_info=True,
        )

        raise HTTPException(
            status_code=500,
            detail=f"Chat failed: {e}",
        )