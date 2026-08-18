import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { FileDown, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/SiteHeader";
import { PalmOverlay } from "@/components/PalmOverlay";
import { ReadingReport } from "@/components/ReadingReport";
import { Button } from "@/components/ui/button";
import { deleteReading, listReadings } from "@/lib/readings.functions";
import type { SynthesisResult } from "@/lib/ai.functions";
import type { PalmAnalysis, PalmMetrics } from "@/lib/palm";
import type { DrawnCard } from "@/lib/tarot";
import { exportReadingPdf } from "@/lib/pdf";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Your Dashboard · Saved Readings & Palm History" },
      {
        name: "description",
        content:
          "Review your saved tarot spreads, palm analysis history and exported reading reports in one place.",
      },
      { property: "og:title", content: "Your Dashboard · Saved Readings" },
      {
        property: "og:description",
        content: "Every palm scan, spread and interpretation you have saved.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

type ReadingRow = {
  id: string;
  title: string;
  mode: string;
  hand_archetype: string | null;
  aspect_ratio: number | null;
  palm_data: unknown;
  tarot_cards: unknown;
  interpretation: unknown;
  image_path: string | null;
  metrics: unknown;
  created_at: string;
};

function Dashboard() {
  const fetchReadings = useServerFn(listReadings);
  const removeReading = useServerFn(deleteReading);
  const queryClient = useQueryClient();
  const [openId, setOpenId] = useState<string | null>(null);
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});

  const { data, isPending, error } = useQuery({
    queryKey: ["readings"],
    queryFn: () => fetchReadings({}) as Promise<ReadingRow[]>,
  });

  const del = useMutation({
    mutationFn: (id: string) => removeReading({ data: { id } }),
    onSuccess: () => {
      toast.success("Reading deleted.");
      void queryClient.invalidateQueries({ queryKey: ["readings"] });
    },
    onError: () => toast.error("Could not delete that reading."),
  });

  async function toggle(row: ReadingRow) {
    const next = openId === row.id ? null : row.id;
    setOpenId(next);
    if (next && row.image_path && !signedUrls[row.id]) {
      const { data: signed } = await supabase.storage
        .from("palm-images")
        .createSignedUrl(row.image_path, 3600);
      if (signed?.signedUrl) {
        setSignedUrls((prev) => ({ ...prev, [row.id]: signed.signedUrl }));
      }
    }
  }

  const readings = data ?? [];
  const archetypeCounts = readings.reduce<Record<string, number>>((acc, row) => {
    if (row.hand_archetype) acc[row.hand_archetype] = (acc[row.hand_archetype] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <div className="animate-rise flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl">Your readings</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Saved spreads, palm analyses and interpretations — private to you.
            </p>
          </div>
          <Button asChild>
            <Link to="/studio">New reading</Link>
          </Button>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="surface-panel p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Saved readings
            </p>
            <p className="mt-2 font-display text-3xl text-primary">{readings.length}</p>
          </div>
          <div className="surface-panel p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Spreads drawn
            </p>
            <p className="mt-2 font-display text-3xl text-heart-line">
              {readings.filter((r) => r.mode === "spread").length}
            </p>
          </div>
          <div className="surface-panel p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Dominant archetype
            </p>
            <p className="mt-2 font-display text-3xl text-head-line">
              {Object.entries(archetypeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—"}
            </p>
          </div>
        </div>

        <div className="gold-rule my-8" />

        {isPending && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Loading your archive…
          </div>
        )}
        {error && (
          <p className="text-sm text-destructive">
            Your readings could not be loaded. Please refresh.
          </p>
        )}
        {!isPending && readings.length === 0 && (
          <div className="surface-panel p-8 text-center">
            <p className="font-display text-lg">Nothing archived yet</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Complete a reading in the studio and save it to build your history.
            </p>
            <Button asChild className="mt-5">
              <Link to="/studio">Open the studio</Link>
            </Button>
          </div>
        )}

        <div className="space-y-4">
          {readings.map((row) => {
            const interpretation = row.interpretation as SynthesisResult | null;
            const cards = (row.tarot_cards as DrawnCard[] | null) ?? [];
            const palm = row.palm_data as PalmAnalysis | null;
            const metrics = row.metrics as PalmMetrics | null;
            const isOpen = openId === row.id;
            return (
              <article key={row.id} className="surface-panel p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => void toggle(row)}
                    className="text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <h2 className="font-display text-lg text-foreground">{row.title}</h2>
                    <p className="mt-1 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                      {new Date(row.created_at).toLocaleString()} ·{" "}
                      {row.mode === "spread" ? "3-card spread" : "Single card"}
                      {row.hand_archetype ? ` · ${row.hand_archetype} hand` : ""}
                      {row.aspect_ratio ? ` · R=${Number(row.aspect_ratio).toFixed(3)}` : ""}
                    </p>
                  </button>
                  <div className="flex gap-2">
                    {interpretation && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() =>
                          exportReadingPdf({
                            reading: interpretation,
                            metrics,
                            cards,
                            createdAt: row.created_at,
                          })
                        }
                      >
                        <FileDown className="mr-2 size-4" /> PDF
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="secondary"
                      aria-label="Delete reading"
                      onClick={() => del.mutate(row.id)}
                      disabled={del.isPending}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>

                {isOpen && (
                  <div className="mt-5 space-y-5">
                    {palm && signedUrls[row.id] && (
                      <PalmOverlay
                        imageUrl={signedUrls[row.id]!}
                        analysis={palm}
                        className="max-w-sm"
                      />
                    )}
                    {interpretation && <ReadingReport reading={interpretation} cards={cards} />}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </main>
    </div>
  );
}
