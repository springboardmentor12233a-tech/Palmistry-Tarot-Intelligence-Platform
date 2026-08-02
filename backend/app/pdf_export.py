import os
from fpdf import FPDF

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "results")


def _safe_text(text):
    return text.encode("latin-1", "replace").decode("latin-1")


def export_combined_pdf(request_id, palm_reading, tarot_spread, tarot_reading, combined_reading, annotated_palm_path):
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Helvetica", "B", 16)
    pdf.cell(0, 10, "Your Palm & Tarot Reading", ln=True)
    pdf.set_font("Helvetica", "", 10)
    pdf.cell(0, 8, "Integrated Reading", ln=True)
    pdf.ln(4)
    pdf.set_font("Helvetica", "", 11)
    pdf.multi_cell(0, 6, _safe_text(combined_reading))

    pdf.add_page()
    pdf.set_font("Helvetica", "B", 14)
    pdf.cell(0, 10, "Palm Reading", ln=True)
    if annotated_palm_path and os.path.exists(annotated_palm_path):
        pdf.image(annotated_palm_path, w=90)
        pdf.ln(4)
    pdf.set_font("Helvetica", "", 11)
    pdf.multi_cell(0, 6, _safe_text(palm_reading))

    pdf.add_page()
    pdf.set_font("Helvetica", "B", 14)
    pdf.cell(0, 10, "Tarot Cards", ln=True)
    for card in tarot_spread:
        orientation = "reversed" if card["reversed"] else "upright"
        pdf.set_font("Helvetica", "B", 11)
        pdf.cell(0, 8, _safe_text(f"{card['position']}: {card['name']} ({orientation})"), ln=True)
        img_path = os.path.join(os.path.dirname(__file__), "data", "tarot", "cards", card["image_filename"])
        if os.path.exists(img_path):
            pdf.image(img_path, w=40)
            pdf.ln(2)
    pdf.set_font("Helvetica", "B", 12)
    pdf.cell(0, 10, "Tarot Interpretation", ln=True)
    pdf.set_font("Helvetica", "", 11)
    pdf.multi_cell(0, 6, _safe_text(tarot_reading))

    output_dir = os.path.join(OUTPUT_DIR, request_id)
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, "combined_reading.pdf")
    pdf.output(output_path)
    return output_path