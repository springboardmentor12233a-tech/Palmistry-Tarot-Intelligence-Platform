from fastapi import (
    HTTPException,
    status,
)

from sqlalchemy import (
    delete,
    or_,
    select,
    update,
)

from sqlalchemy.orm import (
    Session,
)

from app.models.database_models import (
    AnalyticsReading,
    Notification,
    ReadingChatMessage,
    ReadingSession,
    User,
)

from app.models.password_reset_models import (
    PasswordResetToken,
)


# ============================================================
# PRIVATE DATA CLEANUP
# ============================================================

def delete_user_private_data(
    database: Session,
    user_id: int,
) -> None:

    """
    Permanently remove private data owned by
    one user.

    Platform analytics are retained but
    anonymized by setting user_id to NULL.
    """

    reading_session_ids = (
        select(
            ReadingSession.id
        )
        .where(
            ReadingSession.user_id ==
            user_id
        )
    )


    # --------------------------------------------------------
    # PASSWORD RESET TOKENS
    # --------------------------------------------------------

    database.execute(
        delete(
            PasswordResetToken
        )
        .where(
            PasswordResetToken.user_id ==
            user_id
        )
    )


    # --------------------------------------------------------
    # USER NOTIFICATIONS
    # --------------------------------------------------------

    database.execute(
        delete(
            Notification
        )
        .where(
            Notification.user_id ==
            user_id
        )
    )


    # --------------------------------------------------------
    # REMOVE REFERENCES TO THE USER'S READING SESSIONS
    # FROM ANY REMAINING NOTIFICATION RECORD
    # --------------------------------------------------------

    database.execute(
        update(
            Notification
        )
        .where(
            Notification
            .related_reading_session_id
            .in_(
                reading_session_ids
            )
        )
        .values(
            related_reading_session_id=None
        )
    )


    # --------------------------------------------------------
    # CHAT MESSAGES
    # --------------------------------------------------------

    database.execute(
        delete(
            ReadingChatMessage
        )
        .where(
            or_(
                ReadingChatMessage.user_id ==
                user_id,

                ReadingChatMessage.session_id
                .in_(
                    reading_session_ids
                ),
            )
        )
    )


    # --------------------------------------------------------
    # READING SESSIONS
    # --------------------------------------------------------

    database.execute(
        delete(
            ReadingSession
        )
        .where(
            ReadingSession.user_id ==
            user_id
        )
    )


    # --------------------------------------------------------
    # ANALYTICS
    #
    # Keep aggregated platform analytics,
    # but permanently detach them from the user.
    # --------------------------------------------------------

    database.execute(
        update(
            AnalyticsReading
        )
        .where(
            AnalyticsReading.user_id ==
            user_id
        )
        .values(
            user_id=None
        )
    )


# ============================================================
# USER SELF-DELETION
# ============================================================

def delete_current_user_account(
    database: Session,
    current_user: User,
) -> str:

    """
    Permanently delete the currently
    authenticated non-administrator account.
    """

    if (
        current_user.role ==
        "administrator"
    ):

        raise HTTPException(
            status_code=(
                status
                .HTTP_400_BAD_REQUEST
            ),
            detail=(
                "Administrator accounts "
                "cannot be deleted from "
                "the Profile page."
            ),
        )


    try:

        delete_user_private_data(
            database,
            current_user.id,
        )


        database.delete(
            current_user
        )


        database.commit()


    except Exception:

        database.rollback()

        raise


    return (
        "Your account and private "
        "platform data have been "
        "permanently deleted."
    )


# ============================================================
# ADMINISTRATOR DELETION
# ============================================================

def delete_user_as_admin(
    database: Session,
    user_id: int,
    current_admin: User,
) -> str:

    """
    Allow an administrator to permanently
    delete a non-administrator account.
    """

    target_user = database.get(
        User,
        user_id,
    )


    if not target_user:

        raise HTTPException(
            status_code=(
                status
                .HTTP_404_NOT_FOUND
            ),
            detail=(
                "User not found."
            ),
        )


    # --------------------------------------------------------
    # NEVER DELETE YOURSELF FROM ADMIN DASHBOARD
    # --------------------------------------------------------

    if (
        target_user.id ==
        current_admin.id
    ):

        raise HTTPException(
            status_code=(
                status
                .HTTP_400_BAD_REQUEST
            ),
            detail=(
                "An administrator cannot "
                "delete their own account "
                "from the administrator "
                "dashboard."
            ),
        )


    # --------------------------------------------------------
    # PROTECT ADMINISTRATOR ACCOUNTS
    # --------------------------------------------------------

    if (
        target_user.role ==
        "administrator"
    ):

        raise HTTPException(
            status_code=(
                status
                .HTTP_400_BAD_REQUEST
            ),
            detail=(
                "Administrator accounts "
                "cannot be deleted using "
                "user management."
            ),
        )


    deleted_name = (
        target_user.full_name
    )


    try:

        delete_user_private_data(
            database,
            target_user.id,
        )


        database.delete(
            target_user
        )


        database.commit()


    except Exception:

        database.rollback()

        raise


    return (
        f"{deleted_name}'s account "
        "and private platform data "
        "have been permanently deleted."
    )