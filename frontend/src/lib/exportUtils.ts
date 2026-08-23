import { FullReading } from '@/types';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

export function exportReadingToPDF(reading: FullReading) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // Background tint
  doc.setFillColor(10, 10, 24); // #0A0A18
  doc.rect(0, 0, pageWidth, doc.internal.pageSize.getHeight(), 'F');

  // Title Banner
  doc.setTextColor(212, 175, 55); // Gold
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('COSMIC ORACLE INTELLIGENCE REPORT', pageWidth / 2, y, { align: 'center' });
  y += 7;

  doc.setTextColor(201, 184, 240); // Lavender
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `Synthesized Palmistry & Archetypal Tarot Reading · ${new Date(reading.date).toLocaleDateString(undefined, { dateStyle: 'long' })}`,
    pageWidth / 2,
    y,
    { align: 'center' }
  );
  y += 10;

  // Horizontal divider
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.4);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  // Core Metric Box
  doc.setFillColor(22, 18, 50); // Indigo panel
  doc.roundedRect(margin, y, contentWidth, 24, 3, 3, 'F');
  doc.setDrawColor(124, 58, 237); // Violet border
  doc.roundedRect(margin, y, contentWidth, 24, 3, 3, 'D');

  doc.setTextColor(245, 243, 250);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`Spread: ${reading.spread_title}`, margin + 6, y + 8);
  doc.text(`Composite Insight Score: ${reading.insight_score.overall}/100`, margin + 6, y + 16);

  doc.setTextColor(212, 175, 55);
  doc.text(`Tier: ${reading.insight_score.tier}`, pageWidth - margin - 6, y + 8, { align: 'right' });
  doc.setTextColor(201, 184, 240);
  doc.setFontSize(9);
  doc.text(`Archetype: ${reading.personality.primary_archetype}`, pageWidth - margin - 6, y + 16, { align: 'right' });

  y += 32;

  // Section 1: Executive Overview
  doc.setTextColor(212, 175, 55);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('I. EXECUTIVE ALCHEMICAL SYNTHESIS', margin, y);
  y += 6;

  doc.setTextColor(245, 243, 250);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const overviewLines = doc.splitTextToSize(reading.interpretation.overview_summary, contentWidth);
  doc.text(overviewLines, margin, y);
  y += overviewLines.length * 4.5 + 6;

  // Section 2: Palm Biometrics
  doc.setTextColor(212, 175, 55);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(`II. PALM BIOMETRIC ANALYSIS (${reading.palm_result.hand_type})`, margin, y);
  y += 6;

  const lines = [
    { title: 'Heart Line', data: reading.palm_result.lines.heart_line },
    { title: 'Head Line', data: reading.palm_result.lines.head_line },
    { title: 'Life Line', data: reading.palm_result.lines.life_line },
    { title: 'Fate Line', data: reading.palm_result.lines.fate_line },
  ];

  lines.forEach((l) => {
    if (y > 260) {
      doc.addPage();
      doc.setFillColor(10, 10, 24);
      doc.rect(0, 0, pageWidth, doc.internal.pageSize.getHeight(), 'F');
      y = margin;
    }
    doc.setTextColor(201, 184, 240);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`• ${l.title} [Confidence: ${l.data.confidence}% · ${l.data.curvature} / ${l.data.depth}]`, margin + 2, y);
    y += 4.5;

    doc.setTextColor(245, 243, 250);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    const summaryLines = doc.splitTextToSize(l.data.summary, contentWidth - 4);
    doc.text(summaryLines, margin + 4, y);
    y += summaryLines.length * 4 + 3;
  });

  y += 4;

  // Section 3: Tarot Spread Cards
  if (y > 230) {
    doc.addPage();
    doc.setFillColor(10, 10, 24);
    doc.rect(0, 0, pageWidth, doc.internal.pageSize.getHeight(), 'F');
    y = margin;
  }

  doc.setTextColor(212, 175, 55);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('III. TAROT ARCHETYPES & SPREAD MATRIX', margin, y);
  y += 6;

  reading.tarot_result.cards.forEach((c, idx) => {
    if (y > 260) {
      doc.addPage();
      doc.setFillColor(10, 10, 24);
      doc.rect(0, 0, pageWidth, doc.internal.pageSize.getHeight(), 'F');
      y = margin;
    }
    doc.setTextColor(201, 184, 240);
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    doc.text(
      `${idx + 1}. [${c.position_label}] — ${c.card.name} (${c.is_reversed ? 'Reversed' : 'Upright'})`,
      margin + 2,
      y
    );
    y += 4.5;

    doc.setTextColor(245, 243, 250);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    const cardMeaning = c.is_reversed ? c.card.reversed_meaning : c.card.upright_meaning;
    const cardLines = doc.splitTextToSize(`Significance: ${cardMeaning}`, contentWidth - 4);
    doc.text(cardLines, margin + 4, y);
    y += cardLines.length * 4 + 3;
  });

  // Section 4: Key Insights & Recommendations
  if (y > 220) {
    doc.addPage();
    doc.setFillColor(10, 10, 24);
    doc.rect(0, 0, pageWidth, doc.internal.pageSize.getHeight(), 'F');
    y = margin;
  }

  y += 4;
  doc.setTextColor(212, 175, 55);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('IV. ACTIONABLE SOUL BLUEPRINT & MANTRA', margin, y);
  y += 6;

  doc.setTextColor(201, 184, 240);
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.text('Daily Alchemical Mantra:', margin + 2, y);
  y += 4.5;

  doc.setTextColor(245, 243, 250);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  const mantraLines = doc.splitTextToSize(`"${reading.recommendations.daily_mantra}"`, contentWidth - 4);
  doc.text(mantraLines, margin + 4, y);
  y += mantraLines.length * 4 + 5;

  // Save the PDF
  doc.save(`Cosmic_Oracle_Reading_${reading.id}.pdf`);
}

