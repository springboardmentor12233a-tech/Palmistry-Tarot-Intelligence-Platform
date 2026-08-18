"""
Dashboard PDF generation — redesigned as a decorated "old letter" document:
aged parchment background, a gold/wine double-border frame, a wax-seal
flourish under the title, and a cursive script font (Great Vibes) for the
title and section headings.

Body text stays in a clean, fully readable serif (EB Garamond) — the
cursive is decorative, used only for short titles/headings, never for the
dense AI-generated paragraphs. That split is deliberate: a whole page of
cursive is illegible, but a cursive title over readable body text reads as
an actual decorated letter.
"""

from datetime import datetime
from pathlib import Path
TAROT_CARDS_DIR = Path(
    r"C:\Users\souri\Downloads\Palmistry & Tarot Intelligence\Datasets\Image Files\cards"
)
from xml.sax.saxutils import escape

from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import inch
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import Image, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

FONTS_DIR = Path(__file__).parent / "fonts"

# --- Palette: an aged parchment letter, with a magical purple/gold/red accent set ---
PARCHMENT = HexColor("#EDE0BF")
PARCHMENT_EDGE = HexColor("#D8C48D")
INK_TITLE = HexColor("#5A1F3D")   # deep wine-purple — like old ink gone violet with age
INK_BODY = HexColor("#3B2A1A")   # dark sepia brown, easier on aged paper than pure black
GOLD = HexColor("#AD8A34")
WINE_RED_HEX = "#7A1F2B"
WINE_RED = HexColor(WINE_RED_HEX)
SECTION_INK = HexColor("#6B2545")

_FONTS_REGISTERED = False


def _register_fonts():
    global _FONTS_REGISTERED
    if _FONTS_REGISTERED:
        return
    pdfmetrics.registerFont(TTFont("GreatVibes", str(FONTS_DIR / "GreatVibes-Regular.ttf")))
    pdfmetrics.registerFont(TTFont("EBGaramond", str(FONTS_DIR / "EBGaramond-Regular.ttf")))
    pdfmetrics.registerFont(TTFont("EBGaramond-Italic", str(FONTS_DIR / "EBGaramond-Italic.ttf")))
    _FONTS_REGISTERED = True


def _p(text, style):
    """Plain paragraph — fully escapes the text. Use for anything that
    might contain user- or AI-generated content with no intentional markup."""
    return Paragraph(escape(str(text)).replace("\n", "<br/>"), style)


def _label(label):
    """A colored emphasis run for a known, hardcoded label (not user data).
    Not literal bold — EB Garamond's variable font file doesn't give
    reportlab a resolvable bold weight to switch to, so <b> silently does
    nothing. Color emphasis works reliably regardless, and reads well
    against the parchment besides."""
    return f'<font color="{WINE_RED_HEX}">{escape(str(label))}</font>'


def _icon(glyph):
    """EB Garamond's glyph set doesn't include ♥/✧/etc — force these
    specific dingbat characters to render in Helvetica instead, which we've
    confirmed supports them, rather than have them silently vanish."""
    return f'<font name="Helvetica">{glyph}</font>'


def _kv_line(label, value, style, glyph=None):
    """A 'Label — value' line with the label bold and an optional leading
    icon, safely escaping the dynamic value while preserving the label's
    intentional bold markup (a plain _p() call would escape the <b> tags
    into literal visible text instead of applying them)."""
    prefix = f"{_icon(glyph)}  " if glyph else ""
    text = f"{prefix}{_label(label)} — {escape(str(value))}"
    return Paragraph(text, style)


def _divider():
    style = ParagraphStyle("divider", fontName="Helvetica", fontSize=11, alignment=1,
                            textColor=GOLD, spaceBefore=2, spaceAfter=10)
    return Paragraph("✦ ✦ ✦", style)


