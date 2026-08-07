import csv
import io
import re
from datetime import datetime
from typing import Any
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import (
    ParagraphStyle,
    getSampleStyleSheet,
)
from reportlab.lib.units import mm
from reportlab.platypus import (
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

from app.models.report_schemas import (
    ReadingPdfRequest,
)

from app.services.analytics_service import (
    get_analytics_summary,
    get_reading_history,
)


def model_to_dict(value: Any) -> dict:
    if isinstance(value, dict):
        return value

    if hasattr(value, "model_dump"):
        return value.model_dump()

    if hasattr(value, "dict"):
        return value.dict()

    raise TypeError(
        "Unable to convert value to dictionary."
    )


def readable_label(key: str) -> str:
    return (
        key.replace("_", " ")
        .strip()
        .title()
    )


def safe_text(value: Any) -> str:
    if value is None:
        return "N/A"

    return escape(str(value))


def create_filename(name: str) -> str:
    safe_name = re.sub(
        r"[^A-Za-z0-9_-]+",
        "_",
        name.strip(),
    )

    safe_name = safe_name.strip("_")

    if not safe_name:
        safe_name = "reading"

    return (
        f"{safe_name}_Palmistry_Tarot_Reading.pdf"
    )


def add_simple_mapping(
    story: list,
    data: dict,
    styles: dict,
) -> None:
    for key, value in data.items():

        label = readable_label(key)

        if isinstance(value, dict):
            story.append(
                Paragraph(
                    f"<b>{safe_text(label)}</b>",
                    styles["Subsection"],
                )
            )

            story.append(
                Spacer(1, 4)
            )

            add_simple_mapping(
                story,
                value,
                styles,
            )

            story.append(
                Spacer(1, 6)
            )

        elif isinstance(value, list):

            story.append(
                Paragraph(
                    f"<b>{safe_text(label)}</b>",
                    styles["BodyText"],
                )
            )

            if not value:
                story.append(
                    Paragraph(
                        "No information available.",
                        styles["BodyText"],
                    )
                )

            else:
                for item in value:

                    if isinstance(item, dict):
                        item_text = " | ".join(
                            (
                                f"{readable_label(k)}: "
                                f"{v}"
                            )
                            for k, v in item.items()
                        )

                    else:
                        item_text = str(item)

                    story.append(
                        Paragraph(
                            f"- {safe_text(item_text)}",
                            styles["BodyText"],
                        )
                    )

            story.append(
                Spacer(1, 4)
            )

        else:

            story.append(
                Paragraph(
                    (
                        f"<b>{safe_text(label)}:</b> "
                        f"{safe_text(value)}"
                    ),
                    styles["BodyText"],
                )
            )

            story.append(
                Spacer(1, 3)
            )


def build_reading_pdf(
    payload: ReadingPdfRequest,
):
    request_data = model_to_dict(
        payload.reading_request
    )

    response_data = model_to_dict(
        payload.reading_response
    )

    user_profile = request_data.get(
        "user_profile",
        {},
    )

    user_name = user_profile.get(
        "name",
        "User",
    )

    filename = create_filename(
        user_name
    )

    pdf_buffer = io.BytesIO()

    document = SimpleDocTemplate(
        pdf_buffer,
        pagesize=A4,
        rightMargin=18 * mm,
        leftMargin=18 * mm,
        topMargin=18 * mm,
        bottomMargin=18 * mm,
        title=(
            "Palmistry & Tarot Intelligence "
            "Reading"
        ),
        author=(
            "Palmistry & Tarot Intelligence "
            "Platform"
        ),
    )

    base_styles = getSampleStyleSheet()

    styles = {
        "Title": ParagraphStyle(
            "CustomTitle",
            parent=base_styles["Title"],
            alignment=TA_CENTER,
            fontSize=20,
            leading=24,
            spaceAfter=12,
        ),

        "Subtitle": ParagraphStyle(
            "CustomSubtitle",
            parent=base_styles["Normal"],
            alignment=TA_CENTER,
            fontSize=10,
            leading=14,
            textColor=colors.grey,
            spaceAfter=18,
        ),

        "Section": ParagraphStyle(
            "CustomSection",
            parent=base_styles["Heading2"],
            fontSize=14,
            leading=18,
            spaceBefore=12,
            spaceAfter=8,
        ),

        "Subsection": ParagraphStyle(
            "CustomSubsection",
            parent=base_styles["Heading3"],
            fontSize=11,
            leading=14,
            spaceBefore=6,
            spaceAfter=4,
        ),

        "BodyText": ParagraphStyle(
            "CustomBody",
            parent=base_styles["BodyText"],
            fontSize=9.5,
            leading=14,
            spaceAfter=3,
        ),

        "Disclaimer": ParagraphStyle(
            "CustomDisclaimer",
            parent=base_styles["BodyText"],
            fontSize=8,
            leading=11,
            textColor=colors.grey,
            spaceBefore=12,
        ),
    }

    story = []

    story.append(
        Paragraph(
            "Palmistry & Tarot Intelligence Platform",
            styles["Title"],
        )
    )

    story.append(
        Paragraph(
            "Personalized AI Reading Report",
            styles["Subtitle"],
        )
    )

    generated_at = datetime.now().strftime(
        "%d %B %Y, %H:%M"
    )

    information_table = Table(
        [
            [
                "Name",
                safe_text(user_name),
            ],
            [
                "Age Group",
                safe_text(
                    user_profile.get(
                        "age_group"
                    )
                ),
            ],
            [
                "Generated",
                generated_at,
            ],
        ],
        colWidths=[
            38 * mm,
            120 * mm,
        ],
    )

    information_table.setStyle(
        TableStyle(
            [
                (
                    "BACKGROUND",
                    (0, 0),
                    (0, -1),
                    colors.whitesmoke,
                ),
                (
                    "GRID",
                    (0, 0),
                    (-1, -1),
                    0.4,
                    colors.lightgrey,
                ),
                (
                    "VALIGN",
                    (0, 0),
                    (-1, -1),
                    "TOP",
                ),
                (
                    "FONTNAME",
                    (0, 0),
                    (0, -1),
                    "Helvetica-Bold",
                ),
                (
                    "FONTSIZE",
                    (0, 0),
                    (-1, -1),
                    9,
                ),
                (
                    "BOTTOMPADDING",
                    (0, 0),
                    (-1, -1),
                    6,
                ),
                (
                    "TOPPADDING",
                    (0, 0),
                    (-1, -1),
                    6,
                ),
            ]
        )
    )

    story.append(
        information_table
    )

    story.append(
        Spacer(1, 12)
    )


    # ------------------------------------------
    # USER PROFILE
    # ------------------------------------------

    story.append(
        Paragraph(
            "1. User Profile",
            styles["Section"],
        )
    )

    add_simple_mapping(
        story,
        user_profile,
        styles,
    )


    # ------------------------------------------
    # READING CONTEXT
    # ------------------------------------------

    story.append(
        Paragraph(
            "2. Reading Context",
            styles["Section"],
        )
    )

    add_simple_mapping(
        story,
        request_data.get(
            "reading_context",
            {},
        ),
        styles,
    )


    # ------------------------------------------
    # PALM ANALYSIS
    # ------------------------------------------

    story.append(
        Paragraph(
            "3. Palm Analysis",
            styles["Section"],
        )
    )

    add_simple_mapping(
        story,
        request_data.get(
            "palm_analysis",
            {},
        ),
        styles,
    )


    # ------------------------------------------
    # TAROT
    # ------------------------------------------

    story.append(
        Paragraph(
            "4. Tarot Reading",
            styles["Section"],
        )
    )

    add_simple_mapping(
        story,
        request_data.get(
            "tarot_analysis",
            {},
        ),
        styles,
    )


    # ------------------------------------------
    # COMPLETE AI READING
    # ------------------------------------------

    reading = response_data.get(
        "reading",
        {},
    )

    story.append(
        Paragraph(
            "5. AI Interpretation",
            styles["Section"],
        )
    )

    add_simple_mapping(
        story,
        reading.get(
            "interpretation",
            {},
        ),
        styles,
    )


    # ------------------------------------------
    # PERSONALITY
    # ------------------------------------------

    story.append(
        Paragraph(
            "6. Personality Intelligence",
            styles["Section"],
        )
    )

    add_simple_mapping(
        story,
        reading.get(
            "personality",
            {},
        ),
        styles,
    )


    # ------------------------------------------
    # RECOMMENDATIONS
    # ------------------------------------------

    story.append(
        Paragraph(
            "7. Recommendations",
            styles["Section"],
        )
    )

    add_simple_mapping(
        story,
        reading.get(
            "recommendations",
            {},
        ),
        styles,
    )


    # ------------------------------------------
    # LIFE TRENDS
    # ------------------------------------------

    story.append(
        Paragraph(
            "8. Life Trend Analysis",
            styles["Section"],
        )
    )

    add_simple_mapping(
        story,
        reading.get(
            "trends",
            {},
        ),
        styles,
    )


    # ------------------------------------------
    # GUIDANCE SCORES
    # ------------------------------------------

    story.append(
        Paragraph(
            "9. Guidance Scores",
            styles["Section"],
        )
    )

    add_simple_mapping(
        story,
        response_data.get(
            "scores",
            {},
        ),
        styles,
    )


    # ------------------------------------------
    # DISCLAIMER
    # ------------------------------------------

    story.append(
        Spacer(1, 12)
    )

    story.append(
        Paragraph(
            (
                "<b>Disclaimer:</b> "
                "This report is generated by a "
                "prototype Palmistry & Tarot "
                "Intelligence Platform. Palmistry "
                "and tarot interpretations are "
                "provided for entertainment and "
                "personal reflection. They should "
                "not be treated as scientific, "
                "medical, legal, financial, or "
                "professional advice."
            ),
            styles["Disclaimer"],
        )
    )

    document.build(
        story
    )

    pdf_buffer.seek(0)

    return (
        pdf_buffer,
        filename,
    )


def build_analytics_summary_csv() -> str:
    summary = get_analytics_summary()

    output = io.StringIO()

    writer = csv.writer(
        output
    )

    writer.writerow(
        [
            "Section",
            "Metric",
            "Value",
        ]
    )

    writer.writerow(
        [
            "Overview",
            "Total Readings",
            summary.get(
                "total_readings",
                0,
            ),
        ]
    )

    writer.writerow(
        [
            "Overview",
            "Total Palm Analyses",
            summary.get(
                "total_palm_analyses",
                0,
            ),
        ]
    )

    writer.writerow(
        [
            "Overview",
            "Total Tarot Readings",
            summary.get(
                "total_tarot_readings",
                0,
            ),
        ]
    )

    writer.writerow(
        [
            "Overview",
            "Average Guidance Score",
            summary.get(
                "average_guidance_score",
                0,
            ),
        ]
    )


    distribution_fields = {
        "Tarot Spread":
            "spread_distribution",

        "Reading Category":
            "category_distribution",

        "Heart Line":
            "heart_line_distribution",

        "Head Line":
            "head_line_distribution",

        "Life Line":
            "life_line_distribution",

        "Tarot Orientation":
            "orientation_distribution",
    }


    for section, field_name in (
        distribution_fields.items()
    ):

        distribution = summary.get(
            field_name,
            {},
        )

        for name, count in (
            distribution.items()
        ):

            writer.writerow(
                [
                    section,
                    name,
                    count,
                ]
            )


    for card in summary.get(
        "most_common_tarot_cards",
        [],
    ):

        writer.writerow(
            [
                "Most Common Tarot Cards",
                card.get(
                    "name",
                    "Unknown",
                ),
                card.get(
                    "count",
                    0,
                ),
            ]
        )


    return output.getvalue()


def build_reading_history_csv(
    limit: int = 100,
) -> str:

    history = get_reading_history(
        limit=limit
    )

    output = io.StringIO()

    writer = csv.writer(
        output
    )

    writer.writerow(
        [
            "ID",
            "Created At",
            "Category",
            "Spread",
            "Heart Line",
            "Head Line",
            "Life Line",
            "Tarot Cards",
            "Upright Count",
            "Reversed Count",
            "Overall Insight Score",
        ]
    )


    for reading in history:

        tarot_cards = reading.get(
            "tarot_cards",
            [],
        )

        tarot_text = ", ".join(
            tarot_cards
        )


        writer.writerow(
            [
                reading.get(
                    "id"
                ),

                reading.get(
                    "created_at"
                ),

                reading.get(
                    "category"
                ),

                reading.get(
                    "spread"
                ),

                reading.get(
                    "heart_line"
                ),

                reading.get(
                    "head_line"
                ),

                reading.get(
                    "life_line"
                ),

                tarot_text,

                reading.get(
                    "upright_count",
                    0,
                ),

                reading.get(
                    "reversed_count",
                    0,
                ),

                reading.get(
                    "overall_insight_score"
                ),
            ]
        )


    return output.getvalue()