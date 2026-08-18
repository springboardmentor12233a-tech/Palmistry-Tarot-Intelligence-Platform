from pathlib import Path
import re

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Image,
    Table,
    TableStyle,
    PageBreak,
)
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import pdfmetrics


APP_DIR = Path(__file__).resolve().parent
BACKEND_DIR = APP_DIR.parent

REPORTS_DIR = APP_DIR / "reports"
REPORTS_DIR.mkdir(parents=True, exist_ok=True)

TAROT_CARDS_DIR = APP_DIR / "tarot_data" / "tarot cards"

PALM_RESULTS_DIR = BACKEND_DIR / "palmistry" / "code" / "results"
PALM_IMAGE_PATH = PALM_RESULTS_DIR / "warped_palm_clean.jpg"


# ------------------------------------------------------------------
# PALETTE — deep midnight indigo with a warm champagne accent and a
# cool violet secondary, instead of the previous black/gold scheme.
# ------------------------------------------------------------------
BG = colors.HexColor("#0A0C16")
CARD_BG = colors.HexColor("#12142280")  # not used directly (alpha in hex unsupported) — kept for reference
CARD_BG = colors.HexColor("#141628")
CARD_BG_2 = colors.HexColor("#1B1E36")
GOLD = colors.HexColor("#C9A876")
GOLD_BRIGHT = colors.HexColor("#E7CB98")
VIOLET = colors.HexColor("#8B85C4")
VIOLET_BRIGHT = colors.HexColor("#AFA8E0")
WHITE = colors.HexColor("#F3F1F8")
MUTED = colors.HexColor("#ABA6C2")
DIM = colors.HexColor("#6C6886")
BORDER = colors.HexColor("#2A2C46")


def register_fonts():
    regular = Path("C:/Windows/Fonts/DejaVuSerif.ttf")
    bold = Path("C:/Windows/Fonts/DejaVuSerif-Bold.ttf")

    try:
        if regular.exists():
            pdfmetrics.registerFont(TTFont("ArcanaSerif", str(regular)))
        if bold.exists():
            pdfmetrics.registerFont(TTFont("ArcanaSerifBold", str(bold)))
    except Exception:
        pass


register_fonts()

SERIF = "ArcanaSerif" if "ArcanaSerif" in pdfmetrics.getRegisteredFontNames() else "Times-Roman"
SERIF_BOLD = "ArcanaSerifBold" if "ArcanaSerifBold" in pdfmetrics.getRegisteredFontNames() else "Times-Bold"
SANS = "Helvetica"
SANS_BOLD = "Helvetica-Bold"


class ArcanaTable(Table):
    """Table with a single soft-glow rounded frame — quieter than a
    double-contour box, with a small accent rule on the left edge
    instead of corner ticks."""
    def __init__(self, *args, radius=9, accent=True, accent_color=None, **kwargs):
        self.arcana_radius = radius
        self.arcana_accent = accent
        self.arcana_accent_color = accent_color or GOLD
        super().__init__(*args, **kwargs)

    def draw(self):
        super().draw()

        w, h = self._width, self._height
        canvas = self.canv
        canvas.saveState()

        # Single restrained rounded frame.
        canvas.setStrokeColor(
            colors.Color(BORDER.red, BORDER.green, BORDER.blue, alpha=0.95)
        )
        canvas.setLineWidth(0.75)
        canvas.roundRect(
            0.5,
            0.5,
            max(0, w - 1),
            max(0, h - 1),
            self.arcana_radius,
            fill=0,
            stroke=1,
        )

        # Thin accent rule down the left edge — a quieter signature
        # than the previous corner ticks, reads as a "spine".
        if self.arcana_accent:
            ac = self.arcana_accent_color
            canvas.setStrokeColor(ac)
            canvas.setLineWidth(1.6)
            inset = 9
            canvas.line(2.2, inset, 2.2, max(inset, h - inset))

        canvas.restoreState()


