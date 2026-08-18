import { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout.jsx";
import TarotCardFace from "../components/TarotCardFace.jsx";
import api from "../lib/api.js";

export default function TarotDeck() {
  const [deck, setDeck] = useState([]);
  const [arcana, setArcana] = useState("Major");
  const [query, setQuery] = useState("");

  useEffect(() => {
    api.get("/tarot/deck").then((res) => setDeck(res.data.cards));
  }, []);

  const filtered = useMemo(() => {
    return deck.filter((c) => {
      if (c.arcana !== arcana) return false;
      if (query && !c.name.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [deck, arcana, query]);

  return (
    <Layout eyebrow="Tarot" title="The Tarot Deck">
      <p className="text-muted -mt-6 mb-8 text-sm hidden md:block">
        Explore the complete {deck.length || 78} cards of the tarot.
      </p>
      <div className="mb-6 md:hidden">
        <p className="text-xs font-mono uppercase tracking-[0.2em] text-teal mb-2">Tarot</p>
        <h1 className="font-display text-3xl text-ink">The Tarot Deck</h1>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-8">
        <div className="flex gap-2">
          {["Major", "Minor"].map((a) => (
            <button
              key={a}
              onClick={() => setArcana(a)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                arcana === a ? "bg-ink text-cream" : "hairline text-muted hover:text-ink"
              }`}
            >
              {a} Arcana
            </button>
          ))}
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search card..."
          className="ml-auto bg-surface hairline rounded-lg px-3.5 py-2 text-sm text-ink outline-none focus:border-gold/60 w-48"
        />
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
        {filtered.map((card) => (
          <div key={card.name} className="flex flex-col items-center gap-2">
            <TarotCardFace card={card} size="md" revealed />
            <span className="text-xs text-ink text-center leading-tight">{card.name}</span>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-sm text-muted text-center py-10">No cards match "{query}".</p>
      )}
    </Layout>
  );
}
