import { Link } from "react-router-dom";
import Logo from "../components/Logo.jsx";
import SvgDefs from "../components/SvgDefs.jsx";

export default function Landing() {
  return (
    <div className="min-h-screen bg-cream text-ivory">
      <SvgDefs />

      <header className="max-w-6xl mx-auto flex items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <Logo />
          <span className="font-display text-xl tracking-wide text-ink">Lucem</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm text-ink/70">
          <a href="#features" className="hover:text-ink transition-colors">
            Home
          </a>
          <Link to="/register" className="hover:text-ink transition-colors">
            Palm Reading
          </Link>
          <Link to="/register" className="hover:text-ink transition-colors">
            Tarot Reading
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm text-muted hover:text-ink transition-colors hidden sm:inline">
            Sign in
          </Link>
          <Link
            to="/register"
            className="text-sm px-5 py-2.5 rounded-lg bg-ink text-cream font-medium hover:bg-ink-soft transition-colors"
          >
            Get Started
          </Link>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 pt-10 pb-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="animate-floatUp">
            <p className="text-xs font-mono uppercase tracking-[0.25em] text-teal mb-4">
              Palmistry · Tarot · AI Intelligence
            </p>
            <h1 className="font-display text-5xl md:text-6xl leading-[1.05] mb-6 text-ink">
              Discover
              <br />
              Your Path
            </h1>
            <p className="text-muted text-base leading-relaxed mb-8 max-w-md">
              Ancient wisdom meets artificial intelligence to guide you toward clarity, insight,
              and empowerment. Upload your palm, draw your cards, and let AI weave them into one
              reflective reading.
            </p>
            <div className="flex items-center gap-6">
              <Link
                to="/register"
                className="px-7 py-3.5 rounded-lg bg-ink text-cream font-medium hover:bg-ink-soft transition-colors shadow-glow"
              >
                Begin Your Journey
              </Link>
              <Link to="/login" className="text-sm text-ink/70 hover:text-ink transition-colors">
                Explore Readings →
              </Link>
            </div>
          </div>

          <ArchIllustration />
        </div>
      </section>

      <section id="features" className="bg-ink px-6 py-10">
        <div className="max-w-6xl mx-auto grid sm:grid-cols-3 gap-8 text-center sm:text-left">
          {[
            { glyph: "✦", title: "AI Powered", body: "Intelligence meets ancient wisdom" },
            { glyph: "☾", title: "Secure & Private", body: "Your readings and data are always protected" },
            { glyph: "☉", title: "Personalized", body: "Insights tailored uniquely for your journey" },
          ].map((f) => (
            <div key={f.title} className="flex items-center gap-4 justify-center sm:justify-start">
              <span className="w-11 h-11 rounded-full border border-gold/40 flex items-center justify-center text-gold-soft text-lg shrink-0">
                {f.glyph}
              </span>
              <div>
                <p className="text-cream font-display text-base">{f.title}</p>
                <p className="text-cream/50 text-xs mt-0.5">{f.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-3 gap-6">
        {[
          {
            title: "Palmistry engine",
            glyph: "✋",
            body: "A skeleton graph isolates the Life, Head, Heart, and Fate lines for measurable feature extraction, interpreted by AI.",
          },
          {
            title: "Tarot engine",
            glyph: "✦",
            body: "Choose a spread from single-card to Celtic Cross, then pick your own cards from a shuffled, face-down deck.",
          },
          {
            title: "Combined synthesis",
            glyph: "⟡",
            body: "Merge a palm reading with a tarot spread and the AI weaves both into one cohesive report, plus a chat to go deeper.",
          },
        ].map((f) => (
          <div key={f.title} className="hairline rounded-xl bg-surface p-6">
            <span className="text-2xl text-gold">{f.glyph}</span>
            <h3 className="font-display text-lg mt-3 mb-2 text-ink">{f.title}</h3>
            <p className="text-sm text-muted leading-relaxed">{f.body}</p>
          </div>
        ))}
      </section>

      <footer className="border-t border-gold/15 py-8 text-center text-xs text-muted">
        Readings are reflective, not predictive. For entertainment and self-reflection.
      </footer>
    </div>
  );
}

function ArchIllustration() {
  return (
    <div className="relative">
      <div className="hairline rounded-t-[140px] rounded-b-2xl bg-ink p-10 pt-16 flex flex-col items-center overflow-hidden relative">
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(circle at 50% 25%, rgba(139,58,82,0.35), transparent 65%)" }}
        />

        {/* moon */}
        <svg width="52" height="52" viewBox="0 0 52 52" className="mb-6 relative">
          {Array.from({ length: 16 }, (_, i) => i * 22.5).map((deg) => (
            <line
              key={deg}
              x1="26"
              y1="26"
              x2="26"
              y2="4"
              stroke="#D9B876"
              strokeWidth="1"
              opacity="0.5"
              transform={`rotate(${deg} 26 26)`}
            />
          ))}
          <path
            d="M32 15a13 13 0 1 0 0 22 15.5 15.5 0 0 1 0-22z"
            fill="#D9B876"
          />
        </svg>

        {/* palm with traced line */}
        <svg viewBox="0 0 200 220" className="w-40 relative">
          <path
            d="M100 210 C60 200, 45 160, 48 120 L48 50 C48 42, 60 42, 60 50 L62 100 M62 60 C62 50, 74 50, 74 60 L76 100 M76 55 C76 45, 90 45, 90 55 L92 100 M92 60 C92 52, 104 52, 104 60 L106 105 C106 95, 118 95, 118 105 L118 130"
            stroke="#D9B876"
            strokeWidth="1.4"
            fill="none"
            strokeLinecap="round"
            opacity="0.85"
          />
          <path
            d="M60 150 C 80 130, 90 160, 110 145 C 125 134, 130 155, 145 140"
            stroke="#B8863E"
            strokeWidth="1.2"
            fill="none"
            opacity="0.9"
          />
          {[
            [60, 150],
            [110, 145],
            [145, 140],
          ].map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r="2.4" fill="#B8863E" />
          ))}
        </svg>

        {/* scattered sparkles */}
        {[
          [15, 20],
          [85, 10],
          [10, 60],
          [90, 70],
        ].map(([left, top], i) => (
          <span
            key={i}
            className="absolute text-gold-soft/60 text-xs"
            style={{ left: `${left}%`, top: `${top}%` }}
          >
            ✦
          </span>
        ))}
      </div>
    </div>
  );
}
