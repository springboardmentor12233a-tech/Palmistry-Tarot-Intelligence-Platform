import { createFileRoute, Link } from "@tanstack/react-router";
import { Hand, Sparkles, FileDown, Gauge, ShieldCheck, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/SiteHeader";
import heroImage from "@/assets/hero-oracle.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Palmistry & Tarot Intelligence Platform | AI Palm & Tarot Readings" },
      {
        name: "description",
        content:
          "Scan your palm for 21 biometric landmarks, draw tarot cards, and receive a fused AI reading with light and shadow meanings — exportable as a styled PDF.",
      },
      { property: "og:title", content: "Palmistry & Tarot Intelligence Platform" },
      {
        property: "og:description",
        content:
          "Biometric palm segmentation fused with tarot symbolism into one empathetic AI reading.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  {
    icon: Hand,
    title: "Biometric palm segmentation",
    body: "21 landmark anchors (P0–P20) with the heart, head and life lines traced as glowing overlays on your own photograph.",
  },
  {
    icon: Layers,
    title: "Tarot intelligence engine",
    body: "Draw a single card or a Past · Present · Future spread from the full 78-card deck, with reversals and elemental taxonomy.",
  },
  {
    icon: Sparkles,
    title: "Multimodal AI synthesis",
    body: "Palm ratios and drawn card states are fused into one payload and interpreted side by side as light and shadow meanings.",
  },
  {
    icon: FileDown,
    title: "One-click PDF reports",
    body: "Export the full reading — biometrics, cards, both polarities and guidance — as a styled navy-and-gold document.",
  },
  {
    icon: Gauge,
    title: "Latency benchmarks",
    body: "Live metrics panel tracks landmark extraction and model inference against the 500 ms / 2000 ms budgets.",
  },
  {
    icon: ShieldCheck,
    title: "Private by default",
    body: "Hand images live in your own private storage folder; readings are visible only to you.",
  },
];

function Landing() {
  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main>
        <section className="relative overflow-hidden">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 lg:grid-cols-2 lg:py-24">
            <div className="animate-rise">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 px-3 py-1 text-[0.65rem] uppercase tracking-[0.24em] text-primary">
                Vision · Tarot · Gemini synthesis
              </span>
              <h1 className="mt-6 font-display text-4xl leading-[1.1] sm:text-5xl">
                Your hand is a map.
                <span className="text-gilded block">The cards are the legend.</span>
              </h1>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground">
                Upload or capture your palm, let the vision engine anchor 21 landmarks and trace
                your three principal creases, then draw the cards. Both signals are fused into a
                single, deeply personal reading.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link to="/studio">Begin a reading</Link>
                </Button>
                <Button asChild variant="secondary" size="lg">
                  <Link to="/studio" search={{ guest: true }}>
                    Preview as guest
                  </Link>
                </Button>
              </div>
              <div className="mt-8 flex flex-wrap gap-6 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                <span className="text-heart-line">Heart line</span>
                <span className="text-head-line">Head line</span>
                <span className="text-life-line">Life line</span>
                <span className="text-primary">4 elemental archetypes</span>
              </div>
            </div>

            <div className="animate-rise surface-panel overflow-hidden p-2">
              <img
                src={heroImage}
                alt="Golden palm line-art above three ornate tarot cards on a deep navy background"
                width={1536}
                height={1024}
                className="w-full rounded-xl"
              />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-20">
          <div className="gold-rule mb-10" />
          <h2 className="font-display text-2xl sm:text-3xl">A full divination pipeline</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <article key={feature.title} className="surface-panel p-6">
                <feature.icon className="size-5 text-primary" aria-hidden="true" />
                <h3 className="mt-4 font-display text-lg">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 pb-24 text-center">
          <div className="surface-panel px-6 py-12">
            <h2 className="font-display text-2xl sm:text-3xl">Ready when you are</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
              Guest preview needs no account. Create one to keep your reading history, saved
              spreads, palm scans and exported reports.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg">
                <Link to="/studio">Open the studio</Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link to="/auth">Create an account</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/70 px-4 py-8 text-center text-xs text-muted-foreground">
        For reflection and entertainment. Not medical, legal, or financial advice.
      </footer>
    </div>
  );
}