def _draw_page_frame(canvas_obj, doc):
    """Runs on every page: aged parchment fill, a soft darker edge, and a
    gold/wine double-border frame with small corner ornaments. This is what
    makes the output read as a decorated letter rather than a plain report."""
    canvas_obj.saveState()
    width, height = letter

    canvas_obj.setFillColor(PARCHMENT)
    canvas_obj.rect(0, 0, width, height, fill=1, stroke=0)

    canvas_obj.setFillColor(PARCHMENT_EDGE)
    canvas_obj.setFillAlpha(0.55)
    edge = 30
    canvas_obj.rect(0, 0, width, edge, fill=1, stroke=0)
    canvas_obj.rect(0, height - edge, width, edge, fill=1, stroke=0)
    canvas_obj.rect(0, 0, edge, height, fill=1, stroke=0)
    canvas_obj.rect(width - edge, 0, edge, height, fill=1, stroke=0)
    canvas_obj.setFillAlpha(1)

    outer_inset = 34
    inner_inset = 40
    canvas_obj.setStrokeColor(WINE_RED)
    canvas_obj.setLineWidth(1.4)
    canvas_obj.rect(outer_inset, outer_inset, width - 2 * outer_inset, height - 2 * outer_inset, fill=0, stroke=1)
    canvas_obj.setStrokeColor(GOLD)
    canvas_obj.setLineWidth(0.8)
    canvas_obj.rect(inner_inset, inner_inset, width - 2 * inner_inset, height - 2 * inner_inset, fill=0, stroke=1)

    canvas_obj.setFillColor(GOLD)
    canvas_obj.setFont("Helvetica", 12)
    for x, y in [
        (inner_inset + 6, inner_inset + 6),
        (width - inner_inset - 16, inner_inset + 6),
        (inner_inset + 6, height - inner_inset - 18),
        (width - inner_inset - 16, height - inner_inset - 18),
    ]:
        canvas_obj.drawString(x, y, "✦")

    canvas_obj.restoreState()


