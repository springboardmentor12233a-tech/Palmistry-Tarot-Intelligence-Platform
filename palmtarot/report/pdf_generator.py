import logging
import sys
from pathlib import Path
from typing import Any

# Ensure workspace root is in sys.path for direct script execution
workspace_root = str(Path(__file__).resolve().parents[2])
if workspace_root not in sys.path:
    sys.path.insert(0, workspace_root)

from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    HRFlowable,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)
from reportlab.platypus import Image as RLImage

try:
    from ..assets.card_loader import get_card_pil_image
    from ..config import settings
except (ImportError, ValueError):
    from palmtarot.assets.card_loader import get_card_pil_image
    from palmtarot.config import settings

logger = logging.getLogger(__name__)




def _resolve_card_img_filename(card_dict: dict[str, Any]) -> str:
    """Resolve card image filename from card dictionary or card name lookup."""
    img = card_dict.get("img")
    if img and str(img).strip():
        return str(img).strip()
    name = card_dict.get("name")
    if name:
        try:
            from ..data.loader import load_tarot_json
            data = load_tarot_json()
            for card in data.get("cards", []):
                if str(card.get("name", "")).strip().lower() == str(name).strip().lower():
                    return str(card.get("img", "ar00.jpg"))
        except Exception as e:
            logger.warning(f"Error resolving card image by name '{name}': {e}")
    return "ar00.jpg"


def _get_card_flowable_image(
    img_filename: str,
    orientation: str = "Upright",
    width_inch: float = 1.4,
    height_inch: float = 2.3
) -> RLImage | None:
    """Load authentic card PIL image, rotate 180° if Reversed, save to disk cache, and return ReportLab Image flowable."""
    if not img_filename:
        return None
    try:
        temp_dir = settings.OUTPUT_DIR / "temp_card_images"
        temp_dir.mkdir(parents=True, exist_ok=True)
        orient_clean = "reversed" if str(orientation).lower() == "reversed" else "upright"
        temp_file = temp_dir / f"{Path(img_filename).stem}_{orient_clean}.jpg"

        if not temp_file.exists() or temp_file.stat().st_size < 1000:
            pil_img = get_card_pil_image(img_filename, orientation)
            pil_img.convert("RGB").save(temp_file, format="JPEG", quality=95)

        return RLImage(str(temp_file), width=width_inch * inch, height=height_inch * inch)
    except Exception as e:
        logger.warning(f"Failed to generate ReportLab card image for '{img_filename}': {e}")
        return None


