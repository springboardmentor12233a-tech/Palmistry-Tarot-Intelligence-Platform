import os
import uuid

from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    UploadFile,
)
from fastapi.security import (
    HTTPAuthorizationCredentials,
    HTTPBearer,
)
from jose import JWTError
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.database.session import get_db
from app.models.palmistry import PalmistryReading
from app.models.user import User


router = APIRouter(
    prefix="/api/palmistry",
    tags=["Palmistry"],
)

security = HTTPBearer()


# =========================================================
# UPLOAD DIRECTORY
# =========================================================

UPLOAD_DIR = os.path.join(
    os.path.dirname(
        os.path.dirname(
            os.path.dirname(__file__)
        )
    ),
    "uploads",
    "palms",
)

os.makedirs(
    UPLOAD_DIR,
    exist_ok=True,
)


# =========================================================
# GET CURRENT USER
# =========================================================

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(
        security
    ),
    db: Session = Depends(get_db),
):
    token = credentials.credentials

    try:
        payload = decode_access_token(token)

        user_id = payload.get("sub")

        if not user_id:
            raise HTTPException(
                status_code=401,
                detail="Invalid authentication token.",
            )

    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired authentication token.",
        )

    try:
        user_id = int(user_id)

    except (TypeError, ValueError):
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication token.",
        )

    user = db.get(
        User,
        user_id,
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found.",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=403,
            detail="This account is inactive.",
        )

    return user


# =========================================================
# PALM ANALYSIS
# =========================================================

@router.post("/analyze")
async def analyze_palm(
    image: UploadFile = File(...),
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
):
    # -----------------------------------------------------
    # VALIDATE IMAGE TYPE
    # -----------------------------------------------------

    allowed_types = {
        "image/jpeg",
        "image/jpg",
        "image/png",
    }

    if image.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=(
                "Please upload a JPG, JPEG, "
                "or PNG image."
            ),
        )

    # -----------------------------------------------------
    # VALIDATE FILE EXTENSION
    # -----------------------------------------------------

    extension = os.path.splitext(
        image.filename or ""
    )[1].lower()

    if extension not in {
        ".jpg",
        ".jpeg",
        ".png",
    }:
        extension = ".jpg"

    # -----------------------------------------------------
    # GENERATE UNIQUE FILENAME
    # -----------------------------------------------------

    unique_filename = (
        f"{uuid.uuid4().hex}{extension}"
    )

    file_path = os.path.join(
        UPLOAD_DIR,
        unique_filename,
    )

    # -----------------------------------------------------
    # READ IMAGE
    # -----------------------------------------------------

    contents = await image.read()

    if not contents:
        raise HTTPException(
            status_code=400,
            detail="The uploaded image is empty.",
        )

    # -----------------------------------------------------
    # FILE SIZE PROTECTION
    # Maximum: 10 MB
    # -----------------------------------------------------

    max_file_size = 10 * 1024 * 1024

    if len(contents) > max_file_size:
        raise HTTPException(
            status_code=400,
            detail=(
                "Image size must be less than 10 MB."
            ),
        )

    # -----------------------------------------------------
    # SAVE IMAGE
    # -----------------------------------------------------

    try:
        with open(
            file_path,
            "wb",
        ) as buffer:
            buffer.write(contents)

    except OSError:
        raise HTTPException(
            status_code=500,
            detail=(
                "Unable to save the uploaded "
                "palm image."
            ),
        )

    # =====================================================
    # PALM ANALYSIS
    #
    # CURRENT MVP:
    # Symbolic interpretation layer.
    #
    # The database and PDF pipeline are already prepared
    # so a computer-vision model can be integrated later.
    # =====================================================

    palm_shape = (
        "Balanced palm shape"
    )

    life_line = (
        "The life line is symbolically associated "
        "with vitality, resilience, and the way a person "
        "approaches major life transitions."
    )

    head_line = (
        "The head line represents symbolic themes of "
        "thinking, decision-making, learning, and "
        "personal problem solving."
    )

    heart_line = (
        "The heart line is symbolically connected with "
        "emotional expression, relationships, empathy, "
        "and personal connection."
    )

    fate_line = (
        "The fate line represents symbolic themes of "
        "direction, ambition, responsibility, and "
        "career-related choices."
    )

    sun_line = (
        "The sun line is symbolically associated with "
        "creativity, confidence, recognition, and "
        "personal expression."
    )

    overall_reading = (
        "Your palm reading suggests a balanced symbolic "
        "pattern. The interpretation highlights resilience, "
        "thoughtful decision-making, emotional awareness, "
        "and continued personal growth. Use these insights "
        "as a reflection tool rather than as a prediction "
        "of future events."
    )

    # -----------------------------------------------------
    # SAVE READING
    # -----------------------------------------------------

    reading = PalmistryReading(
        user_id=current_user.id,
        image_filename=unique_filename,
        image_path=file_path,
        palm_shape=palm_shape,
        life_line=life_line,
        head_line=head_line,
        heart_line=heart_line,
        fate_line=fate_line,
        sun_line=sun_line,
        overall_reading=overall_reading,
    )

    db.add(reading)
    db.commit()
    db.refresh(reading)

    # -----------------------------------------------------
    # RESPONSE
    # -----------------------------------------------------

    return {
        "message": (
            "Palm analysis completed successfully."
        ),
        "reading_id": reading.id,
        "user_id": current_user.id,
        "created_at": reading.created_at,
        "palm": {
            "shape": reading.palm_shape,
            "life_line": reading.life_line,
            "head_line": reading.head_line,
            "heart_line": reading.heart_line,
            "fate_line": reading.fate_line,
            "sun_line": reading.sun_line,
        },
        "overall_reading": (
            reading.overall_reading
        ),
        "image": {
            "filename": (
                reading.image_filename
            ),
            "path": reading.image_path,
        },
        "disclaimer": (
            "Palmistry interpretations are provided "
            "for self-reflection and entertainment "
            "purposes only."
        ),
    }


