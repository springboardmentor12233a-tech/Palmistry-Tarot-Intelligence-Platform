from sqlalchemy import (
    func,
    select,
)

from sqlalchemy.orm import (
    Session,
)

from app.models.database_models import (
    Notification,
    utc_now,
)


# ============================================================
# CREATE NOTIFICATION
# ============================================================

def create_notification(

    db: Session,

    user_id: int,

    title: str,

    message: str,

    notification_type: str = (
        "general"
    ),

    related_reading_session_id: (
        int | None
    ) = None,

) -> Notification:
    """
    Create one persistent in-app
    notification for a user.
    """

    notification = Notification(

        user_id=user_id,

        notification_type=(
            notification_type
        ),

        title=title,

        message=message,

        related_reading_session_id=(
            related_reading_session_id
        ),

        is_read=False,
    )


    try:

        db.add(
            notification
        )


        db.commit()


        db.refresh(
            notification
        )


        return notification


    except Exception:

        db.rollback()

        raise


# ============================================================
# GET USER NOTIFICATIONS
# ============================================================

def get_user_notifications(

    db: Session,

    user_id: int,

    limit: int = 50,

    unread_only: bool = False,

) -> list[Notification]:
    """
    Return notifications belonging only
    to the supplied user.
    """

    safe_limit = max(
        1,
        min(
            int(limit),
            100,
        )
    )


    statement = (
        select(
            Notification
        )

        .where(
            Notification.user_id ==
            user_id
        )
    )


    if unread_only:

        statement = (
            statement.where(
                Notification.is_read
                .is_(False)
            )
        )


    statement = (
        statement
        .order_by(
            Notification.created_at.desc(),
            Notification.id.desc(),
        )
        .limit(
            safe_limit
        )
    )


    result = db.execute(
        statement
    )


    return list(
        result.scalars().all()
    )


# ============================================================
# GET UNREAD COUNT
# ============================================================

def get_unread_notification_count(

    db: Session,

    user_id: int,

) -> int:
    """
    Return number of unread notifications
    belonging only to the supplied user.
    """

    statement = (
        select(
            func.count(
                Notification.id
            )
        )

        .where(
            Notification.user_id ==
            user_id,

            Notification.is_read
            .is_(False),
        )
    )


    result = db.execute(
        statement
    )


    return int(
        result.scalar_one()
        or 0
    )


# ============================================================
# MARK ONE AS READ
# ============================================================

def mark_notification_as_read(

    db: Session,

    user_id: int,

    notification_id: int,

) -> Notification | None:
    """
    Mark a notification as read only
    when it belongs to the supplied user.
    """

    statement = (
        select(
            Notification
        )

        .where(
            Notification.id ==
            notification_id,

            Notification.user_id ==
            user_id,
        )
    )


    notification = (
        db.execute(
            statement
        )
        .scalar_one_or_none()
    )


    if notification is None:

        return None


    if not notification.is_read:

        notification.is_read = True

        notification.read_at = (
            utc_now()
        )


        try:

            db.commit()

            db.refresh(
                notification
            )


        except Exception:

            db.rollback()

            raise


    return notification


# ============================================================
# MARK ALL AS READ
# ============================================================

def mark_all_notifications_as_read(

    db: Session,

    user_id: int,

) -> int:
    """
    Mark every unread notification
    belonging to a user as read.
    """

    statement = (
        select(
            Notification
        )

        .where(
            Notification.user_id ==
            user_id,

            Notification.is_read
            .is_(False),
        )
    )


    notifications = list(
        db.execute(
            statement
        )
        .scalars()
        .all()
    )


    if not notifications:

        return 0


    read_time = utc_now()


    for notification in notifications:

        notification.is_read = True

        notification.read_at = (
            read_time
        )


    try:

        db.commit()


        return len(
            notifications
        )


    except Exception:

        db.rollback()

        raise