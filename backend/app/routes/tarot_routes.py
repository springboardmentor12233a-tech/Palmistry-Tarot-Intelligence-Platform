from fastapi import APIRouter, HTTPException

from app.models.tarot_schemas import (
    TarotDrawRequest,
    TarotDrawResponse,
)
from app.services.tarot_service import (
    draw_tarot_cards,
    get_tarot_dataset_count,
)


router = APIRouter(
    prefix="/api/tarot",
    tags=["Tarot Drawing Engine"],
)


@router.get("/dataset-summary")
def tarot_dataset_summary():
    """
    Return the number of usable tarot cards loaded
    from the dataset.
    """

    try:
        card_count = get_tarot_dataset_count()

        return {
            "status": "success",
            "message": "Tarot dataset loaded successfully.",
            "usable_card_count": card_count,
        }

    except FileNotFoundError as error:
        raise HTTPException(
            status_code=500,
            detail=str(error),
        ) from error

    except ValueError as error:
        raise HTTPException(
            status_code=500,
            detail=str(error),
        ) from error


@router.post(
    "/draw",
    response_model=TarotDrawResponse,
)
def draw_tarot_reading(
    draw_request: TarotDrawRequest,
):
    """
    Draw tarot cards for the selected spread.
    """

    try:
        drawn_cards = draw_tarot_cards(
            draw_request
        )

        return TarotDrawResponse(
            status="success",
            message="Tarot cards drawn successfully.",
            spread=draw_request.spread,
            card_count=len(drawn_cards),
            cards=drawn_cards,
        )

    except FileNotFoundError as error:
        print("Tarot dataset error:", error)

        raise HTTPException(
            status_code=500,
            detail=str(error),
        ) from error

    except ValueError as error:
        print("Tarot drawing error:", error)

        raise HTTPException(
            status_code=500,
            detail=str(error),
        ) from error

    except Exception as error:
        print(
            "Unexpected tarot drawing error:",
            type(error).__name__,
            error,
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Tarot cards could not be drawn."
            ),
        ) from error