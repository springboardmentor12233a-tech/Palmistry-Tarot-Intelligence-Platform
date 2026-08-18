from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.user import User
from app.models.palmistry import PalmistryReading
from app.models.tarot import TarotReading
from app.routes.palmistry import get_current_user


router = APIRouter(
    prefix="/api/insights",
    tags=["Insights"],
)


# =========================================================
# GET PERSONALIZED INSIGHTS
# =========================================================

@router.get("")
def get_personalized_insights(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):

    # =====================================================
    # GET LATEST PALMISTRY READING
    # =====================================================

    latest_palmistry = (
        db.query(PalmistryReading)
        .filter(
            PalmistryReading.user_id == current_user.id
        )
        .order_by(
            PalmistryReading.created_at.desc()
        )
        .first()
    )


    # =====================================================
    # GET LATEST TAROT READING
    # =====================================================

    latest_tarot = (
        db.query(TarotReading)
        .filter(
            TarotReading.user_id == current_user.id
        )
        .order_by(
            TarotReading.created_at.desc()
        )
        .first()
    )


    # =====================================================
    # NO READINGS
    # =====================================================

    if not latest_palmistry and not latest_tarot:

        return {
            "available": False,

            "message": (
                "Complete a palmistry or tarot reading "
                "to begin building your personal insights."
            ),

            "insight": None,
        }


    # =====================================================
    # PALMISTRY DATA
    # =====================================================

    palm_shape = (
        latest_palmistry.palm_shape
        if latest_palmistry
        else None
    )

    palm_overall = (
        latest_palmistry.overall_reading
        if latest_palmistry
        else ""
    )


    # =====================================================
    # TAROT DATA
    # =====================================================

    tarot_cards = []

    if latest_tarot:

        tarot_cards = [

            {
                "position": "Past",
                "name": latest_tarot.past_card,
                "meaning": latest_tarot.past_meaning,
            },

            {
                "position": "Present",
                "name": latest_tarot.present_card,
                "meaning": latest_tarot.present_meaning,
            },

            {
                "position": "Future",
                "name": latest_tarot.future_card,
                "meaning": latest_tarot.future_meaning,
            },

        ]


    # =====================================================
    # TAROT TOPIC
    # =====================================================

    tarot_topic = (
        latest_tarot.topic.strip().lower()
        if latest_tarot and latest_tarot.topic
        else "general"
    )


    # =====================================================
    # TAROT CARD NAMES
    # =====================================================

    tarot_names = []

    if latest_tarot:

        tarot_names = [
            latest_tarot.past_card,
            latest_tarot.present_card,
            latest_tarot.future_card,
        ]

    tarot_names_lower = [
        name.lower()
        for name in tarot_names
        if name
    ]


    # =====================================================
    # CARD THEMES
    # =====================================================

    theme_keywords = {

        "The Fool": [
            "new beginnings",
            "curiosity",
            "freedom",
            "courage",
        ],

        "The Magician": [
            "skill",
            "confidence",
            "action",
            "manifestation",
        ],

        "The High Priestess": [
            "intuition",
            "inner wisdom",
            "reflection",
        ],

        "The Empress": [
            "growth",
            "creativity",
            "abundance",
            "nurturing",
        ],

        "The Emperor": [
            "leadership",
            "structure",
            "stability",
            "responsibility",
        ],

        "The Hierophant": [
            "learning",
            "guidance",
            "tradition",
        ],

        "The Lovers": [
            "connection",
            "choices",
            "harmony",
            "relationships",
        ],

        "The Chariot": [
            "determination",
            "discipline",
            "direction",
            "movement",
        ],

        "Strength": [
            "courage",
            "patience",
            "compassion",
            "inner strength",
        ],

        "The Hermit": [
            "introspection",
            "solitude",
            "wisdom",
            "reflection",
        ],

        "Wheel of Fortune": [
            "change",
            "opportunity",
            "cycles",
        ],

        "Justice": [
            "balance",
            "fairness",
            "accountability",
            "decisions",
        ],

        "The Hanged Man": [
            "pause",
            "perspective",
            "surrender",
            "patience",
        ],

        "Death": [
            "transformation",
            "change",
            "endings",
            "new phase",
        ],

        "Temperance": [
            "balance",
            "patience",
            "moderation",
            "harmony",
        ],

        "The Devil": [
            "attachments",
            "habits",
            "temptation",
            "patterns",
        ],

        "The Tower": [
            "change",
            "disruption",
            "rebuilding",
        ],

        "The Star": [
            "hope",
            "inspiration",
            "renewal",
            "optimism",
        ],

        "The Moon": [
            "intuition",
            "uncertainty",
            "dreams",
        ],

        "The Sun": [
            "joy",
            "clarity",
            "confidence",
            "success",
        ],

        "Judgement": [
            "reflection",
            "awakening",
            "realization",
            "decision",
        ],

        "The World": [
            "completion",
            "achievement",
            "integration",
            "new chapter",
        ],
    }


    # =====================================================
    # COLLECT THEMES FROM CARDS
    # =====================================================

    detected_themes = []

    for card_name in tarot_names:

        for known_card, themes in theme_keywords.items():

            if card_name.lower() == known_card.lower():

                detected_themes.extend(themes)

                break


    # Remove duplicates while preserving order

    detected_themes = list(
        dict.fromkeys(detected_themes)
    )


    # =====================================================
    # PERSONAL REFLECTION
    # =====================================================

    if latest_palmistry and latest_tarot:

        reflection = (
            f"Your latest palmistry reading describes "
            f"a {palm_shape or 'distinctive'} palm pattern, "
            f"while your tarot reading focuses on "
            f"{tarot_topic}. Together, these readings "
            f"highlight themes of "
            f"{', '.join(detected_themes[:4]) or 'reflection and personal growth'}. "
            f"Use these themes as prompts to reflect on "
            f"your current choices, goals and direction."
        )

    elif latest_palmistry:

        reflection = (
            f"Your latest palmistry reading highlights "
            f"a {palm_shape or 'distinctive'} palm pattern. "
            f"This reading can be used as a reflection "
            f"prompt around your personal strengths, "
            f"decision-making and continued development."
        )

    else:

        reflection = (
            f"Your latest tarot reading focuses on "
            f"{tarot_topic}. The cards highlight themes "
            f"of "
            f"{', '.join(detected_themes[:4]) or 'reflection and personal growth'}. "
            f"Consider how these symbolic themes relate "
            f"to your current question and choices."
        )


    # =====================================================
    # PERSONALITY
    # =====================================================

    personality_traits = []

    if any(
        word in detected_themes
        for word in [
            "intuition",
            "inner wisdom",
            "dreams",
        ]
    ):

        personality_traits.append(
            "intuitive"
        )

    if any(
        word in detected_themes
        for word in [
            "balance",
            "fairness",
            "accountability",
            "moderation",
        ]
    ):

        personality_traits.append(
            "balanced and thoughtful"
        )

    if any(
        word in detected_themes
        for word in [
            "confidence",
            "leadership",
            "courage",
            "determination",
        ]
    ):

        personality_traits.append(
            "confident and action-oriented"
        )

    if any(
        word in detected_themes
        for word in [
            "reflection",
            "introspection",
            "wisdom",
        ]
    ):

        personality_traits.append(
            "reflective"
        )


    personality_traits = list(
        dict.fromkeys(personality_traits)
    )


    if not personality_traits:

        personality_traits = [
            "reflective",
            "adaptable",
        ]


    personality = (
        "Your recent symbolic readings suggest a "
        + ", ".join(personality_traits[:3])
        + " personality. You may benefit from combining "
          "self-awareness with thoughtful action when "
          "approaching important decisions."
    )


    # =====================================================
    # STRENGTHS
    # =====================================================

    strengths = []

    strength_mapping = {

        "confidence": "Confidence",

        "leadership": "Leadership",

        "courage": "Courage",

        "determination": "Determination",

        "intuition": "Intuition",

        "inner wisdom": "Self-awareness",

        "balance": "Balance",

        "fairness": "Fair-mindedness",

        "adaptability": "Adaptability",

        "creativity": "Creativity",

        "hope": "Optimism",

        "inspiration": "Inspiration",

        "reflection": "Self-reflection",

        "patience": "Patience",

        "wisdom": "Wisdom",

        "success": "Positive outlook",
    }


    for theme in detected_themes:

        if theme in strength_mapping:

            strength = strength_mapping[theme]

            if strength not in strengths:

                strengths.append(strength)


    # Palmistry can contribute baseline strengths

    if latest_palmistry:

        palm_strengths = [
            "Resilience",
            "Personal reflection",
        ]

        for strength in palm_strengths:

            if strength not in strengths:

                strengths.append(strength)


    if not strengths:

        strengths = [
            "Self-awareness",
            "Adaptability",
            "Personal reflection",
        ]


    strengths = strengths[:6]


    # =====================================================
    # RELATIONSHIPS
    # =====================================================

    relationship_themes = [
        theme
        for theme in detected_themes
        if theme in [
            "connection",
            "harmony",
            "relationships",
            "compassion",
            "emotional awareness",
            "balance",
        ]
    ]


    if relationship_themes:

        relationships = (
            "Your recent readings emphasize "
            + ", ".join(
                relationship_themes[:3]
            )
            + ". In relationships, these themes can "
              "serve as reminders to communicate openly, "
              "understand emotional needs and maintain "
              "healthy boundaries."
        )

    else:

        relationships = (
            "Your readings encourage thoughtful "
            "communication and greater awareness of "
            "your own emotional needs. Use this as an "
            "opportunity to reflect on how you build "
            "and maintain meaningful connections."
        )


    # =====================================================
    # CAREER
    # =====================================================

    if tarot_topic == "career":

        if detected_themes:

            career = (
                "Your current tarot reading is focused "
                "on career. The strongest symbolic themes "
                "include "
                + ", ".join(
                    detected_themes[:4]
                )
                + ". Consider applying these themes "
                  "through clear goals, consistent effort "
                  "and thoughtful decisions."
            )

        else:

            career = (
                "Your current reading is connected with "
                "career and work. Focus on clear goals, "
                "consistent effort and thoughtful "
                "decision-making."
            )

    else:

        career = (
            "Your readings suggest approaching career "
            "decisions with a balance of planning, "
            "self-awareness and confidence. Consider "
            "how your current strengths can support "
            "your longer-term direction."
        )


    # =====================================================
    # LIFE DIRECTION
    # =====================================================

    if detected_themes:

        life_direction = (
            "The recurring themes in your latest reading "
            "include "
            + ", ".join(
                detected_themes[:5]
            )
            + ". These themes can be used as reflection "
              "points while considering your goals, "
              "decisions and personal development."
        )

    else:

        life_direction = (
            "Your recent readings encourage continued "
            "personal development. Pay attention to "
            "recurring patterns in your decisions, "
            "relationships and goals."
        )


    # =====================================================
    # RECOMMENDATIONS
    # =====================================================

    recommendations = []


    if "balance" in detected_themes:

        recommendations.append(
            "Look for greater balance between your goals, responsibilities and personal wellbeing."
        )


    if any(
        theme in detected_themes
        for theme in [
            "reflection",
            "introspection",
            "inner wisdom",
        ]
    ):

        recommendations.append(
            "Set aside regular time for reflection before making important decisions."
        )


    if any(
        theme in detected_themes
        for theme in [
            "confidence",
            "courage",
            "determination",
        ]
    ):

        recommendations.append(
            "Trust your abilities and take practical steps toward goals that matter to you."
        )


    if tarot_topic == "career":

        recommendations.append(
            "Break your career goals into clear short-term actions and review your progress regularly."
        )


    recommendations.append(
        "Use recurring themes in your readings as prompts for self-reflection rather than fixed predictions."
    )


    recommendations.append(
        "Review your progress periodically and identify patterns that support your personal growth."
    )


    # Remove duplicates

    recommendations = list(
        dict.fromkeys(recommendations)
    )[:5]


    # =====================================================
    # INSIGHT SCORE
    # =====================================================

    score = 50


    if latest_palmistry:

        score += 15


    if latest_tarot:

        score += 15


    if latest_palmistry and latest_tarot:

        score += 10


    # More detected themes indicate richer symbolic data

    if len(detected_themes) >= 5:

        score += 5


    score = min(
        score,
        95
    )


    # =====================================================
    # RETURN RESPONSE
    # =====================================================

    return {

        "available": True,

        "user": {
            "id": current_user.id,
            "name": current_user.name,
        },

        "sources": {

            "palmistry": (

                {
                    "reading_id": latest_palmistry.id,
                    "created_at": latest_palmistry.created_at,
                    "palm_shape": palm_shape,
                }

                if latest_palmistry

                else None
            ),

            "tarot": (

                {
                    "reading_id": latest_tarot.id,
                    "created_at": latest_tarot.created_at,
                    "topic": latest_tarot.topic,
                    "question": latest_tarot.question,
                    "cards": tarot_cards,
                }

                if latest_tarot

                else None
            ),
        },

        "insight": {

            "score": score,

            "personal_reflection": reflection,

            "personality": personality,

            "strengths": strengths,

            "relationships": relationships,

            "career": career,

            "life_direction": life_direction,

            "recommendations": recommendations,
        },

        "disclaimer": (
            "These insights are intended for "
            "self-reflection and entertainment purposes "
            "only. They are not professional medical, "
            "financial, legal, or psychological advice."
        ),
    }