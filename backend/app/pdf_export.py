import os
from fpdf import FPDF

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "results")


def _safe_text(text):
    if text is None:
        return ""
    return str(text).encode("latin-1", "replace").decode("latin-1")


def _create_pdf():
    pdf = FPDF()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()
    return pdf


# ==========================================================
# PALM READING PDF
# ==========================================================

def export_palm_pdf(request_id, palm_reading, annotated_palm_path):

    pdf = _create_pdf()

    pdf.set_font("Helvetica", "B", 18)
    pdf.cell(0, 12, "AI Palmistry & Tarot Intelligence Platform", ln=True)

    pdf.set_font("Helvetica", "", 12)
    pdf.cell(0, 10, "Palm Reading Report", ln=True)

    pdf.ln(5)

    if annotated_palm_path and os.path.exists(annotated_palm_path):
        pdf.image(annotated_palm_path, w=100)
        pdf.ln(8)

    pdf.set_font("Helvetica", "B", 13)
    pdf.cell(0, 10, "AI Interpretation", ln=True)

    pdf.set_font("Helvetica", "", 11)
    pdf.multi_cell(0, 7, _safe_text(palm_reading))

    output_dir = os.path.join(OUTPUT_DIR, request_id)
    os.makedirs(output_dir, exist_ok=True)

    output_path = os.path.join(output_dir, "palm_reading.pdf")

    pdf.output(output_path)

    return output_path


# ==========================================================
# TAROT READING PDF
# ==========================================================

def export_tarot_pdf(request_id, tarot_spread, tarot_reading):

    pdf = _create_pdf()

    pdf.set_font("Helvetica", "B", 18)
    pdf.cell(0, 12, "AI Palmistry & Tarot Intelligence Platform", ln=True)

    pdf.set_font("Helvetica", "", 12)
    pdf.cell(0, 10, "Tarot Reading Report", ln=True)

    pdf.ln(5)

    for card in tarot_spread:

        orientation = "Reversed" if card["reversed"] else "Upright"

        pdf.set_font("Helvetica", "B", 12)
        pdf.cell(
            0,
            8,
            _safe_text(f"{card['position']}: {card['name']} ({orientation})"),
            ln=True,
        )

        image_path = os.path.join(
            os.path.dirname(__file__),
            "data",
            "tarot",
            "cards",
            card["image_filename"],
        )

        if os.path.exists(image_path):
            pdf.image(image_path, w=45)
            pdf.ln(5)

    pdf.set_font("Helvetica", "B", 13)
    pdf.cell(0, 10, "AI Interpretation", ln=True)

    pdf.set_font("Helvetica", "", 11)
    pdf.multi_cell(0, 7, _safe_text(tarot_reading))

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

    pdf = _create_pdf()

    # ---------------- Cover ----------------

    pdf.set_font("Helvetica", "B", 18)
    pdf.cell(0, 12, "AI Palmistry & Tarot Intelligence Platform", ln=True)

    pdf.set_font("Helvetica", "", 12)
    pdf.cell(0, 10, "Combined Reading Report", ln=True)

    pdf.ln(8)

    pdf.set_font("Helvetica", "B", 13)
    pdf.cell(0, 10, "Combined Guidance", ln=True)

    pdf.set_font("Helvetica", "", 11)
    pdf.multi_cell(0, 7, _safe_text(combined_reading))

    # ---------------- Palm ----------------

    pdf.add_page()

    pdf.set_font("Helvetica", "B", 16)
    pdf.cell(0, 10, "Palm Reading", ln=True)

    pdf.ln(5)

    if annotated_palm_path and os.path.exists(annotated_palm_path):
        pdf.image(annotated_palm_path, w=100)
        pdf.ln(8)

    pdf.set_font("Helvetica", "", 11)
    pdf.multi_cell(0, 7, _safe_text(palm_reading))

    # ---------------- Tarot ----------------

    pdf.add_page()

    pdf.set_font("Helvetica", "B", 16)
    pdf.cell(0, 10, "Tarot Reading", ln=True)

    pdf.ln(5)

    for card in tarot_spread:

        orientation = "Reversed" if card["reversed"] else "Upright"

        pdf.set_font("Helvetica", "B", 12)
        pdf.cell(
            0,
            8,
            _safe_text(f"{card['position']}: {card['name']} ({orientation})"),
            ln=True,
        )

        image_path = os.path.join(
            os.path.dirname(__file__),
            "data",
            "tarot",
            "cards",
            card["image_filename"],
        )

        if os.path.exists(image_path):
            pdf.image(image_path, w=45)
            pdf.ln(5)

    pdf.set_font("Helvetica", "B", 13)
    pdf.cell(0, 10, "AI Interpretation", ln=True)

    pdf.set_font("Helvetica", "", 11)
    pdf.multi_cell(0, 7, _safe_text(tarot_reading))

    output_dir = os.path.join(OUTPUT_DIR, request_id)
    os.makedirs(output_dir, exist_ok=True)

    output_path = os.path.join(output_dir, "combined_reading.pdf")

    pdf.output(output_path)

    return output_path