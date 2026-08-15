from fastapi import Query

from app.models.analytics_schemas import (
    AnalyticsSummaryResponse,
    ReadingHistoryItem,
)

from app.services.analytics_service import (
    get_analytics_summary,
    get_reading_history,
)

from fastapi import (
    APIRouter,
    Depends,
)

from sqlalchemy.orm import Session

from app.core.database import (
    get_db,
)

from app.models.auth_schemas import (
    AdminOverviewResponse,
    RoleUpdateRequest,
    UserResponse,
    UserStatusUpdate,
)

from app.models.database_models import (
    User,
)

from app.services.admin_service import (
    change_user_role,
    change_user_status,
    get_admin_overview,
    get_all_users,
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
    """
    Return analytics for the complete
    platform.

    Administrator only.
    """

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
    """
    Return complete platform reading
    history.

    Administrator only.
    """

    return get_reading_history(
        limit=limit,
        user_id=None,
    )