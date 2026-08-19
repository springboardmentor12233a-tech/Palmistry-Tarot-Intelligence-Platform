import os
import re

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import (
    getSampleStyleSheet,
    ParagraphStyle,
)
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    KeepTogether,
    PageBreak,
)


# ============================================================
# FONT SETUP
# ============================================================

def register_fonts():

    fonts = {}

    font_files = {
        "Georgia": r"C:\Windows\Fonts\georgia.ttf",
        "Georgia-Bold": r"C:\Windows\Fonts\georgiab.ttf",
        "Georgia-Italic": r"C:\Windows\Fonts\georgiai.ttf",
        "Georgia-BoldItalic": r"C:\Windows\Fonts\georgiaz.ttf",
    }

    for name, path in font_files.items():

        if os.path.exists(path):

            try:
                pdfmetrics.registerFont(
                    TTFont(name, path)
                )

                fonts[name] = name

            except Exception:
                pass

    # Safe fallbacks
    fonts.setdefault(
        "Georgia",
        "Times-Roman"
    )

    fonts.setdefault(
        "Georgia-Bold",
        "Times-Bold"
    )

    fonts.setdefault(
        "Georgia-Italic",
        "Times-Italic"
    )

    fonts.setdefault(
        "Georgia-BoldItalic",
        "Times-BoldItalic"
    )

    return fonts


FONTS = register_fonts()


# ============================================================
# COLORS
# ============================================================

PARCHMENT = colors.HexColor("#F4E9D2")

CREAM = colors.HexColor("#FFFDF7")

DARK_BROWN = colors.HexColor("#38271E")

BROWN = colors.HexColor("#695040")

TEXT = colors.HexColor("#33261F")

GOLD = colors.HexColor("#A77B3D")

LIGHT_GOLD = colors.HexColor("#D6BE91")

PALM_LINE = colors.HexColor("#C8B184")

SOFT_GOLD = colors.HexColor("#E3D3AE")

AI_BACKGROUND = colors.HexColor("#EFE1C4")


# ============================================================
# PAGE DIMENSIONS
# ============================================================

PAGE_WIDTH, PAGE_HEIGHT = A4

CONTENT_WIDTH = 160 * mm


# ============================================================
# BACKGROUND
# ============================================================

