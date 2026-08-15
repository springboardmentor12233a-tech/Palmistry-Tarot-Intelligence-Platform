from datetime import datetime

from pydantic import (
    BaseModel,
    ConfigDict,
)


# ============================================================
# NOTIFICATION RESPONSE
# ============================================================

class NotificationResponse(
    BaseModel
):
    model_config = ConfigDict(
        from_attributes=True
    )

    id: int

    user_id: int

    notification_type: str

    title: str

    message: str

    related_reading_session_id: (
        int | None
    )

    is_read: bool

    created_at: datetime

    read_at: datetime | None


# ============================================================
# UNREAD COUNT
# ============================================================

class NotificationUnreadCount(
    BaseModel
):
    unread_count: int


# ============================================================
# MARK ALL RESPONSE
# ============================================================

class MarkAllNotificationsResponse(
    BaseModel
):
    status: str

    updated_count: int

    message: str