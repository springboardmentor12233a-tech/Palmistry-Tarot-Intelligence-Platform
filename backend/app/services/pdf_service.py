import os
import re

from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image as RLImage, Table, TableStyle
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.units import inch

from app.config import REPORTS_DIR

styles = getSampleStyleSheet()
title_style = styles["Heading1"]
title_style.alignment = TA_CENTER
heading = styles["Heading2"]
body = styles["BodyText"]

_MD_STRIP = re.compile(r"[#*`_]")


def _clean_line(line: str) -> str:
    return _MD_STRIP.sub("", line).strip()


def _add_markdown(story, markdown_text: str):
    for raw in markdown_text.split("\n"):
        line = raw.strip()
        if not line:
            continue
        if line.startswith("#"):
            story.append(Paragraph(_clean_line(line), heading))
        else:
            story.append(Paragraph(_clean_line(line), body))


def build_report_pdf(
    filename: str,
    title: str,
    images: dict | None = None,
    features: dict | None = None,
    palm_report: str | None = None,
    tarot_result: list | None = None,
    tarot_report: str | None = None,
    combined_report: str | None = None,
) -> str:
    """
    images: dict of label -> absolute file path, rendered in order.
    """
    path = os.path.join(REPORTS_DIR, filename)
    doc = SimpleDocTemplate(path)
    story = [Paragraph(title, title_style), Spacer(1, 20)]

    if images:
        for label, img_path in images.items():
            if not img_path or not os.path.exists(img_path):
                continue
            story.append(Paragraph(label, heading))
            story.append(RLImage(img_path, width=4 * inch, height=4 * inch))
            story.append(Spacer(1, 16))

    if features:
        story.append(Paragraph("Extracted Line Features", heading))
        table_data = [["Line", "Length", "Curvature", "Orientation", "Tortuosity"]]
        for line, feature in features.items():
            if not feature:
                continue
            table_data.append([
                line, str(feature["Length"]), str(feature["Curvature"]),
                str(feature["Orientation"]), str(feature["Tortuosity"]),
            ])
        table = Table(table_data)
        table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.darkblue),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("GRID", (0, 0), (-1, -1), 1, colors.black),
            ("BACKGROUND", (0, 1), (-1, -1), colors.beige),
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ("BOTTOMPADDING", (0, 0), (-1, 0), 8),
        ]))
        story.append(table)
        story.append(Spacer(1, 20))

    if palm_report:
        story.append(Paragraph("Palm Interpretation", heading))
        _add_markdown(story, palm_report)
        story.append(Spacer(1, 20))

    if tarot_result:
        story.append(Paragraph("Tarot Cards Drawn", heading))
        table_data = [["Position", "Card", "Reversed"]]
        for c in tarot_result:
            table_data.append([c["position"], c["name"], "Yes" if c.get("reversed") else "No"])
        table = Table(table_data)
        table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.darkblue),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("GRID", (0, 0), (-1, -1), 1, colors.black),
            ("BACKGROUND", (0, 1), (-1, -1), colors.beige),
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ]))
        story.append(table)
        story.append(Spacer(1, 20))

    if tarot_report:
        story.append(Paragraph("Tarot Interpretation", heading))
        _add_markdown(story, tarot_report)
        story.append(Spacer(1, 20))

    if combined_report:
        story.append(Paragraph("Palm + Tarot Combined Report", heading))
        _add_markdown(story, combined_report)

    doc.build(story)
    return path
