import { useEffect, useState } from "react";
import TarotCardFace from "./TarotCardFace.jsx";

export default function SpreadLayout({ cards, spreadKey }) {
  const [revealedCount, setRevealedCount] = useState(0);
  const isCross = spreadKey === "celtic_cross";

  useEffect(() => {
    setRevealedCount(0);
    const timers = cards.map((_, i) =>
      setTimeout(() => setRevealedCount((n) => Math.max(n, i + 1)), 350 + i * 260)
    );
    return () => timers.forEach(clearTimeout);
  }, [cards]);

  return (
    <div
      className={`relative w-full ${isCross ? "aspect-[4/3] md:aspect-[16/9]" : "aspect-[3/2] md:aspect-[3/1]"} hairline rounded-2xl bg-surface overflow-visible`}
    >
      {cards.map((c, i) => (
        <div
          key={c.position}
          className="absolute flex flex-col items-center gap-1.5"
          style={{
            left: `${c.x}%`,
            top: `${c.y}%`,
            transform: "translate(-50%, -50%)",
          }}
        >
          <TarotCardFace
            card={c}
            size={isCross ? "sm" : "md"}
            reversed={c.reversed}
            revealed={i < revealedCount}
          />
          <span className="text-[10px] font-mono text-muted uppercase tracking-wide text-center max-w-20 leading-tight">
            {c.position}
          </span>
        </div>
      ))}
    </div>
  );
}
