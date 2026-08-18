from io import BytesIO
from pathlib import Path
from xml.sax.saxutils import escape

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    Image,
    KeepTogether,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.user import User
from app.models.palmistry import PalmistryReading
from app.models.tarot import TarotReading
from app.routes.palmistry import get_current_user


# =========================================================
# ROUTER
# =========================================================

router = APIRouter(
    prefix="/api/reports",
    tags=["Reports"],
)


# =========================================================
# PATHS
# =========================================================

# backend/
BASE_DIR = Path(__file__).resolve().parents[2]

# backend/app/static/tarot/cards/
TAROT_CARDS_DIR = (
    BASE_DIR
    / "app"
    / "static"
    / "tarot"
    / "cards"
)


# =========================================================
# TAROT CARD IMAGE MAP
# =========================================================
#
# Your 78 images are arranged as:
#
# Major Arcana:
# m00.jpg -> The Fool
# m01.jpg -> The Magician
# ...
# m21.jpg -> The World
#
# Cups:
# c01.jpg -> Ace of Cups
# ...
# c14.jpg -> King of Cups
#
# Pentacles:
# p01.jpg -> Ace of Pentacles
# ...
# p14.jpg -> King of Pentacles
#
# Swords:
# s01.jpg -> Ace of Swords
# ...
# s14.jpg -> King of Swords
#
# Wands:
# w01.jpg -> Ace of Wands
# ...
# w14.jpg -> King of Wands
# =========================================================


MAJOR_ARCANA = {
    "The Fool": "m00.jpg",
    "The Magician": "m01.jpg",
    "The High Priestess": "m02.jpg",
    "The Empress": "m03.jpg",
    "The Emperor": "m04.jpg",
    "The Hierophant": "m05.jpg",
    "The Lovers": "m06.jpg",
    "The Chariot": "m07.jpg",
    "Strength": "m08.jpg",
    "The Hermit": "m09.jpg",
    "Wheel of Fortune": "m10.jpg",
    "Justice": "m11.jpg",
    "The Hanged Man": "m12.jpg",
    "Death": "m13.jpg",
    "Temperance": "m14.jpg",
    "The Devil": "m15.jpg",
    "The Tower": "m16.jpg",
    "The Star": "m17.jpg",
    "The Moon": "m18.jpg",
    "The Sun": "m19.jpg",
    "Judgement": "m20.jpg",
    "The World": "m21.jpg",
}


MINOR_ARCANA = {
    # -----------------------------------------------------
    # CUPS
    # -----------------------------------------------------

    "Ace of Cups": "c01.jpg",
    "Two of Cups": "c02.jpg",
    "Three of Cups": "c03.jpg",
    "Four of Cups": "c04.jpg",
    "Five of Cups": "c05.jpg",
    "Six of Cups": "c06.jpg",
    "Seven of Cups": "c07.jpg",
    "Eight of Cups": "c08.jpg",
    "Nine of Cups": "c09.jpg",
    "Ten of Cups": "c10.jpg",
    "Page of Cups": "c11.jpg",
    "Knight of Cups": "c12.jpg",
    "Queen of Cups": "c13.jpg",
    "King of Cups": "c14.jpg",

    # -----------------------------------------------------
    # PENTACLES
    # -----------------------------------------------------

    "Ace of Pentacles": "p01.jpg",
    "Two of Pentacles": "p02.jpg",
    "Three of Pentacles": "p03.jpg",
    "Four of Pentacles": "p04.jpg",
    "Five of Pentacles": "p05.jpg",
    "Six of Pentacles": "p06.jpg",
    "Seven of Pentacles": "p07.jpg",
    "Eight of Pentacles": "p08.jpg",
    "Nine of Pentacles": "p09.jpg",
    "Ten of Pentacles": "p10.jpg",
    "Page of Pentacles": "p11.jpg",
    "Knight of Pentacles": "p12.jpg",
    "Queen of Pentacles": "p13.jpg",
    "King of Pentacles": "p14.jpg",

    # -----------------------------------------------------
    # SWORDS
    # -----------------------------------------------------

    "Ace of Swords": "s01.jpg",
    "Two of Swords": "s02.jpg",
    "Three of Swords": "s03.jpg",
    "Four of Swords": "s04.jpg",
    "Five of Swords": "s05.jpg",
    "Six of Swords": "s06.jpg",
    "Seven of Swords": "s07.jpg",
    "Eight of Swords": "s08.jpg",
    "Nine of Swords": "s09.jpg",
    "Ten of Swords": "s10.jpg",
    "Page of Swords": "s11.jpg",
    "Knight of Swords": "s12.jpg",
    "Queen of Swords": "s13.jpg",
    "King of Swords": "s14.jpg",

    # -----------------------------------------------------
    # WANDS
    # -----------------------------------------------------

    "Ace of Wands": "w01.jpg",
    "Two of Wands": "w02.jpg",
    "Three of Wands": "w03.jpg",
    "Four of Wands": "w04.jpg",
    "Five of Wands": "w05.jpg",
    "Six of Wands": "w06.jpg",
    "Seven of Wands": "w07.jpg",
    "Eight of Wands": "w08.jpg",
    "Nine of Wands": "w09.jpg",
    "Ten of Wands": "w10.jpg",
    "Page of Wands": "w11.jpg",
    "Knight of Wands": "w12.jpg",
    "Queen of Wands": "w13.jpg",
    "King of Wands": "w14.jpg",
}