def generate_pdf_report(
    reading_data: dict[str, Any],
    output_path: Path | None = None
) -> Path:
    """Generate a high-quality, print-friendly PDF reading report with card-style Tarot blocks."""
    out_path = Path(output_path) if output_path else settings.OUTPUT_DIR / "Palmistry_AI_Report.pdf"
    out_path.parent.mkdir(parents=True, exist_ok=True)

    styles = getSampleStyleSheet()

    # Premium Typography & Palette Styles
    title_style = ParagraphStyle(
        "DocTitle",
        parent=styles["Title"],
        fontName="Helvetica-Bold",
        fontSize=22,
        leading=26,
        textColor=colors.HexColor("#4c1d95"),
        alignment=0,
        spaceAfter=4
    )

    subtitle_style = ParagraphStyle(
        "DocSubTitle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#6b7280"),
        spaceAfter=10
    )

    h2_style = ParagraphStyle(
        "SectionHeading",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=13,
        leading=17,
        textColor=colors.HexColor("#581c87"),
        spaceBefore=14,
        spaceAfter=6
    )

    body_style = ParagraphStyle(
        "BodyDark",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#1e1b4b"),
        spaceAfter=6
    )

    # Card Block Specific Paragraph Styles
    card_title_style = ParagraphStyle(
        "CardTitle",
        fontName="Helvetica-Bold",
        fontSize=12,
        leading=15,
        textColor=colors.HexColor("#4c1d95"),
        spaceAfter=3
    )

    card_meta_style = ParagraphStyle(
        "CardMeta",
        fontName="Helvetica",
        fontSize=9.5,
        leading=13,
        textColor=colors.HexColor("#581c87"),
        spaceAfter=3
    )

    card_kw_style = ParagraphStyle(
        "CardKeywords",
        fontName="Helvetica-Oblique",
        fontSize=9,
        leading=12,
        textColor=colors.HexColor("#6b21a8"),
        spaceAfter=4
    )

    card_body_style = ParagraphStyle(
        "CardBody",
        fontName="Helvetica",
        fontSize=9.5,
        leading=13.5,
        textColor=colors.HexColor("#1f2937")
    )

    card_aff_style = ParagraphStyle(
        "CardAffirmation",
        fontName="Helvetica-Oblique",
        fontSize=8.5,
        leading=11.5,
        textColor=colors.HexColor("#4b5563"),
        spaceBefore=4
    )

    # Table Header & Cell Styles
    th_style = ParagraphStyle(
        "TableHeader",
        fontName="Helvetica-Bold",
        fontSize=9,
        leading=11,
        textColor=colors.white,
        alignment=0
    )

    td_style = ParagraphStyle(
        "TableCell",
        fontName="Helvetica",
        fontSize=9,
        leading=12,
        textColor=colors.HexColor("#1f2937")
    )

    doc = SimpleDocTemplate(
        str(out_path),
        rightMargin=0.5 * inch,
        leftMargin=0.5 * inch,
        topMargin=0.5 * inch,
        bottomMargin=0.5 * inch
    )

    elements = []

    # Title & Header
    elements.append(Paragraph("Palmistry & Tarot Intelligence Platform", title_style))
    elements.append(Paragraph("Celestial AI Computer Vision & Symbolic Arcana Analysis Report", subtitle_style))
    elements.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#7e22ce"), spaceAfter=10))

    # User Query Context
    query = reading_data.get("user_question", "General Self-Reflection & Guidance Focus")
    elements.append(Paragraph(f"<b>Reading Focus / Query:</b> {query}", body_style))
    elements.append(Spacer(1, 6))

    # Palm Features Table
    palm_lines = reading_data.get("palm_lines", [])
    if palm_lines:
        elements.append(Paragraph("Palm Line Segmentation Features", h2_style))

        p_headers = [
            Paragraph("Line", th_style),
            Paragraph("Length", th_style),
            Paragraph("Area", th_style),
            Paragraph("Angle", th_style),
            Paragraph("Interpretation", th_style)
        ]
        p_data = [p_headers]

        for row in palm_lines:
            line_name = str(row.get("Line", row.get("line", "")))
            length_val = str(row.get("Length", row.get("length_px", "")))
            area_val = str(row.get("Area", row.get("area_px", "")))
            angle_val = str(row.get("Angle", row.get("angle_deg", "")))
            interp_val = str(row.get("Interpretation", row.get("description", "")))

            p_data.append([
                Paragraph(line_name, td_style),
                Paragraph(f"{length_val}px" if not length_val.endswith("px") else length_val, td_style),
                Paragraph(area_val, td_style),
                Paragraph(f"{angle_val}°" if not angle_val.endswith("°") else angle_val, td_style),
                Paragraph(interp_val, td_style)
            ])

        p_table = Table(p_data, colWidths=[1.3 * inch, 1.1 * inch, 1.1 * inch, 1.0 * inch, 3.0 * inch])
        p_table.setStyle(
            TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#581c87")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("ALIGN", (0, 0), (-1, -1), "LEFT"),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e9d5ff")),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.HexColor("#faf5ff"), colors.white])
            ])
        )
        elements.append(p_table)
        elements.append(Spacer(1, 10))

    # Tarot Cards Draw — Stacked Format: Centered Card Artwork Photo Top + Down Meaning (No Table)
    tarot_cards = reading_data.get("tarot_reading", {}).get("cards", [])
    if tarot_cards:
        elements.append(Paragraph("Tarot Reading Draw & Card Archetypes", h2_style))
        elements.append(Spacer(1, 4))

        for idx, c in enumerate(tarot_cards):
            pos_val = str(c.get("position", f"Draw {idx+1}"))
            name_val = str(c.get("name", "Tarot Card"))
            orient_val = str(c.get("orientation", "Upright"))
            orient_icon = "✨ Upright" if orient_val.lower() == "upright" else "🔄 Reversed"

            arcana_val = c.get("arcana", "Arcana")
            suit_val = c.get("suit", "")
            arcana_suit_str = f"{arcana_val} ({suit_val})" if suit_val else str(arcana_val)

            kw_list = c.get("keywords", [])
            kw_str = ", ".join(kw_list) if isinstance(kw_list, list) else str(kw_list or "wisdom, guidance, reflection")

            interp_str = str(c.get("interpretation", c.get("meaning", "Card interpretation guidance.")))
            gen_meaning_str = str(c.get("meaning", interp_str))
            affirmation_str = str(c.get("affirmation", ""))

            img_filename = _resolve_card_img_filename(c)

            # 1. Card Artwork Photo (Centered on top above text block, rotated 180° if Reversed)
            card_img = _get_card_flowable_image(img_filename, orientation=orient_val, width_inch=1.4, height_inch=2.3)
            if card_img:
                card_img.hAlign = 'CENTER'
                elements.append(card_img)
                elements.append(Spacer(1, 6))

            # 2. Card Details & Down Meaning (Stacked cleanly below photo without any table)
            elements.append(Paragraph(f"<b>{pos_val}: {name_val}</b>", card_title_style))
            elements.append(Paragraph(f"<b>State:</b> {orient_icon} &nbsp;|&nbsp; <b>Arcana/Suit:</b> {arcana_suit_str}", card_meta_style))
            elements.append(Paragraph(f"<b>Keywords:</b> <i>{kw_str}</i>", card_kw_style))
            elements.append(Paragraph(f"<b>Interpretation:</b> {interp_str}", card_body_style))
            if gen_meaning_str and gen_meaning_str != interp_str:
                elements.append(Paragraph(f"<b>Meaning:</b> {gen_meaning_str}", card_body_style))
            if affirmation_str and affirmation_str != "No affirmation available":
                elements.append(Paragraph(f"<b>Affirmation:</b> {affirmation_str}", card_aff_style))

            # Spacing between cards
            if idx < len(tarot_cards) - 1:
                elements.append(Spacer(1, 8))
                elements.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#e9d5ff"), spaceBefore=4, spaceAfter=10))
            else:
                elements.append(Spacer(1, 8))

        elements.append(Spacer(1, 4))

    # Narrative Synthesis Sections
    llm_narrative = reading_data.get("interpretation", {})
    sections = [
        ("Personality Analysis", llm_narrative.get("personality", "")),
        ("Career Guidance", llm_narrative.get("career_guidance", "")),
        ("Relationship Insights", llm_narrative.get("relationship_insights", "")),
        ("Health & Wellness", llm_narrative.get("health_wellness", "")),
        ("Life Trend & Temporal Flow", llm_narrative.get("life_trend", ""))
    ]

    for heading, text in sections:
        if text:
            elements.append(Paragraph(heading, h2_style))
            elements.append(Paragraph(text, body_style))
            elements.append(Spacer(1, 6))

    # Actionable Bullet Lists
    for list_key, list_title in [
        ("strengths", "Core Strengths"),
        ("areas_for_improvement", "Areas for Growth"),
        ("recommendations", "Actionable Recommendations")
    ]:
        items = llm_narrative.get(list_key, [])
        if items:
            elements.append(Paragraph(list_title, h2_style))
            for item in items:
                elements.append(Paragraph(f"• {item}", body_style))
            elements.append(Spacer(1, 6))

    # Disclaimer Footer
    elements.append(Spacer(1, 10))
    elements.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#d8b4fe"), spaceAfter=8))
    elements.append(Paragraph("Disclaimer", ParagraphStyle("DiscHead", parent=h2_style, fontSize=10, leading=12, spaceBefore=4, spaceAfter=2)))
    elements.append(
        Paragraph(
            "This document is compiled using AI palmistry landmark computer vision and tarot archetypal interpretation. "
            "It is provided for personal self-reflection, mindfulness, and educational guidance purposes.",
            ParagraphStyle("DiscBody", parent=body_style, fontSize=8, leading=11, textColor=colors.HexColor("#6b7280"))
        )
    )

    doc.build(elements)
    logger.info(f"PDF Report created successfully at {out_path}")
    return out_path


