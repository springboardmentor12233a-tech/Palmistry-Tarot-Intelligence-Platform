from fastapi import HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.database_models import User


VALID_ROLES = {
    "user",
    "tarot_reader",
    "spiritual_consultant",
    "administrator",
}


def get_all_users(
    database: Session,
) -> list[User]:

    statement = (
        select(User)
        .order_by(
            User.created_at.desc()
        )
    )

    return list(
        database.scalars(
            statement
        ).all()
    )


def get_user_or_404(
    database: Session,
    user_id: int,
) -> User:

    user = database.get(
        User,
        user_id,
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found.",
        )

    return user


def change_user_role(
    database: Session,
    user_id: int,
    new_role: str,
    current_admin: User,
) -> User:

    if new_role not in VALID_ROLES:
        raise HTTPException(
            status_code=400,
            detail="Invalid user role.",
        )

    user = get_user_or_404(
        database,
        user_id,
    )

    if (
        user.id == current_admin.id
        and new_role != "administrator"
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                "An administrator cannot "
                "remove their own administrator role."
            ),
        )

    user.role = new_role

    database.add(user)
    database.commit()
    database.refresh(user)

    return user


def change_user_status(
    database: Session,
    user_id: int,
    is_active: bool,
    current_admin: User,
) -> User:

    user = get_user_or_404(
        database,
        user_id,
    )

    if (
        user.id == current_admin.id
        and not is_active
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                "An administrator cannot "
                "disable their own account."
            ),
        )

    user.is_active = is_active

    database.add(user)
    database.commit()
    database.refresh(user)

    return user


def get_admin_overview(
    database: Session,
) -> dict:

    total_users = (
        database.scalar(
            select(
                func.count(User.id)
            )
        )
        or 0
    )

    active_users = (
        database.scalar(
            select(
                func.count(User.id)
            ).where(
                User.is_active.is_(True)
            )
        )
        or 0
    )

    inactive_users = (
        database.scalar(
            select(
                func.count(User.id)
            ).where(
                User.is_active.is_(False)
            )
        )
        or 0
    )

    roles = {}

    for role in VALID_ROLES:
        roles[role] = (
            database.scalar(
                select(
                    func.count(User.id)
                ).where(
                    User.role == role
                )
            )
            or 0
        )

    return {
        "total_users": total_users,
        "active_users": active_users,
        "inactive_users": inactive_users,
        "roles": roles,
    }