TAROT_CARD_IMAGES = {
    **MAJOR_ARCANA,
    **MINOR_ARCANA,
}


# =========================================================
# TAROT KEYWORDS
# =========================================================

TAROT_KEYWORDS = {

    "The Fool":
        "New Beginnings • Curiosity • Freedom • Leap of Faith",

    "The Magician":
        "Skill • Confidence • Action • Manifestation",

    "The High Priestess":
        "Intuition • Wisdom • Reflection • Mystery",

    "The Empress":
        "Growth • Creativity • Abundance • Nurturing",

    "The Emperor":
        "Leadership • Structure • Stability • Authority",

    "The Hierophant":
        "Tradition • Learning • Guidance • Values",

    "The Lovers":
        "Connection • Choices • Harmony • Relationships",

    "The Chariot":
        "Determination • Direction • Discipline • Progress",

    "Strength":
        "Courage • Patience • Compassion • Inner Strength",

    "The Hermit":
        "Introspection • Solitude • Wisdom • Inner Search",

    "Wheel of Fortune":
        "Change • Cycles • Opportunity • Circumstances",

    "Justice":
        "Balance • Fairness • Accountability • Decisions",

    "The Hanged Man":
        "Pause • Surrender • Perspective • Reassessment",

    "Death":
        "Transformation • Endings • Renewal • New Phase",

    "Temperance":
        "Balance • Patience • Moderation • Harmony",

    "The Devil":
        "Attachments • Habits • Temptation • Patterns",

    "The Tower":
        "Change • Disruption • Release • New Structure",

    "The Star":
        "Hope • Inspiration • Renewal • Optimism",

    "The Moon":
        "Intuition • Uncertainty • Dreams • Hidden Factors",

    "The Sun":
        "Joy • Clarity • Confidence • Success",

    "Judgement":
        "Awakening • Reflection • Realization • Decision",

    "The World":
        "Completion • Achievement • Integration • New Chapter",
}


# =========================================================
# HELPERS
# =========================================================

def safe_text(value):
    """
    Safely convert database values into ReportLab text.
    """
    if value is None:
        return ""

    return escape(str(value))


def get_pdf_styles():
    """
    PDF typography and layout styles.
    """

    styles = getSampleStyleSheet()

    styles.add(
        ParagraphStyle(
            name="ReportTitle",
            parent=styles["Title"],
            fontName="Helvetica-Bold",
            fontSize=21,
            leading=25,
            textColor=colors.HexColor("#17124A"),
            alignment=TA_LEFT,
            spaceAfter=5,
        )
    )

    styles.add(
        ParagraphStyle(
            name="ReportSubtitle",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=9,
            leading=13,
            textColor=colors.HexColor("#77718B"),
            spaceAfter=15,
        )
    )

    styles.add(
        ParagraphStyle(
            name="section",
            parent=styles["Heading2"],
            fontName="Helvetica-Bold",
            fontSize=13,
            leading=17,
            textColor=colors.HexColor("#7048E8"),
            spaceBefore=12,
            spaceAfter=8,
        )
    )

    styles.add(
        ParagraphStyle(
            name="subsection",
            parent=styles["Heading3"],
            fontName="Helvetica-Bold",
            fontSize=10,
            leading=14,
            textColor=colors.HexColor("#7048E8"),
            spaceBefore=8,
            spaceAfter=5,
        )
    )

    styles.add(
        ParagraphStyle(
            name="body",
            parent=styles["BodyText"],
            fontName="Helvetica",
            fontSize=8.5,
            leading=13,
            textColor=colors.HexColor("#29234A"),
            spaceAfter=6,
        )
    )

    styles.add(
        ParagraphStyle(
            name="small",
            parent=styles["BodyText"],
            fontName="Helvetica",
            fontSize=7.5,
            leading=11,
            textColor=colors.HexColor("#77718B"),
            spaceAfter=5,
        )
    )

    styles.add(
        ParagraphStyle(
            name="label",
            parent=styles["BodyText"],
            fontName="Helvetica-Bold",
            fontSize=7.5,
            leading=10,
            textColor=colors.HexColor("#7048E8"),
            spaceBefore=3,
            spaceAfter=3,
        )
    )

    styles.add(
        ParagraphStyle(
            name="card_name",
            parent=styles["BodyText"],
            fontName="Helvetica-Bold",
            fontSize=10,
            leading=13,
            textColor=colors.HexColor("#17124A"),
            alignment=TA_CENTER,
            spaceAfter=4,
        )
    )

    styles.add(
        ParagraphStyle(
            name="card_position",
            parent=styles["BodyText"],
            fontName="Helvetica-Bold",
            fontSize=7,
            leading=9,
            textColor=colors.HexColor("#7048E8"),
            alignment=TA_CENTER,
            spaceAfter=4,
        )
    )

    styles.add(
        ParagraphStyle(
            name="card_detail",
            parent=styles["BodyText"],
            fontName="Helvetica",
            fontSize=7.5,
            leading=11,
            textColor=colors.HexColor("#29234A"),
            alignment=TA_LEFT,
            spaceAfter=4,
        )
    )

    return styles


