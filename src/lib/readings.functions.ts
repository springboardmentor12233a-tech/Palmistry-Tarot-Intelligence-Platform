import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const saveInput = z.object({
  title: z.string().min(1).max(140),
  mode: z.enum(["single", "spread"]),
  handArchetype: z.string().nullable(),
  aspectRatio: z.number().nullable(),
  palmData: z.unknown().nullable(),
  tarotCards: z.unknown(),
  interpretation: z.unknown().nullable(),
  imagePath: z.string().nullable(),
  metrics: z.unknown().nullable(),
});

export const saveReading = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => saveInput.parse(input))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("readings")
      .insert({
        user_id: context.userId,
        title: data.title,
        mode: data.mode,
        hand_archetype: data.handArchetype,
        aspect_ratio: data.aspectRatio,
        palm_data: data.palmData as never,
        tarot_cards: data.tarotCards as never,
        interpretation: data.interpretation as never,
        image_path: data.imagePath,
        metrics: data.metrics as never,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const listReadings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("readings")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const deleteReading = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("readings").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
