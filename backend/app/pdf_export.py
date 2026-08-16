import os
from fpdf import FPDF

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "results")
ASSETS_DIR = os.path.join(os.path.dirname(__file__), "assets")
FONTS_DIR = os.path.join(ASSETS_DIR, "fonts")
EMOJI_DIR = os.path.join(ASSETS_DIR, "emoji")

FONT_REGULAR = os.path.join(FONTS_DIR, "DejaVuSans.ttf")
FONT_BOLD = os.path.join(FONTS_DIR, "DejaVuSans-Bold.ttf")

# ---------------------------------------------------------
# Brand palette (matches the reference design: purple banner,
# gold dividers, dark plum headings, soft gray body text)
# ---------------------------------------------------------
PURPLE = (76, 29, 149)
PURPLE_DARK = (55, 20, 110)
GOLD = (200, 160, 60)
TEXT_DARK = (40, 40, 45)
TEXT_MUTED = (120, 120, 128)
WHITE = (255, 255, 255)

PAGE_MARGIN = 15
BANNER_HEIGHT = 26

# Maps each known section heading to an emoji icon file.
# Unrecognized headings fall back to DEFAULT_ICON.
ICON_MAP = {
    "Personality & Character": "star.png",
    "Education & Learning Style": "books.png",
    "Career & Professional Strengths": "briefcase.png",
    "Relationships & Emotional Life": "two_hearts.png",
    "Finance & Growth": "money_bag.png",
    "Personal Guidance": "compass.png",
    "Overall Summary": "sparkles.png",
    "Disclaimer:": "warning.png",
    "Past": "hourglass.png",
    "Present": "sparkles.png",
    "Future": "crystal_ball.png",
    "Focus": "crystal_ball.png",
    "Final Message": "sparkles.png",
    "Combined Insight": "gem.png",
    "Career & Life Direction": "briefcase.png",
    "Relationships & Balance": "two_hearts.png",
    "Personal Growth": "seedling.png",
    "Final Guidance": "compass.png",
}

DEFAULT_ICON = "sparkles.png"

# All headings we know how to detect and style across palm / tarot / combined readings
ALL_HEADINGS = list(ICON_MAP.keys())


def _safe_text(text):
    if text is None:
        return ""
    return str(text)


def _icon_path(filename):
    path = os.path.join(EMOJI_DIR, filename)
    return path if os.path.exists(path) else None


class BrandedPDF(FPDF):
    """FPDF subclass that draws the purple banner header and the
    footer automatically on every page (including page breaks)."""

    def __init__(self, subtitle):
        super().__init__(orientation="P", unit="mm", format="A4")
        self.subtitle = subtitle
        self.set_auto_page_break(auto=True, margin=20)
        self._register_fonts()

    def _register_fonts(self):
        self.add_font("DejaVu", "", FONT_REGULAR)
        self.add_font("DejaVu", "B", FONT_BOLD)

    def header(self):
        # Purple banner background
        self.set_fill_color(*PURPLE)
        self.rect(0, 0, self.w, BANNER_HEIGHT, style="F")

        # Title
        self.set_xy(PAGE_MARGIN, 6)
        self.set_text_color(*WHITE)
        self.set_font("DejaVu", "B", 16)
        self.cell(0, 8, "AI Palmistry & Tarot Intelligence Platform")

        # Subtitle
        self.set_xy(PAGE_MARGIN, 15)
        self.set_font("DejaVu", "", 10.5)
        self.cell(0, 6, self.subtitle)

        # Small emoji icons, top-right of the banner
        icon_size = 8
        crystal = _icon_path("crystal_ball.png")
        sparkle = _icon_path("sparkles.png")
        icon_y = (BANNER_HEIGHT - icon_size) / 2
        x = self.w - PAGE_MARGIN - icon_size
        if sparkle:
            self.image(sparkle, x=x, y=icon_y, w=icon_size, h=icon_size)
            x -= icon_size + 2
        if crystal:
            self.image(crystal, x=x, y=icon_y, w=icon_size, h=icon_size)

        self.set_y(BANNER_HEIGHT + 8)
        self.set_text_color(*TEXT_DARK)

    def footer(self):
        self.set_y(-15)
        self.set_draw_color(*GOLD)
        self.set_line_width(0.3)
        self.line(PAGE_MARGIN, self.get_y(), self.w - PAGE_MARGIN, self.get_y())

        self.set_y(-12)
        self.set_font("DejaVu", "", 8.5)
        self.set_text_color(*TEXT_MUTED)
        self.cell(0, 6, f"Page {self.page_no()}")
        self.set_xy(-PAGE_MARGIN - 80, self.get_y())
        self.cell(80, 6, "Generated for entertainment & self-reflection", align="R")