def save_dashboard_report(analysis: dict, combined_reading: dict | None = None,
                           output_path: str = "dashboard_report.pdf",
                           user_question: str | None = None) -> str:
    _register_fonts()

    title_style = ParagraphStyle("title", fontName="GreatVibes", fontSize=36, leading=44,
                                  textColor=INK_TITLE, alignment=1, spaceAfter=2)
    seal_style = ParagraphStyle("seal", fontName="Helvetica", fontSize=15, alignment=1,
                                 textColor=WINE_RED, spaceBefore=2, spaceAfter=6)
    meta_style = ParagraphStyle("meta", fontName="EBGaramond-Italic", fontSize=10.5, leading=14,
                                 textColor=INK_BODY, alignment=1, spaceAfter=4)
    section_style = ParagraphStyle("section", fontName="GreatVibes", fontSize=22, leading=28,
                                    textColor=SECTION_INK, spaceBefore=14, spaceAfter=6)
    body_style = ParagraphStyle("body", fontName="EBGaramond", fontSize=11.5, leading=17,
                                 textColor=INK_BODY, spaceAfter=8)
    body_italic_style = ParagraphStyle("body_italic", fontName="EBGaramond-Italic", fontSize=12.5, leading=19,
                                        textColor=INK_BODY, spaceAfter=10)
    label_style = ParagraphStyle("label", fontName="EBGaramond", fontSize=11.5, leading=17,
                                  textColor=INK_BODY, spaceAfter=6)
    caption_style = ParagraphStyle("caption", fontName="EBGaramond-Italic", fontSize=9.5, leading=13,
                                    textColor=INK_BODY, alignment=1, spaceBefore=4, spaceAfter=12)
    footer_style = ParagraphStyle("footer", fontName="EBGaramond-Italic", fontSize=9.5, leading=13,
                                   textColor=WINE_RED, alignment=1, spaceBefore=18)

    doc = SimpleDocTemplate(
        output_path, pagesize=letter,
        leftMargin=62, rightMargin=62, topMargin=58, bottomMargin=54,
    )

    story = []
    story.append(_p("Personalized Reading Dashboard", title_style))
    story.append(Paragraph("✦", seal_style))

    meta_bits = [f"Generated: {datetime.now().strftime('%B %d, %Y')}"]
    if analysis.get("_source"):
        meta_bits.append(f"Analysis source: {analysis['_source']}")
    story.append(_p("  ·  ".join(meta_bits), meta_style))
    story.append(_divider())

    if combined_reading:
        story.append(_p("Source Data", section_style))
        if combined_reading.get("tarot_question"):
            story.append(_kv_line("Question asked", combined_reading['tarot_question'], label_style))

        result_image_path = combined_reading.get("result_image_path")
        if result_image_path and Path(result_image_path).exists():
            framed = Table(
                [[Image(result_image_path, width=7.0 * inch, height=1.83 * inch, kind="proportional")]],
                colWidths=[7.0 * inch],
            )
            framed.setStyle(TableStyle([
                ("BOX", (0, 0), (-1, -1), 1.2, GOLD),
                ("BACKGROUND", (0, 0), (-1, -1), HexColor("#F6EED2")),
                ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ]))
            wrapper = Table([[framed]], colWidths=[doc.width])
            wrapper.setStyle(TableStyle([("ALIGN", (0, 0), (-1, -1), "CENTER")]))
            story.append(wrapper)
            story.append(_p("Your palm, with detected lines", caption_style))

        palm_text = combined_reading.get("palm_text")
        if palm_text:
            glyphs = {"heart_line": "♥", "head_line": "◆", "life_line": "✧"}
            for line_name, info in palm_text.items():
                label = line_name.replace("_", " ").title()
                glyph = glyphs.get(line_name, "•")
                story.append(_kv_line(label, info.get('finding', 'Not available.'), label_style, glyph=glyph))
        elif combined_reading.get("palm_success"):
            story.append(_p("Palm analysis succeeded, but detailed line text was not captured for this session.", label_style))
        else:
            story.append(_p(f"Palm analysis unavailable: {combined_reading.get('palm_error', 'unknown reason')}", label_style))

        story.append(Spacer(1, 6))
        cards = combined_reading.get("cards_drawn", [])

        if cards:
            card_cells = []

            for card in cards:
                image_path = TAROT_CARDS_DIR / card.get("img", "")

                if image_path.exists():
                    card_image = Image(
                        str(image_path),
                        width=1.55 * inch,
                        height=2.45 * inch,
                        kind="proportional",
                    )
                else:
                    card_image = _p("Card image unavailable.", body_style)

                card_label = Paragraph(
                    f"<b>{card['card_name']}</b><br/>{card['orientation']}",
                    body_style,
                )

                card_block = Table(
                    [[card_image], [card_label]],
                    colWidths=[1.9 * inch],
                )

                card_block.setStyle(TableStyle([
                    ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                    ("VALIGN", (0, 0), (-1, -1), "TOP"),
                    ("LEFTPADDING", (0, 0), (-1, -1), 3),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 3),
                    ("TOPPADDING", (0, 0), (-1, -1), 3),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
                ]))

                card_cells.append(card_block)

            card_table = Table(
                [card_cells],
                colWidths=[2.1 * inch] * len(card_cells),
                hAlign="CENTER",
            )

            card_table.setStyle(TableStyle([
                ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 4),
                ("RIGHTPADDING", (0, 0), (-1, -1), 4),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ]))

            story.append(card_table)
            story.append(Spacer(1, 8))

            for card in cards:
                card_label = f"{card['card_name']} ({card['orientation']})"
                story.append(
                    _kv_line(
                        card_label,
                        card['meaning'],
                        label_style,
                        glyph="◆",
                    )
                )

        story.append(_divider())

    story.append(_p("Interpretation", section_style))
    story.append(_p(analysis.get("interpretation", "Not available."), body_italic_style))

    story.append(_p("Personality Intelligence", section_style))
    personality = analysis.get("personality", {})
    strengths = personality.get("strengths", [])
    weaknesses = personality.get("weaknesses", [])
    story.append(_kv_line("Strengths", ', '.join(strengths) if strengths else 'Not available.', body_style))
    story.append(_kv_line("Weaknesses", ', '.join(weaknesses) if weaknesses else 'Not available.', body_style))
    story.append(_p(personality.get("behavioral_insights", "Not available."), body_italic_style))

    story.append(_p("Recommendations", section_style))
    recs = analysis.get("recommendations", {})
    story.append(_kv_line("Personal growth", recs.get('personal_growth', 'Not available.'), body_style))
    story.append(_kv_line("Relationships", recs.get('relationships', 'Not available.'), body_style))
    story.append(_kv_line("Career", recs.get('career', 'Not available.'), body_style))

    story.append(_p("Life Trend Analysis", section_style))
    trends = analysis.get("life_trends", {})
    story.append(_kv_line("Opportunities", trends.get('opportunities', 'Not available.'), body_style))
    story.append(_kv_line("Challenges", trends.get('challenges', 'Not available.'), body_style))
    story.append(_kv_line("Growth potential", trends.get('growth_potential', 'Not available.'), body_style))

    story.append(_p("✦ For reflection and entertainment only — not a substitute for professional, medical, or financial advice. ✦", footer_style))

    doc.build(story, onFirstPage=_draw_page_frame, onLaterPages=_draw_page_frame)
    return output_path
