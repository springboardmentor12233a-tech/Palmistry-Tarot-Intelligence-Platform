import { jsPDF } from "jspdf";
import type { SynthesisResult } from "@/lib/ai.functions";
import type { PalmMetrics } from "@/lib/palm";
import type { DrawnCard } from "@/lib/tarot";

const NAVY: readonly [number, number, number] = [27, 42, 74];
const GOLD: readonly [number, number, number] = [212, 175, 55];
const SLATE: readonly [number, number, number] = [74, 85, 104];


export function exportReadingPdf(options: {
  reading: SynthesisResult;
  metrics: PalmMetrics | null;
  cards: DrawnCard[];
  imageDataUrl?: string | null;
  createdAt?: string;
}) {
  const { reading, metrics, cards, imageDataUrl } = options;
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();
  const margin = 48;
  let y = 0;

  const paintHeader = () => {
    doc.setFillColor(NAVY[0], NAVY[1], NAVY[2]);
    doc.rect(0, 0, width, 96, "F");
    doc.setTextColor(GOLD[0], GOLD[1], GOLD[2]);
    doc.setFont("times", "bold");
    doc.setFontSize(20);
    doc.text("Palmistry & Tarot Intelligence", margin, 46);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Multimodal reading · ${new Date(options.createdAt ?? Date.now()).toLocaleString()}`,
      margin,
      66,
    );
    y = 130;
  };

  const ensureSpace = (needed: number) => {
    if (y + needed > height - margin) {
      doc.addPage();
      paintHeader();
    }
  };

  const heading = (text: string) => {
    ensureSpace(46);
    doc.setTextColor(GOLD[0], GOLD[1], GOLD[2]);
    doc.setFont("times", "bold");
    doc.setFontSize(14);
    doc.text(text, margin, y);
    y += 8;
    doc.setDrawColor(GOLD[0], GOLD[1], GOLD[2]);
    doc.line(margin, y, width - margin, y);
    y += 18;
  };

  const body = (text: string, color = SLATE) => {
    if (!text) return;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    doc.setTextColor(color[0], color[1], color[2]);
    const lines = doc.splitTextToSize(text, width - margin * 2);
    for (const line of lines) {
      ensureSpace(16);
      doc.text(line, margin, y);
      y += 15;
    }
    y += 8;
  };

  paintHeader();

  doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
  doc.setFont("times", "bolditalic");
  doc.setFontSize(18);
  const titleLines = doc.splitTextToSize(reading.headline, width - margin * 2);
  for (const line of titleLines) {
    doc.text(line, margin, y);
    y += 22;
  }
  y += 6;

  body(reading.overview);

  if (imageDataUrl) {
    ensureSpace(190);
    try {
      doc.addImage(imageDataUrl, "JPEG", margin, y, 150, 180);
    } catch {
      /* image optional */
    }
    const boxX = margin + 170;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
    doc.text("Palm biometrics", boxX, y + 14);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(SLATE[0], SLATE[1], SLATE[2]);
    const facts = metrics
      ? [
          `Elemental archetype: ${metrics.archetype}`,
          `R_aspect: ${metrics.aspectRatio.toFixed(3)}`,
          `Heart line: ${metrics.heartLineLength.toFixed(3)}`,
          `Head line: ${metrics.headLineLength.toFixed(3)}`,
          `Life line: ${metrics.lifeLineLength.toFixed(3)}`,
          `Palm width: ${metrics.palmWidth.toFixed(3)}`,
        ]
      : ["No palm scan attached."];
    facts.forEach((fact, i) => doc.text(fact, boxX, y + 34 + i * 15));
    y += 200;
  }

  heading("Hand Signature");
  body(reading.handSignature);

  heading("Cards Drawn");
  body(
    cards
      .map(
        (card) =>
          `${card.position} (${card.positionMeaning}): ${card.name}${card.reversed ? " — reversed" : ""} · ${card.arcana === "Major" ? "Major Arcana" : card.suit} · ${card.element}`,
      )
      .join("\n"),
  );

  reading.positions.forEach((pos) => {
    heading(`${pos.position} — ${pos.card}`);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
    ensureSpace(16);
    doc.text("Light meaning", margin, y);
    y += 15;
    body(pos.light);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
    ensureSpace(16);
    doc.text("Shadow meaning", margin, y);
    y += 15;
    body(pos.shadow);
    if (pos.fusion) {
      doc.setFont("helvetica", "bolditalic");
      doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
      ensureSpace(16);
      doc.text("Palm fusion", margin, y);
      y += 15;
      body(pos.fusion);
    }
  });

  if (reading.guidance.length) {
    heading("Guidance");
    body(reading.guidance.map((g, i) => `${i + 1}. ${g}`).join("\n"));
  }

  if (reading.closing) {
    heading("Closing");
    body(reading.closing, NAVY);
  }

  doc.setFontSize(8);
  doc.setTextColor(SLATE[0], SLATE[1], SLATE[2]);
  doc.text(
    "For reflection and entertainment. Not medical, legal, or financial advice.",
    margin,
    height - 28,
  );

  doc.save(`reading-${Date.now()}.pdf`);
}
