from fastapi import (
    APIRouter,
    Depends,
    Query,
)

from sqlalchemy.orm import (
    Session,
)

from app.core.database import (
    get_db,
)

from app.models.analytics_schemas import (
    AnalyticsSummaryResponse,
    ReadingHistoryItem,
)

from app.models.auth_schemas import (
    AccountDeleteRequest,
    AdminOverviewResponse,
    MessageResponse,
    RoleUpdateRequest,
    UserResponse,
    UserStatusUpdate,
)

from app.models.database_models import (
    User,
)

from app.services.account_deletion_service import (
    delete_user_as_admin,
)

from app.services.admin_service import (
    change_user_role,
    change_user_status,
    get_admin_overview,
    get_all_users,
)

from app.services.analytics_service import (
    get_analytics_summary,
    get_reading_history,
)

from app.services.auth_service import (
    require_roles,
)


router = APIRouter(
    prefix="/api/admin",
    tags=["Administration"],
)


administrator_only = require_roles(
    "administrator"
)


# ============================================================
# ADMIN OVERVIEW
# ============================================================

@router.get(
    "/overview",
    response_model=AdminOverviewResponse,
)
def admin_overview(
    database: Session = Depends(
        get_db
    ),

    current_admin: User = Depends(
        administrator_only
    ),
):

    return get_admin_overview(
        database
    )


# ============================================================
# USERS
# ============================================================

@router.get(
    "/users",
    response_model=list[UserResponse],
)
def list_users(
    database: Session = Depends(
        get_db
    ),

    current_admin: User = Depends(
        administrator_only
    ),
):

    return get_all_users(
        database
    )


# ============================================================
# UPDATE ROLE
# ============================================================

@router.patch(
    "/users/{user_id}/role",
    response_model=UserResponse,
)
def update_user_role(
    user_id: int,
    request: RoleUpdateRequest,

    database: Session = Depends(
        get_db
    ),

    current_admin: User = Depends(
        administrator_only
    ),
):

    return change_user_role(
        database=database,
        user_id=user_id,
        new_role=request.role,
        current_admin=current_admin,
    )


# ============================================================
# UPDATE STATUS
# ============================================================

@router.patch(
    "/users/{user_id}/status",
    response_model=UserResponse,
)
def update_user_status(
    user_id: int,
    request: UserStatusUpdate,

    database: Session = Depends(
        get_db
    ),

    current_admin: User = Depends(
        administrator_only
    ),
):

    return change_user_status(
        database=database,
        user_id=user_id,
        is_active=request.is_active,
        current_admin=current_admin,
    )


# ============================================================
# DELETE USER
# ============================================================

@router.delete(
    "/users/{user_id}",
    response_model=MessageResponse,
)
def delete_user(
    user_id: int,
    request: AccountDeleteRequest,

    database: Session = Depends(
        get_db
    ),

    current_admin: User = Depends(
        administrator_only
    ),
):

    message = delete_user_as_admin(
        database=database,
        user_id=user_id,
        current_admin=current_admin,
    )


    return MessageResponse(
        status="success",
        message=message,
    )


# ============================================================
# PLATFORM ANALYTICS
# ============================================================

@router.get(
    "/analytics/summary",
    response_model=AnalyticsSummaryResponse,
)
def platform_analytics_summary(
    current_admin: User = Depends(
        administrator_only
    ),
):

    return get_analytics_summary(
        user_id=None
    )


# ============================================================
# PLATFORM READING HISTORY
# ============================================================

@router.get(
    "/analytics/history",
    response_model=list[
        ReadingHistoryItem
    ],
)
def platform_reading_history(

    limit: int = Query(
        default=20,
        ge=1,
        le=100,
    ),

    current_admin: User = Depends(
        administrator_only
    ),

):

    return get_reading_history(
        limit=limit,
        user_id=None,
    )