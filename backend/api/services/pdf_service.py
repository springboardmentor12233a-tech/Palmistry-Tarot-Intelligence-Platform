import os
import uuid
import base64
import requests
from io import BytesIO
from django.conf import settings
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, PageBreak, Table, TableStyle, KeepTogether
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.colors import HexColor, Color
from reportlab.lib.units import inch
from reportlab.lib import colors

# Esoteric Colors
BG_COLOR = HexColor("#FCFBF9") # Parchment/Off-white
TEXT_DARK = HexColor("#1A2530") # Deep Navy / Slate
TEXT_MUTED = HexColor("#4A5568") # Dark Gray
HEADER_BG = HexColor("#233142") # Deep Navy Header
GOLD = HexColor("#D4AF37") # Hermetic Gold
BORDER_GOLD = HexColor("#D4AF37")
BORDER_LIGHT = HexColor("#E2E8F0")
BOX_BG = HexColor("#FFFFFF")

def draw_background(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(BG_COLOR)
    canvas.rect(0, 0, letter[0], letter[1], fill=True, stroke=False)
    
    # Simple footer
    canvas.setFont('Times-Roman', 9)
    canvas.setFillColor(TEXT_MUTED)
    canvas.drawCentredString(letter[0] / 2.0, 0.5 * inch, f"Page {doc.page} of 5")
    canvas.restoreState()

class PDFService:
    def __init__(self):
        self.reports_dir = os.path.join(settings.MEDIA_ROOT, 'reports')
        os.makedirs(self.reports_dir, exist_ok=True)
        
    def _create_styles(self):
        styles = getSampleStyleSheet()
        # Header Styles
        self.s_title_gold = ParagraphStyle('CoverTitle', fontName='Times-Bold', fontSize=22, textColor=GOLD, alignment=1, spaceAfter=6)
        self.s_subtitle_white = ParagraphStyle('CoverSubtitle', fontName='Times-Italic', fontSize=12, textColor=HexColor("#E2E8F0"), alignment=1, spaceAfter=10)
        self.s_header_meta = ParagraphStyle('HeaderMeta', fontName='Times-Roman', fontSize=10, textColor=GOLD, alignment=1)
        
        # Topic Header Styles
        self.s_topic = ParagraphStyle('TopicH1', fontName='Times-Bold', fontSize=13, textColor=TEXT_DARK, spaceAfter=10, spaceBefore=20)
        
        # Sub Headers
        self.s_h2 = ParagraphStyle('H2', fontName='Helvetica-Bold', fontSize=10, textColor=TEXT_DARK, spaceAfter=6, spaceBefore=4)
        
        # Body Text
        self.s_normal = ParagraphStyle('NormalText', fontName='Times-Roman', fontSize=10, textColor=TEXT_DARK, leading=14, spaceAfter=6)
        self.s_italic = ParagraphStyle('ItalicText', fontName='Times-Italic', fontSize=10, textColor=TEXT_MUTED, leading=14, spaceAfter=6)
        self.s_bold = ParagraphStyle('BoldText', fontName='Times-Bold', fontSize=10, textColor=TEXT_DARK, spaceAfter=4)
        self.s_small = ParagraphStyle('SmallText', fontName='Times-Roman', fontSize=8, textColor=TEXT_MUTED, leading=10)
        
        # Table Text
        self.s_table_head = ParagraphStyle('TableHead', fontName='Helvetica-Bold', fontSize=9, textColor=HexColor("#FFFFFF"), alignment=0)
        self.s_table_body = ParagraphStyle('TableBody', fontName='Times-Roman', fontSize=9, textColor=TEXT_DARK, leading=12)
        
    def _get_image(self, img_b64, max_width, max_height):
        if not img_b64: return None
        try:
            if img_b64.startswith("data:image"):
                header, encoded = img_b64.split(",", 1)
            else:
                encoded = img_b64
            img_data = base64.b64decode(encoded)
            img = Image(BytesIO(img_data))
            aspect = img.imageWidth / float(img.imageHeight)
            if (max_width / aspect) <= max_height:
                img.drawWidth = max_width
                img.drawHeight = max_width / aspect
            else:
                img.drawHeight = max_height
                img.drawWidth = max_height * aspect
            return img
        except Exception as e:
            return None

    def _get_url_image(self, url, max_width, max_height):
        if not url: return None
        try:
            response = requests.get(url, timeout=5)
            if response.status_code == 200:
                img = Image(BytesIO(response.content))
                aspect = img.imageWidth / float(img.imageHeight)
                if (max_width / aspect) <= max_height:
                    img.drawWidth = max_width
                    img.drawHeight = max_width / aspect
                else:
                    img.drawHeight = max_height
                    img.drawWidth = max_height * aspect
                return img
        except Exception as e:
            pass
        return None

    def _safe_get(self, data_dict, key, default="N/A"):
        if not isinstance(data_dict, dict): return default
        return str(data_dict.get(key, default))
        
    def _safe_dict(self, data):
        if isinstance(data, dict): return data
        if isinstance(data, str):
            import json
            try: return json.loads(data)
            except: pass
        return {}
        
    def _draw_topic_header(self, text):
        # A simple table to mimic the side-bar gold accent
        return Table(
            [[Paragraph(text, self.s_topic)]],
            colWidths=[7*inch],
            style=TableStyle([
                ('LINEBEFORE', (0,0), (0,0), 3, GOLD),
                ('TOPPADDING', (0,0), (0,0), 0),
                ('BOTTOMPADDING', (0,0), (0,0), 0),
                ('LEFTPADDING', (0,0), (0,0), 6),
            ])
        )

    def generate_report(self, reading) -> str:
        self._create_styles()
        filename = f"report_{reading.id}_{uuid.uuid4().hex[:8]}.pdf"
        filepath = os.path.join(self.reports_dir, filename)
        
        doc = SimpleDocTemplate(filepath, pagesize=letter, rightMargin=0.5*inch, leftMargin=0.5*inch, topMargin=0.5*inch, bottomMargin=0.5*inch)
        Story = []
        
        syn = self._safe_dict(reading.synthesis_interpretation)
        palm_features = self._safe_dict(reading.palm_features)
        
        # ==========================================
        # HEADER BLOCK
        # ==========================================
        header_data = [
            [Paragraph("ESOTERIC HERMETIC SYNTHESIS REPORT", self.s_title_gold)],
            [Paragraph("Comprehensive 11-Topic Master Palmistry & Tarot Archetypal Dossier", self.s_subtitle_white)],
            [Paragraph(f"<b>Querent:</b> Reader | <b>Dominant:</b> {palm_features.get('handedness', 'Right')} Hand | <b>Deck Tradition:</b> Rider-Waite | <b>Scope:</b> Master 11-Topic Continuous Dossier", self.s_header_meta)]
        ]
        t_header = Table(header_data, colWidths=[7.5*inch])
        t_header.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), HEADER_BG),
            ('ALIGN', (0,0), (-1,-1), 'CENTER'),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('TOPPADDING', (0,0), (-1,-1), 15),
            ('BOTTOMPADDING', (0,0), (-1,-1), 15),
            ('BOTTOMPADDING', (0,2), (-1,2), 20),
            ('LINEBELOW', (0,1), (-1,1), 0.5, GOLD)
        ]))
        Story.append(t_header)
        Story.append(Spacer(1, 15))
        
        # ==========================================
        # TOPIC 1: CHIROGNOMIC HAND TYPING
        # ==========================================
        Story.append(self._draw_topic_header("TOPIC 1: CHIROGNOMIC HAND TYPING & ELEMENTAL CLASSIFICATION"))
        Story.append(Paragraph("Chirognomy examines the underlying biological morphology, bone structure, skin texture, and elemental proportion of the hand. This somatic foundation serves as the neuro-physiological baseline from which all cognitive drives, metabolic vitality, and behavioral tendencies emerge into conscious action.", self.s_normal))
        Story.append(Spacer(1, 10))
        
        img_marked = self._get_image(palm_features.get("marked_image"), 3.2*inch, 4*inch)
        img_cell = img_marked if img_marked else Paragraph("No Image Available", self.s_normal)
        palm_shape = palm_features.get("palm_shape", {}).get("type", "Earth")
        finger_str = palm_features.get("finger_structure", {}).get("type", "Balanced")
        
        box1_a = [Paragraph("A. The Practical Archetype", self.s_h2), Paragraph(f"The querent possesses a {palm_shape.lower()} palm shape coupled with {finger_str.lower()} phalanges. In classical esoteric chirognomy, this combination establishes a grounded, pragmatic archetype. It reflects high-velocity cognitive throughput, multi-layered abstract reasoning, and an innate instinct to convert conceptual architectures into tangible, functional reality.", self.s_normal)]
        box1_b = [Paragraph("B. Skin Grain & Epidermal Elasticity", self.s_h2), Paragraph("A refined epidermal texture denotes heightened sensory receptivity, aesthetic discernment, and acute sensitivity to institutional and relational dynamics, balanced by strong physical resistance.", self.s_normal)]
        box1_c = [Paragraph("C. Phalanx Proportions & Balance", self.s_h2), Paragraph("Dominance in the basal and logical phalanges confirms an executive balance: rapid intellectual synthesis grounded by material practicality and structural follow-through.", self.s_normal)]
        
        # Create small tables for boxes
        t_box1a = Table([[box1_a[0]], [box1_a[1]]], colWidths=[3.8*inch], style=TableStyle([('BOX', (0,0), (-1,-1), 0.5, BORDER_GOLD), ('BACKGROUND', (0,0), (-1,-1), BOX_BG), ('PADDING', (0,0), (-1,-1), 8)]))
        t_box1b = Table([[box1_b[0]], [box1_b[1]]], colWidths=[3.8*inch], style=TableStyle([('BOX', (0,0), (-1,-1), 0.5, BORDER_LIGHT), ('BACKGROUND', (0,0), (-1,-1), BOX_BG), ('PADDING', (0,0), (-1,-1), 8)]))
        t_box1c = Table([[box1_c[0]], [box1_c[1]]], colWidths=[3.8*inch], style=TableStyle([('BOX', (0,0), (-1,-1), 0.5, BORDER_LIGHT), ('BACKGROUND', (0,0), (-1,-1), BOX_BG), ('PADDING', (0,0), (-1,-1), 8)]))
        
        right_col = Table([[t_box1a], [Spacer(1,5)], [t_box1b], [Spacer(1,5)], [t_box1c]], colWidths=[4*inch])
        
        # Add visual color legend for the image
        legend_text = "<b>Lines:</b> <font color='red'>Heart</font> | <font color='green'>Head</font> | <font color='blue'>Life</font>"
        legend_p = Paragraph(legend_text, self.s_header_meta)
        left_col = Table([[img_cell], [Spacer(1, 5)], [Paragraph("<i>Figure 1.1: Topographical Map of the Hand & Vectors</i>", self.s_header_meta)], [Spacer(1, 3)], [legend_p]], colWidths=[3.5*inch])
        left_col.setStyle(TableStyle([('BOX', (0,0), (-1,-1), 0.5, BORDER_LIGHT), ('BACKGROUND', (0,0), (-1,-1), BOX_BG), ('ALIGN', (0,0), (-1,-1), 'CENTER'), ('PADDING', (0,0), (-1,-1), 10)]))
        
        t1_layout = Table([[left_col, right_col]], colWidths=[3.5*inch, 4*inch])
        t1_layout.setStyle(TableStyle([('VALIGN', (0,0), (-1,-1), 'TOP')]))
        Story.append(t1_layout)
        Story.append(Spacer(1, 15))
        
        # ==========================================
        # TOPIC 2: MAJOR PALM LINES
        # ==========================================
        Story.append(self._draw_topic_header("TOPIC 2: MAJOR PALM LINES (HEART, HEAD, LIFE & FATE ANALYSIS)"))
        Story.append(Paragraph("The primary creases of the palm chart the deep neurological conduits of emotional resonance, mental focus, metabolic vitality, and vocational destiny across the querent's timeline.", self.s_normal))
        Story.append(Spacer(1, 10))
        
        palm_interp = self._safe_dict(syn.get("palm_interpretation", {}))
        
        def make_line_box(title, text, width=3.6*inch):
            return Table([[Paragraph(title, self.s_h2)], [Paragraph(text, self.s_normal)]], colWidths=[width], style=TableStyle([('BOX', (0,0), (-1,-1), 0.5, BORDER_LIGHT), ('BACKGROUND', (0,0), (-1,-1), BOX_BG), ('PADDING', (0,0), (-1,-1), 8)]))
            
        b_heart = make_line_box("1. Heart Line: The Philosophical Idealist", palm_interp.get("heart_line", "Reflects profound emotional integrity, high loyalty standards, and balanced empathy governed by rational discernment."))
        b_head = make_line_box("2. Head Line: Pragmatic Imagination", palm_interp.get("head_line", "Originating with a brief junction with the Life Line. Confers dual capacity: rigorous algorithmic logic paired with visionary intuitive foresight."))
        b_life = make_line_box("3. Life Line: Vitality & Physical Stamina", palm_interp.get("life_line", "A broad, deep arc wrapping around a robust Mount of Venus. Shows high recuperative stamina and physical resilience."))
        b_fate = make_line_box("4. Fate Line: Self-Made Sovereign Path", palm_interp.get("fate_line", "Rises cleanly, confirming self-constructed destiny and public engagement rather than inherited comfort."))
        
        t2_layout = Table([[b_heart, b_life], [Spacer(1,5), Spacer(1,5)], [b_head, b_fate]], colWidths=[3.75*inch, 3.75*inch])
        Story.append(t2_layout)
        Story.append(PageBreak())
        
        # ==========================================
        # TOPIC 3: PLANETARY MOUNTS
        # ==========================================
        Story.append(self._draw_topic_header("TOPIC 3: PLANETARY MOUNTS & TOPOGRAPHICAL ENERGIES"))
        Story.append(Paragraph("Planetary mounts act as physiological energy capacitors reflecting neural wiring and behavioral predispositions across distinct life spheres.", self.s_normal))
        Story.append(Spacer(1, 10))
        
        mount_data = [
            [Paragraph("Mount / Marking", self.s_table_head), Paragraph("Elevation & Density", self.s_table_head), Paragraph("Associated Archetype", self.s_table_head), Paragraph("Psychological & Manifest Expression", self.s_table_head)],
            [Paragraph("<b>Mount of Jupiter</b><br/><i>BENEATH INDEX</i>", self.s_table_body), Paragraph("Prominent, firm", self.s_table_body), Paragraph("The Sovereign / Mentor", self.s_table_body), Paragraph("Innate executive ambition, ethical leadership drive, natural inclination toward philosophical teaching.", self.s_table_body)],
            [Paragraph("<b>Mount of Saturn</b><br/><i>BENEATH MIDDLE</i>", self.s_table_body), Paragraph("Moderate, centered", self.s_table_body), Paragraph("The Architect / Sage", self.s_table_body), Paragraph("Deep comfort with solitary technical focus, patience for iterative mastery, karmic fortitude.", self.s_table_body)],
            [Paragraph("<b>Mount of Apollo (Sun)</b><br/><i>BENEATH RING</i>", self.s_table_body), Paragraph("High, radiant apex", self.s_table_body), Paragraph("The Creator / Luminary", self.s_table_body), Paragraph("Aesthetic discernment, yearning for recognized distinction, charisma, and warmth.", self.s_table_body)],
            [Paragraph("<b>Mount of Mercury</b><br/><i>BENEATH LITTLE</i>", self.s_table_body), Paragraph("Pronounced", self.s_table_body), Paragraph("The Alchemist / Messenger", self.s_table_body), Paragraph("Exceptional verbal and written eloquence, commercial acuity, rapid negotiation capacity.", self.s_table_body)],
            [Paragraph("<b>Plain of Mars</b><br/><i>PALM CENTER</i>", self.s_table_body), Paragraph("Firm, unyielding", self.s_table_body), Paragraph("The Spiritual Warrior", self.s_table_body), Paragraph("High moral courage, emotional grit when confronted with institutional friction.", self.s_table_body)],
            [Paragraph("<b>Mount of Moon (Luna)</b><br/><i>LOWER PERCUSSION</i>", self.s_table_body), Paragraph("Expansive, soft", self.s_table_body), Paragraph("The Mystic / Seer", self.s_table_body), Paragraph("Deep psychological intuition, strong love for travel, and attunement to subconscious shifts.", self.s_table_body)]
        ]
        
        t3_layout = Table(mount_data, colWidths=[1.5*inch, 1.2*inch, 1.5*inch, 3.3*inch])
        t3_layout.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), HEADER_BG),
            ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('INNERGRID', (0,0), (-1,-1), 0.5, BORDER_LIGHT),
            ('BOX', (0,0), (-1,-1), 0.5, BORDER_LIGHT),
            ('PADDING', (0,0), (-1,-1), 6)
        ]))
        Story.append(t3_layout)
        Story.append(Spacer(1, 15))
        
        # ==========================================
        # TOPIC 4: ESOTERIC MICRO-SIGNATURES
        # ==========================================
        Story.append(self._draw_topic_header("TOPIC 4: ESOTERIC MICRO-SIGNATURES, DERMATOGLYPHICS & RASCETTES"))
        Story.append(Paragraph("Micro-formations within the dermal ridges and auxiliary lines provide specialized insight into inherited gifts, karmic protections, and energetic vitality.", self.s_normal))
        Story.append(Spacer(1, 10))
        
        b_sol = make_line_box("1. Ring of Solomon", "A distinct semicircular crescent curving under Jupiter. Confers genuine intuitive psychological perception and natural esoteric authority.", 2.3*inch)
        b_croix = make_line_box("2. La Croix Mystique", "An independent cross isolated between Heart and Head lines. Acts as an active bridge between rational linear intellect and sixth-sense divination.", 2.3*inch)
        b_trident = make_line_box("3. Royal Tridents", "Triple-branch apex crowning the Sun line. Indicates tri-fold success: financial stability, intellectual legacy, and public creative acclaim.", 2.3*inch)
        
        t4_top = Table([[b_sol, '', b_croix, '', b_trident]], colWidths=[2.4*inch, 0.1*inch, 2.4*inch, 0.1*inch, 2.4*inch], style=TableStyle([('PADDING', (0,0), (-1,-1), 0)]))
        Story.append(t4_top)
        Story.append(Spacer(1, 5))
        
        b_derma = Table([[Paragraph("Dermatoglyphic Loops & Triradii", self.s_h2)], [Paragraph("High loop patterns denote fluid adaptability and creative dexterity, while a composite whorl on the thumb confirms intense self-determination and executive autonomy.", self.s_normal)]], colWidths=[3.7*inch], style=TableStyle([('BOX', (0,0), (-1,-1), 0.5, BORDER_GOLD), ('BACKGROUND', (0,0), (-1,-1), BOX_BG), ('PADDING', (0,0), (-1,-1), 8)]))
        b_rasc = Table([[Paragraph("The Three Hermetic Wrist Rascettes", self.s_h2)], [Paragraph("The wrist displays well-defined Rascettes of Hermes. The top guarantees longevity; the second guarantees sustainable material wealth; the third confirms generational legacy.", self.s_normal)]], colWidths=[3.7*inch], style=TableStyle([('BOX', (0,0), (-1,-1), 0.5, BORDER_LIGHT), ('BACKGROUND', (0,0), (-1,-1), BOX_BG), ('PADDING', (0,0), (-1,-1), 8)]))
        
        t4_bot = Table([[b_derma, b_rasc]], colWidths=[3.75*inch, 3.75*inch])
        Story.append(t4_bot)
        Story.append(PageBreak())
        
        # ==========================================
        # TOPIC 5: DYNAMIC 5-CARD TAROT SPREAD
        # ==========================================
        Story.append(self._draw_topic_header("TOPIC 5: DYNAMIC TAROT ARCHETYPAL SPREAD"))
        Story.append(Paragraph("While chiromancy reveals the structural vessel built over lifetimes, Tarot captures the fluid energetic currents vibrating through the querent's immediate temporal sphere.", self.s_normal))
        Story.append(Spacer(1, 10))
        
        tarot_row = []
        tarot_desc = []
        if hasattr(reading, 'tarot_reading') and reading.tarot_reading and reading.tarot_reading.cards.exists():
            cards = list(reading.tarot_reading.cards.all())
            col_w = 7.5*inch / max(len(cards), 1)
            for c in cards:
                img = self._get_url_image(c.card.image_url, 1.5*inch, 2.5*inch)
                if not img: img = Paragraph("[Card Image]", self.s_normal)
                tarot_row.append(img)
                meaning = c.card.upright_meaning if c.orientation == 'upright' else c.card.reversed_meaning
                tarot_desc.append(
                    Table([
                        [Paragraph(f"<b>{c.card.name} ({c.orientation})</b>", self.s_bold)],
                        [Paragraph(meaning[:150] + "...", self.s_small)]
                    ], colWidths=[col_w-0.1*inch])
                )
            
            t5_img = Table([tarot_row], colWidths=[col_w]*len(cards))
            t5_img.setStyle(TableStyle([('ALIGN', (0,0), (-1,-1), 'CENTER'), ('BOX', (0,0), (-1,-1), 0.5, BORDER_LIGHT), ('BACKGROUND', (0,0), (-1,-1), BOX_BG), ('PADDING', (0,0), (-1,-1), 10)]))
            Story.append(t5_img)
            Story.append(Spacer(1, 5))
            t5_txt = Table([tarot_desc], colWidths=[col_w]*len(cards))
            t5_txt.setStyle(TableStyle([('ALIGN', (0,0), (-1,-1), 'LEFT'), ('VALIGN', (0,0), (-1,-1), 'TOP')]))
            Story.append(t5_txt)
        else:
            Story.append(Paragraph("No Tarot spread generated for this reading.", self.s_italic))
            
        Story.append(Spacer(1, 15))
        
        # ==========================================
        # TOPIC 6: ELEMENTAL DIGNITIES & SPREAD POLARITIES
        # ==========================================
        Story.append(self._draw_topic_header("TOPIC 6: ELEMENTAL DIGNITIES & SPREAD POLARITIES"))
        Story.append(Paragraph("The interaction between the elemental suites (Wands/Fire, Cups/Water, Swords/Air, Pentacles/Earth) establishes the energetic equilibrium of the reading.", self.s_normal))
        Story.append(Spacer(1, 10))
        
        pers = self._safe_dict(syn.get("personality", {}))
        
        b_dig1 = make_line_box("Internal Polarity", pers.get("mind", "Analytical and structured, seeking balance between intuitive feeling and strict intellectual discipline."))
        b_dig2 = make_line_box("External Synthesis", pers.get("action", "Deliberate and calculated external action, showing a harmonious integration of fire (will) and earth (manifestation)."))
        
        Story.append(Table([[b_dig1, '', b_dig2]], colWidths=[3.65*inch, 0.2*inch, 3.65*inch], style=TableStyle([('PADDING', (0,0), (-1,-1), 0)])))
        
        Story.append(Spacer(1, 5))
        b_syn = Table([[Paragraph(f"<b>Spread Synthesis:</b> A classic alignment. The foundation feeds raw intuition into the rigorous workshop of daily execution, while dissolving old structures to crown the querent with inspired clarity.", self.s_italic)]], colWidths=[7.5*inch], style=TableStyle([('BOX', (0,0), (-1,-1), 0.5, BORDER_GOLD), ('BACKGROUND', (0,0), (-1,-1), HexColor("#FDF8E7")), ('PADDING', (0,0), (-1,-1), 10)]))
        Story.append(b_syn)
        Story.append(Spacer(1, 15))
        
        # ==========================================
        # TOPIC 7: PALM-TO-TAROT CROSS-DISCIPLINARY SYNTHESIS
        # ==========================================
        Story.append(self._draw_topic_header("TOPIC 7: PALM-TO-TAROT CROSS-DISCIPLINARY SYNTHESIS MATRIX"))
        Story.append(Paragraph("The true power of this reading emerges at the exact crossroads where somatic palm formations correlate directly with Tarot archetypal stations.", self.s_normal))
        Story.append(Spacer(1, 10))
        
        matrix_data = [
            [Paragraph("Palm Indicator", self.s_table_head), Paragraph("Tarot Archetype", self.s_table_head), Paragraph("Esoteric Principle", self.s_table_head), Paragraph("Manifest Reality & Forecast", self.s_table_head)],
            [Paragraph("<b>Dominant Mount of Moon & Intuition Line</b>", self.s_table_body), Paragraph("The High Priestess (II)", self.s_table_body), Paragraph("Gnosis & Subconscious Blueprint", self.s_table_body), Paragraph("Uncanny prophetic intuition and strategic forethought; trusting gut feelings.", self.s_table_body)],
            [Paragraph("<b>Clear Break & Ascending Fate Line</b>", self.s_table_body), Paragraph("Wheel of Fortune (X)", self.s_table_body), Paragraph("Cyclical Evolution & Pivot", self.s_table_body), Paragraph("A scheduled career restructuring that aligns the outer vocation directly with long-term spiritual sovereignty.", self.s_table_body)],
            [Paragraph("<b>Straight Head Line into Upper Mars</b>", self.s_table_body), Paragraph("8 of Pentacles & Emperor", self.s_table_body), Paragraph("Systematic Craft & Execution", self.s_table_body), Paragraph("Capacity to manage complex technical architectures and turn abstract visions into commercially viable systems.", self.s_table_body)]
        ]
        
        t7_layout = Table(matrix_data, colWidths=[1.8*inch, 1.8*inch, 1.5*inch, 2.4*inch])
        t7_layout.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), HEADER_BG),
            ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('INNERGRID', (0,0), (-1,-1), 0.5, BORDER_LIGHT),
            ('BOX', (0,0), (-1,-1), 0.5, BORDER_LIGHT),
            ('PADDING', (0,0), (-1,-1), 6)
        ]))
        Story.append(t7_layout)
        Story.append(PageBreak())
        
        # ==========================================
        # TOPIC 8: CHRONOLOGICAL LIFE VECTOR
        # ==========================================
        Story.append(self._draw_topic_header("TOPIC 8: CHRONOLOGICAL LIFE VECTOR MAPPING (AGES 18 TO 50+)"))
        Story.append(Paragraph("By mapping the chronological divisions of the Fate and Life lines alongside major Tarot cycle arcana, we delineate key milestone phases.", self.s_normal))
        Story.append(Spacer(1, 10))
        
        life = self._safe_dict(syn.get("life_path", {}))
        
        p1 = make_line_box("Phase I: Foundation & Incubation", "A period of intensive learning, internal calibration, absorption of multi-disciplinary knowledge, and deep psychic maturation.")
        p2 = make_line_box("Phase II: The Crucible & Pivot", "Rapid acceleration, high-stakes structural decisions, and the forging of true technical sovereignty.")
        p3 = make_line_box("Phase III: Sovereign Mastery", life.get("life_line_reflection", "Represented by The Emperor. Complete autonomy over professional direction, establishing proprietary enterprises."))
        p4 = make_line_box("Phase IV: Illuminator Legacy", life.get("fate_line_reflection", "Corresponds to The Star. A radiant epoch focused on philosophical writing, broad cultural contributions, and serene personal fulfillment."))
        
        Story.append(Table([[p1, p3], [Spacer(1,5), Spacer(1,5)], [p2, p4]], colWidths=[3.75*inch, 3.75*inch]))
        Story.append(Spacer(1, 15))
        
        # ==========================================
        # TOPIC 9: ASTRO-KABBALISTIC
        # ==========================================
        Story.append(self._draw_topic_header("TOPIC 9: ASTRO-KABBALISTIC & NUMEROLOGICAL COORDINATES"))
        Story.append(Paragraph("Hermetic astrology and Pythagorean numerology provide exact mathematical coordinates anchoring the querent's subtle energetic field.", self.s_normal))
        Story.append(Spacer(1, 10))
        
        b_astro = make_line_box("A. Astrological & Kabbalistic Coordinates", "<b>Primary Planetary Rulers:</b> Mercury (Mind) & Jupiter (Expansion).<br/><b>Zodiacal Polarity:</b> Virgo Precision vs Pisces Vision.<br/><b>Tree of Life Path:</b> Path 13 and Path 28.<br/><b>Chakra Alignment:</b> Ajna (Third Eye) active.")
        b_num = make_line_box("B. Pythagorean & Hermetic Numerology", "<b>Destiny Number:</b> 8 (Octave of Mastery & Karma).<br/><b>Soul Urge:</b> 7 (Hermit's Search for Truth).<br/><b>Year Vibration:</b> 1 (New 9-Year Cycle: Bold initiative).")
        
        Story.append(Table([[b_astro, b_num]], colWidths=[3.75*inch, 3.75*inch]))
        Story.append(Spacer(1, 15))
        
        # ==========================================
        # TOPIC 10: HOLISTIC REMEDIAL PROTOCOLS
        # ==========================================
        Story.append(self._draw_topic_header("TOPIC 10: HOLISTIC REMEDIAL PROTOCOLS & PRESCRIPTIONS"))
        Story.append(Paragraph("Practical energetic prescriptions to harmonize planetary excess, support nervous system vitality, and accelerate manifest potential.", self.s_normal))
        Story.append(Spacer(1, 10))
        
        act = self._safe_dict(syn.get("action_plan", {}))
        
        b_litho = make_line_box("1. Lithotherapy (Gems)", "<b>Lapis Lazuli / Sapphire:</b> Worn on right Jupiter finger to align executive power with truth.<br/><b>Labradorite:</b> Shield the Luna mount.", 2.3*inch)
        b_mental = make_line_box("2. Daily Mental Regimen", f"<b>Hermetic Work Blocks:</b> 90-min deep work.<br/><b>Focus:</b> {act.get('today', '15 mins of silence at dusk for subconscious integration.')}", 2.3*inch)
        b_ener = make_line_box("3. Energetic Alignment", "<b>Element:</b> Air & Earth Grounding.<br/><b>Affirmation:</b> 'My mind is clear, my hands are skilled, and I align effortlessly with my destiny.'", 2.3*inch)
        
        Story.append(Table([[b_litho, b_mental, b_ener]], colWidths=[2.5*inch, 2.5*inch, 2.5*inch]))
        Story.append(Spacer(1, 15))
        
        # ==========================================
        # TOPIC 11: 12-MONTH STRATEGIC MILESTONE ROADMAP
        # ==========================================
        Story.append(self._draw_topic_header("TOPIC 11: 12-MONTH STRATEGIC MILESTONE ROADMAP"))
        Story.append(Paragraph("A structured quarterly operational blueprint aligning professional milestones with the prevailing Tarot and palmistry energetic cycles.", self.s_normal))
        Story.append(Spacer(1, 10))
        
        pg = self._safe_dict(syn.get("personal_growth", {}))
        q1_obj = pg.get("actions", ["Internal R&D, structural redesign"])[0] if "actions" in pg and len(pg["actions"]) > 0 else "Internal R&D, structural redesign"
        
        road_data = [
            [Paragraph("Quarter", self.s_table_head), Paragraph("Tarot Archetype", self.s_table_head), Paragraph("Primary Operational Objective", self.s_table_head), Paragraph("Expected Breakthrough & Outcome", self.s_table_head)],
            [Paragraph("<b>Q1</b>", self.s_table_body), Paragraph("The High Priestess", self.s_italic), Paragraph(q1_obj, self.s_table_body), Paragraph("Elimination of non-essential noise; blueprint clarity established.", self.s_table_body)],
            [Paragraph("<b>Q2</b>", self.s_table_body), Paragraph("Eight of Pentacles", self.s_italic), Paragraph(act.get("this_month", "Relentless execution, technical testing, refinement."), self.s_table_body), Paragraph("Creation of undeniable, market-leading quality systems.", self.s_table_body)],
            [Paragraph("<b>Q3</b>", self.s_table_body), Paragraph("Wheel of Fortune", self.s_italic), Paragraph("Public launch, negotiation of alliances, strategic deployment.", self.s_table_body), Paragraph("Rapid scaling and favorable alignment of key synchronistic partners.", self.s_table_body)],
            [Paragraph("<b>Q4</b>", self.s_table_body), Paragraph("The Emperor & The Star", self.s_italic), Paragraph("Institutional governance, leadership delegation, recognition.", self.s_table_body), Paragraph("Solidification of sovereign authority and broad industry esteem.", self.s_table_body)]
        ]
        
        t11_layout = Table(road_data, colWidths=[0.8*inch, 1.7*inch, 2.5*inch, 2.5*inch])
        t11_layout.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), HEADER_BG),
            ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('INNERGRID', (0,0), (-1,-1), 0.5, BORDER_LIGHT),
            ('BOX', (0,0), (-1,-1), 0.5, BORDER_LIGHT),
            ('PADDING', (0,0), (-1,-1), 8)
        ]))
        Story.append(t11_layout)
        Story.append(Spacer(1, 15))
        
        b_footer = Table([[Paragraph(f"<b>End of Report • Hermetically Sealed & Synthesized for Reader</b>", self.s_bold)]], colWidths=[7.5*inch], style=TableStyle([('BOX', (0,0), (-1,-1), 0.5, BORDER_GOLD), ('BACKGROUND', (0,0), (-1,-1), HexColor("#FDF8E7")), ('ALIGN', (0,0), (-1,-1), 'CENTER'), ('PADDING', (0,0), (-1,-1), 10)]))
        Story.append(b_footer)

        doc.build(Story, onFirstPage=draw_background, onLaterPages=draw_background)
        return f"/media/reports/{filename}"

pdf_service = PDFService()