def draw_background(canvas_obj, doc):

    canvas_obj.saveState()

    width = PAGE_WIDTH
    height = PAGE_HEIGHT

    # --------------------------------------------------------
    # Main parchment background
    # --------------------------------------------------------

    canvas_obj.setFillColor(PARCHMENT)

    canvas_obj.rect(
        0,
        0,
        width,
        height,
        fill=1,
        stroke=0
    )

    # --------------------------------------------------------
    # Inner paper area
    # --------------------------------------------------------

    canvas_obj.setFillColor(
        colors.Color(
            1,
            1,
            1,
            alpha=0.12
        )
    )

    canvas_obj.roundRect(
        14 * mm,
        14 * mm,
        width - 28 * mm,
        height - 28 * mm,
        5 * mm,
        fill=1,
        stroke=0
    )

    # --------------------------------------------------------
    # Main border
    # --------------------------------------------------------

    canvas_obj.setStrokeColor(
        LIGHT_GOLD
    )

    canvas_obj.setLineWidth(1)

    canvas_obj.roundRect(
        12 * mm,
        12 * mm,
        width - 24 * mm,
        height - 24 * mm,
        5 * mm,
        fill=0,
        stroke=1
    )

    # --------------------------------------------------------
    # Inner border
    # --------------------------------------------------------

    canvas_obj.setStrokeColor(
        colors.HexColor("#E4D3AE")
    )

    canvas_obj.setLineWidth(0.4)

    canvas_obj.roundRect(
        15 * mm,
        15 * mm,
        width - 30 * mm,
        height - 30 * mm,
        4 * mm,
        fill=0,
        stroke=1
    )

    # ========================================================
    # DECORATIVE PALM-LIKE CURVES
    # ========================================================

    canvas_obj.setStrokeColor(
        PALM_LINE
    )

    canvas_obj.setLineWidth(0.7)

    # Upper right curve

    path = canvas_obj.beginPath()

    path.moveTo(
        width - 72 * mm,
        height - 18 * mm
    )

    path.curveTo(
        width - 35 * mm,
        height - 40 * mm,
        width - 32 * mm,
        height - 85 * mm,
        width - 58 * mm,
        height - 120 * mm
    )

    path.curveTo(
        width - 72 * mm,
        height - 140 * mm,
        width - 75 * mm,
        height - 160 * mm,
        width - 58 * mm,
        height - 185 * mm
    )

    canvas_obj.drawPath(
        path,
        stroke=1,
        fill=0
    )

    # Second curve

    path = canvas_obj.beginPath()

    path.moveTo(
        width - 82 * mm,
        height - 22 * mm
    )

    path.curveTo(
        width - 50 * mm,
        height - 65 * mm,
        width - 45 * mm,
        height - 100 * mm,
        width - 68 * mm,
        height - 145 * mm
    )

    path.curveTo(
        width - 80 * mm,
        height - 168 * mm,
        width - 82 * mm,
        height - 190 * mm,
        width - 68 * mm,
        height - 215 * mm
    )

    canvas_obj.drawPath(
        path,
        stroke=1,
        fill=0
    )

    # Third curve

    path = canvas_obj.beginPath()

    path.moveTo(
        width - 95 * mm,
        height - 28 * mm
    )

    path.curveTo(
        width - 72 * mm,
        height - 70 * mm,
        width - 70 * mm,
        height - 110 * mm,
        width - 88 * mm,
        height - 145 * mm
    )

    canvas_obj.drawPath(
        path,
        stroke=1,
        fill=0
    )

    # ========================================================
    # LOWER LEFT DECORATION
    # ========================================================

    path = canvas_obj.beginPath()

    path.moveTo(
        18 * mm,
        55 * mm
    )

    path.curveTo(
        45 * mm,
        80 * mm,
        62 * mm,
        105 * mm,
        52 * mm,
        138 * mm
    )

    path.curveTo(
        46 * mm,
        158 * mm,
        50 * mm,
        175 * mm,
        70 * mm,
        194 * mm
    )

    canvas_obj.drawPath(
        path,
        stroke=1,
        fill=0
    )

    path = canvas_obj.beginPath()

    path.moveTo(
        20 * mm,
        70 * mm
    )

    path.curveTo(
        50 * mm,
        92 * mm,
        65 * mm,
        125 * mm,
        58 * mm,
        160 * mm
    )

    canvas_obj.drawPath(
        path,
        stroke=1,
        fill=0
    )

    # ========================================================
    # MOON
    # ========================================================

    canvas_obj.setStrokeColor(
        LIGHT_GOLD
    )

    canvas_obj.setLineWidth(0.8)

    moon_x = 27 * mm
    moon_y = height - 32 * mm

    canvas_obj.circle(
        moon_x,
        moon_y,
        5 * mm,
        fill=0,
        stroke=1
    )

    canvas_obj.circle(
        moon_x + 2 * mm,
        moon_y + 1 * mm,
        4 * mm,
        fill=0,
        stroke=1
    )

    # ========================================================
    # STARS
    # ========================================================

    stars = [
        (40 * mm, height - 25 * mm),
        (52 * mm, height - 38 * mm),
        (30 * mm, height - 50 * mm),
        (width - 30 * mm, 45 * mm),
        (width - 45 * mm, 30 * mm),
    ]

    canvas_obj.setStrokeColor(
        SOFT_GOLD
    )

    for x, y in stars:

        canvas_obj.line(
            x - 1.5 * mm,
            y,
            x + 1.5 * mm,
            y
        )

        canvas_obj.line(
            x,
            y - 1.5 * mm,
            x,
            y + 1.5 * mm
        )

    # ========================================================
    # FOOTER
    # ========================================================

    canvas_obj.setFont(
        FONTS["Georgia"],
        7
    )

    canvas_obj.setFillColor(
        BROWN
    )

    canvas_obj.drawCentredString(
        width / 2,
        7 * mm,
        "Palmistry & Tarot Intelligence • Reflective Guidance"
    )

    canvas_obj.restoreState()


