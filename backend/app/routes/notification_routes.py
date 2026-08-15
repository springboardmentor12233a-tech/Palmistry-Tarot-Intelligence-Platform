from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
)

from sqlalchemy.orm import (
    Session,
)

from app.core.database import (
    get_db,
)

from app.models.database_models import (
    User,
)

from app.models.notification_schemas import (
    MarkAllNotificationsResponse,
    NotificationResponse,
    NotificationUnreadCount,
)

from app.services.auth_service import (
    get_current_user,
)

from app.services.notification_service import (
    get_unread_notification_count,
    get_user_notifications,
    mark_all_notifications_as_read,
    mark_notification_as_read,
)


router = APIRouter(
    prefix="/api/notifications",
    tags=["Notifications"],
)


# ============================================================
# MY NOTIFICATIONS
# ============================================================

@router.get(
    "",
    response_model=list[
        NotificationResponse
    ],
)
def list_my_notifications(

    limit: int = Query(
        default=50,
        ge=1,
        le=100,
    ),

    unread_only: bool = Query(
        default=False,
    ),

    current_user: User = Depends(
        get_current_user
    ),

    db: Session = Depends(
        get_db
    ),

):
    """
    Return only notifications belonging
    to the authenticated user.
    """

    return get_user_notifications(

        db=db,

        user_id=current_user.id,

        limit=limit,

        unread_only=unread_only,
    )


# ============================================================
# UNREAD COUNT
# ============================================================

@router.get(
    "/unread-count",
    response_model=(
        NotificationUnreadCount
    ),
)
def my_unread_notification_count(

    current_user: User = Depends(
        get_current_user
    ),

    db: Session = Depends(
        get_db
    ),

):
    """
    Return unread notification count for
    the authenticated user.
    """

    count = (
        get_unread_notification_count(

            db=db,

            user_id=current_user.id,
        )
    )


    return NotificationUnreadCount(
        unread_count=count
    )


# ============================================================
# MARK ALL AS READ
# ============================================================

@router.patch(
    "/read-all",
    response_model=(
        MarkAllNotificationsResponse
    ),
)
def read_all_notifications(

    current_user: User = Depends(
        get_current_user
    ),

    db: Session = Depends(
        get_db
    ),

):
    """
    Mark every unread notification belonging
    to the authenticated user as read.
    """

    updated_count = (
        mark_all_notifications_as_read(

            db=db,

            user_id=current_user.id,
        )
    )


    return (
        MarkAllNotificationsResponse(

            status="success",

            updated_count=(
                updated_count
            ),

            message=(
                "All notifications "
                "have been marked as read."
            ),
        )
    )


# ============================================================
# MARK ONE AS READ
# ============================================================

@router.patch(
    "/{notification_id}/read",
    response_model=(
        NotificationResponse
    ),
)
def read_notification(

    notification_id: int,

    current_user: User = Depends(
        get_current_user
    ),

    db: Session = Depends(
        get_db
    ),

):
    """
    Mark one user-owned notification
    as read.
    """

    notification = (
        mark_notification_as_read(

            db=db,

            user_id=current_user.id,

            notification_id=(
                notification_id
            ),
        )
    )


    if notification is None:

        raise HTTPException(
            status_code=404,

            detail=(
                "Notification not found."
            ),
        )


    return notification