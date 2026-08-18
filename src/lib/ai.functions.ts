import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const pointSchema = z.object({ x: z.number(), y: z.number() });

const analyzeInput = z.object({
  imageDataUrl: z.string().min(32),
});

const synthesizeInput = z.object({
  metrics: z.object({
    aspectRatio: z.number(),
    archetype: z.string(),
    archetypeRationale: z.string(),
    heartLineLength: z.number(),
    headLineLength: z.number(),
    lifeLineLength: z.number(),
    palmWidth: z.number(),
    fingerSpan: z.number(),
  }),
  palmNotes: z.string().optional(),
  question: z.string().max(400).optional(),
  cards: z
    .array(
      z.object({
        name: z.string(),
        arcana: z.string(),
        suit: z.string(),
        element: z.string(),
        reversed: z.boolean(),
        position: z.string(),
        positionMeaning: z.string(),
        light: z.string(),
        shadow: z.string(),
      }),
    )
    .min(1)
    .max(3),
});

export type PalmAnalysisResult = {
  landmarks: Array<{ id: string; x: number; y: number; label: string }>;
  lines: {
    heart: Array<{ x: number; y: number }>;
    head: Array<{ x: number; y: number }>;
    life: Array<{ x: number; y: number }>;
  };
  handedness: "left" | "right" | "unknown";
  quality: "high" | "medium" | "low";
  notes: string;
  latencyMs: number;
};

export type SynthesisResult = {
  headline: string;
  overview: string;
  handSignature: string;
  positions: Array<{
    position: string;
    card: string;
    light: string;
    shadow: string;
    fusion: string;
  }>;
  guidance: string[];
  closing: string;
  latencyMs: number;
};

const PALM_SYSTEM = `You are a precise hand-vision model. Given a photograph of a human hand, return ONLY JSON.
Estimate 21 hand landmarks in MediaPipe order, ids "P0".."P20" (P0 wrist, P1-P4 thumb, P5-P8 index, P9-P12 middle, P13-P16 ring, P17-P20 pinky).
Coordinates are normalized floats 0..1 relative to image width/height (x right, y down).
Also trace three palmar creases as ordered polylines of 6-9 normalized points each:
heart line (upper transverse crease), head line (middle transverse crease), life line (arc around the thumb mount).
Shape:
{"handedness":"left|right|unknown","quality":"high|medium|low","notes":"one sentence on visible crease quality",
"landmarks":[{"id":"P0","x":0.5,"y":0.9}, ...21 entries...],
"lines":{"heart":[{"x":0,"y":0}],"head":[...],"life":[...]}}
If the image is not a hand, set quality "low" and notes to "no hand detected", but still return plausible placeholder geometry.`;

const READING_SYSTEM = `You are an empathetic, literate diviner who fuses palmistry biometrics with tarot symbolism.
Never predict death, illness, legal or financial certainties. Be warm, specific, non-fatalistic, and psychologically grounded.
Return ONLY JSON in this shape:
{"headline":"<=70 chars evocative title",
"overview":"2-3 sentences fusing the hand archetype with the drawn cards",
"handSignature":"2-3 sentences interpreting the palm metrics themselves",
"positions":[{"position":"...","card":"...","light":"2-3 sentences of the illuminated reading","shadow":"2-3 sentences of the shadow reading","fusion":"1-2 sentences tying the card to the palm metrics"}],
"guidance":["3 to 5 short actionable practices"],
"closing":"1-2 sentence blessing"}
Include exactly one positions entry per card given, in the same order.`;

export const analyzePalm = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => analyzeInput.parse(input))
  .handler(async ({ data }): Promise<PalmAnalysisResult> => {
    const { callGemini, parseJsonLoose } = await import("./ai-gateway.server");
    const { LANDMARK_LABELS } = await import("./palm");
    const started = Date.now();

    const raw = await callGemini({
      jsonOnly: true,
      messages: [
        { role: "system", content: PALM_SYSTEM },
        {
          role: "user",
          content: [
            { type: "text", text: "Extract the 21 landmarks and the three palmar lines from this hand image." },
            { type: "image_url", image_url: { url: data.imageDataUrl } },
          ],
        },
      ],
    });

    const parsed = parseJsonLoose<{
      handedness?: string;
      quality?: string;
      notes?: string;
      landmarks?: Array<{ id: string; x: number; y: number }>;
      lines?: Record<string, Array<{ x: number; y: number }>>;
    }>(raw);

    const clamp = (v: number) => Math.min(1, Math.max(0, Number.isFinite(v) ? v : 0.5));
    const landmarks = (parsed.landmarks ?? [])
      .filter((l) => typeof l?.id === "string" && l.id in LANDMARK_LABELS)
      .map((l) => ({
        id: l.id,
        x: clamp(l.x),
        y: clamp(l.y),
        label: LANDMARK_LABELS[l.id] ?? l.id,
      }));

    if (landmarks.length < 12) {
      throw new Error(
        "Could not resolve enough landmarks. Use a well-lit, open palm facing the camera.",
      );
    }

    const line = (key: string) =>
      z
        .array(pointSchema)
        .catch([])
        .parse(parsed.lines?.[key] ?? [])
        .map((p) => ({ x: clamp(p.x), y: clamp(p.y) }));

    return {
      landmarks,
      lines: { heart: line("heart"), head: line("head"), life: line("life") },
      handedness:
        parsed.handedness === "left" || parsed.handedness === "right" ? parsed.handedness : "unknown",
      quality:
        parsed.quality === "high" || parsed.quality === "low" ? parsed.quality : "medium",
      notes: typeof parsed.notes === "string" ? parsed.notes : "Creases resolved.",
      latencyMs: Date.now() - started,
    };
  });

export const synthesizeReading = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => synthesizeInput.parse(input))
  .handler(async ({ data }): Promise<SynthesisResult> => {
    const { callGemini, parseJsonLoose } = await import("./ai-gateway.server");
    const started = Date.now();

    const payload = {
      palm: {
        elementalArchetype: data.metrics.archetype,
        archetypeRationale: data.metrics.archetypeRationale,
        R_aspect: data.metrics.aspectRatio,
        normalizedLineLengths: {
          heart: data.metrics.heartLineLength,
          head: data.metrics.headLineLength,
          life: data.metrics.lifeLineLength,
        },
        palmWidth: data.metrics.palmWidth,
        fingerSpan: data.metrics.fingerSpan,
        visionNotes: data.palmNotes ?? "",
      },
      tarot: data.cards,
      querentQuestion: data.question ?? "",
    };

    const raw = await callGemini({
      jsonOnly: true,
      messages: [
        { role: "system", content: READING_SYSTEM },
        {
          role: "user",
          content: `Fused multimodal payload:\n${JSON.stringify(payload, null, 2)}\n\nProduce the reading. Keep total length under 700 words.`,
        },
      ],
    });

    const parsed = parseJsonLoose<Omit<SynthesisResult, "latencyMs">>(raw);
    return {
      headline: parsed.headline ?? "A Reading of Hand and Card",
      overview: parsed.overview ?? "",
      handSignature: parsed.handSignature ?? "",
      positions: Array.isArray(parsed.positions) ? parsed.positions : [],
      guidance: Array.isArray(parsed.guidance) ? parsed.guidance.slice(0, 5) : [],
      closing: parsed.closing ?? "",
      latencyMs: Date.now() - started,
    };
  });