# ============================================================
# STYLES
# ============================================================

def create_styles():

    styles = getSampleStyleSheet()

    # --------------------------------------------------------
    # Main title
    # --------------------------------------------------------

    styles.add(
        ParagraphStyle(
            name="ReportTitle",
            fontName=FONTS["Georgia-Bold"],
            fontSize=22,
            leading=27,
            alignment=TA_CENTER,
            textColor=DARK_BROWN,
            spaceAfter=4 * mm
        )
    )

    # --------------------------------------------------------
    # Subtitle
    # --------------------------------------------------------

    styles.add(
        ParagraphStyle(
            name="Subtitle",
            fontName=FONTS["Georgia-Italic"],
            fontSize=10,
            leading=14,
            alignment=TA_CENTER,
            textColor=BROWN,
            spaceAfter=7 * mm
        )
    )

    # --------------------------------------------------------
    # Main sections
    # --------------------------------------------------------

    styles.add(
        ParagraphStyle(
            name="Section",
            fontName=FONTS["Georgia-Bold"],
            fontSize=15,
            leading=20,
            textColor=DARK_BROWN,
            spaceBefore=5 * mm,
            spaceAfter=4 * mm
        )
    )

    # --------------------------------------------------------
    # Subsections
    # --------------------------------------------------------

    styles.add(
        ParagraphStyle(
            name="Subsection",
            fontName=FONTS["Georgia-Bold"],
            fontSize=12,
            leading=16,
            textColor=BROWN,
            spaceAfter=2 * mm
        )
    )

    # --------------------------------------------------------
    # Normal body
    # --------------------------------------------------------

    styles.add(
        ParagraphStyle(
            name="Body",
            fontName=FONTS["Georgia"],
            fontSize=9.5,
            leading=14.5,
            textColor=TEXT,
            spaceAfter=3 * mm
        )
    )

    # --------------------------------------------------------
    # AI normal text
    #
    # IMPORTANT:
    # This is NOT placed inside a Table.
    # Therefore it can split across pages.
    # --------------------------------------------------------

    styles.add(
        ParagraphStyle(
            name="AI",
            fontName=FONTS["Georgia"],
            fontSize=9.3,
            leading=14.5,
            textColor=TEXT,
            backColor=AI_BACKGROUND,
            borderColor=GOLD,
            borderWidth=0.6,
            borderPadding=5,
            spaceAfter=3 * mm,
            allowWidows=1,
            allowOrphans=1
        )
    )

    # --------------------------------------------------------
    # AI H1 / H2
    # --------------------------------------------------------

    styles.add(
        ParagraphStyle(
            name="AIHeading1",
            fontName=FONTS["Georgia-Bold"],
            fontSize=14,
            leading=18,
            textColor=DARK_BROWN,
            spaceBefore=4 * mm,
            spaceAfter=3 * mm
        )
    )

    styles.add(
        ParagraphStyle(
            name="AIHeading2",
            fontName=FONTS["Georgia-Bold"],
            fontSize=11.5,
            leading=15,
            textColor=BROWN,
            spaceBefore=3 * mm,
            spaceAfter=2 * mm
        )
    )

    # --------------------------------------------------------
    # AI bullets
    # --------------------------------------------------------

    styles.add(
        ParagraphStyle(
            name="AIBullet",
            fontName=FONTS["Georgia"],
            fontSize=9.2,
            leading=14,
            leftIndent=6 * mm,
            firstLineIndent=-4 * mm,
            textColor=TEXT,
            backColor=AI_BACKGROUND,
            borderColor=GOLD,
            borderWidth=0.4,
            borderPadding=4,
            spaceAfter=2 * mm
        )
    )

    # --------------------------------------------------------
    # Small text
    # --------------------------------------------------------

    styles.add(
        ParagraphStyle(
            name="Small",
            fontName=FONTS["Georgia"],
            fontSize=8,
            leading=12,
            textColor=BROWN
        )
    )

    return styles


# ============================================================
# SAFE TEXT
# ============================================================

