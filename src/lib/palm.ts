export type Landmark = { id: string; x: number; y: number; label: string };

export type PalmLines = {
  heart: Array<{ x: number; y: number }>;
  head: Array<{ x: number; y: number }>;
  life: Array<{ x: number; y: number }>;
};

export type PalmAnalysis = {
  landmarks: Landmark[];
  lines: PalmLines;
  handedness: "left" | "right" | "unknown";
  quality: "high" | "medium" | "low";
  notes: string;
};

export type HandArchetype = "Fire" | "Earth" | "Air" | "Water";

export type PalmMetrics = {
  aspectRatio: number;
  archetype: HandArchetype;
  archetypeRationale: string;
  heartLineLength: number;
  headLineLength: number;
  lifeLineLength: number;
  palmWidth: number;
  fingerSpan: number;
};

export const LANDMARK_LABELS: Record<string, string> = {
  P0: "Wrist anchor",
  P1: "Thumb base (CMC)",
  P2: "Thumb MCP",
  P3: "Thumb IP",
  P4: "Thumb tip",
  P5: "Index MCP",
  P6: "Index PIP",
  P7: "Index DIP",
  P8: "Index tip",
  P9: "Middle MCP",
  P10: "Middle PIP",
  P11: "Middle DIP",
  P12: "Middle tip",
  P13: "Ring MCP",
  P14: "Ring PIP",
  P15: "Ring DIP",
  P16: "Ring tip",
  P17: "Pinky MCP",
  P18: "Pinky PIP",
  P19: "Pinky DIP",
  P20: "Pinky tip",
};

export const LANDMARK_IDS = Object.keys(LANDMARK_LABELS);

export const HAND_SKELETON: Array<[string, string]> = [
  ["P0", "P1"], ["P1", "P2"], ["P2", "P3"], ["P3", "P4"],
  ["P0", "P5"], ["P5", "P6"], ["P6", "P7"], ["P7", "P8"],
  ["P5", "P9"], ["P9", "P10"], ["P10", "P11"], ["P11", "P12"],
  ["P9", "P13"], ["P13", "P14"], ["P14", "P15"], ["P15", "P16"],
  ["P13", "P17"], ["P17", "P18"], ["P18", "P19"], ["P19", "P20"],
  ["P0", "P17"],
];

function dist(a?: { x: number; y: number }, b?: { x: number; y: number }) {
  if (!a || !b) return 0;
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function polylineLength(points: Array<{ x: number; y: number }>) {
  let total = 0;
  for (let i = 1; i < points.length; i += 1) total += dist(points[i - 1], points[i]);
  return total;
}

export function classifyArchetype(
  aspectRatio: number,
  lineDensity: number,
): { archetype: HandArchetype; rationale: string } {
  // R_aspect = ||P0 - P9|| / ||P9 - P12||  (palm length vs. middle finger length)
  if (aspectRatio >= 1.12) {
    return lineDensity >= 0.9
      ? {
          archetype: "Water",
          rationale:
            "A long palm paired with numerous fine lines — the Water hand: receptive, emotionally fluent, highly intuitive.",
        }
      : {
          archetype: "Fire",
          rationale:
            "A long palm with shorter fingers and few, decisive lines — the Fire hand: kinetic, instinctive, action-first.",
        };
  }
  return lineDensity >= 0.9
    ? {
        archetype: "Air",
        rationale:
          "A squarer palm with long fingers and crisp linework — the Air hand: analytical, communicative, idea-driven.",
      }
    : {
        archetype: "Earth",
        rationale:
          "A square, broad palm with deep, sparse lines — the Earth hand: grounded, practical, endurance-oriented.",
      };
}

export function computeMetrics(analysis: PalmAnalysis): PalmMetrics {
  const map = new Map(analysis.landmarks.map((l) => [l.id, l]));
  const p0 = map.get("P0");
  const p9 = map.get("P9");
  const p12 = map.get("P12");
  const p5 = map.get("P5");
  const p17 = map.get("P17");

  const palmLength = dist(p0, p9);
  const middleFinger = dist(p9, p12) || 0.0001;
  const aspectRatio = palmLength / middleFinger;

  const heartLineLength = polylineLength(analysis.lines.heart);
  const headLineLength = polylineLength(analysis.lines.head);
  const lifeLineLength = polylineLength(analysis.lines.life);
  const lineDensity = (heartLineLength + headLineLength + lifeLineLength) / 1.35;

  const { archetype, rationale } = classifyArchetype(aspectRatio, lineDensity);

  return {
    aspectRatio: Number(aspectRatio.toFixed(3)),
    archetype,
    archetypeRationale: rationale,
    heartLineLength: Number(heartLineLength.toFixed(3)),
    headLineLength: Number(headLineLength.toFixed(3)),
    lifeLineLength: Number(lifeLineLength.toFixed(3)),
    palmWidth: Number(dist(p5, p17).toFixed(3)),
    fingerSpan: Number(dist(map.get("P4"), p12).toFixed(3)),
  };
}

export const ARCHETYPE_TRAITS: Record<HandArchetype, { keywords: string; element: string }> = {
  Fire: { keywords: "Impulse · Charisma · Initiative", element: "🜂 Fire" },
  Earth: { keywords: "Endurance · Craft · Loyalty", element: "🜃 Earth" },
  Air: { keywords: "Intellect · Language · Curiosity", element: "🜁 Air" },
  Water: { keywords: "Empathy · Dreams · Sensitivity", element: "🜄 Water" },
};
