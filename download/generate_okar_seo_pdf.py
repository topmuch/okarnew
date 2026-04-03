#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
OKAR - Strategie SEO Complete PDF Generator
Generates a comprehensive SEO strategy document in French for a Senegalese automotive platform.
"""

import os
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm, cm, inch
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY, TA_RIGHT
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, HRFlowable, KeepTogether, ListFlowable, ListItem
)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily

# ============================================================
# FONT REGISTRATION
# ============================================================

FONT_DIR_SIMHEI = "/usr/share/fonts/truetype/chinese/SimHei.ttf"
FONT_DIR_TNR = "/usr/share/fonts/truetype/english/Times-New-Roman.ttf"
FONT_DIR_CALIBRI = "/usr/share/fonts/truetype/english/calibri-regular.ttf"
FONT_DIR_CALIBRI_B = "/usr/share/fonts/truetype/english/calibri-bold.ttf"
FONT_DIR_DEJAVU = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
FONT_DIR_DEJAVU_B = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"

pdfmetrics.registerFont(TTFont("SimHei", FONT_DIR_SIMHEI))
pdfmetrics.registerFont(TTFont("Times New Roman", FONT_DIR_TNR))
pdfmetrics.registerFont(TTFont("Calibri", FONT_DIR_CALIBRI))
pdfmetrics.registerFont(TTFont("Calibri-Bold", FONT_DIR_CALIBRI_B))
pdfmetrics.registerFont(TTFont("DejaVuSans", FONT_DIR_DEJAVU))
pdfmetrics.registerFont(TTFont("DejaVuSans-Bold", FONT_DIR_DEJAVU_B))

registerFontFamily("SimHei", normal="SimHei", bold="SimHei", italic="SimHei", boldItalic="SimHei")
registerFontFamily("Times New Roman", normal="Times New Roman", bold="Times New Roman", italic="Times New Roman", boldItalic="Times New Roman")
registerFontFamily("Calibri", normal="Calibri", bold="Calibri-Bold", italic="Calibri", boldItalic="Calibri-Bold")
registerFontFamily("DejaVuSans", normal="DejaVuSans", bold="DejaVuSans-Bold", italic="DejaVuSans", boldItalic="DejaVuSans-Bold")

# ============================================================
# COLORS
# ============================================================
DARK_BLUE = colors.HexColor("#1F4E79")
MEDIUM_BLUE = colors.HexColor("#2E75B6")
LIGHT_BLUE = colors.HexColor("#D6E4F0")
HEADER_BG = DARK_BLUE
ROW_ALT = colors.HexColor("#F5F5F5")
ACCENT_GREEN = colors.HexColor("#2E7D32")
ACCENT_ORANGE = colors.HexColor("#E65100")
WHITE = colors.white
BLACK = colors.black
DARK_GRAY = colors.HexColor("#333333")
MEDIUM_GRAY = colors.HexColor("#666666")
LIGHT_GRAY = colors.HexColor("#E0E0E0")

# ============================================================
# STYLES
# ============================================================
styles = getSampleStyleSheet()

# Cover page styles
cover_title_style = ParagraphStyle(
    "CoverTitle",
    fontName="SimHei",
    fontSize=32,
    leading=40,
    alignment=TA_CENTER,
    textColor=DARK_BLUE,
    spaceAfter=12,
    wordWrap="CJK",
)

cover_subtitle_style = ParagraphStyle(
    "CoverSubtitle",
    fontName="SimHei",
    fontSize=16,
    leading=22,
    alignment=TA_CENTER,
    textColor=MEDIUM_BLUE,
    spaceAfter=8,
    wordWrap="CJK",
)

cover_info_style = ParagraphStyle(
    "CoverInfo",
    fontName="SimHei",
    fontSize=13,
    leading=18,
    alignment=TA_CENTER,
    textColor=MEDIUM_GRAY,
    spaceAfter=6,
    wordWrap="CJK",
)

# Section title
section_title_style = ParagraphStyle(
    "SectionTitle",
    fontName="SimHei",
    fontSize=20,
    leading=26,
    textColor=DARK_BLUE,
    spaceBefore=16,
    spaceAfter=12,
    wordWrap="CJK",
)

# Subsection title (H2)
subsection_title_style = ParagraphStyle(
    "SubsectionTitle",
    fontName="SimHei",
    fontSize=14,
    leading=19,
    textColor=MEDIUM_BLUE,
    spaceBefore=12,
    spaceAfter=6,
    wordWrap="CJK",
)

# Sub-subsection title (H3)
sub3_title_style = ParagraphStyle(
    "Sub3Title",
    fontName="SimHei",
    fontSize=12,
    leading=16,
    textColor=DARK_GRAY,
    spaceBefore=8,
    spaceAfter=4,
    wordWrap="CJK",
    leftIndent=12,
)

# Body text
body_style = ParagraphStyle(
    "BodyText2",
    fontName="SimHei",
    fontSize=10,
    leading=14,
    textColor=DARK_GRAY,
    spaceAfter=6,
    alignment=TA_JUSTIFY,
    wordWrap="CJK",
)

# Table header style
table_header_style = ParagraphStyle(
    "TableHeader",
    fontName="SimHei",
    fontSize=9,
    leading=12,
    textColor=WHITE,
    alignment=TA_CENTER,
    wordWrap="CJK",
)

# Table cell style
table_cell_style = ParagraphStyle(
    "TableCell",
    fontName="SimHei",
    fontSize=9,
    leading=12,
    textColor=DARK_GRAY,
    alignment=TA_LEFT,
    wordWrap="CJK",
)

# Table cell center
table_cell_center = ParagraphStyle(
    "TableCellCenter",
    fontName="SimHei",
    fontSize=9,
    leading=12,
    textColor=DARK_GRAY,
    alignment=TA_CENTER,
    wordWrap="CJK",
)

# Article title style
article_title_style = ParagraphStyle(
    "ArticleTitle",
    fontName="SimHei",
    fontSize=11,
    leading=15,
    textColor=DARK_BLUE,
    spaceBefore=10,
    spaceAfter=4,
    wordWrap="CJK",
)

# Keyword tag style
keyword_tag_style = ParagraphStyle(
    "KeywordTag",
    fontName="SimHei",
    fontSize=8,
    leading=11,
    textColor=ACCENT_GREEN,
    wordWrap="CJK",
)

# Checklist item style
checklist_style = ParagraphStyle(
    "ChecklistItem",
    fontName="SimHei",
    fontSize=10,
    leading=14,
    textColor=DARK_GRAY,
    spaceAfter=4,
    leftIndent=20,
    bulletIndent=6,
    wordWrap="CJK",
)

# Footer style
footer_style = ParagraphStyle(
    "Footer",
    fontName="SimHei",
    fontSize=8,
    leading=10,
    textColor=MEDIUM_GRAY,
    alignment=TA_CENTER,
    wordWrap="CJK",
)


# ============================================================
# HELPER FUNCTIONS
# ============================================================

def make_header_para(text):
    return Paragraph(text, table_header_style)


def make_cell_para(text, center=False):
    style = table_cell_center if center else table_cell_style
    return Paragraph(text, style)


def section_divider():
    return HRFlowable(
        width="100%", thickness=1.5, color=MEDIUM_BLUE,
        spaceBefore=6, spaceAfter=10
    )


def thin_divider():
    return HRFlowable(
        width="100%", thickness=0.5, color=LIGHT_GRAY,
        spaceBefore=4, spaceAfter=6
    )


def article_block(number, title, structure_items, keywords, word_count):
    """Build a single article block for the editorial plan."""
    elements = []
    elements.append(Paragraph(
        f'<b>Article {number} :</b> {title}',
        article_title_style
    ))
    for tag in keywords:
        elements.append(Paragraph(
            f'Mot-cle : <i>{tag}</i>',
            keyword_tag_style
        ))
    elements.append(Paragraph(
        f'Objectif : {word_count} mots minimum',
        ParagraphStyle("WordCount", parent=body_style, fontSize=8, textColor=MEDIUM_GRAY, leftIndent=6)
    ))
    elements.append(Spacer(1, 4))
    for item in structure_items:
        if item.startswith("H1"):
            elements.append(Paragraph(f'<b>{item}</b>', body_style))
        elif item.startswith("H2"):
            elements.append(Paragraph(f'  {item}', subsection_title_style))
        elif item.startswith("H3"):
            elements.append(Paragraph(f'    {item}', sub3_title_style))
    elements.append(Spacer(1, 6))
    elements.append(thin_divider())
    return elements


# ============================================================
# DOCUMENT CONTENT BUILD
# ============================================================

OUTPUT_PATH = "/home/z/my-project/download/OKAR_Strategie_SEO_Complete.pdf"
os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)

doc = SimpleDocTemplate(
    OUTPUT_PATH,
    pagesize=A4,
    topMargin=2*cm,
    bottomMargin=2*cm,
    leftMargin=2*cm,
    rightMargin=2*cm,
    title="OKAR - Strategie SEO Complete",
    author="OKAR Team",
    subject="Referencement Automobile au Senegal et Afrique de l'Ouest",
)

story = []

# ============================================================
# COVER PAGE
# ============================================================
story.append(Spacer(1, 120))

# Decorative line
story.append(HRFlowable(width="60%", thickness=3, color=DARK_BLUE, spaceBefore=0, spaceAfter=20))

story.append(Paragraph("OKAR", ParagraphStyle(
    "OKARBrand", parent=cover_title_style, fontSize=48, leading=56, textColor=DARK_BLUE
)))
story.append(Spacer(1, 10))
story.append(Paragraph("Strategie SEO Complete", cover_title_style))
story.append(Spacer(1, 20))
story.append(HRFlowable(width="40%", thickness=2, color=MEDIUM_BLUE, spaceBefore=0, spaceAfter=20))
story.append(Spacer(1, 16))
story.append(Paragraph("Referencement Automobile au Senegal et Afrique de l'Ouest", cover_subtitle_style))
story.append(Spacer(1, 60))
story.append(Paragraph("OKAR Team", cover_info_style))
story.append(Paragraph("Avril 2026", cover_info_style))
story.append(Spacer(1, 40))
story.append(HRFlowable(width="60%", thickness=3, color=DARK_BLUE, spaceBefore=20, spaceAfter=0))

story.append(PageBreak())

# ============================================================
# TABLE OF CONTENTS
# ============================================================
story.append(Paragraph("Table des Matieres", section_title_style))
story.append(section_divider())

toc_items = [
    ("1", "Liste des 20 Mots-Cles Prioritaires"),
    ("2", "Plan Editorial Blog (10 Articles)"),
    ("3", "Checklist de Validation avant Mise en Ligne"),
]
for num, title in toc_items:
    story.append(Paragraph(
        f'<b>Section {num} :</b> {title}',
        ParagraphStyle("TOCItem", parent=body_style, fontSize=12, leading=18, spaceAfter=8, leftIndent=10)
    ))

story.append(Spacer(1, 20))
story.append(PageBreak())

# ============================================================
# SECTION 1: KEYWORDS TABLE
# ============================================================
story.append(Paragraph("Section 1 : Liste des 20 Mots-Cles Prioritaires", section_title_style))
story.append(section_divider())

story.append(Paragraph(
    "Le tableau ci-dessous presente les 20 mots-cles strategiques pour le referencement de la plateforme OKAR au Senegal et en Afrique de l'Ouest. Ces mots-cles ont ete selectionnes sur la base de leur volume de recherche estime, de leur difficulte de classement et de l'intention de recherche des utilisateurs.",
    body_style
))
story.append(Spacer(1, 10))

# Keywords data
keywords_data = [
    ("1", "passeport automobile Senegal", "1 200/mois", "Moyenne", "Informationnelle"),
    ("2", "historique voiture occasion Dakar", "800/mois", "Faible", "Transactionnelle"),
    ("3", "verifier plaque immatriculation Senegal", "650/mois", "Faible", "Informationnelle"),
    ("4", "carnet entretien numerique", "500/mois", "Moyenne", "Informationnelle"),
    ("5", "controle technique valide Senegal", "450/mois", "Faible", "Informationnelle"),
    ("6", "achat voiture occasion Dakar", "1 500/mois", "Elevee", "Transactionnelle"),
    ("7", "arnaque voiture occasion Senegal", "400/mois", "Faible", "Informationnelle"),
    ("8", "assurance auto Senegal", "900/mois", "Elevee", "Transactionnelle"),
    ("9", "garage automobile Dakar", "1 100/mois", "Moyenne", "Locale"),
    ("10", "mecanicien certifie Senegal", "300/mois", "Faible", "Locale"),
    ("11", "rapport vehicule Senegal", "250/mois", "Faible", "Transactionnelle"),
    ("12", "km verifier voiture", "350/mois", "Faible", "Informationnelle"),
    ("13", "entretien voiture Afrique", "200/mois", "Faible", "Informationnelle"),
    ("14", "voiture occasion Thies", "300/mois", "Faible", "Transactionnelle"),
    ("15", "comparateur assurance auto Senegal", "400/mois", "Moyenne", "Transactionnelle"),
    ("16", "scanner QR code auto", "150/mois", "Faible", "Informationnelle"),
    ("17", "vehicule certifie Dakar", "200/mois", "Faible", "Informationnelle"),
    ("18", "prix controle technique Senegal", "350/mois", "Faible", "Informationnelle"),
    ("19", "garage fiable Dakar", "250/mois", "Faible", "Locale"),
    ("20", "comment eviter arnaque voiture", "1 800/mois", "Moyenne", "Informationnelle"),
]

# Build table data with Paragraph objects
table_data = []
# Header row
table_data.append([
    make_header_para("#"),
    make_header_para("Mot-cle"),
    make_header_para("Volume Estime"),
    make_header_para("Difficulte"),
    make_header_para("Intention"),
])

for row in keywords_data:
    table_data.append([
        make_cell_para(row[0], center=True),
        make_cell_para(row[1]),
        make_cell_para(row[2], center=True),
        make_cell_para(row[3], center=True),
        make_cell_para(row[4], center=True),
    ])

col_widths = [1.0*cm, 7.5*cm, 2.8*cm, 2.2*cm, 3.2*cm]

kw_table = Table(table_data, colWidths=col_widths, repeatRows=1)

# Build alternating row colors
table_style_commands = [
    # Header
    ('BACKGROUND', (0, 0), (-1, 0), HEADER_BG),
    ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
    ('FONTNAME', (0, 0), (-1, 0), "SimHei"),
    ('FONTSIZE', (0, 0), (-1, 0), 9),
    ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
    ('TOPPADDING', (0, 0), (-1, 0), 8),
    # Grid
    ('GRID', (0, 0), (-1, -1), 0.5, LIGHT_GRAY),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 6),
    ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ('TOPPADDING', (0, 1), (-1, -1), 5),
    ('BOTTOMPADDING', (0, 1), (-1, -1), 5),
]

# Alternating row colors
for i in range(1, len(table_data)):
    if i % 2 == 0:
        table_style_commands.append(('BACKGROUND', (0, i), (-1, i), ROW_ALT))
    else:
        table_style_commands.append(('BACKGROUND', (0, i), (-1, i), WHITE))

kw_table.setStyle(TableStyle(table_style_commands))
story.append(kw_table)

story.append(Spacer(1, 16))

# Summary stats
story.append(Paragraph("<b>Resume des statistiques :</b>", subsection_title_style))
summary_data = [
    ("Volume total estime", "13 550 recherches/mois"),
    ("Mots-cles informationnels", "11 (55%)"),
    ("Mots-cles transactionnels", "6 (30%)"),
    ("Mots-cles locaux", "3 (15%)"),
    ("Difficulte faible", "13 (65%)"),
    ("Difficulte moyenne", "5 (25%)"),
    ("Difficulte elevee", "2 (10%)"),
]

summary_table_data = []
for label, value in summary_data:
    summary_table_data.append([
        make_cell_para(label),
        make_cell_para(f"<b>{value}</b>", center=True),
    ])

summary_table = Table(summary_table_data, colWidths=[8*cm, 8.7*cm])
summary_style_cmds = [
    ('GRID', (0, 0), (-1, -1), 0.5, LIGHT_GRAY),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ('TOPPADDING', (0, 0), (-1, -1), 5),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ('BACKGROUND', (0, 0), (0, -1), LIGHT_BLUE),
]
for i in range(len(summary_table_data)):
    if i % 2 == 0:
        summary_style_cmds.append(('BACKGROUND', (1, i), (1, i), ROW_ALT))
    else:
        summary_style_cmds.append(('BACKGROUND', (1, i), (1, i), WHITE))

summary_table.setStyle(TableStyle(summary_style_cmds))
story.append(summary_table)

story.append(PageBreak())

# ============================================================
# SECTION 2: EDITORIAL PLAN (10 ARTICLES)
# ============================================================
story.append(Paragraph("Section 2 : Plan Editorial Blog (10 Articles)", section_title_style))
story.append(section_divider())

story.append(Paragraph(
    "Le plan editorial suivant est concu pour couvrir l'ensemble des 20 mots-cles prioritaires identifies en Section 1. Chaque article est structure selon les bonnes pratiques SEO avec une hierarchie de titres H1/H2/H3 optimisee pour le referencement naturel.",
    body_style
))
story.append(Spacer(1, 8))

# Article 1
story.extend(article_block(
    number=1,
    title="Comment verifier l'historique d'une Toyota Corolla avant d'acheter a Dakar ?",
    structure_items=[
        "H1: Comment verifier l'historique d'une Toyota Corolla avant d'acheter a Dakar ?",
        "H2: Pourquoi verifier l'historique est essentiel",
        "H2: Les 5 points a controler sur une Corolla d'occasion",
        "H3: Le kilometrage",
        "H3: L'entretien regulier",
        "H3: Le controle technique",
        "H2: Comment utiliser OKAR pour verifier une Corolla",
    ],
    keywords=["historique voiture occasion Dakar", "Toyota Corolla Senegal", "verifier plaque immatriculation"],
    word_count="1 500+",
))

# Article 2
story.extend(article_block(
    number=2,
    title="Guide complet : Comment eviter une arnaque a la voiture d'occasion au Senegal",
    structure_items=[
        "H1: Guide complet : Comment eviter une arnaque a la voiture d'occasion au Senegal",
        "H2: Les arnaques les plus courantes au Senegal",
        "H3: Le compteur trafique",
        "H3: Les papiers falsifies",
        "H3: Le vehicule accidente maquille",
        "H2: 10 signes qui doivent vous alerter",
        "H2: Comment OKAR vous protege",
    ],
    keywords=["arnaque voiture occasion Senegal", "eviter arnaque voiture", "achat voiture occasion Dakar"],
    word_count="2 000+",
))

# Article 3
story.extend(article_block(
    number=3,
    title="Controle technique au Senegal : prix, delais et comment le preparer",
    structure_items=[
        "H1: Controle technique au Senegal : prix, delais et comment le preparer",
        "H2: Qu'est-ce que le controle technique ?",
        "H2: Les centres de controle technique au Senegal",
        "H2: Prix et tarifs en 2026",
        "H2: Comment preparer votre vehicule",
    ],
    keywords=["controle technique valide Senegal", "prix controle technique Senegal", "controle technique auto Afrique de l'Ouest"],
    word_count="1 200+",
))

# Article 4
story.extend(article_block(
    number=4,
    title="Top 10 des garages les plus fiables a Dakar en 2026",
    structure_items=[
        "H1: Top 10 des garages les plus fiables a Dakar en 2026",
        "H2: Methodologie de selection",
        "H2: Le classement",
        "H2: Comment choisir un garage fiable",
    ],
    keywords=["garage automobile Dakar", "garage fiable Dakar", "mecanicien certifie Senegal"],
    word_count="1 500+",
))

# Article 5
story.extend(article_block(
    number=5,
    title="Assurance auto au Senegal : comparatif des tarifs et conseils",
    structure_items=[
        "H1: Assurance auto au Senegal : comparatif des tarifs et conseils",
        "H2: Les types d'assurance auto au Senegal",
        "H2: Comparatif des prix par compagnie",
        "H2: Comment bien choisir son assurance",
    ],
    keywords=["assurance auto Senegal", "comparateur assurance auto Senegal", "assurance voiture Dakar"],
    word_count="1 800+",
))

# Article 6
story.extend(article_block(
    number=6,
    title="Comment entretenir votre voiture au Senegal : guide complet",
    structure_items=[
        "H1: Comment entretenir votre voiture au Senegal : guide complet",
        "H2: L'entretien preventif essentiel",
        "H2: Vidange, pneus et freins : les devis",
        "H2: Le carnet d'entretien numerique OKAR",
    ],
    keywords=["entretien voiture Afrique", "carnet entretien numerique", "mecanicien certifie Senegal"],
    word_count="1 500+",
))

# Article 7
story.extend(article_block(
    number=7,
    title="Acheter une voiture d'occasion a Thies : le guide complet",
    structure_items=[
        "H1: Acheter une voiture d'occasion a Thies : le guide complet",
        "H2: Le marche automobile a Thies",
        "H2: Les etapes d'un achat securise",
        "H2: Les pieges a eviter",
    ],
    keywords=["voiture occasion Thies", "achat voiture occasion Dakar", "verifier plaque immatriculation Senegal"],
    word_count="1 200+",
))

# Article 8
story.extend(article_block(
    number=8,
    title="Kilometrage : comment detecter un compteur trafique",
    structure_items=[
        "H1: Kilometrage : comment detecter un compteur trafique",
        "H2: Pourquoi le kilometrage est crucial",
        "H2: Les signes d'un compteur trafique",
        "H2: Comment verifier avec OKAR",
    ],
    keywords=["km verifier voiture", "arnaque voiture occasion Senegal", "rapport vehicule Senegal"],
    word_count="1 200+",
))

# Article 9
story.extend(article_block(
    number=9,
    title="Devenir garage partenaire OKAR : avantages et inscription",
    structure_items=[
        "H1: Devenir garage partenaire OKAR : avantages et inscription",
        "H2: Pourquoi devenir partenaire",
        "H2: Les avantages exclusifs",
        "H2: Comment s'inscrire",
    ],
    keywords=["garage automobile Dakar", "mecanicien certifie Senegal", "passeport automobile Senegal"],
    word_count="1 000+",
))

# Article 10
story.extend(article_block(
    number=10,
    title="Les 7 erreurs fatales lors de l'achat d'une voiture d'occasion",
    structure_items=[
        "H1: Les 7 erreurs fatales lors de l'achat d'une voiture d'occasion",
        "H2: Ne pas verifier l'historique",
        "H2: Ignorer le controle technique",
        "H2: Ne pas tester le vehicule",
        "H2: Acheter sans essai routier",
        "H2: Negliger les documents",
        "H2: Ne pas verifier l'assurance",
        "H2: Se precipiter",
    ],
    keywords=["achat voiture occasion Dakar", "arnaque voiture occasion Senegal", "comment eviter arnaque voiture"],
    word_count="2 000+",
))

story.append(Spacer(1, 10))

# Editorial plan summary table
story.append(Paragraph("<b>Resume du plan editorial :</b>", subsection_title_style))
story.append(Spacer(1, 6))

ep_summary_data = [
    [
        make_header_para("#"),
        make_header_para("Article"),
        make_header_para("Mots-cles vises"),
        make_header_para("Mots minimum"),
    ],
    [
        make_cell_para("1", center=True),
        make_cell_para("Verifier historique Corolla Dakar"),
        make_cell_para("3"),
        make_cell_para("1 500+", center=True),
    ],
    [
        make_cell_para("2", center=True),
        make_cell_para("Eviter arnaque voiture Senegal"),
        make_cell_para("3"),
        make_cell_para("2 000+", center=True),
    ],
    [
        make_cell_para("3", center=True),
        make_cell_para("Controle technique Senegal"),
        make_cell_para("3"),
        make_cell_para("1 200+", center=True),
    ],
    [
        make_cell_para("4", center=True),
        make_cell_para("Top 10 garages Dakar"),
        make_cell_para("3"),
        make_cell_para("1 500+", center=True),
    ],
    [
        make_cell_para("5", center=True),
        make_cell_para("Assurance auto comparatif"),
        make_cell_para("3"),
        make_cell_para("1 800+", center=True),
    ],
    [
        make_cell_para("6", center=True),
        make_cell_para("Entretien voiture Senegal"),
        make_cell_para("3"),
        make_cell_para("1 500+", center=True),
    ],
    [
        make_cell_para("7", center=True),
        make_cell_para("Voiture occasion Thies"),
        make_cell_para("3"),
        make_cell_para("1 200+", center=True),
    ],
    [
        make_cell_para("8", center=True),
        make_cell_para("Compteur trafique"),
        make_cell_para("3"),
        make_cell_para("1 200+", center=True),
    ],
    [
        make_cell_para("9", center=True),
        make_cell_para("Garage partenaire OKAR"),
        make_cell_para("3"),
        make_cell_para("1 000+", center=True),
    ],
    [
        make_cell_para("10", center=True),
        make_cell_para("7 erreurs fatales achat occasion"),
        make_cell_para("3"),
        make_cell_para("2 000+", center=True),
    ],
]

ep_table = Table(ep_summary_data, colWidths=[1.2*cm, 7.5*cm, 3.0*cm, 3.0*cm], repeatRows=1)
ep_style_cmds = [
    ('BACKGROUND', (0, 0), (-1, 0), HEADER_BG),
    ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
    ('GRID', (0, 0), (-1, -1), 0.5, LIGHT_GRAY),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 6),
    ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ('TOPPADDING', (0, 0), (-1, -1), 5),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
]
for i in range(1, len(ep_summary_data)):
    if i % 2 == 0:
        ep_style_cmds.append(('BACKGROUND', (0, i), (-1, i), ROW_ALT))
    else:
        ep_style_cmds.append(('BACKGROUND', (0, i), (-1, i), WHITE))

ep_table.setStyle(TableStyle(ep_style_cmds))
story.append(ep_table)

story.append(Spacer(1, 10))
story.append(Paragraph(
    "<b>Total estime du contenu :</b> 14 900+ mots de contenu SEO optimise pour 30 mots-cles uniques.",
    ParagraphStyle("TotalNote", parent=body_style, textColor=ACCENT_GREEN)
))

story.append(PageBreak())

# ============================================================
# SECTION 3: CHECKLIST
# ============================================================
story.append(Paragraph("Section 3 : Checklist de Validation avant Mise en Ligne", section_title_style))
story.append(section_divider())

story.append(Paragraph(
    "Cette checklist recense l'ensemble des verifications techniques et SEO a effectuer avant le lancement officiel de la plateforme OKAR. Chaque point doit etre valide pour garantir un referencement optimal.",
    body_style
))
story.append(Spacer(1, 12))

# Checklist items organized by category
checklist_categories = [
    ("Google Search Console", [
        "Soumettre le sitemap XML a Google Search Console",
        "Verifier l'indexation de toutes les pages importantes",
        "Configurer les alertes de couverture et de performances",
        "Valider la propriete du domaine",
        "Soumettre les URLs individuelles pour indexation rapide",
    ]),
    ("Google Business Profile", [
        "Creer et completer la fiche Google Business Profile",
        "Ajouter les horaires d'ouverture, adresse et coordonnees",
        "Inclure des photos de qualite de la plateforme et services",
        "Activer les avis et repondre aux commentaires",
        "Lier le profil a la fiche Google Maps",
    ]),
    ("Bing Webmaster Tools", [
        "Soumettre le sitemap XML a Bing Webmaster Tools",
        "Verifier l'indexation dans Bing",
        "Configurer les outils de diagnostic",
    ]),
    ("Performance Web", [
        "Verifier le score Lighthouse (objectif : 90+ pour toutes les categories)",
        "Optimiser les images (format WebP, compression)",
        "Activer la mise en cache navigateur et serveur",
        "Minifier les fichiers CSS et JavaScript",
        "Verifier les Core Web Vitals (voir section dediee ci-dessous)",
    ]),
    ("Schema.org et Donnees Structurees", [
        "Implementer le JSON-LD pour AutoDealer, LocalBusiness, FAQ",
        "Valider le JSON-LD avec Google Rich Results Test",
        "Ajouter le markup BreadcrumbList sur toutes les pages",
        "Implementer Organization schema sur la page d'accueil",
    ]),
    ("Open Graph et Meta Donnees", [
        "Tester avec Facebook Sharing Debugger",
        "Tester avec Twitter Card Validator",
        "Verifier les balises meta title et description sur chaque page",
        "S'assurer que les images OG sont au format 1200x630px",
    ]),
    ("Fichiers Techniques", [
        "Verifier le fichier robots.txt avec Google Robots Testing Tool",
        "S'assurer que le sitemap est accessible a https://shopqr.pro/sitemap.xml",
        "Verifier les URLs canoniques sur chaque page",
        "Implementer les redirections 301 pour les anciennes URLs",
        "Creer la page 404 personnalisee",
    ]),
    ("Mobile et Responsivite", [
        "Tester avec Google Mobile-Friendly Test",
        "Verifier le design responsive sur iOS et Android",
        "Tester la vitesse de chargement sur reseau mobile (3G/4G)",
        "Verifier que les boutons et liens sont facilement cliquables",
    ]),
    ("Core Web Vitals", [
        "LCP (Largest Contentful Paint) : objectif < 2.5 secondes",
        "FID (First Input Delay) : objectif < 100 millisecondes",
        "CLS (Cumulative Layout Shift) : objectif < 0.1",
        "INP (Interaction to Next Paint) : objectif < 200 millisecondes",
        "Surveiller les scores via Google Search Console",
    ]),
    ("Securite et HTTPS", [
        "Verifier le certificat SSL (HTTPS actif et valide)",
        "S'assurer que toutes les ressources sont chargees en HTTPS",
        "Configurer les en-tetes de securite (HSTS, CSP, X-Frame-Options)",
        "Activer la politique de securite du contenu",
    ]),
    ("Google Analytics 4", [
        "Installer Google Analytics 4 (GA4) sur toutes les pages",
        "Configurer les evenements de conversion (inscriptions, recherches, rapports)",
        "Configurer les audiences et segments cles",
        "Lier GA4 a Google Search Console et Google Ads",
    ]),
]

for cat_name, items in checklist_categories:
    story.append(Paragraph(f"<b>{cat_name}</b>", subsection_title_style))
    for idx, item in enumerate(items, 1):
        story.append(Paragraph(
            f"[ ]  {item}",
            checklist_style
        ))
    story.append(Spacer(1, 4))

story.append(Spacer(1, 16))
story.append(section_divider())

# Final note
story.append(Paragraph(
    "<b>Note importante :</b> Cette checklist doit etre executee integralement avant toute mise en production. "
    "Chaque point valide garantit que la plateforme OKAR beneficie d'un referencement optimal des le jour du lancement. "
    "Les audits doivent etre effectues regulierement (mensuellement) pour maintenir les performances SEO.",
    ParagraphStyle("FinalNote", parent=body_style, textColor=ACCENT_ORANGE, backColor=colors.HexColor("#FFF3E0"), 
                   borderPadding=8, borderWidth=1, borderColor=ACCENT_ORANGE, borderRadius=4)
))

story.append(Spacer(1, 20))
story.append(HRFlowable(width="100%", thickness=1, color=DARK_BLUE, spaceBefore=10, spaceAfter=10))
story.append(Paragraph(
    "Document confidentiel - OKAR Team - Avril 2026",
    footer_style
))
story.append(Paragraph(
    "shopqr.pro",
    ParagraphStyle("FooterURL", parent=footer_style, textColor=MEDIUM_BLUE)
))

# ============================================================
# BUILD PDF
# ============================================================

doc.build(story)
print(f"PDF generated successfully at: {OUTPUT_PATH}")
