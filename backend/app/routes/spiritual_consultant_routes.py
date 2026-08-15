from fastapi import (
    APIRouter,
    Depends,
    Query,
)

from app.models.analytics_schemas import (
    AnalyticsSummaryResponse,
    ReadingHistoryItem,
)

from app.models.database_models import (
    User,
)

from app.services.analytics_service import (
    get_analytics_summary,
    get_reading_history,
)

from app.services.auth_service import (
    require_roles,
)


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/api/spiritual-consultant",
    tags=["Spiritual Consultant Dashboard"],
)


# ============================================================
# ROLE PROTECTION
# ============================================================

consultant_access = require_roles(
    "spiritual_consultant",
    "administrator",
)


# ============================================================
# CONSULTANT ANALYTICS SUMMARY
# ============================================================

@router.get(
    "/analytics/summary",
    response_model=(
        AnalyticsSummaryResponse
    ),
)
def spiritual_consultant_summary(

    current_user: User = Depends(
        consultant_access
    ),

):
    """
    Return aggregated platform analytics
    for authorized Spiritual Consultants.

    No user identity or account-management
    information is exposed.
    """

    return get_analytics_summary(
        user_id=None
    )


# ============================================================
# CONSULTANT READING HISTORY
# ============================================================

@router.get(
    "/analytics/history",
    response_model=list[
        ReadingHistoryItem
    ],
)
def spiritual_consultant_history(

    limit: int = Query(
        default=50,
        ge=1,
        le=100,
    ),

    current_user: User = Depends(
        consultant_access
    ),

):
    """
    Return recent platform reading activity
    for consultant guidance analysis.
    """

    return get_reading_history(
        limit=limit,
        user_id=None,
    )