# =========================================================
# HEADER
# =========================================================

def add_header(
    story,
    title,
    subtitle,
    styles,
):

    story.append(
        Paragraph(
            "P&amp;T INTELLIGENCE",
            ParagraphStyle(
                "Brand",
                parent=styles["body"],
                fontName="Helvetica-Bold",
                fontSize=9,
                textColor=colors.HexColor("#7048E8"),
                spaceAfter=3,
            ),
        )
    )

    story.append(
        Paragraph(
            safe_text(title),
            styles["ReportTitle"],
        )
    )

    story.append(
        Paragraph(
            safe_text(subtitle),
            styles["ReportSubtitle"],
        )
    )


# =========================================================
# USER INFORMATION
# =========================================================

def add_user_information(
    story,
    current_user,
    styles,
):

    story.append(
        Paragraph(
            "ACCOUNT INFORMATION",
            styles["section"],
        )
    )

    data = [
        [
            Paragraph(
                "<b>Name</b>",
                styles["body"],
            ),
            Paragraph(
                safe_text(current_user.name),
                styles["body"],
            ),
        ],
        [
            Paragraph(
                "<b>Email</b>",
                styles["body"],
            ),
            Paragraph(
                safe_text(current_user.email),
                styles["body"],
            ),
        ],
        [
            Paragraph(
                "<b>Account Status</b>",
                styles["body"],
            ),
            Paragraph(
                "Active"
                if current_user.is_active
                else "Inactive",
                styles["body"],
            ),
        ],
    ]

    table = Table(
        data,
        colWidths=[
            42 * mm,
            125 * mm,
        ],
    )

    table.setStyle(
        TableStyle(
            [
                (
                    "BACKGROUND",
                    (0, 0),
                    (0, -1),
                    colors.HexColor("#EEE8FF"),
                ),
                (
                    "GRID",
                    (0, 0),
                    (-1, -1),
                    0.5,
                    colors.HexColor("#D8D0EA"),
                ),
                (
                    "VALIGN",
                    (0, 0),
                    (-1, -1),
                    "TOP",
                ),
                (
                    "LEFTPADDING",
                    (0, 0),
                    (-1, -1),
                    8,
                ),
                (
                    "RIGHTPADDING",
                    (0, 0),
                    (-1, -1),
                    8,
                ),
                (
                    "TOPPADDING",
                    (0, 0),
                    (-1, -1),
                    6,
                ),
                (
                    "BOTTOMPADDING",
                    (0, 0),
                    (-1, -1),
                    6,
                ),
            ]
        )
    )

    story.append(table)
    story.append(Spacer(1, 10))


# =========================================================
# PALM IMAGE
# =========================================================

def add_palm_image(
    story,
    image_path,
    styles,
):

    if not image_path:
        return

    try:

        path = Path(str(image_path))

        if not path.is_absolute():
            path = BASE_DIR / path

        if not path.exists():
            return

        image = Image(
            str(path)
        )

        image_width, image_height = (
            image.imageWidth,
            image.imageHeight,
        )

        max_width = 150 * mm
        max_height = 95 * mm

        scale = min(
            max_width / image_width,
            max_height / image_height,
        )

        image.drawWidth = (
            image_width * scale
        )

        image.drawHeight = (
            image_height * scale
        )

        image.hAlign = "CENTER"

        story.append(
            image
        )

        story.append(
            Spacer(1, 10)
        )

    except Exception:
        story.append(
            Paragraph(
                "Unable to display the uploaded palm image.",
                styles["small"],
            )
        )


# =========================================================
# TAROT IMAGE PATH
# =========================================================

def get_tarot_image_path(card_name):
    """
    Return the local image path for a Tarot card.
    """

    if not card_name:
        return None

    filename = TAROT_CARD_IMAGES.get(
        str(card_name).strip()
    )

    if not filename:
        return None

    path = TAROT_CARDS_DIR / filename

    if path.exists():
        return path

    return None


# =========================================================
# TAROT CARD IMAGE
# =========================================================

def create_tarot_image(card_name):
    """
    Create a ReportLab image for the Tarot card.
    """

    image_path = get_tarot_image_path(
        card_name
    )

    if not image_path:
        return None

    try:

        image = Image(
            str(image_path)
        )

        original_width = image.imageWidth
        original_height = image.imageHeight

        max_width = 35 * mm
        max_height = 58 * mm

        scale = min(
            max_width / original_width,
            max_height / original_height,
        )

        image.drawWidth = (
            original_width * scale
        )

        image.drawHeight = (
            original_height * scale
        )

        image.hAlign = "CENTER"

        return image

    except Exception:
        return None


# =========================================================
# TAROT CARD INFORMATION
# =========================================================

def get_tarot_card_data(
    position,
    card_name,
    meaning,
):

    return {
        "position": position,
        "name": card_name,
        "orientation": "Upright",
        "keywords": TAROT_KEYWORDS.get(
            card_name,
            "",
        ),
        "meaning": meaning,
    }


