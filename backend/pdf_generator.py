import os
import io
from textwrap import wrap
from datetime import datetime
from reportlab.lib.pagesizes import letter, A4
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.lib.utils import ImageReader

def generate_pdf_report(
    user_name: str,
    question: str,
    reading_text: str,
    cards: list,
    palm_data: dict = None,
    palm_image_bytes: bytes = None,
    output_path: str = None
) -> str:
    """
    Generates a deluxe styled PDF report of the Palmistry & Tarot Reading.
    """
    if not output_path:
        reports_dir = os.path.join(os.path.dirname(__file__), "reports")
        os.makedirs(reports_dir, exist_ok=True)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = os.path.join(reports_dir, f"reading_report_{timestamp}.pdf")

    c = canvas.Canvas(output_path, pagesize=A4)
    width, height = A4
    margin = 45
    usable_width = width - (margin * 2)

    # Color Palette
    c_primary = HexColor("#0f0c20")   # Deep Obsidian Indigo
    c_gold = HexColor("#d4af37")      # Celestial Gold
    c_accent = HexColor("#7c3aed")    # Violet Mystique
    c_text = HexColor("#1e1b4b")      # Dark Navy Ink
    c_muted = HexColor("#64748b")     # Slate grey

    y = height - margin

    # --- Header Banner ---
    c.setFillColor(c_primary)
    c.roundRect(margin, y - 60, usable_width, 60, 6, fill=1, stroke=0)
    
    c.setFillColor(c_gold)
    c.setFont("Helvetica-Bold", 18)
    c.drawCentredString(width / 2, y - 28, "MYSTIC ORACLE • DESTINY REPORT")
    
    c.setFillColor(HexColor("#ffffff"))
    c.setFont("Helvetica", 10)
    c.drawCentredString(width / 2, y - 48, f"Prepared for: {user_name}  •  {datetime.now().strftime('%B %d, %Y - %H:%M')}")
    
    y -= 80

    # --- Querent Question Box ---
    c.setFillColor(HexColor("#f8fafc"))
    c.roundRect(margin, y - 45, usable_width, 45, 4, fill=1, stroke=1)
    
    c.setFillColor(c_accent)
    c.setFont("Helvetica-Bold", 10)
    c.drawString(margin + 12, y - 18, "QUERENT'S INQUIRY:")
    
    c.setFillColor(c_text)
    c.setFont("Helvetica-Oblique", 11)
    c.drawString(margin + 12, y - 34, f"\"{question}\"")
    
    y -= 60

    # --- Palm Image & Palmistry Highlights (if present) ---
    if palm_data:
        c.setFillColor(c_gold)
        c.setFont("Helvetica-Bold", 13)
        c.drawString(margin, y, "I. PALMISTRY MORPHOLOGY & LINE ANALYSIS")
        c.setStrokeColor(c_gold)
        c.setLineWidth(1)
        c.line(margin, y - 4, width - margin, y - 4)
        y -= 20

        # Draw palm image if provided
        palm_drawn = False
        if palm_image_bytes:
            try:
                img_io = io.BytesIO(palm_image_bytes)
                img = ImageReader(img_io)
                c.drawImage(img, margin, y - 110, width=110, height=110, preserveAspectRatio=True)
                palm_drawn = True
            except Exception as e:
                print(f"[PDF Image Error] {e}")

        text_x = margin + 125 if palm_drawn else margin
        text_w = usable_width - 125 if palm_drawn else usable_width

        c.setFillColor(c_text)
        c.setFont("Helvetica-Bold", 9)
        
        lines_info = palm_data.get("lines", {})
        for line_key, line_val in lines_info.items():
            if y < margin + 60:
                c.showPage()
                y = height - margin
            
            c.setFont("Helvetica-Bold", 9)
            c.setFillColor(c_accent)
            c.drawString(text_x, y, f"• {line_val['name']}: {line_val['score']}/100")
            y -= 12
            
            c.setFont("Helvetica", 8)
            c.setFillColor(c_text)
            wrapped = wrap(line_val["archetype"], width=65 if palm_drawn else 85)
            for line in wrapped:
                c.drawString(text_x + 8, y, line)
                y -= 11
            y -= 4
        
        if palm_drawn:
            y -= 15

    # --- Drawn Tarot Cards ---
    if cards:
        if y < margin + 120:
            c.showPage()
            y = height - margin

        c.setFillColor(c_gold)
        c.setFont("Helvetica-Bold", 13)
        c.drawString(margin, y, "II. SACRED TAROT SPREAD")
        c.setStrokeColor(c_gold)
        c.line(margin, y - 4, width - margin, y - 4)
        y -= 20

        card_col_w = usable_width / max(1, len(cards))
        for i, c_item in enumerate(cards):
            card = c_item["card"]
            cx = margin + (i * card_col_w)
            
            # Card card box
            c.setFillColor(HexColor("#f1f5f9"))
            c.roundRect(cx + 4, y - 65, card_col_w - 8, 65, 4, fill=1, stroke=0)
            
            c.setFillColor(c_accent)
            c.setFont("Helvetica-Bold", 8)
            c.drawString(cx + 10, y - 14, c_item["position"].upper())
            
            c.setFillColor(c_primary)
            c.setFont("Helvetica-Bold", 10)
            c.drawString(cx + 10, y - 28, f"{card['name']}")
            
            c.setFillColor(c_gold if c_item["upright"] else HexColor("#ef4444"))
            c.setFont("Helvetica-Bold", 8)
            c.drawString(cx + 10, y - 40, f"[{c_item['orientation'].upper()}]")
            
            c.setFillColor(c_muted)
            c.setFont("Helvetica", 7)
            kw = ", ".join(card.get("keywords", [])[:3])
            c.drawString(cx + 10, y - 52, f"Keywords: {kw}")

        y -= 80

    # --- Synthesized Reading Narrative ---
    if y < margin + 100:
        c.showPage()
        y = height - margin

    c.setFillColor(c_gold)
    c.setFont("Helvetica-Bold", 13)
    c.drawString(margin, y, "III. ORACLE SYNTHESIS & GUIDANCE")
    c.setStrokeColor(c_gold)
    c.line(margin, y - 4, width - margin, y - 4)
    y -= 20

    c.setFillColor(c_text)
    c.setFont("Helvetica", 9.5)

    for para in reading_text.split("\n"):
        para = para.strip()
        if not para:
            y -= 8
            continue
        
        # Check if heading
        if para.startswith("🌌") or para.startswith("❤️") or para.startswith("⚡") or para.startswith("🌿") or para.startswith("✨") or para.startswith("🔮") or para.startswith("🌟"):
            if y < margin + 40:
                c.showPage()
                y = height - margin
            y -= 6
            c.setFont("Helvetica-Bold", 10.5)
            c.setFillColor(c_accent)
            c.drawString(margin, y, para)
            c.setFont("Helvetica", 9.5)
            c.setFillColor(c_text)
            y -= 14
            continue

        wrapped = wrap(para, width=88)
        for line in wrapped:
            if y < margin + 30:
                c.showPage()
                y = height - margin
                c.setFont("Helvetica", 9.5)
                c.setFillColor(c_text)
            c.drawString(margin, y, line)
            y -= 13

    # --- Footer on every page ---
    c.save()
    return output_path
