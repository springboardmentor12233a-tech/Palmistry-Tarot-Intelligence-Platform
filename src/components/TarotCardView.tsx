import { cn } from "@/lib/utils";
import type { DrawnCard } from "@/lib/tarot";

const ELEMENT_TINT: Record<string, string> = {
  Fire: "text-life-line",
  Water: "text-heart-line",
  Air: "text-head-line",
  Earth: "text-primary",
  Aether: "text-gold-soft",
};

export function TarotCardView({
  card,
  revealed,
  onClick,
  className,
}: {
  card: DrawnCard;
  revealed: boolean;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <div className={cn("tarot-scene w-full", className)}>
      <button
        type="button"
        onClick={onClick}
        aria-label={revealed ? `${card.name}${card.reversed ? " reversed" : ""}` : "Reveal card"}
        className="block w-full cursor-pointer rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div
          className="tarot-flipper relative aspect-[2/3.4] w-full"
          style={{ transform: revealed ? "rotateY(180deg)" : "rotateY(0deg)" }}
        >
          {/* Back */}
          <div className="tarot-face absolute inset-0 overflow-hidden rounded-2xl border border-primary/40 bg-card shadow-[var(--shadow-gold)]">
            <div
              className="absolute inset-0 opacity-60"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(45deg, color-mix(in oklab, var(--gold) 14%, transparent) 0 2px, transparent 2px 10px), repeating-linear-gradient(-45deg, color-mix(in oklab, var(--accent) 12%, transparent) 0 2px, transparent 2px 10px)",
              }}
            />
            <div className="absolute inset-3 rounded-xl border border-primary/30" />
            <div className="absolute inset-0 grid place-items-center">
              <div className="animate-orbit grid size-16 place-items-center rounded-full border border-primary/50 text-2xl text-primary">
                ✷
              </div>
            </div>
          </div>

          {/* Face */}
          <div
            className="tarot-face absolute inset-0 overflow-hidden rounded-2xl border border-primary/50 bg-card shadow-[var(--shadow-gold)]"
            style={{ transform: "rotateY(180deg)" }}
          >
            <div
              className={cn(
                "flex h-full flex-col items-center justify-between p-3 text-center",
                card.reversed && "rotate-180",
              )}
            >
              <span className="font-display text-xs tracking-[0.2em] text-primary">
                {card.numeral}
              </span>
              <div className="flex flex-col items-center gap-2">
                <span className={cn("text-4xl", ELEMENT_TINT[card.element] ?? "text-primary")}>
                  {card.glyph}
                </span>
                <span className="font-display text-[0.78rem] leading-tight text-foreground">
                  {card.name}
                </span>
                <span className="text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
                  {card.arcana === "Major" ? "Major Arcana" : card.suit} · {card.element}
                </span>
              </div>
              <span className="gold-rule w-2/3" />
            </div>
            {card.reversed && (
              <span className="absolute right-2 top-2 rounded-full bg-background/80 px-2 py-0.5 text-[0.55rem] uppercase tracking-widest text-life-line">
                Reversed
              </span>
            )}
          </div>
        </div>
      </button>
    </div>
  );
}