# =========================================================
# TAROT CARD TABLE
# =========================================================

def add_tarot_cards(
    story,
    reading,
    styles,
):

    cards = [
        get_tarot_card_data(
            "Past",
            reading.past_card,
            reading.past_meaning,
        ),
        get_tarot_card_data(
            "Present",
            reading.present_card,
            reading.present_meaning,
        ),
        get_tarot_card_data(
            "Future",
            reading.future_card,
            reading.future_meaning,
        ),
    ]


    # =====================================================
    # CARDS DRAWN TABLE
    # =====================================================

    story.append(
        Paragraph(
            "THREE CARD READING",
            styles["section"],
        )
    )


    table_data = [
        [
            Paragraph(
                "<b>Position</b>",
                styles["small"],
            ),
            Paragraph(
                "<b>Card</b>",
                styles["small"],
            ),
            Paragraph(
                "<b>Orientation</b>",
                styles["small"],
            ),
        ]
    ]


    for card in cards:

        table_data.append(
            [
                Paragraph(
                    safe_text(
                        card["position"]
                    ),
                    styles["body"],
                ),
                Paragraph(
                    safe_text(
                        card["name"]
                    ),
                    styles["body"],
                ),
                Paragraph(
                    safe_text(
                        card["orientation"]
                    ),
                    styles["body"],
                ),
            ]
        )


    card_table = Table(
        table_data,
        colWidths=[
            38 * mm,
            92 * mm,
            37 * mm,
        ],
        repeatRows=1,
    )


    card_table.setStyle(
        TableStyle(
            [
                (
                    "BACKGROUND",
                    (0, 0),
                    (-1, 0),
                    colors.HexColor("#17124A"),
                ),
                (
                    "TEXTCOLOR",
                    (0, 0),
                    (-1, 0),
                    colors.white,
                ),
                (
                    "BACKGROUND",
                    (0, 1),
                    (0, -1),
                    colors.HexColor("#EEE8FF"),
                ),
                (
                    "GRID",
                    (0, 0),
                    (-1, -1),
                    0.5,
                    colors.HexColor("#D8D0EA"),
                ),
                (
                    "VALIGN",
                    (0, 0),
                    (-1, -1),
                    "TOP",
                ),
                (
                    "LEFTPADDING",
                    (0, 0),
                    (-1, -1),
                    7,
                ),
                (
                    "RIGHTPADDING",
                    (0, 0),
                    (-1, -1),
                    7,
                ),
                (
                    "TOPPADDING",
                    (0, 0),
                    (-1, -1),
                    6,
                ),
                (
                    "BOTTOMPADDING",
                    (0, 0),
                    (-1, -1),
                    6,
                ),
            ]
        )
    )


    story.append(
        card_table
    )

    story.append(
        Spacer(1, 12)
    )


    # =====================================================
    # CARD DETAILS WITH ACTUAL IMAGES
    # =====================================================

    story.append(
        Paragraph(
            "CARD DETAILS",
            styles["section"],
        )
    )


    for card in cards:

        card_image = create_tarot_image(
            card["name"]
        )


        image_cell = (
            card_image
            if card_image
            else Paragraph(
                "Card image unavailable.",
                styles["small"],
            )
        )


        details = []

        details.append(
            Paragraph(
                safe_text(
                    card["position"]
                ).upper(),
                styles["label"],
            )
        )


        details.append(
            Paragraph(
                (
                    f"<b>{safe_text(card['name'])}</b> "
                    f"({safe_text(card['orientation'])})"
                ),
                styles["card_name"],
            )
        )


        if card["keywords"]:

            details.append(
                Paragraph(
                    (
                        f"<b>Keywords:</b> "
                        f"{safe_text(card['keywords'])}"
                    ),
                    styles["card_detail"],
                )
            )


        details.append(
            Paragraph(
                (
                    f"<b>Meaning:</b> "
                    f"{safe_text(card['meaning'])}"
                ),
                styles["card_detail"],
            )
        )


        card_content = Table(
            [
                [
                    image_cell,
                    details,
                ]
            ],
            colWidths=[
                48 * mm,
                119 * mm,
            ],
        )


        card_content.setStyle(
            TableStyle(
                [
                    (
                        "VALIGN",
                        (0, 0),
                        (-1, -1),
                        "TOP",
                    ),
                    (
                        "ALIGN",
                        (0, 0),
                        (0, 0),
                        "CENTER",
                    ),
                    (
                        "LEFTPADDING",
                        (0, 0),
                        (-1, -1),
                        5,
                    ),
                    (
                        "RIGHTPADDING",
                        (0, 0),
                        (-1, -1),
                        8,
                    ),
                    (
                        "TOPPADDING",
                        (0, 0),
                        (-1, -1),
                        5,
                    ),
                    (
                        "BOTTOMPADDING",
                        (0, 0),
                        (-1, -1),
                        8,
                    ),
                ]
            )
        )


        story.append(
            KeepTogether(
                [
                    card_content,
                    Spacer(1, 8),
                ]
            )
        )


# =========================================================
# TAROT INTERPRETATION
# =========================================================

