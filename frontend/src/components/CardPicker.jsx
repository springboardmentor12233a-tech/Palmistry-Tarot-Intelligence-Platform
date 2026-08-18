import { useEffect, useMemo, useState } from "react";
import TarotCardFace from "./TarotCardFace.jsx";

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function CardPicker({ deck, positions, onComplete }) {
  const [order, setOrder] = useState(() => shuffle(deck.map((c) => c.name)));
  const [selected, setSelected] = useState([]); // array of card names, in pick order

  useEffect(() => {
    setOrder(shuffle(deck.map((c) => c.name)));
    setSelected([]);
  }, [positions.length]); // reshuffle if the chosen spread size changes

  const remaining = positions.length - selected.length;
  const done = remaining === 0;

  function pick(name) {
    if (done || selected.includes(name)) return;
    setSelected((s) => [...s, name]);
  }

  function reshuffle() {
    setOrder(shuffle(deck.map((c) => c.name)));
    setSelected([]);
  }

  const nextLabel = !done ? positions[selected.length] : null;

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <p className="text-sm text-muted">
          {done ? (
            <span className="text-gold">All {positions.length} cards chosen.</span>
          ) : (
            <>
              Tap a card for{" "}
              <span className="text-violet-soft font-medium">{nextLabel}</span>{" "}
              <span className="text-muted/70">
                ({selected.length + 1} of {positions.length})
              </span>
            </>
          )}
        </p>
        <button
          onClick={reshuffle}
          className="text-xs font-mono uppercase tracking-wide text-muted hover:text-gold transition-colors"
        >
          ↻ Reshuffle
        </button>
      </div>

      <div className="flex flex-wrap gap-2.5 justify-center max-h-[46vh] overflow-y-auto p-2 hairline rounded-2xl bg-cream-soft">
        {order.map((name) => {
          const idx = selected.indexOf(name);
          const isSelected = idx !== -1;
          return (
            <button
              key={name}
              onClick={() => pick(name)}
              disabled={done && !isSelected}
              className={`relative transition-transform hover:-translate-y-1 ${
                isSelected ? "opacity-40" : done ? "opacity-30" : "opacity-100"
              }`}
            >
              <TarotCardFace card={null} size="xs" revealed={false} />
              {isSelected && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="w-6 h-6 rounded-full bg-gold text-ink text-[10px] font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                </span>
              )}
            </button>
          );
        })}
      </div>

      {done && (
        <button
          onClick={() => onComplete(selected)}
          className="mt-6 w-full sm:w-auto px-8 py-3 rounded-lg bg-violet text-cream font-medium hover:opacity-90 transition-opacity shadow-violetGlow"
        >
          Reveal my reading
        </button>
      )}
    </div>
  );
}