def safe_text(value):

    if value is None:
        return ""

    text = str(value)

    # Remove unsupported control characters
    text = re.sub(
        r"[\x00-\x08\x0B\x0C\x0E-\x1F]",
        "",
        text
    )

    # Replace some common Unicode symbols that may
    # not exist in Georgia/Times fonts.
    replacements = {
        "🔮": "",
        "🎯": "",
        "✨": "",
        "🌙": "",
        "⭐": "",
        "🌟": "",
        "🃏": "",
        "❤️": "Heart",
        "♥️": "Heart",
        "→": "->",
        "—": "-",
        "–": "-",
        "…": "...",
        "•": "-",
        "“": '"',
        "”": '"',
        "‘": "'",
        "’": "'",
    }

    for old, new in replacements.items():
        text = text.replace(old, new)

    # Escape XML / HTML
    text = (
        text
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
    )

    return text


# ============================================================
# MARKUP TEXT
# ============================================================

def markup_text(value):

    if value is None:
        return ""

    return safe_text(value)


# ============================================================
# MARKDOWN INLINE CONVERSION
# ============================================================

def markdown_inline(text):

    text = safe_text(text)

    # Bold first
    text = re.sub(
        r"\*\*(.+?)\*\*",
        r"<b>\1</b>",
        text
    )

    # Underscore bold
    text = re.sub(
        r"__(.+?)__",
        r"<b>\1</b>",
        text
    )

    # Italic
    text = re.sub(
        r"(?<!\*)\*([^*]+?)\*(?!\*)",
        r"<i>\1</i>",
        text
    )

    # Inline code
    text = re.sub(
        r"`([^`]+)`",
        r"\1",
        text
    )

    return text


# ============================================================
# AI MARKDOWN -> REPORTLAB FLOWABLES
# ============================================================

def ai_reading_flowables(
    ai_reading,
    styles
):

    flowables = []

    if ai_reading is None:
        return flowables

    text = str(ai_reading).strip()

    if not text:
        return flowables

    # Normalize line endings
    text = text.replace(
        "\r\n",
        "\n"
    )

    text = text.replace(
        "\r",
        "\n"
    )

    lines = text.split("\n")

    paragraph_buffer = []

    def flush_paragraph():

        nonlocal paragraph_buffer

        if not paragraph_buffer:
            return

        paragraph_text = " ".join(
            line.strip()
            for line in paragraph_buffer
            if line.strip()
        )

        paragraph_buffer = []

        if not paragraph_text:
            return

        formatted = markdown_inline(
            paragraph_text
        )

        flowables.append(
            Paragraph(
                formatted,
                styles["AI"]
            )
        )

    for raw_line in lines:

        line = raw_line.strip()

        # ----------------------------------------------------
        # Empty line
        # ----------------------------------------------------

        if not line:

            flush_paragraph()

            flowables.append(
                Spacer(
                    1,
                    1.5 * mm
                )
            )

            continue

        # ----------------------------------------------------
        # H1
        # ----------------------------------------------------

        if line.startswith("# ") and not line.startswith("## "):

            flush_paragraph()

            heading = line[2:].strip()

            flowables.append(
                Paragraph(
                    markdown_inline(heading),
                    styles["AIHeading1"]
                )
            )

            continue

        # ----------------------------------------------------
        # H2
        # ----------------------------------------------------

        if line.startswith("## "):

            flush_paragraph()

            heading = line[3:].strip()

            flowables.append(
                Paragraph(
                    markdown_inline(heading),
                    styles["AIHeading1"]
                )
            )

            continue

        # ----------------------------------------------------
        # H3
        # ----------------------------------------------------

        if line.startswith("### "):

            flush_paragraph()

            heading = line[4:].strip()

            flowables.append(
                Paragraph(
                    markdown_inline(heading),
                    styles["AIHeading2"]
                )
            )

            continue

        # ----------------------------------------------------
        # Bullet
        # ----------------------------------------------------

        if (
            line.startswith("- ")
            or line.startswith("* ")
            or line.startswith("• ")
        ):

            flush_paragraph()

            bullet_text = line[2:].strip()

            formatted = markdown_inline(
                bullet_text
            )

            flowables.append(
                Paragraph(
                    "• " + formatted,
                    styles["AIBullet"]
                )
            )

            continue

        # ----------------------------------------------------
        # Numbered list
        # ----------------------------------------------------

        number_match = re.match(
            r"^(\d+)[.)]\s+(.*)",
            line
        )

        if number_match:

            flush_paragraph()

            number = number_match.group(1)

            item_text = number_match.group(2)

            formatted = markdown_inline(
                item_text
            )

            flowables.append(
                Paragraph(
                    f"{number}. {formatted}",
                    styles["AIBullet"]
                )
            )

            continue

        # ----------------------------------------------------
        # Horizontal line
        # ----------------------------------------------------

        if line in (
            "---",
            "***",
            "___"
        ):

            flush_paragraph()

            flowables.append(
                Spacer(
                    1,
                    2 * mm
                )
            )

            continue

        # ----------------------------------------------------
        # Normal paragraph
        # ----------------------------------------------------

        paragraph_buffer.append(
            line
        )

    # Final paragraph
    flush_paragraph()

    return flowables


