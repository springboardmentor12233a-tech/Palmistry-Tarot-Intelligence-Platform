from datetime import (
    datetime,
    timedelta,
    timezone,
)

import pytest

from fastapi import (
    HTTPException,
)

from sqlalchemy import (
    create_engine,
    select,
)

from sqlalchemy.orm import (
    Session,
)

from sqlalchemy.pool import (
    StaticPool,
)

from app.core.database import (
    Base,
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

from app.services.account_deletion_service import (
    delete_current_user_account,
    delete_user_as_admin,
)


# ============================================================
# DATABASE FIXTURE
# ============================================================

@pytest.fixture
def database():

    engine = create_engine(
        "sqlite+pysqlite:///:memory:",
        connect_args={
            "check_same_thread":
                False,
        },
        poolclass=StaticPool,
    )


    Base.metadata.create_all(
        bind=engine
    )


    with Session(
        engine
    ) as session:

        yield session


    Base.metadata.drop_all(
        bind=engine
    )

    engine.dispose()


# ============================================================
# HELPERS
# ============================================================

def create_test_user(
    database: Session,
    email: str,
    role: str = "user",
) -> User:

    user = User(
        email=email,
        password_hash="test-hash",
        full_name="Test User",
        role=role,
        is_active=True,
    )


    database.add(
        user
    )

    database.commit()

    database.refresh(
        user
    )


    return user


def create_private_data(
    database: Session,
    user: User,
):

    reading = ReadingSession(
        user_id=user.id,
        title="Test Reading",
        original_question=(
            "What should I focus on?"
        ),
        category="Career",
        spread="Single Card",
        user_profile={},
        reading_context={},
        palm_analysis={},
        tarot_analysis={},
        initial_reading={},
        scores={},
    )


    database.add(
        reading
    )

    database.commit()

    database.refresh(
        reading
    )


    chat = ReadingChatMessage(
        session_id=reading.id,
        user_id=user.id,
        role="user",
        content="Follow-up question",
    )


    notification = Notification(
        user_id=user.id,
        notification_type="reading",
        title="Reading Ready",
        message="Your reading is ready.",
        related_reading_session_id=(
            reading.id
        ),
    )


    analytics = AnalyticsReading(
        user_id=user.id,
        category="Career",
        spread="Single Card",
        heart_line="long",
        head_line="long",
        life_line="long",
        tarot_cards=[],
        upright_count=1,
        reversed_count=0,
        overall_insight_score=80.0,
    )


    reset_token = (
        PasswordResetToken(
            user_id=user.id,
            token_hash=(
                "a" * 64
            ),
            expires_at=(
                datetime.now(
                    timezone.utc
                )
                +
                timedelta(
                    minutes=30
                )
            ),
        )
    )


    database.add_all([
        chat,
        notification,
        analytics,
        reset_token,
    ])

    database.commit()


    return (
        reading,
        analytics,
    )


# ============================================================
# SELF DELETE
# ============================================================

def test_user_can_delete_own_account(
    database: Session,
):

    user = create_test_user(
        database,
        "delete-self@example.com",
    )

    user_id = user.id


    create_private_data(
        database,
        user,
    )


    message = (
        delete_current_user_account(
            database,
            user,
        )
    )


    assert (
        "permanently deleted"
        in message
    )


    assert (
        database.get(
            User,
            user_id,
        )
        is None
    )


    assert (
        database.scalars(
            select(
                ReadingSession
            ).where(
                ReadingSession.user_id ==
                user_id
            )
        ).all()
        ==
        []
    )


    assert (
        database.scalars(
            select(
                ReadingChatMessage
            ).where(
                ReadingChatMessage.user_id ==
                user_id
            )
        ).all()
        ==
        []
    )


    assert (
        database.scalars(
            select(
                Notification
            ).where(
                Notification.user_id ==
                user_id
            )
        ).all()
        ==
        []
    )


    assert (
        database.scalars(
            select(
                PasswordResetToken
            ).where(
                PasswordResetToken.user_id ==
                user_id
            )
        ).all()
        ==
        []
    )


    analytics = (
        database.scalars(
            select(
                AnalyticsReading
            )
        )
        .one()
    )


    assert (
        analytics.user_id
        is None
    )


# ============================================================
# ADMIN SELF DELETE PROTECTED
# ============================================================

def test_administrator_cannot_self_delete_from_profile(
    database: Session,
):

    admin = create_test_user(
        database,
        "admin-self@example.com",
        role="administrator",
    )


    with pytest.raises(
        HTTPException
    ) as error:

        delete_current_user_account(
            database,
            admin,
        )


    assert (
        error.value.status_code ==
        400
    )


    assert (
        database.get(
            User,
            admin.id,
        )
        is not None
    )


# ============================================================
# ADMIN DELETE USER
# ============================================================

def test_admin_can_delete_regular_user(
    database: Session,
):

    admin = create_test_user(
        database,
        "admin@example.com",
        role="administrator",
    )


    target = create_test_user(
        database,
        "target@example.com",
    )

    target_id = target.id


    create_private_data(
        database,
        target,
    )


    message = (
        delete_user_as_admin(
            database,
            target_id,
            admin,
        )
    )


    assert (
        "permanently deleted"
        in message
    )


    assert (
        database.get(
            User,
            target_id,
        )
        is None
    )


    analytics = (
        database.scalars(
            select(
                AnalyticsReading
            )
        )
        .one()
    )


    assert (
        analytics.user_id
        is None
    )


# ============================================================
# ADMIN CANNOT DELETE SELF
# ============================================================

def test_admin_cannot_delete_self_from_admin_dashboard(
    database: Session,
):

    admin = create_test_user(
        database,
        "admin-protected@example.com",
        role="administrator",
    )


    with pytest.raises(
        HTTPException
    ) as error:

        delete_user_as_admin(
            database,
            admin.id,
            admin,
        )


    assert (
        error.value.status_code ==
        400
    )


# ============================================================
# ADMIN ACCOUNT PROTECTION
# ============================================================

def test_admin_cannot_delete_another_administrator(
    database: Session,
):

    admin = create_test_user(
        database,
        "admin-one@example.com",
        role="administrator",
    )


    other_admin = (
        create_test_user(
            database,
            "admin-two@example.com",
            role="administrator",
        )
    )


    with pytest.raises(
        HTTPException
    ) as error:

        delete_user_as_admin(
            database,
            other_admin.id,
            admin,
        )


    assert (
        error.value.status_code ==
        400
    )


    assert (
        database.get(
            User,
            other_admin.id,
        )
        is not None
    )


# ============================================================
# NOT FOUND
# ============================================================

def test_admin_delete_missing_user_returns_404(
    database: Session,
):

    admin = create_test_user(
        database,
        "admin-missing@example.com",
        role="administrator",
    )


    with pytest.raises(
        HTTPException
    ) as error:

        delete_user_as_admin(
            database,
            999999,
            admin,
        )


    assert (
        error.value.status_code ==
        404
    )