def add_tarot_interpretation(
    story,
    reading,
    styles,
):

    cards = [
        (
            "Past",
            reading.past_card,
            reading.past_meaning,
        ),
        (
            "Present",
            reading.present_card,
            reading.present_meaning,
        ),
        (
            "Future",
            reading.future_card,
            reading.future_meaning,
        ),
    ]


    names = [
        card[1]
        for card in cards
    ]


    keywords = [
        TAROT_KEYWORDS.get(
            name,
            "",
        )
        for name in names
    ]


    # =====================================================
    # INTERPRETATION
    # =====================================================

    story.append(
        Paragraph(
            "AI INTERPRETATION",
            styles["section"],
        )
    )


    summary = (
        "The three-card reading presents a symbolic "
        f"progression from {names[0]} in the past, "
        f"through {names[1]} in the present, "
        f"toward {names[2]} in the future. "
        "The combined themes suggest "
        f"{' • '.join(keywords)}. "
        "Rather than treating these cards as fixed "
        "predictions, they can be used as reflection "
        "points when considering your question about "
        f"{str(reading.topic).lower()}."
    )


    story.append(
        Paragraph(
            "<b>Reading Summary</b>",
            styles["body"],
        )
    )


    story.append(
        Paragraph(
            safe_text(summary),
            styles["body"],
        )
    )


    # =====================================================
    # INDIVIDUAL CARD INSIGHTS
    # =====================================================

    story.append(
        Paragraph(
            "INDIVIDUAL CARD INSIGHTS",
            styles["section"],
        )
    )


    for position, name, meaning in cards:

        story.append(
            Paragraph(
                (
                    f"<b>{safe_text(position)}: "
                    f"{safe_text(name)}</b>"
                ),
                styles["body"],
            )
        )


        story.append(
            Paragraph(
                (
                    f"The {safe_text(name)} appears "
                    f"upright in the {safe_text(position).lower()} "
                    "position, emphasizing the constructive "
                    "and visible qualities associated with "
                    "this card. The card represents "
                    f"{safe_text(meaning)} "
                    f"Because your question relates to "
                    f"{safe_text(str(reading.topic).lower())}, "
                    "these themes can be considered in the "
                    "context of your current situation."
                ),
                styles["body"],
            )
        )


    # =====================================================
    # PERSONAL GUIDANCE
    # =====================================================

    story.append(
        Paragraph(
            "PERSONAL GUIDANCE",
            styles["section"],
        )
    )


    guidance = [
        (
            f"Consider what the themes represented by "
            f"{names[0]} can teach you about patterns "
            "from your past."
        ),
        (
            f"Use the present energy of {names[1]} as "
            "a prompt to examine your current choices "
            "and priorities."
        ),
        (
            f"Reflect on the perspective offered by "
            f"{names[2]} when thinking about possible "
            "future directions."
        ),
        (
            f"For your {str(reading.topic).lower()} question, "
            "focus on clear decisions, consistent action "
            "and awareness of your own values."
        ),
        (
            "Use the reading as a self-reflection tool "
            "rather than as a fixed prediction of future "
            "events."
        ),
    ]


    for item in guidance:

        story.append(
            Paragraph(
                f"• {safe_text(item)}",
                styles["body"],
            )
        )


    # =====================================================
    # SELF-REFLECTION PROMPT
    # =====================================================

    story.append(
        Paragraph(
            "SELF-REFLECTION PROMPT",
            styles["section"],
        )
    )


    prompt = (
        f"How do the themes represented by "
        f"{names[0]}, {names[1]} and {names[2]} "
        f"relate to your current question: "
        f"\"{reading.question}\"?"
    )


    story.append(
        Paragraph(
            safe_text(prompt),
            styles["body"],
        )
    )


    # =====================================================
    # FOLLOW-UP CONVERSATION
    # =====================================================

    story.append(
        Paragraph(
            "FOLLOW-UP CONVERSATION",
            styles["section"],
        )
    )


    story.append(
        Paragraph(
            "<b>User Question</b>",
            styles["body"],
        )
    )


    story.append(
        Paragraph(
            safe_text(
                reading.question
            ),
            styles["body"],
        )
    )


    story.append(
        Paragraph(
            "<b>AI Response</b>",
            styles["body"],
        )
    )


    response = (
        f"Based on your three-card reading, consider "
        f"exploring how the transition from {names[0]} "
        f"to {names[1]} and then toward {names[2]} "
        "relates to your present circumstances. "
        "You may use this as a starting point for a "
        "deeper reflection on your question."
    )


    story.append(
        Paragraph(
            safe_text(response),
            styles["body"],
        )
    )


# =========================================================
# DISCLAIMER
# =========================================================

def add_disclaimer(
    story,
    styles,
):

    story.append(
        Spacer(1, 15)
    )


    story.append(
        Paragraph(
            "DISCLAIMER",
            styles["section"],
        )
    )


    story.append(
        Paragraph(
            (
                "This report is provided for self-reflection "
                "and entertainment purposes only. Palmistry "
                "and tarot interpretations are symbolic and "
                "should not be treated as professional medical, "
                "financial, legal, psychological, or other "
                "professional advice."
            ),
            styles["small"],
        )
    )