def _create_pdf(subtitle):
    pdf = BrandedPDF(subtitle)
    pdf.add_page()
    return pdf


def _content_width(pdf):
    return pdf.w - 2 * PAGE_MARGIN


def _ensure_space(pdf, needed_mm):
    """Force a page break (with its branded header) if there isn't
    enough room left before the footer area."""
    if pdf.get_y() + needed_mm > pdf.h - 20:
        pdf.add_page()


def _section_heading(pdf, heading_text):
    icon_file = ICON_MAP.get(heading_text, DEFAULT_ICON)
    icon_path = _icon_path(icon_file)

    _ensure_space(pdf, 16)
    pdf.ln(3)

    start_y = pdf.get_y()
    icon_size = 6.5

    if icon_path:
        pdf.image(icon_path, x=PAGE_MARGIN, y=start_y, w=icon_size, h=icon_size)
        text_x = PAGE_MARGIN + icon_size + 3
    else:
        text_x = PAGE_MARGIN

    pdf.set_xy(text_x, start_y - 0.5)
    pdf.set_font("DejaVu", "B", 12.5)
    pdf.set_text_color(*PURPLE_DARK)
    pdf.cell(0, icon_size + 1, heading_text)

    pdf.set_xy(PAGE_MARGIN, start_y + icon_size + 1.5)
    pdf.set_draw_color(*GOLD)
    pdf.set_line_width(0.4)
    pdf.line(PAGE_MARGIN, pdf.get_y(), pdf.w - PAGE_MARGIN, pdf.get_y())
    pdf.ln(3)

    pdf.set_text_color(*TEXT_DARK)


def _body_paragraph(pdf, text, italic=False):
    pdf.set_font("DejaVu", "", 10.5)
    pdf.set_text_color(*TEXT_MUTED if italic else TEXT_DARK)
    pdf.multi_cell(_content_width(pdf), 6, _safe_text(text))
    pdf.set_text_color(*TEXT_DARK)


def _render_reading(pdf, raw_text):
    """Parses the LLM output (same heading convention the frontend
    formatter relies on) and renders each section with its icon,
    a colored heading and a gold divider, instead of one flat block
    of text."""
    if not raw_text:
        return

    paragraph_lines = []

    def flush_paragraph():
        if paragraph_lines:
            is_disclaimer = False
            _body_paragraph(pdf, " ".join(paragraph_lines).strip(), italic=is_disclaimer)
            paragraph_lines.clear()

    for raw_line in _safe_text(raw_text).split("\n"):
        line = raw_line.strip()

        if line in ALL_HEADINGS:
            flush_paragraph()
            _section_heading(pdf, line)
            continue

        if line == "":
            flush_paragraph()
            continue

        paragraph_lines.append(line)

    flush_paragraph()


def _centered_image(pdf, image_path, max_w):
    if not image_path or not os.path.exists(image_path):
        return
    x = (pdf.w - max_w) / 2
    pdf.image(image_path, x=x, w=max_w)
    pdf.ln(4)


def _ai_interpretation_lead_in(pdf):
    _ensure_space(pdf, 14)
    pdf.set_font("DejaVu", "B", 14)
    pdf.set_text_color(*PURPLE_DARK)
    icon_path = _icon_path("crystal_ball.png")
    start_y = pdf.get_y()
    if icon_path:
        pdf.image(icon_path, x=PAGE_MARGIN, y=start_y, w=7, h=7)
        pdf.set_xy(PAGE_MARGIN + 9, start_y)
    pdf.cell(0, 8, "AI Interpretation")
    pdf.ln(10)
    pdf.set_text_color(*TEXT_DARK)


def _image_display_height(image_path, display_w_mm):
    """Compute the height (mm) an image should render at for a given
    display width, from its real pixel aspect ratio. Falls back to a
    square guess if the file can't be read for any reason - we never
    want a bad image to crash the whole PDF."""
    try:
        from PIL import Image
        with Image.open(image_path) as im:
            px_w, px_h = im.size
        if px_w > 0:
            return display_w_mm * (px_h / px_w)
    except Exception:
        pass
    return display_w_mm


