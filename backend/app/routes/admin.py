from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.database.session import get_db
from app.models.user import User
from app.models.palmistry import PalmistryReading
from app.models.tarot import TarotReading


# =========================================================
# ROUTER
# =========================================================

router = APIRouter(
    prefix="/api/admin",
    tags=["Admin"],
)

security = HTTPBearer()


# =========================================================
# REQUEST MODEL
# =========================================================

class UserStatusRequest(BaseModel):
    is_active: bool


# =========================================================
# GET CURRENT AUTHENTICATED USER
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
        user_id
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
# ADMIN ONLY DEPENDENCY
# =========================================================

def get_current_admin(
    current_user: User = Depends(
        get_current_user
    ),
):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Admin access required.",
        )

    return current_user


# =========================================================
# ADMIN PROFILE
# =========================================================

@router.get("/me")
def get_admin_profile(
    current_admin: User = Depends(
        get_current_admin
    ),
):
    return {
        "message": "Admin authentication successful.",
        "admin": {
            "id": current_admin.id,
            "name": current_admin.name,
            "email": current_admin.email,
            "role": current_admin.role,
            "is_active": current_admin.is_active,
        },
    }


# =========================================================
# GET ALL USERS
# =========================================================

@router.get("/users")
def get_all_users(
    current_admin: User = Depends(
        get_current_admin
    ),
    db: Session = Depends(
        get_db
    ),
):
    users = (
        db.query(User)
        .order_by(
            User.id.asc()
        )
        .all()
    )

    return {
        "total_users": len(users),
        "users": [
            {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "role": user.role,
                "is_active": user.is_active,
                "created_at": user.created_at,
            }
            for user in users
        ],
    }


# =========================================================
# ACTIVATE / DEACTIVATE USER
# =========================================================

@router.patch(
    "/users/{user_id}/status"
)
def update_user_status(
    user_id: int,

    data: UserStatusRequest,

    current_admin: User = Depends(
        get_current_admin
    ),

    db: Session = Depends(
        get_db
    ),
):

    # -----------------------------------------------------
    # FIND USER
    # -----------------------------------------------------

    user = db.get(
        User,
        user_id
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found.",
        )


    # -----------------------------------------------------
    # PREVENT ADMIN SELF-DEACTIVATION
    # -----------------------------------------------------

    if (
        user.id == current_admin.id
        and not data.is_active
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                "You cannot deactivate "
                "your own admin account."
            ),
        )


    # -----------------------------------------------------
    # PREVENT DEACTIVATING OTHER ADMINS
    # -----------------------------------------------------

    if (
        user.role == "admin"
        and not data.is_active
    ):
        raise HTTPException(
            status_code=403,
            detail=(
                "Admin accounts cannot "
                "be deactivated."
            ),
        )


    # -----------------------------------------------------
    # UPDATE STATUS
    # -----------------------------------------------------

    user.is_active = data.is_active

    db.commit()

    db.refresh(user)


    # -----------------------------------------------------
    # RESPONSE
    # -----------------------------------------------------

    return {
        "message": (
            "User activated successfully."
            if user.is_active
            else "User deactivated successfully."
        ),

        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "is_active": user.is_active,
        },
    }


# =========================================================
# ADMIN STATISTICS
# =========================================================

@router.get("/statistics")
def get_admin_statistics(
    current_admin: User = Depends(
        get_current_admin
    ),
    db: Session = Depends(
        get_db
    ),
):

    # -----------------------------------------------------
    # USER STATISTICS
    # -----------------------------------------------------

    total_users = (
        db.query(User)
        .count()
    )

    active_users = (
        db.query(User)
        .filter(
            User.is_active.is_(True)
        )
        .count()
    )

    admin_users = (
        db.query(User)
        .filter(
            User.role == "admin"
        )
        .count()
    )

    normal_users = (
        db.query(User)
        .filter(
            User.role == "user"
        )
        .count()
    )


    # -----------------------------------------------------
    # READING STATISTICS
    # -----------------------------------------------------

    total_palmistry_readings = (
        db.query(
            PalmistryReading
        )
        .count()
    )

    total_tarot_readings = (
        db.query(
            TarotReading
        )
        .count()
    )

    total_readings = (
        total_palmistry_readings
        + total_tarot_readings
    )


    # -----------------------------------------------------
    # RESPONSE
    # -----------------------------------------------------

    return {
        "statistics": {

            "total_users": total_users,

            "active_users": active_users,

            "admin_users": admin_users,

            "normal_users": normal_users,

            "total_palmistry_readings": (
                total_palmistry_readings
            ),

            "total_tarot_readings": (
                total_tarot_readings
            ),

            "total_readings": total_readings,
        }
    }