export function exportReadingToExcel(reading: FullReading) {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Reading Summary
  const summaryData = [
    ['Cosmic Oracle Reading Summary', ''],
    ['Reading ID', reading.id],
    ['Date', new Date(reading.date).toISOString()],
    ['Spread Type', reading.spread_title],
    ['Overall Insight Score', reading.insight_score.overall],
    ['Score Tier', reading.insight_score.tier],
    ['Primary Archetype', reading.personality.primary_archetype],
    ['Secondary Archetype', reading.personality.secondary_archetype],
    ['Hand Type', reading.palm_result.hand_type],
    ['Primary Element', reading.palm_result.primary_element],
    ['Daily Mantra', reading.recommendations.daily_mantra],
    ['Overview Summary', reading.interpretation.overview_summary],
  ];
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

  // Sheet 2: Insight Score Breakdown
  const scoreData = [
    ['Metric Component', 'Weight', 'Score (0-100)'],
    ['Palm Analysis Confidence', '30%', reading.insight_score.palm_confidence],
    ['Tarot Interpretation Relevance', '25%', reading.insight_score.tarot_relevance],
    ['Personality Alignment', '20%', reading.insight_score.personality_alignment],
    ['User Context Relevance', '15%', reading.insight_score.context_relevance],
    ['Reading Consistency', '10%', reading.insight_score.consistency],
    ['Composite Total', '100%', reading.insight_score.overall],
  ];
  const wsScore = XLSX.utils.aoa_to_sheet(scoreData);
  XLSX.utils.book_append_sheet(wb, wsScore, 'Insight Score');

  // Sheet 3: Palm Biometrics
  const palmData = [
    ['Line Name', 'Length', 'Depth', 'Curvature', 'Confidence %', 'Summary Interpretation'],
    [
      reading.palm_result.lines.heart_line.name,
      reading.palm_result.lines.heart_line.length,
      reading.palm_result.lines.heart_line.depth,
      reading.palm_result.lines.heart_line.curvature,
      reading.palm_result.lines.heart_line.confidence,
      reading.palm_result.lines.heart_line.summary,
    ],
    [
      reading.palm_result.lines.head_line.name,
      reading.palm_result.lines.head_line.length,
      reading.palm_result.lines.head_line.depth,
      reading.palm_result.lines.head_line.curvature,
      reading.palm_result.lines.head_line.confidence,
      reading.palm_result.lines.head_line.summary,
    ],
    [
      reading.palm_result.lines.life_line.name,
      reading.palm_result.lines.life_line.length,
      reading.palm_result.lines.life_line.depth,
      reading.palm_result.lines.life_line.curvature,
      reading.palm_result.lines.life_line.confidence,
      reading.palm_result.lines.life_line.summary,
    ],
    [
      reading.palm_result.lines.fate_line.name,
      reading.palm_result.lines.fate_line.length,
      reading.palm_result.lines.fate_line.depth,
      reading.palm_result.lines.fate_line.curvature,
      reading.palm_result.lines.fate_line.confidence,
      reading.palm_result.lines.fate_line.summary,
    ],
  ];
  const wsPalm = XLSX.utils.aoa_to_sheet(palmData);
  XLSX.utils.book_append_sheet(wb, wsPalm, 'Palm Biometrics');

  // Sheet 4: Tarot Spread
  const tarotData = [
    ['Position #', 'Position Label', 'Position Meaning', 'Card Name', 'Orientation', 'Arcana', 'Element', 'Key Meaning'],
    ...reading.tarot_result.cards.map((c, i) => [
      i + 1,
      c.position_label,
      c.position_meaning,
      c.card.name,
      c.is_reversed ? 'Reversed' : 'Upright',
      c.card.arcana,
      c.card.element,
      c.is_reversed ? c.card.reversed_meaning : c.card.upright_meaning,
    ]),
  ];
  const wsTarot = XLSX.utils.aoa_to_sheet(tarotData);
  XLSX.utils.book_append_sheet(wb, wsTarot, 'Tarot Spread');

  // Sheet 5: 7-Pillar Category Insights
  const categoryData = [
    ['Pillar Category', 'Score (0-100)', 'Executive Summary', 'Detailed Narrative', 'Key Takeaways', 'Astrological / Archetypal Correlation'],
    ...reading.interpretation.categories.map((cat) => [
      cat.title,
      cat.score,
      cat.summary,
      cat.detailed_narrative,
      cat.key_takeaways.join('; '),
      cat.astrological_influence || cat.tarot_correlation || '',
    ]),
  ];
  const wsCategories = XLSX.utils.aoa_to_sheet(categoryData);
  XLSX.utils.book_append_sheet(wb, wsCategories, 'Category Insights');

  // Sheet 6: Actionable Recommendations
  const recData = [
    ['Domain', 'Recommendations'],
    ['Personal Growth', reading.recommendations.growth.join('\n')],
    ['Relationships', reading.recommendations.relationships.join('\n')],
    ['Career & Purpose', reading.recommendations.career.join('\n')],
    ['Goal Alignment', reading.recommendations.goal_alignment.join('\n')],
    ['Spiritual Development', reading.recommendations.spiritual_development.join('\n')],
    ['Recommended Crystals & Sigils', reading.recommendations.recommended_crystals_or_symbols.join(', ')],
  ];
  const wsRec = XLSX.utils.aoa_to_sheet(recData);
  XLSX.utils.book_append_sheet(wb, wsRec, 'Recommendations');

  // Generate and trigger download
  XLSX.writeFile(wb, `Cosmic_Oracle_Reading_${reading.id}.xlsx`);
}