def draw_background(canvas, doc):
    width, height = A4
    canvas.saveState()

    canvas.setFillColor(BG)
    canvas.rect(0, 0, width, height, fill=1, stroke=0)

    # Soft vertical gradient wash using stacked translucent bands,
    # cool violet at the top fading toward the base — replaces the
    # concentric-ring motif with something calmer.
    band_h = height / 26
    for i in range(26):
        t = i / 25
        alpha = 0.05 * (1 - t) ** 1.6
        canvas.setFillColor(colors.Color(VIOLET.red, VIOLET.green, VIOLET.blue, alpha=alpha))
        canvas.rect(0, height - (i + 1) * band_h, width, band_h + 0.5, fill=1, stroke=0)

    # Two quiet corner glows.
    canvas.setFillColor(colors.Color(GOLD.red, GOLD.green, GOLD.blue, alpha=0.05))
    canvas.circle(width + 10 * mm, 12 * mm, 46 * mm, fill=1, stroke=0)
    canvas.setFillColor(colors.Color(VIOLET.red, VIOLET.green, VIOLET.blue, alpha=0.045))
    canvas.circle(-10 * mm, height - 14 * mm, 50 * mm, fill=1, stroke=0)

    # Minimal star points.
    canvas.setFillColor(colors.Color(
        GOLD_BRIGHT.red, GOLD_BRIGHT.green, GOLD_BRIGHT.blue, alpha=0.5
    ))
    for sx, sy in [
        (20 * mm, height - 26 * mm),
        (width - 22 * mm, height - 40 * mm),
        (width - 26 * mm, 30 * mm),
        (25 * mm, 38 * mm),
    ]:
        canvas.circle(sx, sy, 0.55 * mm, fill=1, stroke=0)

    margin = 8 * mm

    # Premium curved editorial frame.
    canvas.setStrokeColor(
        colors.Color(GOLD.red, GOLD.green, GOLD.blue, alpha=0.48)
    )
    canvas.setLineWidth(0.7)
    canvas.roundRect(
        margin,
        margin,
        width - 2 * margin,
        height - 2 * margin,
        7 * mm,
        fill=0,
        stroke=1,
    )

    # Inner curved arc segments create a subtle "portal" motif.
    canvas.setStrokeColor(
        colors.Color(VIOLET.red, VIOLET.green, VIOLET.blue, alpha=0.22)
    )
    canvas.setLineWidth(0.45)

    arc_inset = 14 * mm
    canvas.arc(
        margin + arc_inset,
        height - margin - arc_inset - 20 * mm,
        width - margin - arc_inset,
        height - margin - arc_inset,
        0,
        90,
    )
    canvas.arc(
        margin + arc_inset,
        margin + arc_inset,
        width - margin - arc_inset,
        margin + arc_inset + 20 * mm,
        180,
        90,
    )

    canvas.setFillColor(GOLD_BRIGHT)
    canvas.setFont(SANS_BOLD, 7)
    canvas.drawCentredString(
        width / 2,
        height - 13 * mm,
        "A R C A N A   A I",
    )

    canvas.setFillColor(DIM)
    canvas.setFont(SANS, 6)
    canvas.drawString(
        margin + 3 * mm,
        6 * mm,
        "ARCANA AI  •  TAROT INTELLIGENCE",
    )
    canvas.drawRightString(
        width - margin - 3 * mm,
        6 * mm,
        f"{doc.page:02d}",
    )

    canvas.restoreState()