# =========================================================
# CREATE PDF
# =========================================================

def create_pdf(story):

    buffer = BytesIO()


    document = SimpleDocTemplate(
        buffer,
        pagesize=A4,

        rightMargin=18 * mm,
        leftMargin=18 * mm,

        topMargin=18 * mm,
        bottomMargin=18 * mm,

        title="P&T Intelligence Report",
        author="P&T Intelligence",
    )


    document.build(
        story
    )


    buffer.seek(0)

    return buffer


# =========================================================
# PDF RESPONSE
# =========================================================

def pdf_response(
    buffer,
    filename,
):

    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": (
                f'attachment; filename="{filename}"'
            )
        },
    )


# =========================================================
# PALMISTRY REPORT
# =========================================================

@router.get(
    "/palmistry/{reading_id}/pdf"
)
def generate_palmistry_report(

    reading_id: int,

    current_user: User = Depends(
        get_current_user
    ),

    db: Session = Depends(
        get_db
    ),
):

    reading = (
        db.query(
            PalmistryReading
        )
        .filter(
            PalmistryReading.id
            == reading_id,

            PalmistryReading.user_id
            == current_user.id,
        )
        .first()
    )


    if not reading:

        raise HTTPException(
            status_code=404,
            detail="Palmistry reading not found.",
        )


    styles = get_pdf_styles()

    story = []


    # -----------------------------------------------------
    # HEADER
    # -----------------------------------------------------

    add_header(
        story,
        "Your Palmistry Report",
        (
            "A symbolic reflection based on "
            "your completed palm reading."
        ),
        styles,
    )


    # -----------------------------------------------------
    # USER
    # -----------------------------------------------------

    add_user_information(
        story,
        current_user,
        styles,
    )


    # -----------------------------------------------------
    # PALM IMAGE
    # -----------------------------------------------------

    add_palm_image(
        story,
        reading.image_path,
        styles,
    )


    # -----------------------------------------------------
    # PALM READING
    # -----------------------------------------------------

    story.append(
        Paragraph(
            "PALM READING",
            styles["section"],
        )
    )


    reading_date = (
        reading.created_at.strftime(
            "%d %B %Y"
        )
        if reading.created_at
        else "Not available"
    )


    story.append(
        Paragraph(
            (
                f"<b>Reading #{reading.id}</b>"
                f" &nbsp; • &nbsp; "
                f"{safe_text(reading_date)}"
            ),
            styles["body"],
        )
    )


    palm_items = [

        (
            "Palm Shape",
            reading.palm_shape,
        ),

        (
            "Life Line",
            reading.life_line,
        ),

        (
            "Head Line",
            reading.head_line,
        ),

        (
            "Heart Line",
            reading.heart_line,
        ),

        (
            "Fate Line",
            reading.fate_line,
        ),

        (
            "Sun Line",
            reading.sun_line,
        ),
    ]


    for label, value in palm_items:

        story.append(
            Paragraph(
                safe_text(
                    label.upper()
                ),
                styles["label"],
            )
        )

        story.append(
            Paragraph(
                safe_text(value),
                styles["body"],
            )
        )


    story.append(
        Paragraph(
            "OVERALL PALM INTERPRETATION",
            styles["section"],
        )
    )


    story.append(
        Paragraph(
            safe_text(
                reading.overall_reading
            ),
            styles["body"],
        )
    )


    add_disclaimer(
        story,
        styles,
    )


    buffer = create_pdf(
        story
    )


    filename = (
        f"palmistry_report_"
        f"{reading.id}.pdf"
    )


    return pdf_response(
        buffer,
        filename,
    )


# =========================================================
# TAROT REPORT
# =========================================================

