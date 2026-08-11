import os
import shutil
import uuid

from fastapi import FastAPI, UploadFile, File , Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from app.palm_pipeline import analyze_palm
from app.tarot_pipeline import draw_spread
from datetime import datetime

from app.llm_interpretation import (
    generate_palm_llm_reading,
    generate_tarot_llm_reading,
    generate_combined_llm_reading,
)

from app.pdf_export import (
    export_palm_pdf,
    export_tarot_pdf,
    export_combined_pdf,
)

from app.auth_routes import router as auth_router
from app.auth import get_current_user
from app.database import save_reading, get_user_readings, get_reading_stats, users_collection

BASE_DIR = os.path.dirname(os.path.dirname(__file__))  # backend/
UPLOADS_DIR = os.path.join(BASE_DIR, "uploads")
RESULTS_DIR = os.path.join(BASE_DIR, "results")

os.makedirs(UPLOADS_DIR, exist_ok=True)
os.makedirs(RESULTS_DIR, exist_ok=True)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth_router, prefix="/auth", tags=["auth"])

# Serve annotated images so the frontend can display them directly
app.mount("/results", StaticFiles(directory=RESULTS_DIR), name="results")
app.mount("/card-images", StaticFiles(directory=os.path.join(os.path.dirname(__file__), "data", "tarot", "cards")), name="card-images")

@app.get("/")
def read_root():
    return {"message": "Backend is running"}


@app.post("/analyze-palm")
async def analyze_palm_endpoint(
    file: UploadFile = File(...),
    current_user_email: str = Depends(get_current_user)
):
    request_id = str(uuid.uuid4())

    upload_path = os.path.join(
        UPLOADS_DIR,
        f"{request_id}_{file.filename}"
    )

    with open(upload_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    result_dir = os.path.join(RESULTS_DIR, request_id)

    result = analyze_palm(upload_path, result_dir)

    if not result["success"]:
        return {
            "success": False,
            "error": result["error"]
        }

    annotated_filename = os.path.basename(
        result["result_image_path"]
    )

    image_url = f"/results/{request_id}/{annotated_filename}"

    lines_summary = {
        name: {
            "relative_length": data["relative_length"],
            "length_px": data["length_px"],
        }
        for name, data in result["lines"].items()
    }

    reading = generate_palm_llm_reading(lines_summary)

    export_palm_pdf(
        request_id,
        reading,
        result["result_image_path"]
    )

    response_data = {
        "success": True,
        "lines": lines_summary,
        "annotated_image_url": image_url,
        "reading": reading,
        "pdf_url": f"/results/{request_id}/palm_reading.pdf",
    }

    await save_reading(current_user_email, "palm", response_data)

    return response_data
@app.post("/draw-tarot")
async def draw_tarot_endpoint(
    spread_type: str = "three_card",
    current_user_email: str = Depends(get_current_user)
):

    request_id = str(uuid.uuid4())

    spread = draw_spread(spread_type)

    reading = generate_tarot_llm_reading(spread)

    export_tarot_pdf(
        request_id,
        spread,
        reading
    )

    cards_summary = [
        {
            "position": card["position"],
            "name": card["name"],
            "reversed": card["reversed"],
            "keywords": card["keywords"],
            "image_filename": card["image_filename"],
        }
        for card in spread
    ]

    response_data = {
        "success": True,
        "cards": cards_summary,
        "reading": reading,
        "pdf_url": f"/results/{request_id}/tarot_reading.pdf",
    }

    await save_reading(current_user_email, "tarot", response_data)

    return response_data

@app.post("/combined-reading")
async def combined_reading_endpoint(
    file: UploadFile = File(...),
    spread_type: str = "three_card",
    current_user_email: str = Depends(get_current_user)
):
    request_id = str(uuid.uuid4())

    upload_path = os.path.join(UPLOADS_DIR, f"{request_id}_{file.filename}")
    with open(upload_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    result_dir = os.path.join(RESULTS_DIR, request_id)
    palm_result = analyze_palm(upload_path, result_dir)

    if not palm_result["success"]:
        return {"success": False, "error": palm_result["error"]}

    lines_summary = {
        name: {
            "relative_length": data["relative_length"],
            "length_px": data["length_px"]
        }
        for name, data in palm_result["lines"].items()
    }

    palm_reading = generate_palm_llm_reading(lines_summary)

    tarot_spread = draw_spread(spread_type)
    tarot_reading = generate_tarot_llm_reading(tarot_spread)

    combined_reading = generate_combined_llm_reading(
        palm_reading,
        tarot_reading
    )

    export_combined_pdf(
        request_id,
        palm_reading,
        tarot_spread,
        tarot_reading,
        combined_reading,
        palm_result["result_image_path"]
    )

    response_data = {
        "success": True,
        "lines": lines_summary,
        "annotated_image_url": f"/results/{request_id}/annotated_palm.jpg",
        "palm_reading": palm_reading,
        "tarot_cards": [
            {
                "position": c["position"],
                "name": c["name"],
                "reversed": c["reversed"],
                "image_filename": c["image_filename"]
            }
            for c in tarot_spread
        ],
        "tarot_reading": tarot_reading,
        "combined_reading": combined_reading,
        "pdf_url": f"/results/{request_id}/combined_reading.pdf"
    }

    await save_reading(current_user_email, "combined", response_data)

    return response_data


class CurrentUserResponse(BaseModel):
    name: str | None = None
    email: str
    created_at: datetime | None = None

@app.get("/auth/me", response_model=CurrentUserResponse)
async def read_current_user(
    current_user_email: str = Depends(get_current_user)
):
    user_doc = await users_collection.find_one(
        {"email": current_user_email}
    )

    if not user_doc:
        return {
            "email": current_user_email,
            "created_at": None
        }

    return {
        "name": user_doc.get("name"),
        "email": user_doc.get("email"),
        "created_at": user_doc.get("created_at")
    }

@app.get("/my-readings")
async def my_readings_endpoint(current_user_email: str = Depends(get_current_user)):
    readings = await get_user_readings(current_user_email)
    return {"success": True, "readings": readings}

@app.get("/profile-stats")
async def profile_stats_endpoint(current_user_email: str = Depends(get_current_user)):
    stats = await get_reading_stats(current_user_email)
    return {"success": True, "stats": stats}