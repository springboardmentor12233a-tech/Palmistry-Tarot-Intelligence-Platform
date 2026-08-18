from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.user import User
from app.models.palmistry import PalmistryReading
from app.models.tarot import TarotReading
from app.routes.palmistry import get_current_user


router = APIRouter(
    prefix="/api/dashboard",
    tags=["Dashboard"],
)


# =========================================================
# GET CURRENT USER DASHBOARD STATISTICS
# =========================================================

@router.get("/stats")
def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):

    # -----------------------------------------------------
    # Count Palmistry readings for logged-in user
    # -----------------------------------------------------

    palmistry_count = (
        db.query(PalmistryReading)
        .filter(
            PalmistryReading.user_id == current_user.id
        )
        .count()
    )

    # -----------------------------------------------------
    # Count Tarot readings for logged-in user
    # -----------------------------------------------------

    tarot_count = (
        db.query(TarotReading)
        .filter(
            TarotReading.user_id == current_user.id
        )
        .count()
    )

    # -----------------------------------------------------
    # Total readings
    # -----------------------------------------------------

    total_readings = (
        palmistry_count + tarot_count
    )

    # -----------------------------------------------------
    # Latest Palmistry reading
    # -----------------------------------------------------

    latest_palmistry = (
        db.query(PalmistryReading)
        .filter(
            PalmistryReading.user_id == current_user.id
        )
        .order_by(
            PalmistryReading.created_at.desc()
        )
        .first()
    )

    # -----------------------------------------------------
    # Latest Tarot reading
    # -----------------------------------------------------

    latest_tarot = (
        db.query(TarotReading)
        .filter(
            TarotReading.user_id == current_user.id
        )
        .order_by(
            TarotReading.created_at.desc()
        )
        .first()
    )

    # -----------------------------------------------------
    # Determine latest reading
    # -----------------------------------------------------

    latest_type = None
    latest_created_at = None

    if latest_palmistry and latest_tarot:

        if (
            latest_palmistry.created_at
            >= latest_tarot.created_at
        ):
            latest_type = "Palmistry"
            latest_created_at = (
                latest_palmistry.created_at
            )
        else:
            latest_type = "Tarot"
            latest_created_at = (
                latest_tarot.created_at
            )

    elif latest_palmistry:

        latest_type = "Palmistry"
        latest_created_at = (
            latest_palmistry.created_at
        )

    elif latest_tarot:

        latest_type = "Tarot"
        latest_created_at = (
            latest_tarot.created_at
        )

    # -----------------------------------------------------
    # Response
    # -----------------------------------------------------

    return {
        "user_id": current_user.id,
        "user_name": current_user.name,

        "statistics": {
            "total_readings": total_readings,
            "palmistry_readings": palmistry_count,
            "tarot_readings": tarot_count,
        },

        "latest_reading": {
            "type": latest_type,
            "created_at": latest_created_at,
        },
    }