def styles():
    return {
        "brand": ParagraphStyle(
            "brand", fontName=SANS_BOLD, fontSize=7.5, leading=10,
            textColor=GOLD, alignment=TA_CENTER, tracking=1.5,
        ),
        "hero": ParagraphStyle(
            "hero", fontName=SERIF_BOLD, fontSize=36, leading=41,
            textColor=WHITE, alignment=TA_CENTER,
        ),
        "hero_small": ParagraphStyle(
            "hero_small", fontName=SANS, fontSize=7.5, leading=11.5,
            textColor=MUTED, alignment=TA_CENTER,
        ),
        "question_label": ParagraphStyle(
            "question_label", fontName=SANS_BOLD, fontSize=7, leading=9,
            textColor=VIOLET_BRIGHT, alignment=TA_LEFT,
        ),
        "question": ParagraphStyle(
            "question", fontName=SERIF_BOLD, fontSize=18, leading=25,
            textColor=WHITE, alignment=TA_CENTER,
        ),
        "manifesto": ParagraphStyle(
            "manifesto", fontName=SERIF, fontSize=11, leading=17,
            textColor=MUTED, alignment=TA_CENTER,
        ),
        "section_number": ParagraphStyle(
            "section_number", fontName=SANS_BOLD, fontSize=7, leading=9,
            textColor=VIOLET_BRIGHT, spaceAfter=3,
        ),
        "section_title": ParagraphStyle(
            "section_title", fontName=SERIF_BOLD, fontSize=26, leading=30,
            textColor=WHITE, spaceAfter=8,
        ),
        "section_subtitle": ParagraphStyle(
            "section_subtitle", fontName=SANS, fontSize=8, leading=11,
            textColor=MUTED,
        ),
        "card_name": ParagraphStyle(
            "card_name", fontName=SERIF_BOLD, fontSize=11.5, leading=14,
            textColor=WHITE, alignment=TA_CENTER,
        ),
        "position": ParagraphStyle(
            "position", fontName=SANS_BOLD, fontSize=7, leading=9,
            textColor=VIOLET_BRIGHT, alignment=TA_CENTER,
        ),
        "orientation": ParagraphStyle(
            "orientation", fontName=SANS_BOLD, fontSize=6.5, leading=8,
            textColor=GOLD, alignment=TA_CENTER,
        ),
        "label": ParagraphStyle(
            "label", fontName=SANS_BOLD, fontSize=6.5, leading=8,
            textColor=GOLD_BRIGHT,
        ),
        "body": ParagraphStyle(
            "body", fontName=SANS, fontSize=8.7, leading=14,
            textColor=WHITE,
        ),
        "body_muted": ParagraphStyle(
            "body_muted", fontName=SANS, fontSize=8, leading=12,
            textColor=MUTED,
        ),
        "insight": ParagraphStyle(
            "insight", fontName=SANS, fontSize=9, leading=14.5,
            textColor=WHITE,
        ),
        "big_quote": ParagraphStyle(
            "big_quote", fontName=SERIF_BOLD, fontSize=20, leading=27,
            textColor=WHITE,
        ),
        "guidance_number": ParagraphStyle(
            "guidance_number", fontName=SERIF_BOLD, fontSize=19, leading=22,
            textColor=VIOLET_BRIGHT, alignment=TA_CENTER,
        ),
        "guidance": ParagraphStyle(
            "guidance", fontName=SANS, fontSize=8.5, leading=13,
            textColor=WHITE,
        ),
        "final_title": ParagraphStyle(
            "final_title", fontName=SERIF_BOLD, fontSize=28, leading=34,
            textColor=WHITE, alignment=TA_CENTER,
        ),
        "final_quote": ParagraphStyle(
            "final_quote", fontName=SERIF_BOLD, fontSize=16, leading=24,
            textColor=WHITE, alignment=TA_CENTER,
        ),
    }


def safe(text):
    if not text:
        return ""
    return (
        str(text)
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
    )


def find_card_image(card):
    filename = card.get("image_file")
    if not filename:
        return None

    path = TAROT_CARDS_DIR / Path(filename).name
    return path if path.exists() and path.is_file() else None


def panel(content, width, background=CARD_BG, accent_color=None):
    table = ArcanaTable([[content]], colWidths=[width], accent_color=accent_color)
    table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), background),
            ("LEFTPADDING", (0, 0), (-1, -1), 10),
            ("RIGHTPADDING", (0, 0), (-1, -1), 8),
            ("TOPPADDING", (0, 0), (-1, -1), 9),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 9),
        ])
    )
    return table


