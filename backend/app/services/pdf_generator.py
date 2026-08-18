from html import escape
from pathlib import Path
from uuid import uuid4

from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import Image, Paragraph, SimpleDocTemplate, Spacer

from app.core.config import get_settings


def _clean_text(text: str) -> str:
    return escape(text.replace("**", "").replace("###", "").strip()).replace("\n", "<br/>")


def generate_tarot_pdf(reading: dict) -> Path:
    settings = get_settings()
    pdf_path = settings.generated_outputs_dir / f"tarot_report_{uuid4().hex}.pdf"

    styles = getSampleStyleSheet()
    title_style = styles["Heading1"]
    title_style.alignment = TA_CENTER
    heading_style = styles["Heading2"]
    normal_style = styles["BodyText"]

    story = [
        Paragraph("AI Tarot Reading Report", title_style),
        Spacer(1, 20),
        Paragraph("1. Reading Details", heading_style),
        Paragraph(f"<b>Name:</b> {escape(reading['name'])}", normal_style),
        Paragraph(f"<b>Question:</b> {escape(reading['question'])}", normal_style),
        Paragraph(f"<b>Category:</b> {escape(reading['category'])}", normal_style),
        Paragraph(f"<b>Spread:</b> {escape(reading['spread'])}", normal_style),
        Spacer(1, 20),
        Paragraph("2. Cards Drawn", heading_style),
    ]

    for item in reading["cards"]:
        card = item["card"]
        image_path = settings.tarot_cards_dir / card["img"]
        if image_path.exists():
            story.append(Image(str(image_path), width=2.2 * inch, height=3.8 * inch))
            story.append(Spacer(1, 8))

        story.extend(
            [
                Paragraph(f"<b>Position:</b> {escape(item['position'])}", normal_style),
                Paragraph(f"<b>Card:</b> {escape(card['name'])}", normal_style),
                Paragraph(f"<b>Orientation:</b> {escape(item['orientation'])}", normal_style),
                Paragraph(f"<b>Keywords:</b> {escape(', '.join(card['keywords']))}", normal_style),
                Spacer(1, 8),
            ]
        )

        for meaning in item["meaning"]:
            story.append(Paragraph(f"- {escape(meaning)}", normal_style))
        story.append(Spacer(1, 16))

    story.extend(
        [
            Paragraph("3. AI Tarot Interpretation", heading_style),
            Paragraph(_clean_text(reading["interpretation"]), normal_style),
            Spacer(1, 20),
            Paragraph("4. Disclaimer", heading_style),
            Paragraph(
                "This tarot reading is generated for self-reflection and entertainment purposes only. "
                "It is not intended to predict the future or replace professional advice.",
                normal_style,
            ),
        ]
    )

    SimpleDocTemplate(str(pdf_path), pagesize=A4).build(story)
    return pdf_path


def generate_palm_pdf(analysis: dict) -> Path:
    settings = get_settings()
    pdf_path = settings.generated_outputs_dir / f"palm_report_{uuid4().hex}.pdf"

    styles = getSampleStyleSheet()
    title_style = styles["Heading1"]
    title_style.alignment = TA_CENTER
    heading_style = styles["Heading2"]
    normal_style = styles["BodyText"]

    story = [
        Paragraph("AI Palmistry Analysis Report", title_style),
        Spacer(1, 20),
        Paragraph("1. Uploaded Palm Image", heading_style),
        Image(analysis["input_image_path"], width=3.5 * inch, height=3.5 * inch),
        Spacer(1, 15),
    ]

    if analysis.get("palm_lines_image_path"):
        story.extend(
            [
                Paragraph("2. Detected Principal Lines", heading_style),
                Image(analysis["palm_lines_image_path"], width=3.5 * inch, height=3.5 * inch),
                Spacer(1, 20),
            ]
        )

    story.extend(
        [
            Paragraph("3. Palm Line Analysis", heading_style),
            Paragraph(f"<b>Heart Line:</b> {escape(analysis['lines']['heart_line'])}", normal_style),
            Paragraph(f"<b>Head Line:</b> {escape(analysis['lines']['head_line'])}", normal_style),
            Paragraph(f"<b>Life Line:</b> {escape(analysis['lines']['life_line'])}", normal_style),
            Spacer(1, 20),
            Paragraph("4. AI Interpretation", heading_style),
            Paragraph(_clean_text(analysis["interpretation"]), normal_style),
            Spacer(1, 20),
            Paragraph("5. Disclaimer", heading_style),
            Paragraph(
                "This report is generated using AI-based palm line detection and language-model "
                "interpretation for educational and entertainment purposes only.",
                normal_style,
            ),
        ]
    )

    SimpleDocTemplate(str(pdf_path), pagesize=A4).build(story)
    return pdf_path
