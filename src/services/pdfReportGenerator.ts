import jsPDF from 'jspdf';
import { SynthesisReadingReport } from '../types';

export async function generateMysticalPDFReport(report: SynthesisReadingReport): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;

  // Background decoration helper
  const renderMysticalBackground = (pageNum: number, totalPagesStr: string) => {
    // Dark celestial background
    doc.setFillColor(11, 12, 22);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Subtle cosmic gradient band
    doc.setFillColor(20, 24, 48);
    doc.rect(margin - 2, margin - 2, contentWidth + 4, pageHeight - margin * 2 + 4, 'F');

    // Gold border frame
    doc.setDrawColor(217, 163, 56);
    doc.setLineWidth(0.7);
    doc.rect(margin, margin, contentWidth, pageHeight - margin * 2);

    // Inner hairline frame
    doc.setDrawColor(180, 130, 40);
    doc.setLineWidth(0.2);
    doc.rect(margin + 2, margin + 2, contentWidth - 4, pageHeight - margin * 2 - 4);

    // Corner decorative accents
    const cs = 5;
    doc.line(margin + 2, margin + 2 + cs, margin + 2 + cs, margin + 2);
    doc.line(pageWidth - margin - 2 - cs, margin + 2, pageWidth - margin - 2, margin + 2 + cs);
    doc.line(margin + 2, pageHeight - margin - 2 - cs, margin + 2 + cs, pageHeight - margin - 2);
    doc.line(pageWidth - margin - 2 - cs, pageHeight - margin - 2, pageWidth - margin - 2, pageHeight - margin - 2 - cs);

    // Footer
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(160, 170, 195);
    doc.text('MYSTIQ • BIOMETRIC PALMISTRY & TAROT INTELLIGENCE', pageWidth / 2, pageHeight - margin + 6, { align: 'center' });
    doc.text(`Page ${pageNum}`, pageWidth - margin - 5, pageHeight - margin + 6, { align: 'right' });
  };

  // --- PAGE 1: TITLE, SCORE & BIOMETRIC PALMISTRY SUMMARY ---
  renderMysticalBackground(1, '3');
  let y = margin + 14;

  // Title Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(245, 197, 66); // Celestial Gold
  doc.text('Mystiq Palm and Tarot Reading', pageWidth / 2, y, { align: 'center' });
  y += 7;

  doc.setFontSize(10);
  doc.setTextColor(190, 200, 225);
  doc.setFont('helvetica', 'normal');
  doc.text('AI PALM BIOMETRICS & COSMIC TAROT SYNTHESIS', pageWidth / 2, y, { align: 'center' });
  y += 8;

  // Metadata Card
  doc.setFillColor(15, 18, 36);
  doc.setDrawColor(217, 163, 56);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin + 5, y, contentWidth - 10, 18, 2, 2, 'FD');

  doc.setFontSize(9);
  doc.setTextColor(220, 225, 240);
  const dateStr = report.createdAt?.toDate ? report.createdAt.toDate().toLocaleDateString() : new Date(report.createdAt).toLocaleDateString();
  const timeStr = report.createdAt?.toDate ? report.createdAt.toDate().toLocaleTimeString() : new Date(report.createdAt).toLocaleTimeString();
  
  doc.text(`Seeker: ${report.seekerName || 'Seeker'}`, margin + 9, y + 6);
  doc.text(`Session ID: ${report.id ? report.id.substring(0, 16) : 'N/A'}`, margin + 9, y + 12);
  doc.text(`Date: ${dateStr} ${timeStr}`, margin + (contentWidth / 2), y + 6);
  doc.text(`Spread Type: ${(report.spreadType || 'past_present_future').replace('_', ' ').toUpperCase()}`, margin + (contentWidth / 2), y + 12);
  y += 24;

  // 5-FACTOR INSIGHT SCORE HERO
  doc.setFillColor(25, 30, 60);
  doc.setDrawColor(217, 163, 56);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin + 5, y, contentWidth - 10, 42, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(245, 197, 66);
  doc.text('5-FACTOR SPIRITUAL GUIDANCE INSIGHT SCORE', margin + 10, y + 8);

  doc.setFontSize(26);
  doc.setTextColor(255, 255, 255);
  doc.text(`${report.scoreData.final_score}`, margin + 10, y + 23);
  doc.setFontSize(11);
  doc.setTextColor(245, 197, 66);
  doc.text('/ 100', margin + 46, y + 23);

  doc.setFontSize(10);
  doc.setTextColor(165, 180, 215);
  doc.text(`Band: ${report.scoreData.ratingBand}`, margin + 10, y + 33);

  // Score Factors Mini-Table
  const scoreX = margin + (contentWidth / 2) - 10;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(200, 210, 235);
  doc.text(`• Palm Confidence (Spalm 30%): ${report.scoreData.s_palm}%`, scoreX, y + 14);
  doc.text(`• Tarot Relevance (Starot 25%): ${report.scoreData.s_tarot}%`, scoreX, y + 20);
  doc.text(`• Personality Alignment (Spers 20%): ${report.scoreData.s_pers}%`, scoreX, y + 26);
  doc.text(`• Context Relevance (Sctx 15%): ${report.scoreData.s_ctx}%`, scoreX, y + 32);
  doc.text(`• Reading Consistency (Scons 10%): ${report.scoreData.s_cons}%`, scoreX, y + 38);
  y += 48;

  // EXECUTIVE SUMMARY SECTION
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(245, 197, 66);
  doc.text('I. EXECUTIVE SPIRITUAL SUMMARY', margin + 5, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(225, 230, 245);
  const execLines = doc.splitTextToSize(report.executiveSummary, contentWidth - 10);
  doc.text(execLines, margin + 5, y);
  y += execLines.length * 4.2 + 6;

  // BIOMETRIC PALMISTRY ANALYSIS TABLE
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(245, 197, 66);
  doc.text('II. BIOMETRIC PALMISTRY LINE & MOUNT METRICS', margin + 5, y);
  y += 5;

  // Render Table Header
  doc.setFillColor(30, 36, 70);
  doc.rect(margin + 5, y, contentWidth - 10, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(245, 197, 66);
  doc.text('Palm Line Identifier', margin + 8, y + 4.2);
  doc.text('Length Ratio', margin + 55, y + 4.2);
  doc.text('Curvature Index', margin + 85, y + 4.2);
  doc.text('Prominence', margin + 120, y + 4.2);
  doc.text('Status', margin + 150, y + 4.2);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  report.palmData.lines.slice(0, 4).forEach((line, idx) => {
    doc.setFillColor(idx % 2 === 0 ? 18 : 24, idx % 2 === 0 ? 22 : 28, idx % 2 === 0 ? 44 : 54);
    doc.rect(margin + 5, y, contentWidth - 10, 5.5, 'F');
    doc.setTextColor(230, 235, 250);
    doc.text(line.displayName, margin + 8, y + 3.8);
    doc.text(`${line.lengthRatio}`, margin + 55, y + 3.8);
    doc.text(`${line.curvatureIndex}`, margin + 85, y + 3.8);
    doc.text(`${line.prominenceScore}`, margin + 120, y + 3.8);
    doc.setTextColor(110, 231, 183);
    doc.text(line.status, margin + 150, y + 3.8);
    y += 5.5;
  });
  y += 5;

  // Palm Line Text Insights
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(190, 205, 235);
  const heartText = doc.splitTextToSize(`• Heart Line: ${report.palmBiometricInsights.heartLineAnalysis}`, contentWidth - 10);
  doc.text(heartText, margin + 5, y);
  y += heartText.length * 3.8 + 2;

  const headText = doc.splitTextToSize(`• Head Line: ${report.palmBiometricInsights.headLineAnalysis}`, contentWidth - 10);
  doc.text(headText, margin + 5, y);
  y += headText.length * 3.8 + 2;

  const lifeText = doc.splitTextToSize(`• Life Line: ${report.palmBiometricInsights.lifeLineAnalysis}`, contentWidth - 10);
  doc.text(lifeText, margin + 5, y);
  y += lifeText.length * 3.8 + 2;

  // --- PAGE 2: TAROT SPREAD & MULTIDIMENSIONAL GUIDANCE ---
  doc.addPage();
  renderMysticalBackground(2, '3');
  y = margin + 14;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(245, 197, 66);
  doc.text('III. TAROT SPREAD DECODING', margin + 5, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(215, 225, 245);
  const themeText = doc.splitTextToSize(`Cosmic Theme: ${report.tarotCosmicInsights.overallTheme}`, contentWidth - 10);
  doc.text(themeText, margin + 5, y);
  y += themeText.length * 4.2 + 4;

  // Drawn Cards Breakdown
  report.drawnCards.slice(0, 5).forEach((dc, idx) => {
    const interp = report.tarotCosmicInsights.cardInterpretations[idx]?.synthesis || dc.card.meanings[dc.orientation === 'Upright' ? 'light' : 'shadow'][0];
    const interpLines = doc.splitTextToSize(interp, contentWidth - 16);
    
    // Calculate dynamic box height so text doesn't overflow
    const boxHeight = 11.5 + (interpLines.length * 3.5);

    doc.setFillColor(20, 25, 50);
    doc.setDrawColor(217, 163, 56);
    doc.setLineWidth(0.2);
    doc.roundedRect(margin + 5, y, contentWidth - 10, boxHeight, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(245, 197, 66);
    doc.text(`[${dc.positionName}] ${dc.card.name} (${dc.orientation})`, margin + 8, y + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(170, 185, 215);
    doc.text(`Keywords: ${dc.card.keywords.slice(0, 4).join(', ')}  |  Element: ${dc.card.elemental || 'Cosmic'}`, margin + 8, y + 8.5);

    doc.setTextColor(230, 235, 248);
    doc.text(interpLines, margin + 8, y + 13);
    
    y += boxHeight + 3; // Advance Y by box height + gap
  });

  // Provide sufficient vertical spacing for the next heading baseline
  y += 6;

  // PERSONALITY & TIMELINE
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(245, 197, 66);
  doc.text('IV. PERSONALITY ARCHETYPE & LIFE TIMELINE', margin + 5, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(220, 230, 248);
  doc.text(`• Core Archetype: ${report.personalityProfile.coreArchetype}`, margin + 5, y);
  y += 4;
  doc.text(`• Temperament: ${report.personalityProfile.temperament}`, margin + 5, y);
  y += 4;

  const horizonText = doc.splitTextToSize(`• 1-3 Month Cycle: ${report.lifeTrendTimeline.immediateHorizon}`, contentWidth - 10);
  doc.text(horizonText, margin + 5, y);
  y += horizonText.length * 3.8 + 2;

  const cycleText = doc.splitTextToSize(`• 6-12 Month Milestone: ${report.lifeTrendTimeline.emergingCycle}`, contentWidth - 10);
  doc.text(cycleText, margin + 5, y);
  y += cycleText.length * 3.8 + 2;

  const catalystText = doc.splitTextToSize(`• Catalyst Opportunity: ${report.lifeTrendTimeline.catalystOpportunity}`, contentWidth - 10);
  doc.text(catalystText, margin + 5, y);
  y += catalystText.length * 3.8 + 4;

  // --- PAGE 3: RECOMMENDATIONS, CHAKRA & SACRED SEAL ---
  doc.addPage();
  renderMysticalBackground(3, '3');
  y = margin + 14;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(245, 197, 66);
  doc.text('V. RELATIONSHIPS & VOCATIONAL TRAJECTORY', margin + 5, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(220, 230, 245);
  const relText = doc.splitTextToSize(`• Emotional Dynamic: ${report.relationshipsGuidance.emotionalDisposition} ${report.relationshipsGuidance.guidanceForHarmonizing}`, contentWidth - 10);
  doc.text(relText, margin + 5, y);
  y += relText.length * 3.8 + 2;

  const carText = doc.splitTextToSize(`• Vocation & Prosperity: ${report.careerFinancialTrajectory.vocationAlignment} Key Move: ${report.careerFinancialTrajectory.strategicMove}`, contentWidth - 10);
  doc.text(carText, margin + 5, y);
  y += carText.length * 3.8 + 6;

  // SPIRITUAL RECOMMENDATIONS & AFFIRMATIONS
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(245, 197, 66);
  doc.text('VI. EMPOWERING RITUALS & DAILY AFFIRMATIONS', margin + 5, y);
  y += 5;

  report.spiritualRecommendations.forEach((rec) => {
    doc.setFillColor(18, 22, 44);
    doc.setDrawColor(217, 163, 56);
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(245, 197, 66);
    const actionText = doc.splitTextToSize(`${rec.category}: ${rec.action}`, contentWidth - 16);
    
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.5);
    doc.setTextColor(190, 242, 100);
    const affText = doc.splitTextToSize(`Affirmation: "${rec.affirmation}"`, contentWidth - 16);
    
    const boxHeight = (actionText.length * 3.5) + (affText.length * 3.5) + 6;
    doc.roundedRect(margin + 5, y, contentWidth - 10, boxHeight, 1.5, 1.5, 'FD');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(245, 197, 66);
    doc.text(actionText, margin + 8, y + 4.5);
    
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.5);
    doc.setTextColor(190, 242, 100);
    doc.text(affText, margin + 8, y + 4.5 + (actionText.length * 3.5) + 2);
    
    y += boxHeight + 2;
  });
  y += 4;

  // CHAKRA ENERGY BALANCE TABLE
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(245, 197, 66);
  doc.text('VII. CHAKRA ENERGY ALIGNMENT', margin + 5, y);
  y += 5;

  report.chakraEnergyBalance.slice(0, 4).forEach((ch) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(220, 230, 245);
    const chText = doc.splitTextToSize(`• ${ch.chakra}: ${ch.status} (${ch.intensity}%) — ${ch.recommendation}`, contentWidth - 10);
    doc.text(chText, margin + 5, y);
    y += chText.length * 3.5 + 2;
  });
  y += 10;

  // OFFICIAL SEAL / CERTIFICATION STAMP
  doc.setFillColor(25, 30, 60);
  doc.setDrawColor(217, 163, 56);
  doc.setLineWidth(0.8);
  doc.roundedRect(margin + 20, y, contentWidth - 40, 22, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(245, 197, 66);
  doc.text('SEAL OF MULTIMODAL SYNTHESIS', pageWidth / 2, y + 7, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(180, 195, 225);
  doc.text('Validated by Mystiq AI Neural Biometrics & RWS Symbolic Tarot Dataset', pageWidth / 2, y + 13, { align: 'center' });
  doc.text('Deterministic 5-Factor Weighted Score Verified', pageWidth / 2, y + 18, { align: 'center' });

  // Save the PDF
  const filename = `Mystiq_Report_${report.seekerName.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
  doc.save(filename);
}

export function exportReadingAsExcelCSV(report: SynthesisReadingReport): void {
  const dateStr = report.createdAt?.toDate ? report.createdAt.toDate().toLocaleDateString() : new Date(report.createdAt).toLocaleDateString();
  const timeStr = report.createdAt?.toDate ? report.createdAt.toDate().toLocaleTimeString() : new Date(report.createdAt).toLocaleTimeString();

  const rows = [
    ['MYSTIQ PALMISTRY & TAROT INTELLIGENCE REPORT', ''],
    ['Seeker Name', report.seekerName],
    ['Report ID', report.id],
    ['Created At', dateStr + ' ' + timeStr],
    ['Spread Type', report.spreadType || 'past_present_future'],
    ['Overall Insight Score', `${report.scoreData.final_score} / 100`],
    ['Rating Band', report.scoreData.ratingBand],
    ['', ''],
    ['--- 5-FACTOR SCORE BREAKDOWN ---', ''],
    ['Palm Confidence (Spalm 30%)', `${report.scoreData.s_palm}%`],
    ['Tarot Relevance (Starot 25%)', `${report.scoreData.s_tarot}%`],
    ['Personality Alignment (Spers 20%)', `${report.scoreData.s_pers}%`],
    ['Context Relevance (Sctx 15%)', `${report.scoreData.s_ctx}%`],
    ['Reading Consistency (Scons 10%)', `${report.scoreData.s_cons}%`],
    ['', ''],
    ['--- BIOMETRIC PALM METRICS ---', ''],
    ['Palm Shape', report.palmData.palmShape],
    ...report.palmData.lines.map((l) => [l.displayName, `Length: ${l.lengthRatio} | Curvature: ${l.curvatureIndex} | Prominence: ${l.prominenceScore} | Status: ${l.status}`]),
    ['', ''],
    ['--- DRAWN TAROT CARDS ---', ''],
    ...report.drawnCards.map((c) => [c.positionName, `${c.card.name} (${c.orientation}) - Keywords: ${c.card.keywords.join(', ')}`]),
    ['', ''],
    ['--- EXECUTIVE SYNTHESIS ---', ''],
    ['Executive Summary', report.executiveSummary],
    ['Core Personality Archetype', report.personalityProfile.coreArchetype],
    ['Immediate Horizon (1-3 Mo)', report.lifeTrendTimeline.immediateHorizon],
    ['Emerging Cycle (6-12 Mo)', report.lifeTrendTimeline.emergingCycle],
    ['Career Trajectory', report.careerFinancialTrajectory.vocationAlignment],
    ['Strategic Action', report.careerFinancialTrajectory.strategicMove],
  ];

  const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.map((x) => `"${(x || '').toString().replace(/"/g, '""')}"`).join(',')).join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `Mystiq_Reading_${report.seekerName.replace(/\s+/g, '_')}_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