# ============================================================
# SECTION BOX
# ============================================================

def section_box(
    title,
    content,
    styles,
    content_is_markup=False
):

    if content_is_markup:

        formatted_content = content

    else:

        # Convert newlines to line breaks
        formatted_content = safe_text(
            content
        ).replace(
            "\n",
            "<br/>"
        )

    data = [
        [
            Paragraph(
                safe_text(title),
                styles["Subsection"]
            )
        ],
        [
            Paragraph(
                formatted_content,
                styles["Body"]
            )
        ]
    ]

    table = Table(
        data,
        colWidths=[
            CONTENT_WIDTH
        ],
        splitByRow=1
    )

    table.setStyle(
        TableStyle(
            [
                (
                    "BACKGROUND",
                    (0, 0),
                    (-1, -1),
                    CREAM
                ),

                (
                    "BOX",
                    (0, 0),
                    (-1, -1),
                    0.8,
                    LIGHT_GOLD
                ),

                (
                    "LINEBELOW",
                    (0, 0),
                    (-1, 0),
                    0.4,
                    SOFT_GOLD
                ),

                (
                    "LEFTPADDING",
                    (0, 0),
                    (-1, -1),
                    6 * mm
                ),

                (
                    "RIGHTPADDING",
                    (0, 0),
                    (-1, -1),
                    6 * mm
                ),

                (
                    "TOPPADDING",
                    (0, 0),
                    (-1, -1),
                    4 * mm
                ),

                (
                    "BOTTOMPADDING",
                    (0, 0),
                    (-1, -1),
                    4 * mm
                ),
            ]
        )
    )

    return table


# ============================================================
# AI SECTION
#
# IMPORTANT FIX:
#
# DO NOT PUT THE WHOLE AI RESPONSE INTO A TABLE.
#
# Each Paragraph is independently splittable across pages.
# ============================================================

def ai_box(
    title,
    ai_reading,
    styles
):

    story = []

    if not ai_reading:
        return story

    # Section heading
    story.append(
        Paragraph(
            safe_text(title),
            styles["Section"]
        )
    )

    # Small intro line
    story.append(
        Paragraph(
            "AI-generated reflective interpretation:",
            styles["Small"]
        )
    )

    story.append(
        Spacer(
            1,
            2 * mm
        )
    )

    # --------------------------------------------------------
    # CRITICAL FIX
    #
    # No Table around AI content.
    # --------------------------------------------------------

    ai_flowables = ai_reading_flowables(
        ai_reading,
        styles
    )

    story.extend(
        ai_flowables
    )

    return story


# ============================================================
# DISCLAIMER
# ============================================================

def add_disclaimer(
    story,
    text,
    styles
):

    story.append(
        Spacer(
            1,
            3 * mm
        )
    )

    story.append(
        Paragraph(
            "DISCLAIMER",
            styles["Section"]
        )
    )

    story.append(
        Paragraph(
            safe_text(text),
            styles["Small"]
        )
    )


# ============================================================
# CREATE DOCUMENT
# ============================================================