def parse_interpretation(text):
    result = {
        "overall": "",
        "synthesis": "",
        "palm": "",
        "tarot": "",
        "meaning": "",
        "guidance": "",
    }

    if not text:
        return result

    pattern = re.compile(
        r"(OVERALL INSIGHT|ARCANA SYNTHESIS|PALM INSIGHT|TAROT INSIGHT|"
        r"WHAT THIS MEANS FOR YOU|KEY GUIDANCE)",
        re.IGNORECASE,
    )

    matches = list(pattern.finditer(text))

    for i, match in enumerate(matches):
        title = match.group(1).strip().upper()
        start = match.end()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        content = text[start:end].strip()

        if title == "OVERALL INSIGHT":
            result["overall"] = content
        elif title == "ARCANA SYNTHESIS":
            result["synthesis"] = content
        elif title == "PALM INSIGHT":
            result["palm"] = content
        elif title == "TAROT INSIGHT":
            result["tarot"] = content
        elif title == "WHAT THIS MEANS FOR YOU":
            result["meaning"] = content
        elif title == "KEY GUIDANCE":
            result["guidance"] = content

    return result


def get_guidance(text):
    if not text:
        return []

    matches = re.findall(
        r"(?:^|\n)\s*(?:\d+[.)]|[-•])\s*(.+?)(?=\n\s*(?:\d+[.)]|[-•])|\Z)",
        text,
        flags=re.S,
    )

    return [
        " ".join(item.strip().split())
        for item in matches
        if item.strip()
    ][:3]


def create_card(card, position, card_width, image_height, st):
    elements = [
        Paragraph(position, st["position"]),
        Spacer(1, 3 * mm),
    ]

    image_path = find_card_image(card)

    if image_path:
        image = Image(str(image_path))
        image._restrictSize(card_width - 10 * mm, image_height)
        elements.append(image)
    else:
        elements.append(Spacer(1, image_height))

    elements.extend([
        Spacer(1, 3 * mm),
        Paragraph(safe(card.get("card", "Unknown Card")), st["card_name"]),
        Spacer(1, 1.5 * mm),
        Paragraph(
            f"— {safe(card.get('orientation', 'Upright'))} —",
            st["orientation"],
        ),
    ])

    table = ArcanaTable([[elements]], colWidths=[card_width], accent_color=VIOLET)
    table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), CARD_BG),
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ("LEFTPADDING", (0, 0), (-1, -1), 4 * mm),
            ("RIGHTPADDING", (0, 0), (-1, -1), 4 * mm),
            ("TOPPADDING", (0, 0), (-1, -1), 4 * mm),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4 * mm),
        ])
    )
    return table


