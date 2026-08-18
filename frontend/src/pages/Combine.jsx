import { useEffect, useState } from "react";
import Layout from "../components/Layout.jsx";
import ConstellationLoader from "../components/ConstellationLoader.jsx";
import ReportView from "../components/ReportView.jsx";
import api from "../lib/api.js";

export default function Combine() {
  const [readings, setReadings] = useState([]);
  const [palmId, setPalmId] = useState(null);
  const [tarotId, setTarotId] = useState(null);
  const [status, setStatus] = useState("select"); // select | loading | done | error
  const [reading, setReading] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/reports/history").then((res) => setReadings(res.data));
  }, []);

  const palmOptions = readings.filter((r) => r.type === "palm");
  const tarotOptions = readings.filter((r) => r.type === "tarot");

  async function combine() {
    setStatus("loading");
    setError("");
    try {
      const res = await api.post("/reports/combine", {
        palm_reading_id: palmId,
        tarot_reading_id: tarotId,
      });
      setReading(res.data);
      setStatus("done");
    } catch (err) {
      setError(err.response?.data?.detail || "Could not combine these readings.");
      setStatus("error");
    }
  }

  if (status === "done" && reading) {
    return (
      <Layout eyebrow="Combine" title="Your Combined Reading">
        <div className="space-y-6">
          <ReportView reading={reading} />
          <button
            onClick={() => {
              setStatus("select");
              setReading(null);
            }}
            className="text-sm text-muted hover:text-gold transition-colors"
          >
            ← Combine another pair
          </button>
        </div>
      </Layout>
    );
  }

  if (status === "loading") {
    return (
      <Layout eyebrow="Combine" title="Weaving Your Reading">
        <div className="hairline rounded-2xl bg-surface p-10">
          <ConstellationLoader label="Weaving your palm and cards together..." />
        </div>
      </Layout>
    );
  }

  return (
    <Layout eyebrow="Combine" title="Merge a Reading">
      <p className="text-muted -mt-6 mb-8 text-sm max-w-lg hidden md:block">
        Pick one palm reading and one tarot reading. The AI synthesizes them into a single
        report covering love, career, money, health, and guidance.
      </p>
      <div className="mb-8 md:hidden">
        <p className="text-xs font-mono uppercase tracking-[0.2em] text-teal mb-2">Combine</p>
        <h1 className="font-display text-3xl text-ink">Merge a reading</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-3xl mb-8">
        <div>
          <h3 className="text-xs font-mono uppercase tracking-wider text-muted mb-3">
            Palm reading
          </h3>
          <div className="space-y-2">
            {palmOptions.length === 0 && (
              <p className="text-sm text-muted hairline rounded-lg p-4">No palm readings yet.</p>
            )}
            {palmOptions.map((r) => (
              <button
                key={r.id}
                onClick={() => setPalmId(r.id)}
                className={`w-full text-left p-3 rounded-lg hairline transition-colors ${
                  palmId === r.id ? "bg-surface-raised border-gold/50" : "bg-surface hover:bg-surface-raised/60"
                }`}
              >
                <p className={`text-sm ${palmId === r.id ? "text-gold-dim" : "text-ink"}`}>{r.title}</p>
                <p className="text-xs text-muted font-mono mt-0.5">
                  {new Date(r.created_at).toLocaleDateString()}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-mono uppercase tracking-wider text-muted mb-3">
            Tarot reading
          </h3>
          <div className="space-y-2">
            {tarotOptions.length === 0 && (
              <p className="text-sm text-muted hairline rounded-lg p-4">No tarot readings yet.</p>
            )}
            {tarotOptions.map((r) => (
              <button
                key={r.id}
                onClick={() => setTarotId(r.id)}
                className={`w-full text-left p-3 rounded-lg hairline transition-colors ${
                  tarotId === r.id ? "bg-surface-raised border-violet/50" : "bg-surface hover:bg-surface-raised/60"
                }`}
              >
                <p className={`text-sm ${tarotId === r.id ? "text-violet" : "text-ink"}`}>{r.title}</p>
                <p className="text-xs text-muted font-mono mt-0.5">
                  {new Date(r.created_at).toLocaleDateString()}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-red-700 mb-4">{error}</p>}

      <button
        onClick={combine}
        disabled={!palmId || !tarotId}
        className="px-6 py-3 rounded-lg bg-teal text-cream font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Combine readings
      </button>
    </Layout>
  );
}
