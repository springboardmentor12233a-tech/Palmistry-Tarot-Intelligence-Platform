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
    prefix="/api/tarot-reader",
    tags=["Tarot Reader Dashboard"],
)


# ============================================================
# ROLE PROTECTION
# ============================================================

tarot_reader_access = require_roles(
    "tarot_reader",
    "administrator",
)


# ============================================================
# TAROT READER ANALYTICS SUMMARY
# ============================================================

@router.get(
    "/analytics/summary",
    response_model=(
        AnalyticsSummaryResponse
    ),
)
def tarot_reader_analytics_summary(

    current_user: User = Depends(
        tarot_reader_access
    ),

):
    """
    Return platform-level reading analytics
    for authorized Tarot Readers.

    Administrators may also access this
    dashboard for supervision.

    No individual user identity information
    is exposed by this endpoint.
    """

    return get_analytics_summary(
        user_id=None
    )


# ============================================================
# TAROT READER READING ACTIVITY
# ============================================================

@router.get(
    "/analytics/history",
    response_model=list[
        ReadingHistoryItem
    ],
)
def tarot_reader_reading_history(

    limit: int = Query(
        default=30,
        ge=1,
        le=100,
    ),

    current_user: User = Depends(
        tarot_reader_access
    ),

):
    """
    Return recent platform reading activity
    for Tarot Reader dashboard analytics.

    ReadingHistoryItem contains analytical
    reading information without exposing
    account identity information.
    """

    return get_reading_history(
        limit=limit,
        user_id=None,
    )