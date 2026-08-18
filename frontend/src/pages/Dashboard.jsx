import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../lib/api.js";

export default function Dashboard() {
  const { user } = useAuth();
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    api.get("/reports/history").then((res) => setRecent(res.data.slice(0, 4)));
  }, []);

  return (
    <Layout eyebrow="Dashboard" title={`Good ${greeting()}, ${user?.name?.split(" ")[0] || ""}`}>
      <p className="text-muted -mt-6 mb-8 text-sm hidden md:block">
        What would you like to explore today?
      </p>
      <div className="mb-8 md:hidden animate-floatUp">
        <p className="text-xs font-mono uppercase tracking-[0.2em] text-teal mb-2">Dashboard</p>
        <h1 className="font-display text-3xl text-ink">Welcome back, {user?.name?.split(" ")[0]}</h1>
        <p className="text-muted mt-2 text-sm">Choose a path, or pick up where you left off.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
        <Link
          to="/palmistry"
          className="group hairline rounded-2xl bg-surface p-7 hover:shadow-glow transition-shadow relative"
        >
          <span className="w-14 h-14 rounded-full bg-cream-soft border border-gold/30 flex items-center justify-center text-2xl text-gold mb-4">
            ✋
          </span>
          <h2 className="font-display text-xl mb-2 text-ink">Palm Reading</h2>
          <p className="text-sm text-muted leading-relaxed mb-5">
            Upload a photo of your palm and receive AI-powered insights into your lines.
          </p>
          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-violet-soft/25 text-violet text-xs font-medium group-hover:bg-violet-soft/40 transition-colors">
            Start Palm Reading →
          </span>
        </Link>

        <Link
          to="/tarot"
          className="group hairline rounded-2xl bg-surface p-7 hover:shadow-glow transition-shadow relative"
        >
          <span className="w-14 h-14 rounded-full bg-cream-soft border border-gold/30 flex items-center justify-center text-2xl text-violet mb-4">
            ✦
          </span>
          <h2 className="font-display text-xl mb-2 text-ink">Tarot Reading</h2>
          <p className="text-sm text-muted leading-relaxed mb-5">
            Choose your spread, pick your cards, and get position-by-position guidance.
          </p>
          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-ink text-cream text-xs font-medium group-hover:bg-ink-soft transition-colors">
            Explore Tarot →
          </span>
        </Link>

        <Link
          to="/combine"
          className="group hairline rounded-2xl bg-surface p-7 hover:shadow-glow transition-shadow relative sm:col-span-2 lg:col-span-1"
        >
          <span className="w-14 h-14 rounded-full bg-cream-soft border border-gold/30 flex items-center justify-center text-2xl text-gold mb-4">
            ⟡
          </span>
          <h2 className="font-display text-xl mb-2 text-ink">Combined Reading</h2>
          <p className="text-sm text-muted leading-relaxed mb-5">
            Get a holistic reading that combines palmistry and tarot into one report.
          </p>
          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gold text-ink text-xs font-medium group-hover:bg-gold-soft transition-colors">
            Start Combined Reading →
          </span>
        </Link>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg text-ink">Recent Readings</h3>
          <Link to="/history" className="text-sm text-muted hover:text-gold">
            View All →
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="hairline rounded-xl bg-surface/60 p-8 text-center text-sm text-muted">
            No readings yet. Start with a palm or tarot reading above.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {recent.map((r) => (
              <Link
                key={r.id}
                to={`/reading/${r.id}`}
                className="hairline rounded-lg bg-surface p-4 hover:bg-surface-raised transition-colors flex items-center justify-between"
              >
                <div className="min-w-0">
                  <p className="text-sm text-ink truncate">{r.title}</p>
                  <p className="text-xs text-muted font-mono mt-0.5">
                    {new Date(r.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-xs font-mono uppercase text-teal shrink-0 ml-3">{r.type}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
}
