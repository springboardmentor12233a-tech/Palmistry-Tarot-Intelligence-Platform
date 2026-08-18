import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout.jsx";
import api from "../lib/api.js";

const TYPE_COLOR = {
  palm: "text-gold",
  tarot: "text-violet-soft",
  combined: "text-teal",
};

export default function History() {
  const [readings, setReadings] = useState(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    api.get("/reports/history").then((res) => setReadings(res.data));
  }, []);

  const filtered = readings?.filter((r) => filter === "all" || r.type === filter) || [];

  return (
    <Layout eyebrow="History" title="Your Readings">
      <div className="mb-6 md:hidden">
        <p className="text-xs font-mono uppercase tracking-[0.2em] text-teal mb-2">History</p>
        <h1 className="font-display text-3xl text-ink">Your readings</h1>
      </div>

      <div className="flex gap-2 mb-6">
        {["all", "palm", "tarot", "combined"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-mono uppercase tracking-wide transition-colors ${
              filter === f ? "bg-surface-raised text-ivory hairline" : "text-muted hover:text-ivory"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {readings === null ? (
        <p className="text-sm text-muted">Loading...</p>
      ) : filtered.length === 0 ? (
        <div className="hairline rounded-xl bg-surface/30 p-10 text-center text-sm text-muted">
          No readings here yet.
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((r) => (
            <Link
              key={r.id}
              to={`/reading/${r.id}`}
              className="flex items-center justify-between hairline rounded-lg bg-surface/40 hover:bg-surface-raised transition-colors p-4"
            >
              <div className="min-w-0">
                <p className="text-sm text-ivory truncate">{r.title}</p>
                <p className="text-xs text-muted font-mono mt-0.5">
                  {new Date(r.created_at).toLocaleString()}
                </p>
              </div>
              <span className={`text-xs font-mono uppercase tracking-wide shrink-0 ml-4 ${TYPE_COLOR[r.type] || ""}`}>
                {r.type}
              </span>
            </Link>
          ))}
        </div>
      )}
    </Layout>
  );
}
