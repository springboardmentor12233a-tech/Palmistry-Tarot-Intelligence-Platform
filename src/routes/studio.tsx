import { useCallback, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { FileDown, Layers, Loader2, Save, Sparkles, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { SiteHeader } from "@/components/SiteHeader";
import { PalmUploader } from "@/components/PalmUploader";
import { PalmOverlay } from "@/components/PalmOverlay";
import { TarotCardView } from "@/components/TarotCardView";
import { MetricsPanel } from "@/components/MetricsPanel";
import { ReadingReport } from "@/components/ReadingReport";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { analyzePalm, synthesizeReading, type SynthesisResult } from "@/lib/ai.functions";
import { saveReading } from "@/lib/readings.functions";
import { computeMetrics, type PalmAnalysis, type PalmMetrics } from "@/lib/palm";
import { drawCards, type DrawnCard } from "@/lib/tarot";
import { exportReadingPdf } from "@/lib/pdf";
import { useSession } from "@/hooks/useSession";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/studio")({
  validateSearch: z.object({ guest: z.boolean().optional() }),
  head: () => ({
    meta: [
      { title: "Reading Studio · Palm Scan & Tarot Draw" },
      {
        name: "description",
        content:
          "Scan your palm for 21 landmarks and three principal lines, draw one card or a three-card spread, and fuse both into one AI reading.",
      },
      { property: "og:title", content: "Reading Studio · Palm Scan & Tarot Draw" },
      {
        property: "og:description",
        content: "Palm biometrics plus tarot symbolism, fused into a single deep reading.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Studio,
});

function Studio() {
  const { user } = useSession();
  const runAnalyze = useServerFn(analyzePalm);
  const runSynthesis = useServerFn(synthesizeReading);
  const runSave = useServerFn(saveReading);

  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<PalmAnalysis | null>(null);
  const [landmarkMs, setLandmarkMs] = useState<number | null>(null);
  const [inferenceMs, setInferenceMs] = useState<number | null>(null);
  const [showLandmarks, setShowLandmarks] = useState(true);
  const [showLines, setShowLines] = useState(true);

  const [mode, setMode] = useState<"single" | "spread">("single");
  const [cards, setCards] = useState<DrawnCard[]>([]);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  const [question, setQuestion] = useState("");
  const [reading, setReading] = useState<SynthesisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [synthesizing, setSynthesizing] = useState(false);
  const [saving, setSaving] = useState(false);

  const metrics: PalmMetrics | null = useMemo(
    () => (analysis ? computeMetrics(analysis) : null),
    [analysis],
  );

  const handleImage = useCallback(
    async (dataUrl: string) => {
      setImageDataUrl(dataUrl);
      setAnalysis(null);
      setReading(null);
      setAnalyzing(true);
      const started = performance.now();
      try {
        const result = await runAnalyze({ data: { imageDataUrl: dataUrl } });
        setAnalysis({
          landmarks: result.landmarks,
          lines: result.lines,
          handedness: result.handedness,
          quality: result.quality,
          notes: result.notes,
        });
        setLandmarkMs(Math.round(performance.now() - started));
        toast.success("Palm segmented.");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Palm analysis failed.");
        setImageDataUrl(null);
      } finally {
        setAnalyzing(false);
      }
    },
    [runAnalyze],
  );

  const draw = useCallback((count: 1 | 3) => {
    const next = drawCards(count);
    setMode(count === 1 ? "single" : "spread");
    setCards(next);
    setRevealed({});
    setReading(null);
    setTimeout(() => {
      setRevealed(Object.fromEntries(next.map((c) => [c.position, true])));
    }, 260);
  }, []);

  const synthesize = useCallback(async () => {
    if (!metrics || cards.length === 0) {
      toast.error("Scan a palm and draw at least one card first.");
      return;
    }
    setSynthesizing(true);
    const started = performance.now();
    try {
      const result = await runSynthesis({
        data: {
          metrics,
          palmNotes: analysis?.notes ?? "",
          question: question.slice(0, 400),
          cards: cards.map((c) => ({
            name: c.name,
            arcana: c.arcana,
            suit: c.suit,
            element: c.element,
            reversed: c.reversed,
            position: c.position,
            positionMeaning: c.positionMeaning,
            light: c.light,
            shadow: c.shadow,
          })),
        },
      });
      setReading(result);
      setInferenceMs(Math.round(performance.now() - started));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Synthesis failed.");
    } finally {
      setSynthesizing(false);
    }
  }, [analysis, cards, metrics, question, runSynthesis]);

  const save = useCallback(async () => {
    if (!user || !reading) return;
    setSaving(true);
    try {
      let imagePath: string | null = null;
      if (imageDataUrl) {
        const blob = await (await fetch(imageDataUrl)).blob();
        const path = `${user.id}/${Date.now()}.jpg`;
        const { error } = await supabase.storage
          .from("palm-images")
          .upload(path, blob, { contentType: "image/jpeg" });
        if (!error) imagePath = path;
      }
      await runSave({
        data: {
          title: reading.headline,
          mode,
          handArchetype: metrics?.archetype ?? null,
          aspectRatio: metrics?.aspectRatio ?? null,
          palmData: analysis,
          tarotCards: cards,
          interpretation: reading,
          imagePath,
          metrics: { ...metrics, landmarkMs, inferenceMs },
        },
      });
      toast.success("Reading saved to your dashboard.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save the reading.");
    } finally {
      setSaving(false);
    }
  }, [analysis, cards, imageDataUrl, inferenceMs, landmarkMs, metrics, mode, reading, runSave, user]);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="animate-rise">
          <h1 className="font-display text-3xl">Reading Studio</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Step one: offer your palm. Step two: draw the cards. Step three: let both signals fuse
            into one reading.
            {!user && (
              <>
                {" "}
                You&apos;re in guest preview —{" "}
                <Link to="/auth" className="text-primary underline">
                  sign in
                </Link>{" "}
                to save readings.
              </>
            )}
          </p>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_1fr]">
          <section className="space-y-6">
            <div>
              <h2 className="font-display text-xl">1 · Palm segmentation</h2>
              <div className="gold-rule my-4" />
              {analysis && imageDataUrl ? (
                <div className="space-y-3">
                  <PalmOverlay
                    imageUrl={imageDataUrl}
                    analysis={analysis}
                    showLandmarks={showLandmarks}
                    showLines={showLines}
                  />
                  <div className="flex flex-wrap items-center gap-6 rounded-xl border border-border bg-background/40 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Switch
                        id="landmarks"
                        checked={showLandmarks}
                        onCheckedChange={setShowLandmarks}
                      />
                      <Label htmlFor="landmarks" className="text-xs">
                        Landmarks P0–P20
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch id="lines" checked={showLines} onCheckedChange={setShowLines} />
                      <Label htmlFor="lines" className="text-xs">
                        Palmar lines
                      </Label>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setImageDataUrl(null);
                        setAnalysis(null);
                        setReading(null);
                      }}
                    >
                      New scan
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {analysis.handedness !== "unknown" ? `${analysis.handedness} hand · ` : ""}
                    capture quality {analysis.quality} · {analysis.notes}
                  </p>
                </div>
              ) : (
                <PalmUploader
                  onImage={(url) => void handleImage(url)}
                  imageUrl={imageDataUrl}
                  onClear={() => setImageDataUrl(null)}
                  busy={analyzing}
                />
              )}
            </div>

            <div>
              <h2 className="font-display text-xl">2 · Draw the cards</h2>
              <div className="gold-rule my-4" />
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => draw(1)} variant={mode === "single" ? "default" : "secondary"}>
                  <Wand2 className="mr-2 size-4" /> Draw 1 card
                </Button>
                <Button onClick={() => draw(3)} variant={mode === "spread" ? "default" : "secondary"}>
                  <Layers className="mr-2 size-4" /> Draw 3-card spread
                </Button>
              </div>

              {cards.length > 0 && (
                <div
                  className={`mt-6 grid gap-4 ${cards.length === 1 ? "max-w-[220px]" : "grid-cols-3"}`}
                >
                  {cards.map((card) => (
                    <div key={card.position} className="animate-rise space-y-2">
                      <p className="text-center text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
                        {card.position}
                        <span className="block text-[0.6rem] opacity-70">
                          {card.positionMeaning}
                        </span>
                      </p>
                      <TarotCardView
                        card={card}
                        revealed={revealed[card.position] ?? false}
                        onClick={() =>
                          setRevealed((prev) => ({
                            ...prev,
                            [card.position]: !(prev[card.position] ?? false),
                          }))
                        }
                      />
                    </div>
                  ))}
                </div>
              )}

              {cards.length > 0 && (
                <div className="mt-5 space-y-4">
                  {cards.map((card) => (
                    <div
                      key={`detail-${card.position}`}
                      className="surface-panel space-y-2 p-4 text-sm"
                    >
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <span className="font-display text-base text-primary">{card.name}</span>
                        <span className="text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground">
                          {card.arcana === "Major" ? "Major Arcana" : card.suit} · {card.element} ·{" "}
                          {card.reversed ? "Reversed" : "Upright"}
                        </span>
                      </div>
                      <p className="text-head-line">
                        <span className="text-[0.65rem] uppercase tracking-widest">Light — </span>
                        {card.light}
                      </p>
                      <p className="text-life-line">
                        <span className="text-[0.65rem] uppercase tracking-widest">Shadow — </span>
                        {card.shadow}
                      </p>
                      <p className="text-muted-foreground">
                        <span className="text-[0.65rem] uppercase tracking-widest">Fortune — </span>
                        {card.fortune}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <MetricsPanel
              metrics={metrics}
              landmarkMs={landmarkMs}
              inferenceMs={inferenceMs}
              landmarkCount={analysis?.landmarks.length ?? null}
            />

            <div className="surface-panel space-y-4 p-5">
              <h3 className="font-display text-lg">3 · Fuse &amp; interpret</h3>
              <div className="space-y-2">
                <Label htmlFor="question" className="text-xs">
                  Optional focus question
                </Label>
                <Input
                  id="question"
                  value={question}
                  maxLength={400}
                  placeholder="What should I know about this next chapter?"
                  onChange={(e) => setQuestion(e.target.value)}
                />
              </div>
              <Button
                className="w-full"
                onClick={() => void synthesize()}
                disabled={synthesizing || !metrics || cards.length === 0}
              >
                {synthesizing ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 size-4" />
                )}
                {synthesizing ? "Consulting the oracle…" : "Generate deep reading"}
              </Button>
              {reading && (
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={() =>
                      exportReadingPdf({ reading, metrics, cards, imageDataUrl })
                    }
                  >
                    <FileDown className="mr-2 size-4" /> Export PDF
                  </Button>
                  {user ? (
                    <Button variant="secondary" onClick={() => void save()} disabled={saving}>
                      {saving ? (
                        <Loader2 className="mr-2 size-4 animate-spin" />
                      ) : (
                        <Save className="mr-2 size-4" />
                      )}
                      Save
                    </Button>
                  ) : (
                    <Button asChild variant="secondary">
                      <Link to="/auth">Sign in to save</Link>
                    </Button>
                  )}
                </div>
              )}
              {!metrics && (
                <p className="text-xs text-muted-foreground">
                  A palm scan is required before synthesis so the reading can be fused with your
                  biometrics.
                </p>
              )}
            </div>
          </aside>
        </div>

        {reading && (
          <section className="mt-12">
            <ReadingReport reading={reading} cards={cards} />
          </section>
        )}
      </main>
    </div>
  );
}