def create_document(
    output_path
):

    output_path = str(
        output_path
    )

    parent = os.path.dirname(
        os.path.abspath(output_path)
    )

    if parent:
        os.makedirs(
            parent,
            exist_ok=True
        )

    return SimpleDocTemplate(
        output_path,
        pagesize=A4,
        rightMargin=22 * mm,
        leftMargin=22 * mm,
        topMargin=25 * mm,
        bottomMargin=18 * mm,
        title="Palmistry & Tarot Reading",
        author="Palmistry & Tarot Intelligence Platform",
        subject="Reflective Palmistry and Tarot Reading"
    )


# ============================================================
# PALMISTRY PDF
# ============================================================

def create_palmistry_pdf(
    filename=None,
    contents=None,
    ai_reading=None,
    file_path=None
):

    # --------------------------------------------------------
    # Support BOTH:
    #
    # create_palmistry_pdf(filename=...)
    #
    # and:
    #
    # create_palmistry_pdf(file_path=...)
    # --------------------------------------------------------

    output_path = (
        filename
        if filename is not None
        else file_path
    )

    if output_path is None:

        raise ValueError(
            "PDF output path was not provided. "
            "Use filename= or file_path=."
        )

    if contents is None:
        contents = []

    styles = create_styles()

    doc = create_document(
        output_path
    )

    story = []

    # --------------------------------------------------------
    # TITLE
    # --------------------------------------------------------

    story.append(
        Paragraph(
            "PALMISTRY READING",
            styles["ReportTitle"]
        )
    )

    story.append(
        Paragraph(
            "Palmistry & Tarot Intelligence Platform",
            styles["Subtitle"]
        )
    )

    story.append(
        Paragraph(
            "A reflective interpretation of the major "
            "palm lines detected by the application.",
            styles["Body"]
        )
    )

    story.append(
        Spacer(
            1,
            4 * mm
        )
    )

    # --------------------------------------------------------
    # HEART LINE
    # --------------------------------------------------------

    if len(contents) >= 2:

        story.append(
            section_box(
                "HEART LINE",
                (
                    f"{contents[0]}\n\n"
                    f"Additional Interpretation:\n"
                    f"{contents[1]}"
                ),
                styles
            )
        )

        story.append(
            Spacer(
                1,
                2 * mm
            )
        )

    # --------------------------------------------------------
    # HEAD LINE
    # --------------------------------------------------------

    if len(contents) >= 4:

        story.append(
            section_box(
                "HEAD LINE",
                (
                    f"{contents[2]}\n\n"
                    f"Additional Interpretation:\n"
                    f"{contents[3]}"
                ),
                styles
            )
        )
        story.append(
            Spacer(
                1,
                2 * mm
            )
        )

    # --------------------------------------------------------
    # LIFE LINE
    # --------------------------------------------------------

    if len(contents) >= 6:

        story.append(
            section_box(
                "LIFE LINE",
                (
                    f"{contents[4]}\n\n"
                    f"Additional Interpretation:\n"
                    f"{contents[5]}"
                ),
                styles
            )
        )
        story.append(
            Spacer(
                1,
                2 * mm
            )
        )

    # --------------------------------------------------------
    # AI
    # --------------------------------------------------------

    if ai_reading:

        story.extend(
            ai_box(
                "AI PALM INTERPRETATION",
                ai_reading,
                styles
            )
        )

    # --------------------------------------------------------
    # DISCLAIMER
    # --------------------------------------------------------

    add_disclaimer(
        story,
        (
            "Palmistry interpretations are provided for "
            "reflection and entertainment purposes only. "
            "They are not scientific predictions, medical "
            "advice, or guaranteed statements about future events."
        ),
        styles
    )

    # --------------------------------------------------------
    # BUILD
    # --------------------------------------------------------

    doc.build(
        story,
        onFirstPage=draw_background,
        onLaterPages=draw_background
    )

    return output_path


# ============================================================
# TAROT CARD CONTENT
# ============================================================

