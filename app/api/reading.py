import io
import uuid
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user_optional
from app.db.models import Reading, User
from app.db.session import get_db
from app.schemas.palm import PalmAnalysisResult
from app.schemas.reading import (
    FullReading,
    GenerateReadingRequest,
    InsightScore,
    Interpretation,
    LifeTrendAnalysis,
    PersonalityIntelligence,
    Recommendations,
    UserContext,
)
from app.schemas.tarot import TarotDrawResult
from app.services.ai_interpretation import ai_service
from app.services.palm_analysis import palm_service
from app.services.report_generator import generate_excel_report, generate_pdf_report
from app.services.scoring import derive_score_from_payloads
from app.services.tarot_engine import tarot_engine

router = APIRouter(prefix="/reading", tags=["Readings"])


def _convert_db_to_full_reading(r: Reading) -> FullReading:
    """Converts a database Reading model to Pydantic FullReading response."""
    palm_res = PalmAnalysisResult.model_validate(r.palm_result)
    tarot_res = TarotDrawResult.model_validate(r.tarot_spread)
    user_ctx = UserContext.model_validate(r.user_context) if r.user_context else None
    interp = Interpretation.model_validate(r.interpretation)
    pers = PersonalityIntelligence.model_validate(r.personality)
    trend = LifeTrendAnalysis.model_validate(r.life_trend)
    recs = Recommendations.model_validate(r.recommendations)
    score = InsightScore.model_validate(r.insight_score)

    return FullReading(
        id=r.id,
        user_id=r.user_id,
        date=r.created_at.isoformat() if r.created_at else datetime.now(timezone.utc).isoformat(),
        spread_type=r.spread_type,
        spread_title=r.spread_title,
        palm_result=palm_res,
        tarot_result=tarot_res,
        user_context=user_ctx,
        interpretation=interp,
        personality=pers,
        life_trend=trend,
        insight_score=score,
        recommendations=recs,
        created_at=r.created_at.isoformat() if r.created_at else datetime.now(timezone.utc).isoformat(),
        pdf_url=r.pdf_url,
        excel_url=r.excel_url,
    )


@router.post("/generate", response_model=FullReading)
async def generate_reading(
    payload: GenerateReadingRequest,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db),
):
    """
    Synthesizes palm biometrics, tarot archetypes, and user context into a full reading.
    Stores the reading in database and returns comprehensive insights with weighted scoring.
    """
    palm_res = payload.palm_result
    if not palm_res:
        palm_res = palm_service.analyze_palm_image(image_bytes=None)

    tarot_res = payload.tarot_spread or payload.tarot_result
    if not tarot_res:
        tarot_res = tarot_engine.draw_spread("three_card")

    # 1. Run AI synthesis
    synthesis = ai_service.synthesize_full_reading(
        palm_result=palm_res,
        tarot_result=tarot_res,
        user_context=payload.user_context,
    )

    # 2. Derive weighted Insight Score
    insight_score = derive_score_from_payloads(
        palm_result=palm_res.model_dump(),
        tarot_spread=tarot_res.model_dump(),
        user_context=payload.user_context.model_dump() if payload.user_context else None,
    )

    reading_id = f"rdg_{uuid.uuid4().hex[:10]}"
    now = datetime.now(timezone.utc)

    # 3. Store reading in DB
    new_reading = Reading(
        id=reading_id,
        user_id=current_user.id if current_user else None,
        created_at=now,
        spread_type=tarot_res.spread_type,
        spread_title=tarot_res.spread_title,
        palm_result=palm_res.model_dump(),
        tarot_spread=tarot_res.model_dump(),
        user_context=payload.user_context.model_dump() if payload.user_context else None,
        interpretation=synthesis["interpretation"].model_dump(),
        personality=synthesis["personality"].model_dump(),
        life_trend=synthesis["life_trend"].model_dump(),
        recommendations=synthesis["recommendations"].model_dump(),
        insight_score=insight_score.model_dump(),
        pdf_url=f"/api/reading/{reading_id}/export?format=pdf",
        excel_url=f"/api/reading/{reading_id}/export?format=xlsx",
    )

    db.add(new_reading)
    await db.commit()
    await db.refresh(new_reading)

    return _convert_db_to_full_reading(new_reading)


@router.get("/{id}", response_model=FullReading)
async def get_reading_by_id(id: str, db: AsyncSession = Depends(get_db)):
    """Retrieves a full stored reading by its unique ID."""
    query = select(Reading).where(Reading.id == id)
    result = await db.execute(query)
    reading = result.scalars().first()

    if not reading:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Reading with ID '{id}' was not found.",
        )

    return _convert_db_to_full_reading(reading)


@router.get("/{id}/export")
async def export_reading(
    id: str,
    format: str = Query("pdf", pattern="^(pdf|xlsx)$"),
    db: AsyncSession = Depends(get_db),
):
    """
    Exports a reading as a downloadable PDF report or Excel spreadsheet.
    """
    query = select(Reading).where(Reading.id == id)
    result = await db.execute(query)
    reading = result.scalars().first()

    if not reading:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Reading with ID '{id}' was not found.",
        )

    full_reading = _convert_db_to_full_reading(reading)
    user_name = "Seeker"
    if reading.user_id:
        user_query = select(User).where(User.id == reading.user_id)
        user_obj = (await db.execute(user_query)).scalars().first()
        if user_obj:
            user_name = user_obj.name

    if format == "pdf":
        file_bytes = generate_pdf_report(full_reading, user_name=user_name)
        media_type = "application/pdf"
        filename = f"cosmic-oracle-reading-{id}.pdf"
    else:
        file_bytes = generate_excel_report(full_reading, user_name=user_name)
        media_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        filename = f"cosmic-oracle-reading-{id}.xlsx"

    return StreamingResponse(
        io.BytesIO(file_bytes),
        media_type=media_type,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
