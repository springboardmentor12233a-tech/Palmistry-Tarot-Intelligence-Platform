from typing import List
from fastapi import APIRouter
from app.schemas.notification import NotificationItem

router = APIRouter(prefix="/notifications", tags=["Notifications"])

DEFAULT_NOTIFICATIONS: List[NotificationItem] = [
    NotificationItem(
        id="notif_1",
        type="celestial_transit",
        title="Venus enters Pisces Trine Jupiter",
        message="High relational harmony and creative alchemical breakthrough window active for the next 72 hours.",
        date="2 hours ago",
        read=False,
        link="/reading",
    ),
    NotificationItem(
        id="notif_2",
        type="insight_update",
        title="Synthesized Insight Calibrated",
        message="Your palm biometric indicators have been integrated into your archetypal destiny matrix.",
        date="Yesterday",
        read=False,
        link="/profile",
    ),
    NotificationItem(
        id="notif_3",
        type="reading_reminder",
        title="New Moon Integration Cycle",
        message="Auspicious cycle to recalibrate your 30-day life trend vectors.",
        date="3 days ago",
        read=True,
        link="/reading",
    ),
]


@router.get("", response_model=List[NotificationItem])
async def get_notifications():
    """Fetches user notifications and celestial transit alerts."""
    return DEFAULT_NOTIFICATIONS
