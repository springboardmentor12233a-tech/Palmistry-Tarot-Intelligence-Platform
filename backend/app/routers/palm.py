import json
import os
import uuid

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user
from app import models, schemas
from app.config import UPLOADS_DIR
from app.services import hand_detection, preprocessing, line_graph, features as feat_service
from app.services import groq_service

router = APIRouter(prefix="/palm", tags=["palm"])


@router.post("/analyze", response_model=schemas.ReadingOut)
async def analyze_palm(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if file.content_type not in ("image/jpeg", "image/png", "image/webp", "image/jpg"):
        raise HTTPException(status_code=400, detail="Please upload a JPEG, PNG, or WEBP image")

    ext = os.path.splitext(file.filename or "upload.jpg")[1] or ".jpg"
    uid = uuid.uuid4().hex[:12]
    upload_filename = f"{uid}{ext}"
    upload_path = os.path.join(UPLOADS_DIR, upload_filename)
    with open(upload_path, "wb") as f:
        f.write(await file.read())

    try:
        hand = hand_detection.detect_and_extract_roi(upload_path)
    except hand_detection.HandNotFoundError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Could not process image: {e}")

    pre = preprocessing.preprocess_palm(hand["palm_roi_rgb"])
    graph, _, _ = line_graph.build_graph(pre["skeleton"])
    lines = line_graph.detect_lines(graph, pre["skeleton"].shape)
    features = feat_service.extract_features(lines)
    # Note: the skeleton/lines/landmark visualizations are computed above purely to
    # extract features - they're intentionally NOT saved or surfaced in the report.
    # Only the user's original photo is shown/stored as an image.

    try:
        report_md = groq_service.palm_interpretation(features)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI interpretation failed: {e}")

    images = {
        "original": f"/static/uploads/{upload_filename}",
    }

    reading = models.Reading(
        user_id=current_user.id,
        type="palm",
        title=f"Palm Reading ({hand['hand_side']} hand)",
        input_data=json.dumps({"features": features, "hand_side": hand["hand_side"]}),
        result_markdown=report_md,
        images=json.dumps(images),
    )
    db.add(reading)
    db.commit()
    db.refresh(reading)

    reading.input_data = json.loads(reading.input_data)
    reading.images = json.loads(reading.images)
    return reading
