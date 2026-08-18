import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout.jsx";
import ConstellationLoader from "../components/ConstellationLoader.jsx";
import ReportView from "../components/ReportView.jsx";
import SpreadLayout from "../components/SpreadLayout.jsx";
import CardPicker from "../components/CardPicker.jsx";
import MiniSpreadIcon from "../components/MiniSpreadIcon.jsx";
import api from "../lib/api.js";

const SPREAD_INFO = [
  { key: "single", label: "Single Card", desc: "One card, one clear answer." },
  { key: "three", label: "Past · Present · Future", desc: "The classic three-card arc." },
  { key: "relationship", label: "Relationship", desc: "You, them, the connection, the path forward." },
  { key: "career", label: "Career", desc: "Current path, obstacle, strength, outcome." },
  { key: "celtic_cross", label: "Celtic Cross", desc: "A deep, ten-card layout." },
  { key: "life_path", label: "Life Path", desc: "Where you've been, and where you're going." },
];

export default function Tarot() {
  const [spread, setSpread] = useState("three");
  const [deck, setDeck] = useState([]);
  const [spreads, setSpreads] = useState(null);
  const [status, setStatus] = useState("select"); // select | picking | drawing | done | error
  const [reading, setReading] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/tarot/deck").then((res) => setDeck(res.data.cards));
    api.get("/tarot/spreads").then((res) => setSpreads(res.data));
  }, []);

  const positions = spreads?.[spread]?.positions || [];

  async function submitSelection(cardNames) {
    setStatus("drawing");
    setError("");
    try {
      const res = await api.post("/tarot/draw-selected", { spread, card_names: cardNames });
      setReading(res.data);
      setStatus("done");
    } catch (err) {
      setError(err.response?.data?.detail || "Could not complete the reading.");
      setStatus("error");
    }
  }

  function reset() {
    setReading(null);
    setStatus("select");
    setError("");
  }

  if (status === "done" && reading) {
    const cards = reading.input_data?.cards || [];
    return (
      <Layout eyebrow="Tarot" title="Your Reading">
        <div className="space-y-8">
          <SpreadLayout cards={cards} spreadKey={reading.input_data?.spread || spread} />
          <ReportView reading={reading} showImages={false} />
          <button onClick={reset} className="text-sm text-muted hover:text-gold transition-colors">
            ← Draw a new spread
          </button>
        </div>
      </Layout>
    );
  }

  if (status === "drawing") {
    return (
      <Layout eyebrow="Tarot" title="Reading...">
        <div className="hairline rounded-2xl bg-surface p-10">
          <ConstellationLoader label="Reading the cards you chose..." />
        </div>
      </Layout>
    );
  }

  if (status === "picking") {
    return (
      <Layout eyebrow={spreads?.[spread]?.label || "Tarot"} title="Choose Your Cards">
        <button
          onClick={() => setStatus("select")}
          className="text-sm text-muted hover:text-gold transition-colors mb-6 -mt-4 block"
        >
          ← Change spread
        </button>
        <div className="mb-6 md:hidden">
          <p className="text-xs font-mono uppercase tracking-[0.2em] text-teal mb-2">
            {spreads?.[spread]?.label}
          </p>
          <h1 className="font-display text-3xl text-ink">Choose your cards</h1>
        </div>
        <p className="text-muted mb-6 text-sm max-w-lg">
          The deck is shuffled and face-down. Trust your instinct and tap a card for each
          position, in order.
        </p>

        {error && <p className="text-sm text-red-700 mb-4">{error}</p>}

        {deck.length > 0 && (
          <CardPicker deck={deck} positions={positions} onComplete={submitSelection} />
        )}
      </Layout>
    );
  }

  return (
    <Layout eyebrow="Tarot" title="Draw a Spread">
      <p className="text-muted -mt-6 mb-8 text-sm max-w-lg hidden md:block">
        Choose a layout from the full {deck.length || 78}-card deck. You'll pick each card
        yourself from a face-down spread, and it's interpreted for its position.
      </p>
      <div className="mb-8 md:hidden">
        <p className="text-xs font-mono uppercase tracking-[0.2em] text-teal mb-2">Tarot</p>
        <h1 className="font-display text-3xl text-ink">Draw a spread</h1>
      </div>

      <div className="grid sm:grid-cols-2 gap-3 mb-8 max-w-2xl">
        {SPREAD_INFO.map((s) => (
          <button
            key={s.key}
            onClick={() => setSpread(s.key)}
            className={`text-left p-4 rounded-xl hairline transition-colors ${
              spread === s.key ? "bg-surface-raised border-gold/50" : "bg-surface hover:bg-surface-raised/60"
            }`}
          >
            <MiniSpreadIcon layout={spreads?.[s.key]?.layout} />
            <p className={`text-sm font-medium mt-1 ${spread === s.key ? "text-gold-dim" : "text-ink"}`}>
              {s.label}
            </p>
            <p className="text-xs text-muted mt-1">{s.desc}</p>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <button
          onClick={() => setStatus("picking")}
          className="px-6 py-3 rounded-lg bg-violet text-cream font-medium hover:opacity-90 transition-opacity shadow-violetGlow"
        >
          Continue to Select Cards →
        </button>
        <Link
          to="/tarot/deck"
          className="text-sm px-4 py-2.5 rounded-lg hairline text-ink hover:bg-surface-raised transition-colors inline-flex items-center gap-1.5"
        >
          View All 78 Cards <span className="text-gold">+</span>
        </Link>
      </div>
    </Layout>
  );
}
