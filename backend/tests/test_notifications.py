from app.core.database import (
    SessionLocal,
)

from app.models.database_models import (
    Notification,
)


# ============================================================
# HELPER
# ============================================================

def create_notification(
    user_id: int,
    title: str = "Test Notification",
    message: str = "Test notification message.",
    notification_type: str = "reading_ready",
    is_read: bool = False,
):

    with SessionLocal() as database:

        notification = Notification(
            user_id=user_id,
            notification_type=notification_type,
            title=title,
            message=message,
            is_read=is_read,
        )

        database.add(
            notification
        )

        database.commit()

        database.refresh(
            notification
        )

        return {
            "id": notification.id,
            "user_id": notification.user_id,
            "title": notification.title,
            "is_read": notification.is_read,
        }


# ============================================================
# AUTHENTICATION REQUIRED
# ============================================================

def test_notifications_require_authentication(
    client,
):

    response = client.get(
        "/api/notifications"
    )

    assert (
        response.status_code
        == 401
    )


def test_unread_count_requires_authentication(
    client,
):

    response = client.get(
        "/api/notifications/unread-count"
    )

    assert (
        response.status_code
        == 401
    )


# ============================================================
# EMPTY NOTIFICATION LIST
# ============================================================

def test_empty_notification_list(
    client,
    authenticated_user,
):

    account = authenticated_user(
        role="user"
    )

    response = client.get(
        "/api/notifications",
        headers=account["headers"],
    )

    assert (
        response.status_code
        == 200
    )

    assert (
        response.json()
        == []
    )


# ============================================================
# USER CAN SEE OWN NOTIFICATIONS
# ============================================================

def test_user_can_see_own_notifications(
    client,
    authenticated_user,
):

    account = authenticated_user(
        role="user"
    )

    notification = create_notification(
        user_id=account["id"],
        title="Your Reading Is Ready",
    )

    response = client.get(
        "/api/notifications",
        headers=account["headers"],
    )

    assert (
        response.status_code
        == 200
    )

    data = response.json()

    assert len(data) == 1

    assert (
        data[0]["id"]
        == notification["id"]
    )

    assert (
        data[0]["title"]
        == "Your Reading Is Ready"
    )


# ============================================================
# USER CANNOT SEE ANOTHER USER'S NOTIFICATIONS
# ============================================================

def test_user_cannot_see_other_user_notifications(
    client,
    authenticated_user,
):

    user_one = authenticated_user(
        role="user"
    )

    user_two = authenticated_user(
        role="user"
    )

    create_notification(
        user_id=user_one["id"],
        title="User One Notification",
    )

    create_notification(
        user_id=user_two["id"],
        title="User Two Notification",
    )

    response = client.get(
        "/api/notifications",
        headers=user_one["headers"],
    )

    assert (
        response.status_code
        == 200
    )

    data = response.json()

    assert len(data) == 1

    assert (
        data[0]["title"]
        == "User One Notification"
    )


# ============================================================
# UNREAD COUNT
# ============================================================

def test_unread_notification_count(
    client,
    authenticated_user,
):

    account = authenticated_user(
        role="user"
    )

    create_notification(
        user_id=account["id"],
        title="Unread One",
        is_read=False,
    )

    create_notification(
        user_id=account["id"],
        title="Unread Two",
        is_read=False,
    )

    create_notification(
        user_id=account["id"],
        title="Already Read",
        is_read=True,
    )

    response = client.get(
        "/api/notifications/unread-count",
        headers=account["headers"],
    )

    assert (
        response.status_code
        == 200
    )

    data = response.json()

    assert (
        data["unread_count"]
        == 2
    )


# ============================================================
# UNREAD-ONLY FILTER
# ============================================================

def test_unread_only_filter(
    client,
    authenticated_user,
):

    account = authenticated_user(
        role="user"
    )

    create_notification(
        user_id=account["id"],
        title="Unread",
        is_read=False,
    )

    create_notification(
        user_id=account["id"],
        title="Read",
        is_read=True,
    )

    response = client.get(
        "/api/notifications?unread_only=true",
        headers=account["headers"],
    )

    assert (
        response.status_code
        == 200
    )

    data = response.json()

    assert len(data) == 1

    assert (
        data[0]["title"]
        == "Unread"
    )

    assert (
        data[0]["is_read"]
        is False
    )


# ============================================================
# MARK ONE NOTIFICATION AS READ
# ============================================================

def test_mark_notification_as_read(
    client,
    authenticated_user,
):

    account = authenticated_user(
        role="user"
    )

    notification = create_notification(
        user_id=account["id"],
        is_read=False,
    )

    response = client.patch(
        (
            "/api/notifications/"
            f"{notification['id']}/read"
        ),
        headers=account["headers"],
    )

    assert (
        response.status_code
        == 200
    )

    data = response.json()

    assert (
        data["id"]
        == notification["id"]
    )

    assert (
        data["is_read"]
        is True
    )

    assert (
        data["read_at"]
        is not None
    )


# ============================================================
# CANNOT MODIFY ANOTHER USER'S NOTIFICATION
# ============================================================

def test_user_cannot_mark_other_user_notification_as_read(
    client,
    authenticated_user,
):

    owner = authenticated_user(
        role="user"
    )

    attacker = authenticated_user(
        role="user"
    )

    notification = create_notification(
        user_id=owner["id"],
        is_read=False,
    )

    response = client.patch(
        (
            "/api/notifications/"
            f"{notification['id']}/read"
        ),
        headers=attacker["headers"],
    )

    assert (
        response.status_code
        == 404
    )


# ============================================================
# MARK ALL AS READ
# ============================================================

def test_mark_all_notifications_as_read(
    client,
    authenticated_user,
):

    account = authenticated_user(
        role="user"
    )

    create_notification(
        user_id=account["id"],
        is_read=False,
    )

    create_notification(
        user_id=account["id"],
        is_read=False,
    )

    response = client.patch(
        "/api/notifications/read-all",
        headers=account["headers"],
    )

    assert (
        response.status_code
        == 200
    )

    data = response.json()

    assert (
        data["status"]
        == "success"
    )

    assert (
        data["updated_count"]
        == 2
    )

    count_response = client.get(
        "/api/notifications/unread-count",
        headers=account["headers"],
    )

    assert (
        count_response.status_code
        == 200
    )

    assert (
        count_response.json()[
            "unread_count"
        ]
        == 0
    )


# ============================================================
# MARK ALL AFFECTS ONLY CURRENT USER
# ============================================================

def test_mark_all_does_not_modify_other_user_notifications(
    client,
    authenticated_user,
):

    user_one = authenticated_user(
        role="user"
    )

    user_two = authenticated_user(
        role="user"
    )

    create_notification(
        user_id=user_one["id"],
        is_read=False,
    )

    create_notification(
        user_id=user_two["id"],
        is_read=False,
    )

    response = client.patch(
        "/api/notifications/read-all",
        headers=user_one["headers"],
    )

    assert (
        response.status_code
        == 200
    )

    second_user_count = client.get(
        "/api/notifications/unread-count",
        headers=user_two["headers"],
    )

    assert (
        second_user_count.status_code
        == 200
    )

    assert (
        second_user_count.json()[
            "unread_count"
        ]
        == 1
    )