@router.get(
    "/tarot/{reading_id}/pdf"
)
def generate_tarot_report(

    reading_id: int,

    current_user: User = Depends(
        get_current_user
    ),

    db: Session = Depends(
        get_db
    ),
):

    # -----------------------------------------------------
    # FIND READING
    # -----------------------------------------------------

    reading = (
        db.query(
            TarotReading
        )
        .filter(
            TarotReading.id
            == reading_id,

            TarotReading.user_id
            == current_user.id,
        )
        .first()
    )


    if not reading:

        raise HTTPException(
            status_code=404,
            detail="Tarot reading not found.",
        )


    styles = get_pdf_styles()

    story = []


    # -----------------------------------------------------
    # HEADER
    # -----------------------------------------------------

    add_header(
        story,
        "Your Tarot Report",
        (
            "A symbolic reflection based on "
            "your completed three-card reading."
        ),
        styles,
    )


    # -----------------------------------------------------
    # USER
    # -----------------------------------------------------

    add_user_information(
        story,
        current_user,
        styles,
    )


    # -----------------------------------------------------
    # READING DETAILS
    # -----------------------------------------------------

    story.append(
        Paragraph(
            "READING DETAILS",
            styles["section"],
        )
    )


    details = [
        [
            Paragraph(
                "<b>Question</b>",
                styles["body"],
            ),
            Paragraph(
                safe_text(
                    reading.question
                ),
                styles["body"],
            ),
        ],

        [
            Paragraph(
                "<b>Topic</b>",
                styles["body"],
            ),
            Paragraph(
                safe_text(
                    str(
                        reading.topic
                    ).title()
                ),
                styles["body"],
            ),
        ],

        [
            Paragraph(
                "<b>Spread</b>",
                styles["body"],
            ),
            Paragraph(
                safe_text(
                    reading.spread
                ),
                styles["body"],
            ),
        ],
    ]


    details_table = Table(
        details,
        colWidths=[
            42 * mm,
            125 * mm,
        ],
    )


    details_table.setStyle(
        TableStyle(
            [
                (
                    "BACKGROUND",
                    (0, 0),
                    (0, -1),
                    colors.HexColor("#EEE8FF"),
                ),

                (
                    "GRID",
                    (0, 0),
                    (-1, -1),
                    0.5,
                    colors.HexColor("#D8D0EA"),
                ),

                (
                    "VALIGN",
                    (0, 0),
                    (-1, -1),
                    "TOP",
                ),

                (
                    "LEFTPADDING",
                    (0, 0),
                    (-1, -1),
                    8,
                ),

                (
                    "RIGHTPADDING",
                    (0, 0),
                    (-1, -1),
                    8,
                ),

                (
                    "TOPPADDING",
                    (0, 0),
                    (-1, -1),
                    7,
                ),

                (
                    "BOTTOMPADDING",
                    (0, 0),
                    (-1, -1),
                    7,
                ),
            ]
        )
    )


    story.append(
        details_table
    )


    story.append(
        Spacer(1, 8)
    )


    # -----------------------------------------------------
    # THREE CARDS + IMAGES
    # -----------------------------------------------------

    add_tarot_cards(
        story,
        reading,
        styles,
    )


    # -----------------------------------------------------
    # AI INTERPRETATION
    # -----------------------------------------------------

    add_tarot_interpretation(
        story,
        reading,
        styles,
    )


    # -----------------------------------------------------
    # DISCLAIMER
    # -----------------------------------------------------

    add_disclaimer(
        story,
        styles,
    )


    # -----------------------------------------------------
    # BUILD
    # -----------------------------------------------------

    buffer = create_pdf(
        story
    )


    filename = (
        f"tarot_report_"
        f"{reading.id}.pdf"
    )


    return pdf_response(
        buffer,
        filename,
    )


# =========================================================
# COMBINED PALMISTRY + TAROT REPORT
# =========================================================

@router.get(
    "/combined/"
    "{palm_reading_id}/"
    "{tarot_reading_id}/pdf"
)
def generate_combined_report(

    palm_reading_id: int,

    tarot_reading_id: int,

    current_user: User = Depends(
        get_current_user
    ),

    db: Session = Depends(
        get_db
    ),
):

    # -----------------------------------------------------
    # PALMISTRY
    # -----------------------------------------------------

    palm = (
        db.query(
            PalmistryReading
        )
        .filter(
            PalmistryReading.id
            == palm_reading_id,

            PalmistryReading.user_id
            == current_user.id,
        )
        .first()
    )


    if not palm:

        raise HTTPException(
            status_code=404,
            detail="Palmistry reading not found.",
        )


    # -----------------------------------------------------
    # TAROT
    # -----------------------------------------------------

    tarot = (
        db.query(
            TarotReading
        )
        .filter(
            TarotReading.id
            == tarot_reading_id,

            TarotReading.user_id
            == current_user.id,
        )
        .first()
    )


    if not tarot:

        raise HTTPException(
            status_code=404,
            detail="Tarot reading not found.",
        )


    styles = get_pdf_styles()

    story = []


    # -----------------------------------------------------
    # HEADER
    # -----------------------------------------------------

    add_header(
        story,
        "Your Combined Journey Report",
        (
            "A combined symbolic reflection from "
            "your palmistry and tarot experiences."
        ),
        styles,
    )


    # -----------------------------------------------------
    # USER
    # -----------------------------------------------------

    add_user_information(
        story,
        current_user,
        styles,
    )


    # -----------------------------------------------------
    # PALMISTRY
    # -----------------------------------------------------

    story.append(
        Paragraph(
            "PALMISTRY REFLECTION",
            styles["section"],
        )
    )


    add_palm_image(
        story,
        palm.image_path,
        styles,
    )


    palm_items = [

        (
            "Palm Shape",
            palm.palm_shape,
        ),

        (
            "Life Line",
            palm.life_line,
        ),

        (
            "Head Line",
            palm.head_line,
        ),

        (
            "Heart Line",
            palm.heart_line,
        ),

        (
            "Fate Line",
            palm.fate_line,
        ),

        (
            "Sun Line",
            palm.sun_line,
        ),
    ]


    for label, value in palm_items:

        story.append(
            Paragraph(
                safe_text(
                    label.upper()
                ),
                styles["label"],
            )
        )

        story.append(
            Paragraph(
                safe_text(value),
                styles["body"],
            )
        )


    story.append(
        Paragraph(
            "Overall Palm Interpretation",
            styles["section"],
        )
    )


    story.append(
        Paragraph(
            safe_text(
                palm.overall_reading
            ),
            styles["body"],
        )
    )


    # -----------------------------------------------------
    # TAROT
    # -----------------------------------------------------

    story.append(
        Paragraph(
            "TAROT REFLECTION",
            styles["section"],
        )
    )


    story.append(
        Paragraph(
            (
                f"<b>Question:</b> "
                f"{safe_text(tarot.question)}"
            ),
            styles["body"],
        )
    )


    story.append(
        Paragraph(
            (
                f"<b>Topic:</b> "
                f"{safe_text(str(tarot.topic).title())}"
            ),
            styles["body"],
        )
    )


    story.append(
        Paragraph(
            (
                f"<b>Spread:</b> "
                f"{safe_text(tarot.spread)}"
            ),
            styles["body"],
        )
    )


    # -----------------------------------------------------
    # TAROT CARDS
    # -----------------------------------------------------

    add_tarot_cards(
        story,
        tarot,
        styles,
    )


    # -----------------------------------------------------
    # COMBINED REFLECTION
    # -----------------------------------------------------

    story.append(
        Paragraph(
            "COMBINED REFLECTION",
            styles["section"],
        )
    )


    combined_text = (
        "Your palmistry and tarot readings provide "
        "different symbolic perspectives that can be "
        "considered together as reflection tools. "
        "The palm reading offers observations about "
        "patterns and tendencies, while the Tarot "
        "reading presents symbolic themes connected "
        "with your current question."
    )


    story.append(
        Paragraph(
            safe_text(
                combined_text
            ),
            styles["body"],
        )
    )


    # -----------------------------------------------------
    # TAROT INTERPRETATION
    # -----------------------------------------------------

    add_tarot_interpretation(
        story,
        tarot,
        styles,
    )


    # -----------------------------------------------------
    # DISCLAIMER
    # -----------------------------------------------------

    add_disclaimer(
        story,
        styles,
    )


    # -----------------------------------------------------
    # BUILD
    # -----------------------------------------------------

    buffer = create_pdf(
        story
    )


    filename = (
        f"combined_report_"
        f"{palm.id}_"
        f"{tarot.id}.pdf"
    )


    return pdf_response(
        buffer,
        filename,
    )