if __name__ == "__main__":
    import sys
    from pathlib import Path
    logging.basicConfig(level=logging.INFO)

    # Enable relative imports when run as script
    sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

    try:
        from palmtarot.tarot_engine.deck import TarotDeck
        deck = TarotDeck()
        cards = deck.draw_cards(3)
    except Exception as err:
        logger.warning(f"Could not load tarot deck: {err}. Using fallback cards.")
        cards = [
            {"position": "Past", "name": "The Fool", "orientation": "Upright", "arcana": "Major", "keywords": ["beginnings", "faith"], "interpretation": "A step into the unknown.", "meaning": "New beginnings.", "img": "m00.jpg"},
            {"position": "Present", "name": "The Magician", "orientation": "Upright", "arcana": "Major", "keywords": ["manifestation", "power"], "interpretation": "Willpower and alignment.", "meaning": "Resourcefulness.", "img": "m01.jpg"},
            {"position": "Future", "name": "The World", "orientation": "Upright", "arcana": "Major", "keywords": ["completion", "wholeness"], "interpretation": "Fulfillment and success.", "meaning": "Cosmic integration.", "img": "m21.jpg"}
        ]

    sample_data = {
        "user_question": "What does my spiritual and personal growth path reveal?",
        "palm_lines": [
            {"Line": "Heart Line", "Length": "182", "Area": "245", "Angle": "44", "Interpretation": "Deep emotional harmony and active compassion."},
            {"Line": "Head Line", "Length": "135", "Area": "188", "Angle": "29", "Interpretation": "Strong mental focus and analytical problem solving."},
            {"Line": "Life Line", "Length": "215", "Area": "305", "Angle": "56", "Interpretation": "High physical energy and resilient health."}
        ],
        "tarot_reading": {
            "cards": cards
        },
        "interpretation": {
            "personality": "Balanced, intuitive, and action-oriented.",
            "career_guidance": "Promising trajectory in strategic leadership.",
            "relationship_insights": "Authentic expression brings deeper connection.",
            "health_wellness": "Strong vitality; prioritize mindful rest.",
            "life_trend": "Progressive growth and expansion.",
            "strengths": ["Intuition", "Strategic Vision", "Resilience"],
            "areas_for_improvement": ["Patience"],
            "recommendations": ["Align daily routines with core goals", "Trust long-term vision"]
        }
    }

    target_pdf = settings.OUTPUT_DIR / "Sample_Direct_PDF_Report.pdf"
    generated_file = generate_pdf_report(sample_data, output_path=target_pdf)
    print(f"\n[+] PDF generated successfully at: {generated_file.absolute()}")

