from fastapi import (
    APIRouter,
    Query,
)

from app.models.analytics_schemas import (
    AnalyticsSummaryResponse,
    ReadingHistoryItem,
)

from app.services.analytics_service import (
    get_analytics_summary,
    get_reading_history,
)


router = APIRouter(
    prefix="/api/analytics",
    tags=["Analytics"],
)


@router.get(
    "/summary",
    response_model=AnalyticsSummaryResponse,
)
def analytics_summary():
    return get_analytics_summary()


@router.get(
    "/history",
    response_model=list[ReadingHistoryItem],
)
def reading_history(
    limit: int = Query(
        default=20,
        ge=1,
        le=100,
    ),
):
    return get_reading_history(
        limit=limit
    )