# =========================================================
# REPORT HISTORY
# =========================================================

@router.get(
    "/history"
)
def get_report_history(

    current_user: User = Depends(
        get_current_user
    ),

    db: Session = Depends(
        get_db
    ),
):

    # -----------------------------------------------------
    # PALMISTRY READINGS
    # -----------------------------------------------------

    palm_readings = (
        db.query(
            PalmistryReading
        )
        .filter(
            PalmistryReading.user_id
            == current_user.id
        )
        .order_by(
            PalmistryReading.created_at.desc()
        )
        .all()
    )


    # -----------------------------------------------------
    # TAROT READINGS
    # -----------------------------------------------------

    tarot_readings = (
        db.query(
            TarotReading
        )
        .filter(
            TarotReading.user_id
            == current_user.id
        )
        .order_by(
            TarotReading.created_at.desc()
        )
        .all()
    )


    reports = []


    # -----------------------------------------------------
    # PALMISTRY REPORTS
    # -----------------------------------------------------

    for reading in palm_readings:

        reports.append(
            {
                "id": reading.id,

                "type": "Palmistry",

                "created_at":
                    reading.created_at,

                "title":
                    f"Palmistry Report #{reading.id}",

                "download_url":
                    (
                        f"/api/reports/"
                        f"palmistry/"
                        f"{reading.id}/pdf"
                    ),
            }
        )


    # -----------------------------------------------------
    # TAROT REPORTS
    # -----------------------------------------------------

    for reading in tarot_readings:

        reports.append(
            {
                "id": reading.id,

                "type": "Tarot",

                "created_at":
                    reading.created_at,

                "title":
                    f"Tarot Report #{reading.id}",

                "download_url":
                    (
                        f"/api/reports/"
                        f"tarot/"
                        f"{reading.id}/pdf"
                    ),
            }
        )


    # -----------------------------------------------------
    # SORT
    # -----------------------------------------------------

    reports.sort(
        key=lambda item:
            item["created_at"],
        reverse=True,
    )


    # -----------------------------------------------------
    # LATEST READINGS
    # -----------------------------------------------------

    latest_palmistry = (
        palm_readings[0]
        if palm_readings
        else None
    )


    latest_tarot = (
        tarot_readings[0]
        if tarot_readings
        else None
    )


    combined_report = None


    if (
        latest_palmistry
        and latest_tarot
    ):

        combined_report = {

            "palmistry_reading_id":
                latest_palmistry.id,

            "tarot_reading_id":
                latest_tarot.id,

            "title":
                "Combined Journey Report",

            "download_url":
                (
                    f"/api/reports/"
                    f"combined/"
                    f"{latest_palmistry.id}/"
                    f"{latest_tarot.id}/pdf"
                ),
        }


    # -----------------------------------------------------
    # RESPONSE
    # -----------------------------------------------------

    return {

        "total_reports":
            len(reports),

        "palmistry_reports":
            len(palm_readings),

        "tarot_reports":
            len(tarot_readings),

        "reports":
            reports,

        "combined_report":
            combined_report,
    }