def create_tarot_card_content(
    position,
    item
):

    if not isinstance(
        item,
        dict
    ):

        return (
            f"{position} — Tarot Card",
            "<b>No tarot card information available.</b>"
        )

    card = item.get(
        "card",
        {}
    )

    if not isinstance(
        card,
        dict
    ):
        card = {}

    orientation = item.get(
        "orientation",
        "upright"
    )

    card_name = markup_text(
        card.get(
            "name",
            "Unknown Card"
        )
    )

    arcana = markup_text(
        card.get(
            "arcana",
            ""
        )
    )

    suit = markup_text(
        card.get(
            "suit",
            ""
        )
    )

    orientation_safe = markup_text(
        orientation
    )

    content = (
        f"<b>Card:</b> {card_name}<br/>"
        f"<b>Arcana:</b> {arcana}<br/>"
        f"<b>Suit:</b> {suit}<br/>"
        f"<b>Orientation:</b> {orientation_safe}"
        f"<br/><br/>"
    )

    # --------------------------------------------------------
    # Keywords
    # --------------------------------------------------------

    keywords = card.get(
        "keywords",
        []
    )

    if keywords:

        if not isinstance(
            keywords,
            list
        ):
            keywords = [
                keywords
            ]

        keyword_text = ", ".join(
            markup_text(keyword)
            for keyword in keywords
        )

        content += (
            "<b>Keywords:</b> "
            + keyword_text
            + "<br/><br/>"
        )

    # --------------------------------------------------------
    # Meanings
    # --------------------------------------------------------

    meanings_data = card.get(
        "meanings",
        {}
    )

    meanings = []

    if isinstance(
        meanings_data,
        dict
    ):

        meanings = meanings_data.get(
            orientation,
            []
        )

        # Try lower case if exact orientation missing
        if not meanings:

            meanings = meanings_data.get(
                str(orientation).lower(),
                []
            )

    if meanings:

        if not isinstance(
            meanings,
            list
        ):
            meanings = [
                meanings
            ]

        content += (
            "<b>Interpretation:</b><br/>"
        )

        for meaning in meanings:

            content += (
                "• "
                + markup_text(meaning)
                + "<br/>"
            )

    return (
        f"{position} — {card_name}",
        content
    )


# ============================================================
# TAROT PDF
# ============================================================

def create_tarot_pdf(
    filename=None,
    question="",
    reading=None,
    ai_reading=None,
    file_path=None
):

    # --------------------------------------------------------
    # Support BOTH filename and file_path
    # --------------------------------------------------------

    output_path = (
        filename
        if filename is not None
        else file_path
    )

    if output_path is None:

        raise ValueError(
            "PDF output path was not provided. "
            "Use filename= or file_path=."
        )

    if reading is None:
        reading = []

    styles = create_styles()

    doc = create_document(
        output_path
    )

    story = []

    # ========================================================
    # TITLE
    # ========================================================

    story.append(
        Paragraph(
            "TAROT READING",
            styles["ReportTitle"]
        )
    )

    story.append(
        Paragraph(
            "Palmistry & Tarot Intelligence Platform",
            styles["Subtitle"]
        )
    )

    # ========================================================
    # QUESTION
    # ========================================================

    if question:

        story.append(
            Paragraph(
                "<b>Reading Question:</b><br/>"
                + safe_text(question),
                styles["Body"]
            )
        )

    # ========================================================
    # SPREAD
    # ========================================================

    story.append(
        Paragraph(
            "THREE CARD SPREAD — PAST / PRESENT / FUTURE",
            styles["Section"]
        )
    )

    positions = [
        "PAST",
        "PRESENT",
        "FUTURE"
    ]

    for position, item in zip(
        positions,
        reading
    ):

        title, content = (
            create_tarot_card_content(
                position,
                item
            )
        )

        story.append(
            section_box(
                title,
                content,
                styles,
                content_is_markup=True
            )
        )

        story.append(
            Spacer(
                1,
                2 * mm
            )
        )

    # ========================================================
    # AI INTERPRETATION
    # ========================================================

    if ai_reading:

        story.extend(
            ai_box(
                "AI TAROT INTERPRETATION",
                ai_reading,
                styles
            )
        )

    # ========================================================
    # DISCLAIMER
    # ========================================================

    add_disclaimer(
        story,
        (
            "Tarot readings are intended for reflection and "
            "entertainment purposes only. They are not scientific "
            "predictions and do not guarantee future events."
        ),
        styles
    )

    # ========================================================
    # BUILD
    # ========================================================

    doc.build(
        story,
        onFirstPage=draw_background,
        onLaterPages=draw_background
    )

    return output_path


