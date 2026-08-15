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
    get_current_user,
)


router = APIRouter(
    prefix="/api/analytics",
    tags=["Analytics"],
)


# ============================================================
# CURRENT USER ANALYTICS
# ============================================================

@router.get(
    "/summary",
    response_model=AnalyticsSummaryResponse,
)
def analytics_summary(
    current_user: User = Depends(
        get_current_user
    ),
):
    """
    Return analytics belonging only
    to the authenticated user.
    """

    return get_analytics_summary(
        user_id=current_user.id
    )


# ============================================================
# CURRENT USER HISTORY
# ============================================================

@router.get(
    "/history",
    response_model=list[
        ReadingHistoryItem
    ],
)
def reading_history(
    limit: int = Query(
        default=20,
        ge=1,
        le=100,
    ),

    current_user: User = Depends(
        get_current_user
    ),
):
    """
    Return only readings belonging
    to the authenticated user.
    """

    return get_reading_history(
        limit=limit,
        user_id=current_user.id,
    )