# =========================================================
# GET USER'S PALM READINGS
# =========================================================

@router.get("/readings")
def get_my_palm_readings(
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
):
    readings = (
        db.query(PalmistryReading)
        .filter(
            PalmistryReading.user_id
            == current_user.id
        )
        .order_by(
            PalmistryReading.created_at.desc()
        )
        .all()
    )

    return {
        "count": len(readings),
        "readings": [
            {
                "id": reading.id,
                "created_at": reading.created_at,
                "image_filename": (
                    reading.image_filename
                ),
                "palm_shape": (
                    reading.palm_shape
                ),
                "life_line": (
                    reading.life_line
                ),
                "head_line": (
                    reading.head_line
                ),
                "heart_line": (
                    reading.heart_line
                ),
                "fate_line": (
                    reading.fate_line
                ),
                "sun_line": (
                    reading.sun_line
                ),
                "overall_reading": (
                    reading.overall_reading
                ),
            }
            for reading in readings
        ],
    }


# =========================================================
# GET SINGLE PALM READING
# =========================================================

@router.get("/readings/{reading_id}")
def get_palm_reading(
    reading_id: int,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
):
    reading = (
        db.query(PalmistryReading)
        .filter(
            PalmistryReading.id == reading_id,
            PalmistryReading.user_id
            == current_user.id,
        )
        .first()
    )

    if not reading:
        raise HTTPException(
            status_code=404,
            detail="Palmistry reading not found.",
        )

    return {
        "id": reading.id,
        "user_id": reading.user_id,
        "created_at": reading.created_at,
        "image_filename": (
            reading.image_filename
        ),
        "image_path": (
            reading.image_path
        ),
        "palm_shape": (
            reading.palm_shape
        ),
        "life_line": (
            reading.life_line
        ),
        "head_line": (
            reading.head_line
        ),
        "heart_line": (
            reading.heart_line
        ),
        "fate_line": (
            reading.fate_line
        ),
        "sun_line": (
            reading.sun_line
        ),
        "overall_reading": (
            reading.overall_reading
        ),
        "disclaimer": (
            "Palmistry interpretations are provided "
            "for self-reflection and entertainment "
            "purposes only."
        ),
    }