def _tarot_card_block(pdf, card, cards_dir):
    """Renders one card's heading followed by its image, with every
    coordinate set explicitly (no reliance on fpdf2's default image
    positioning, which doesn't advance the cursor the way multi_cell
    does and was causing cards to drift to the right/overlap)."""
    orientation = "Reversed" if card["reversed"] else "Upright"

    _ensure_space(pdf, 20)
    pdf.set_font("DejaVu", "B", 11.5)
    pdf.set_text_color(*PURPLE_DARK)
    pdf.set_x(PAGE_MARGIN)
    pdf.multi_cell(
        _content_width(pdf), 6.5,
        f"{card['position']}: {card['name']} ({orientation})"
    )
    pdf.set_text_color(*TEXT_DARK)

    heading_bottom_y = pdf.get_y()

    image_path = os.path.join(cards_dir, card["image_filename"])
    if os.path.exists(image_path):
        card_w = 38
        card_h = _image_display_height(image_path, card_w)

        # Break to a fresh page if the card image won't fit before the footer
        if heading_bottom_y + card_h > pdf.h - 20:
            pdf.add_page()
            heading_bottom_y = pdf.get_y()

        pdf.image(image_path, x=PAGE_MARGIN, y=heading_bottom_y, w=card_w, h=card_h)
        next_y = heading_bottom_y + card_h + 5
    else:
        next_y = heading_bottom_y + 5

    pdf.set_xy(PAGE_MARGIN, next_y)


# ==========================================================
# PALM READING PDF
# ==========================================================

def export_palm_pdf(request_id, palm_reading, annotated_palm_path):

    pdf = _create_pdf("Palm Reading Report")

    _centered_image(pdf, annotated_palm_path, 90)
    _ai_interpretation_lead_in(pdf)
    _render_reading(pdf, palm_reading)

    output_dir = os.path.join(OUTPUT_DIR, request_id)
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, "palm_reading.pdf")
    pdf.output(output_path)

    return output_path


# ==========================================================
# TAROT READING PDF
# ==========================================================

def export_tarot_pdf(request_id, tarot_spread, tarot_reading):

    pdf = _create_pdf("Tarot Reading Report")
    cards_dir = os.path.join(os.path.dirname(__file__), "data", "tarot", "cards")

    for card in tarot_spread:
        _tarot_card_block(pdf, card, cards_dir)

    _ai_interpretation_lead_in(pdf)
    _render_reading(pdf, tarot_reading)

    output_dir = os.path.join(OUTPUT_DIR, request_id)
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, "tarot_reading.pdf")
    pdf.output(output_path)

    return output_path


# ==========================================================
# COMBINED READING PDF
# ==========================================================

def export_combined_pdf(
    request_id,
    palm_reading,
    tarot_spread,
    tarot_reading,
    combined_reading,
    annotated_palm_path,
):

    pdf = _create_pdf("Combined Reading Report")

    # ---------------- Cover: combined guidance ----------------
    _ai_interpretation_lead_in(pdf)
    _render_reading(pdf, combined_reading)

    # ---------------- Palm ----------------
    pdf.add_page()
    pdf.set_font("DejaVu", "B", 15)
    pdf.set_text_color(*PURPLE_DARK)
    pdf.cell(0, 9, "Palm Reading")
    pdf.ln(11)
    pdf.set_text_color(*TEXT_DARK)

    _centered_image(pdf, annotated_palm_path, 90)
    _render_reading(pdf, palm_reading)

    # ---------------- Tarot ----------------
    pdf.add_page()
    pdf.set_font("DejaVu", "B", 15)
    pdf.set_text_color(*PURPLE_DARK)
    pdf.cell(0, 9, "Tarot Reading")
    pdf.ln(11)
    pdf.set_text_color(*TEXT_DARK)

    cards_dir = os.path.join(os.path.dirname(__file__), "data", "tarot", "cards")
    for card in tarot_spread:
        _tarot_card_block(pdf, card, cards_dir)

    _render_reading(pdf, tarot_reading)

    output_dir = os.path.join(OUTPUT_DIR, request_id)
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, "combined_reading.pdf")
    pdf.output(output_path)

    return output_path
