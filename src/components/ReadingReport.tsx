import { Sparkles } from "lucide-react";
import type { SynthesisResult } from "@/lib/ai.functions";
import type { DrawnCard } from "@/lib/tarot";

export function ReadingReport({
  reading,
  cards,
}: {
  reading: SynthesisResult;
  cards: DrawnCard[];
}) {
  const cardBy = new Map(cards.map((c) => [c.position, c]));

  return (
    <div className="animate-rise space-y-6">
      <header className="surface-panel p-6">
        <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-primary">
          <Sparkles className="size-3.5" /> Multimodal synthesis
        </span>
        <h2 className="text-gilded mt-3 font-display text-2xl leading-tight sm:text-3xl">
          {reading.headline}
        </h2>
        <div className="gold-rule my-4" />
        <p className="text-sm leading-relaxed text-foreground/90">{reading.overview}</p>
        {reading.handSignature && (
          <p className="mt-4 rounded-xl border border-border bg-background/40 p-4 text-sm leading-relaxed text-muted-foreground">
            <span className="font-display text-primary">Hand signature — </span>
            {reading.handSignature}
          </p>
        )}
      </header>

      <div className="grid gap-5">
        {reading.positions.map((pos) => {
          const card = cardBy.get(pos.position);
          return (
            <article key={`${pos.position}-${pos.card}`} className="surface-panel p-6">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-display text-xl">{pos.position}</h3>
                <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  {card?.positionMeaning ?? ""}
                </span>
              </div>
              <p className="mt-1 text-sm text-primary">
                {pos.card}
                {card?.reversed ? " · reversed" : ""}
                {card ? ` · ${card.element}` : ""}
              </p>
              <div className="gold-rule my-4" />
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-head-line/30 bg-background/30 p-4">
                  <h4 className="text-xs uppercase tracking-[0.2em] text-head-line">
                    Light meaning
                  </h4>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/90">{pos.light}</p>
                </div>
                <div className="rounded-xl border border-life-line/30 bg-background/30 p-4">
                  <h4 className="text-xs uppercase tracking-[0.2em] text-life-line">
                    Shadow meaning
                  </h4>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/90">{pos.shadow}</p>
                </div>
              </div>
              {pos.fusion && (
                <p className="mt-4 text-sm italic leading-relaxed text-heart-line/90">
                  {pos.fusion}
                </p>
              )}
            </article>
          );
        })}
      </div>

      {reading.guidance.length > 0 && (
        <section className="surface-panel p-6">
          <h3 className="font-display text-xl">Guidance</h3>
          <div className="gold-rule my-4" />
          <ul className="space-y-3">
            {reading.guidance.map((item) => (
              <li key={item} className="flex gap-3 text-sm leading-relaxed">
                <span className="mt-1 text-primary">◈</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {reading.closing && (
        <p className="px-2 text-center font-display text-lg text-gold-soft">{reading.closing}</p>
      )}
    </div>
  );
}