def generate_tarot_pdf(
    question,
    spread,
    interpretation,
    palm_image_path=None,
):
    if not question:
        raise ValueError("A question is required.")

    if len(spread) != 3:
        raise ValueError("Exactly three Tarot cards are required.")

    st = styles()

    palm_path = Path(palm_image_path) if palm_image_path else PALM_IMAGE_PATH
    if not palm_path.exists():
        palm_path = None

    filename = re.sub(r"[^a-zA-Z0-9_-]", "_", question.strip())[:45]
    output_path = REPORTS_DIR / f"arcana_tarot_{filename}.pdf"

    doc = SimpleDocTemplate(
        str(output_path),
        pagesize=A4,
        leftMargin=15 * mm,
        rightMargin=15 * mm,
        topMargin=19 * mm,
        bottomMargin=14 * mm,
        title="ARCANA AI Tarot Reading",
        author="ARCANA AI",
    )

    page_width, _ = A4
    width = page_width - doc.leftMargin - doc.rightMargin
    story = []

    parsed = parse_interpretation(interpretation)
    positions = ["PAST", "PRESENT", "FUTURE"]

    # ========================================================
    # PAGE 1 — COVER / OVERVIEW
    # ========================================================

    story += [
        Spacer(1, 9 * mm),
        Paragraph("A R C A N A   A I", st["brand"]),
        Spacer(1, 4 * mm),
        Paragraph("Your Tarot<br/>Reading", st["hero"]),
        Spacer(1, 2 * mm),
        Paragraph(
            "A PERSONAL REFLECTION ACROSS<br/>PAST · PRESENT · FUTURE",
            st["hero_small"],
        ),
        Spacer(1, 7 * mm),
        Paragraph(
            "Three cards. One question.<br/>A moment to look at your story from another angle.",
            st["manifesto"],
        ),
        Spacer(1, 8 * mm),
    ]

    question_box = [
        Paragraph("01  ·  YOUR QUESTION", st["question_label"]),
        Spacer(1, 3 * mm),
        Paragraph(f"“{safe(question)}”", st["question"]),
    ]

    story += [
        panel(question_box, width, CARD_BG_2, accent_color=GOLD),
        Spacer(1, 7 * mm),
    ]

    palm_elements = [Paragraph("YOUR PALM  ·  VISUAL", st["label"])]

    if palm_path:
        palm_img = Image(str(palm_path))
        palm_img._restrictSize(67 * mm, 82 * mm)
        palm_elements += [
            Spacer(1, 3 * mm),
            palm_img,
            Spacer(1, 2 * mm),
            Paragraph("Captured from your palm analysis", st["body_muted"]),
        ]
    else:
        palm_elements += [
            Spacer(1, 5 * mm),
            Paragraph("Palm image unavailable.", st["body_muted"]),
        ]

    palm_table = ArcanaTable(
        [[palm_elements]],
        colWidths=[74 * mm],
        radius=12,
        accent_color=GOLD,
    )
    palm_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), CARD_BG),
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ("LEFTPADDING", (0, 0), (-1, -1), 5 * mm),
            ("RIGHTPADDING", (0, 0), (-1, -1), 5 * mm),
            ("TOPPADDING", (0, 0), (-1, -1), 5 * mm),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5 * mm),
        ])
    )

    overview = [
        Paragraph("YOUR READING AT A GLANCE", st["label"]),
        Spacer(1, 4 * mm),
        Paragraph(
            "Three cards have been drawn to explore the story surrounding your question.",
            st["body"],
        ),
        Spacer(1, 5 * mm),
    ]

    for i, card in enumerate(spread):
        overview.append(
            Paragraph(
                f"<b>{positions[i]}</b>  {safe(card.get('card', 'Unknown'))}",
                st["body"],
            )
        )
        overview.append(
            Paragraph(
                safe(card.get("orientation", "Upright")),
                st["orientation"],
            )
        )
        if i < 2:
            overview.append(Spacer(1, 3 * mm))

    overview_table = ArcanaTable(
        [[overview]],
        colWidths=[width - 78 * mm],
        accent_color=VIOLET,
    )
    overview_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), CARD_BG_2),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (-1, -1), 7 * mm),
            ("RIGHTPADDING", (0, 0), (-1, -1), 7 * mm),
            ("TOPPADDING", (0, 0), (-1, -1), 7 * mm),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 7 * mm),
        ])
    )

    top_row = Table(
        [[palm_table, overview_table]],
        colWidths=[78 * mm, width - 78 * mm],
    )
    top_row.setStyle(
        TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (0, 0), (-1, -1), 2 * mm),
        ])
    )

    story += [
        top_row,
        Spacer(1, 6 * mm),
        Paragraph(
            "The cards are presented as reflective symbols, not fixed predictions.",
            st["body_muted"],
        ),
        PageBreak(),
    ]

    # ========================================================
    # PAGE 2 — CARDS
    # ========================================================

    story += [
        Paragraph("01 · THE THREE CARDS", st["section_number"]),
        Paragraph("Past · Present · Future", st["section_title"]),
        Paragraph(
            "The spread creates a visual timeline around your question.",
            st["section_subtitle"],
        ),
        Spacer(1, 6 * mm),
    ]

    card_width = (width - 10 * mm) / 3
    cards = [
        create_card(
            spread[i],
            positions[i],
            card_width,
            82 * mm,
            st,
        )
        for i in range(3)
    ]

    card_row = Table(
        [cards],
        colWidths=[card_width] * 3,
    )
    card_row.setStyle(
        TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (-1, -1), 1.5 * mm),
            ("RIGHTPADDING", (0, 0), (-1, -1), 1.5 * mm),
        ])
    )

    story += [card_row, Spacer(1, 8 * mm), Paragraph("CARD THEMES  ·  DATASET MEANINGS", st["label"])]

    meaning_rows = []

    for i, card in enumerate(spread):
        meaning_rows.append([
            Paragraph(f"0{i + 1}", st["guidance_number"]),
            [
                Paragraph(
                    f"{positions[i]}  •  {safe(card.get('card', ''))}",
                    st["label"],
                ),
                Spacer(1, 1.5 * mm),
                Paragraph(safe(card.get("meaning", "")), st["body"]),
            ],
        ])

    meanings_table = ArcanaTable(
        meaning_rows,
        colWidths=[17 * mm, width - 17 * mm],
        accent_color=GOLD,
    )
    meanings_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), CARD_BG),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("ALIGN", (0, 0), (0, -1), "CENTER"),
            ("LEFTPADDING", (0, 0), (-1, -1), 5),
            ("RIGHTPADDING", (0, 0), (-1, -1), 5),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ("LINEBELOW", (0, 0), (-1, -2), 0.4, BORDER),
        ])
    )

    story += [
        meanings_table,
        Spacer(1, 6 * mm),
        Paragraph(
            "The meaning of each card is considered together with its position and orientation.",
            st["body_muted"],
        ),
        PageBreak(),
    ]

    # ========================================================
    # PAGE 3 — INTERPRETATION
    # ========================================================

    story += [
        Paragraph("02  ·  YOUR READING", st["section_number"]),
        Paragraph("The story behind the cards", st["section_title"]),
    ]

    story += [
        panel(
            [
                Paragraph("OVERALL INSIGHT", st["label"]),
                Spacer(1, 1.5 * mm),
                Paragraph(
                    safe(parsed["overall"] or "Your overall interpretation is ready."),
                    st["insight"],
                ),
            ],
            width,
            CARD_BG_2,
            accent_color=VIOLET,
        ),
        Spacer(1, 4.5 * mm),
    ]

    synthesis_text = parsed["synthesis"] or parsed["palm"] or (
        "Your combined palm and Tarot interpretation will appear here "
        "when palm analysis is part of this reading."
    )

    synthesis_body = ParagraphStyle(
        "synthesis_body",
        parent=st["insight"],
        fontSize=8.35,
        leading=12.8,
        alignment=TA_CENTER,
        textColor=WHITE,
    )

    synthesis_eyebrow = ParagraphStyle(
        "synthesis_eyebrow",
        parent=st["label"],
        fontSize=6.2,
        leading=7.5,
        alignment=TA_CENTER,
        textColor=GOLD_BRIGHT,
    )

    synthesis_card = ArcanaTable(
        [[[
            Paragraph("✦", st["brand"]),
            Spacer(1, 1.5 * mm),
            Paragraph("ARCANA SYNTHESIS", st["label"]),
            Spacer(1, 1.5 * mm),
            Paragraph("WHERE THE SIGNALS MEET", synthesis_eyebrow),
            Spacer(1, 1.5 * mm),
            Paragraph(safe(synthesis_text), synthesis_body),
        ]]],
        colWidths=[width],
        radius=12,
        accent_color=GOLD,
    )

    synthesis_card.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), CARD_BG_2),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("LEFTPADDING", (0, 0), (-1, -1), 9 * mm),
        ("RIGHTPADDING", (0, 0), (-1, -1), 9 * mm),
        ("TOPPADDING", (0, 0), (-1, -1), 5 * mm),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5 * mm),
    ]))

    story += [
        synthesis_card,
        Spacer(1, 4.5 * mm),
        panel(
            [
                Paragraph("TAROT INSIGHT", st["label"]),
                Spacer(1, 1.5 * mm),
                Paragraph(
                    safe(parsed["tarot"] or "Your Tarot interpretation is ready."),
                    st["insight"],
                ),
            ],
            width,
            CARD_BG,
            accent_color=GOLD,
        ),
        Spacer(1, 4.5 * mm),
        panel(
            [
                Paragraph("WHAT THIS MEANS FOR YOU", st["label"]),
                Spacer(1, 1.5 * mm),
                Paragraph(
                    safe(
                        parsed["meaning"]
                        or "Reflect on the relationship between the cards and your question."
                    ),
                    st["insight"],
                ),
            ],
            width,
            CARD_BG_2,
            accent_color=VIOLET,
        ),
        PageBreak(),
    ]

    # ========================================================
    # PAGE 4 — GUIDANCE / CLOSING
    # ========================================================

    story += [
        Spacer(1, 8 * mm),
        Paragraph("03  ·  KEY GUIDANCE", st["section_number"]),
        Paragraph("Three things to carry forward", st["section_title"]),
        Paragraph(
            "Practical reflections drawn from the themes of your reading.",
            st["section_subtitle"],
        ),
        Spacer(1, 7 * mm),
    ]

    guidance = get_guidance(parsed["guidance"])

    if len(guidance) < 3:
        guidance = [
            "Reflect on the message of the three cards.",
            "Focus on the choices that remain within your control.",
            "Use the reading as a prompt for thoughtful action.",
        ]

    guidance_rows = []

    for i, item in enumerate(guidance):
        guidance_rows.append([
            Paragraph(f"0{i + 1}", st["guidance_number"]),
            [
                Paragraph(f"GUIDANCE 0{i + 1}", st["label"]),
                Spacer(1, 1.5 * mm),
                Paragraph(safe(item), st["guidance"]),
            ],
        ])

    guidance_table = ArcanaTable(
        guidance_rows,
        colWidths=[18 * mm, width - 18 * mm],
        accent_color=VIOLET,
    )
    guidance_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), CARD_BG),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("ALIGN", (0, 0), (0, -1), "CENTER"),
            ("LEFTPADDING", (0, 0), (-1, -1), 7),
            ("RIGHTPADDING", (0, 0), (-1, -1), 7),
            ("TOPPADDING", (0, 0), (-1, -1), 9),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 9),
            ("LINEBELOW", (0, 0), (-1, -2), 0.4, BORDER),
        ])
    )

    story += [
        guidance_table,
        Spacer(1, 15 * mm),
    ]

    # Large final reflection card
    final_card = ArcanaTable(
        [[
            [
                Paragraph("✦", st["brand"]),
                Spacer(1, 4 * mm),
                Paragraph(
                    "A READING IS A MIRROR — NOT A MAP.",
                    st["label"],
                ),
                Spacer(1, 4 * mm),
                Paragraph(
                    "Take what resonates. Question what does not. "
                    "Let the reading become a starting point for your own reflection.",
                    st["final_quote"],
                ),
            ]
        ]],
        colWidths=[width],
        accent_color=GOLD,
    )

    final_card.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), CARD_BG_2),
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ("LEFTPADDING", (0, 0), (-1, -1), 12 * mm),
            ("RIGHTPADDING", (0, 0), (-1, -1), 12 * mm),
            ("TOPPADDING", (0, 0), (-1, -1), 12 * mm),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 12 * mm),
        ])
    )

    story += [
        final_card,
        Spacer(1, 14 * mm),
    ]

    # --------------------------------------------------------
    # PAGE 5 — CLOSING CONSTELLATION
    # --------------------------------------------------------

    story += [
        PageBreak(),
        Spacer(1, 9 * mm),
        Paragraph("A R C A N A   A I", st["brand"]),
        Spacer(1, 7 * mm),
    ]

    # Large central closing emblem.
    closing_emblem = ArcanaTable(
        [[
            [
                Spacer(1, 4 * mm),
                Paragraph("✦", st["brand"]),
                Spacer(1, 3 * mm),
                Paragraph(
                    "REFLECT",
                    ParagraphStyle(
                        "closing_word",
                        fontName=SERIF_BOLD,
                        fontSize=27,
                        leading=31,
                        textColor=WHITE,
                        alignment=TA_CENTER,
                    ),
                ),
                Spacer(1, 2 * mm),
                Paragraph(
                    "Explore what the reading stirred in you.",
                    st["hero_small"],
                ),
                Spacer(1, 4 * mm),
            ]
        ]],
        colWidths=[width * 0.68],
        accent_color=VIOLET,
    )
    closing_emblem.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), CARD_BG_2),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("LEFTPADDING", (0, 0), (-1, -1), 15 * mm),
        ("RIGHTPADDING", (0, 0), (-1, -1), 15 * mm),
        ("TOPPADDING", (0, 0), (-1, -1), 8 * mm),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8 * mm),
    ]))

    # Center the emblem using a one-cell layout without a conventional box.
    emblem_wrap = Table([[closing_emblem]], colWidths=[width])
    emblem_wrap.setStyle(TableStyle([
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
    ]))
    story += [emblem_wrap, Spacer(1, 10 * mm)]

    story += [
        Paragraph(
            "Thank you for spending a moment with ARCANA AI.",
            st["final_title"],
        ),
        Spacer(1, 3 * mm),
        Paragraph(
            "Your question started the journey. The cards offered a perspective. "
            "What you do with that perspective is yours.",
            st["hero_small"],
        ),
        Spacer(1, 10 * mm),
    ]

    # Three floating-style reflection cards.
    closing_items = [
        ("01", "REFLECT", "What part of the reading felt most meaningful to you?"),
        ("02", "EXPLORE", "What is one small step worth taking from here?"),
        ("03", "DISCOVER", "When you revisit this question, what has changed?"),
    ]

    closing_cells = []
    for number, title, text in closing_items:
        cell = [
            Paragraph(number, st["guidance_number"]),
            Spacer(1, 2 * mm),
            Paragraph(title, st["label"]),
            Spacer(1, 2 * mm),
            Paragraph(text, st["guidance"]),
        ]
        closing_cells.append(cell)

    closing_grid = ArcanaTable(
        [closing_cells],
        colWidths=[width / 3 - 2 * mm] * 3,
        radius=12,
        accent=False,
    )
    closing_grid.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), CARD_BG),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("LEFTPADDING", (0, 0), (-1, -1), 5 * mm),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5 * mm),
        ("TOPPADDING", (0, 0), (-1, -1), 6 * mm),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6 * mm),
    ]))

    story += [
        closing_grid,
        Spacer(1, 11 * mm),
    ]

    # Final statement: visually stronger than a disclaimer block.
    final_statement = ArcanaTable(
        [[
            [
                Paragraph("A READING IS A MIRROR — NOT A MAP.", st["label"]),
                Spacer(1, 3 * mm),
                Paragraph(
                    "Take what resonates. Question what does not. "
                    "Let the reading become a starting point for your own reflection.",
                    st["final_quote"],
                ),
                Spacer(1, 3 * mm),
                Paragraph(
                    "REFLECT  ·  EXPLORE  ·  DISCOVER",
                    st["hero_small"],
                ),
            ]
        ]],
        colWidths=[width],
        radius=12,
        accent_color=VIOLET,
    )
    final_statement.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), CARD_BG_2),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("LEFTPADDING", (0, 0), (-1, -1), 13 * mm),
        ("RIGHTPADDING", (0, 0), (-1, -1), 13 * mm),
        ("TOPPADDING", (0, 0), (-1, -1), 8 * mm),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8 * mm),
    ]))

    story += [
        final_statement,
        Spacer(1, 8 * mm),
        Paragraph(
            "Tarot is presented by ARCANA AI as a reflective experience "
            "for personal reflection and entertainment — not as a guaranteed "
            "prediction of the future.",
            st["body_muted"],
        ),
    ]

    doc.build(
        story,
        onFirstPage=draw_background,
        onLaterPages=draw_background,
    )

    return output_path