# ============================================================
# COMBINED PDF
# ============================================================

def create_combined_pdf(
    filename=None,
    question="",
    palm_contents=None,
    tarot_reading=None,
    ai_reading=None,
    file_path=None
):

    # --------------------------------------------------------
    # Support BOTH filename and file_path
    # --------------------------------------------------------

    output_path = (
        filename
        if filename is not None
        else file_path
    )

    if output_path is None:

        raise ValueError(
            "PDF output path was not provided. "
            "Use filename= or file_path=."
        )

    if palm_contents is None:
        palm_contents = []

    if tarot_reading is None:
        tarot_reading = []

    styles = create_styles()

    doc = create_document(
        output_path
    )

    story = []

    # ========================================================
    # TITLE
    # ========================================================

    story.append(
        Paragraph(
            "COMBINED READING",
            styles["ReportTitle"]
        )
    )

    story.append(
        Paragraph(
            "Palmistry + Tarot Intelligence Platform",
            styles["Subtitle"]
        )
    )

    # ========================================================
    # QUESTION
    # ========================================================

    if question:

        story.append(
            Paragraph(
                "<b>Reading Question:</b><br/>"
                + safe_text(question),
                styles["Body"]
            )
        )

    # ========================================================
    # PALMISTRY
    # ========================================================

    story.append(
        Paragraph(
            "PALMISTRY INSIGHTS",
            styles["Section"]
        )
    )

    # --------------------------------------------------------
    # Heart
    # --------------------------------------------------------

    if len(palm_contents) >= 2:

        story.append(
            section_box(
                "HEART LINE",
                (
                    f"{palm_contents[0]}\n\n"
                    f"Additional Interpretation:\n"
                    f"{palm_contents[1]}"
                ),
                styles
            )
        )

    # --------------------------------------------------------
    # Head
    # --------------------------------------------------------

    if len(palm_contents) >= 4:

        story.append(
            section_box(
                "HEAD LINE",
                (
                    f"{palm_contents[2]}\n\n"
                    f"Additional Interpretation:\n"
                    f"{palm_contents[3]}"
                ),
                styles
            )
        )

    # --------------------------------------------------------
    # Life
    # --------------------------------------------------------

    if len(palm_contents) >= 6:

        story.append(
            section_box(
                "LIFE LINE",
                (
                    f"{palm_contents[4]}\n\n"
                    f"Additional Interpretation:\n"
                    f"{palm_contents[5]}"
                ),
                styles
            )
        )

    # ========================================================
    # TAROT
    # ========================================================

    story.append(
        Paragraph(
            "TAROT INSIGHTS",
            styles["Section"]
        )
    )

    for position, item in zip(
        [
            "PAST",
            "PRESENT",
            "FUTURE"
        ],
        tarot_reading
    ):

        title, content = (
            create_tarot_card_content(
                position,
                item
            )
        )

        story.append(
            section_box(
                title,
                content,
                styles,
                content_is_markup=True
            )
        )

        story.append(
            Spacer(
                1,
                2 * mm
            )
        )

    # ========================================================
    # AI
    # ========================================================

    if ai_reading:

        story.extend(
            ai_box(
                "COMBINED AI INTERPRETATION",
                ai_reading,
                styles
            )
        )

    # ========================================================
    # DISCLAIMER
    # ========================================================

    add_disclaimer(
        story,
        (
            "Palmistry and Tarot readings are intended for "
            "reflection and entertainment purposes. They are "
            "not scientific predictions, medical advice, or "
            "guaranteed forecasts of future events."
        ),
        styles
    )

    # ========================================================
    # BUILD
    # ========================================================

    doc.build(
        story,
        onFirstPage=draw_background,
        onLaterPages=draw_background
    )

    return output_path


# ============================================================
# END OF FILE
# ============================================================