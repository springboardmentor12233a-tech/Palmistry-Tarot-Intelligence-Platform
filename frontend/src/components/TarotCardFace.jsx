const SYMBOLS = {
  star: "✦",
  flame: "🜂",
  chalice: "⌾",
  blade: "⚔",
  coin: "◍",
};

// Suit accent colors kept close to the maroon/gold/cream family, with a
// distinct hue per suit so a spread reads clearly at a glance.
const SUIT_ACCENT = {
  Trump: { ring: "#8A6A34", ink: "#6B1F3A" },
  Wands: { ring: "#B5651D", ink: "#8A4A18" },
  Cups: { ring: "#3D6E77", ink: "#2C5158" },
  Swords: { ring: "#5B6270", ink: "#454B57" },
  Pentacles: { ring: "#6B7A3D", ink: "#525E2E" },
};

const DIMS = {
  xs: "w-10 h-14",
  sm: "w-16 h-24",
  md: "w-24 h-36",
  lg: "w-32 h-48",
  xl: "w-44 h-64",
};

function CardBack({ dims }) {
  const rays = Array.from({ length: 20 }, (_, i) => i * 18);
  return (
    <div
      className={`absolute inset-0 rounded-md bg-ink overflow-hidden`}
      style={{ backfaceVisibility: "hidden" }}
    >
      <div className="absolute inset-1 rounded-sm border border-gold/40" />
      <div className="absolute inset-[5px] rounded-sm border border-gold/20" />
      <svg viewBox="0 0 100 150" className="absolute inset-0 w-full h-full">
        <g transform="translate(50 75)">
          {rays.map((deg) => (
            <line
              key={deg}
              x1="0"
              y1="0"
              x2="0"
              y2="-40"
              stroke="#D9B876"
              strokeWidth="0.6"
              opacity="0.5"
              transform={`rotate(${deg})`}
            />
          ))}
          <circle r="7" fill="none" stroke="#D9B876" strokeWidth="1" opacity="0.8" />
          <circle r="2.2" fill="#D9B876" />
        </g>
      </svg>
    </div>
  );
}

function CardFront({ card, accent, glyph, reversed }) {
  const hasArt = Boolean(card?.img);

  return (
    <div
      className={`absolute inset-0 rounded-md bg-surface border overflow-hidden ${reversed ? "rotate-180" : ""}`}
      style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)", borderColor: accent.ring + "80" }}
    >
      {hasArt ? (
        <img
          src={card.img}
          alt={card.name}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => {
            // Real art failed to load (e.g. file missing) - fall back to the
            // SVG glyph design by hiding the broken <img>.
            e.currentTarget.style.display = "none";
          }}
        />
      ) : null}

      {!hasArt && (
        <>
          <div
            className="absolute inset-[3px] rounded-sm"
            style={{ border: `1px solid ${accent.ring}55` }}
          />
          <div className="relative h-full flex flex-col items-center justify-between p-2">
            <span
              className="text-[8px] font-mono self-start pt-0.5 pl-0.5"
              style={{ color: accent.ink, opacity: 0.75 }}
            >
              {card?.arcana === "Major" ? String(card.number).padStart(2, "0") : card?.suit}
            </span>
            <span
              className="w-8 h-8 rounded-full flex items-center justify-center text-base"
              style={{ border: `1px solid ${accent.ring}70`, color: accent.ink }}
            >
              {glyph}
            </span>
            <span
              className="text-[8.5px] leading-tight text-center px-0.5 pb-0.5 font-medium font-display"
              style={{ color: accent.ink }}
            >
              {card?.name}
            </span>
          </div>
        </>
      )}
    </div>
  );
}

export default function TarotCardFace({ card, size = "md", reversed = false, revealed = true }) {
  const dims = DIMS[size] || DIMS.md;
  const accent = SUIT_ACCENT[card?.suit] || SUIT_ACCENT.Trump;
  const glyph = SYMBOLS[card?.symbol] || "✦";
  const title = card
    ? `${card.name}${reversed ? " (Reversed)" : ""}${card.keywords?.length ? " — " + card.keywords.join(", ") : ""}`
    : undefined;

  return (
    <div className={`${dims} shrink-0`} style={{ perspective: "1000px" }} title={title}>
      <div
        className="relative w-full h-full transition-transform duration-700"
        style={{ transformStyle: "preserve-3d", transform: revealed ? "rotateY(180deg)" : "rotateY(0deg)" }}
      >
        <CardBack dims={dims} />
        <CardFront card={card} accent={accent} glyph={glyph} reversed={reversed} />
      </div>
    </div>
  );
}
