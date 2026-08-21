from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.models import Reading, User
from app.db.session import get_db
from app.schemas.user import ReadingHistoryItem, UserResponse, UserUpdateRequest

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserResponse)
async def get_my_profile(current_user: User = Depends(get_current_user)):
    """Fetches the authenticated user's profile."""
    return UserResponse.model_validate(current_user)


@router.put("/me", response_model=UserResponse)
async def update_my_profile(
    payload: UserUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Updates profile information and reading preferences."""
    if payload.name is not None:
        current_user.name = payload.name
    if payload.age_group is not None:
        current_user.age_group = payload.age_group
    if payload.interests is not None:
        current_user.interests = payload.interests
    if payload.spiritual_goals is not None:
        current_user.spiritual_goals = payload.spiritual_goals
    if payload.reading_preferences is not None:
        prefs = dict(current_user.reading_preferences or {})
        prefs.update(payload.reading_preferences)
        current_user.reading_preferences = prefs

    await db.commit()
    await db.refresh(current_user)
    return UserResponse.model_validate(current_user)


@router.get("/me/readings", response_model=List[ReadingHistoryItem])
async def get_my_readings(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Fetches history of past readings for the authenticated user."""
    query = (
        select(Reading)
        .where(Reading.user_id == current_user.id)
        .order_by(Reading.created_at.desc())
    )
    result = await db.execute(query)
    readings = result.scalars().all()

    items: List[ReadingHistoryItem] = []
    for r in readings:
        score_val = r.insight_score.get("overall", 90) if isinstance(r.insight_score, dict) else 90
        pers = r.personality if isinstance(r.personality, dict) else {}
        primary_arch = pers.get("primary_archetype", "The Visionary")
        trend = r.life_trend if isinstance(r.life_trend, dict) else {}
        theme = trend.get("life_path_summary", "Sovereign Alignment")

        palm = r.palm_result if isinstance(r.palm_result, dict) else {}
        thumb = palm.get("image_url")

        items.append(
            ReadingHistoryItem(
                id=r.id,
                date=r.created_at.isoformat() if r.created_at else "",
                spread_type=r.spread_type,
                spread_title=r.spread_title,
                overall_score=int(score_val),
                primary_archetype=primary_arch,
                thumbnail_url=thumb,
                key_theme=theme,
            )
        )

    return items
