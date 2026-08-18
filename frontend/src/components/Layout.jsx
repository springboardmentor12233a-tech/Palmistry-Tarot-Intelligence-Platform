import { NavLink, useNavigate } from "react-router-dom";
import Logo from "./Logo.jsx";
import SvgDefs from "./SvgDefs.jsx";

const NAV = [
  { to: "/dashboard", label: "Dashboard", glyph: "◈" },
  { to: "/palmistry", label: "Palm Reading", glyph: "✋" },
  { to: "/tarot", label: "Tarot Reading", glyph: "✦" },
  { to: "/combine", label: "Combined Reading", glyph: "⟡" },
  { to: "/tarot/deck", label: "Tarot Deck", glyph: "🂠" },
  { to: "/history", label: "History", glyph: "☰" },
];

// A trimmed set for the 5-slot mobile bottom bar - Tarot Deck stays
// reachable from the sidebar and from the Tarot page's "View all cards" link.
const MOBILE_NAV = NAV.filter((n) => n.to !== "/tarot/deck");

import { useAuth } from "../context/AuthContext.jsx";

export default function Layout({ children, title, eyebrow }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const initial = user?.name?.[0]?.toUpperCase() || "?";

  return (
    <div className="min-h-screen flex bg-cream">
      <SvgDefs />

      <aside className="w-64 shrink-0 bg-ink relative overflow-hidden flex-col py-7 px-5 hidden md:flex">
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none">
          <svg width="100%" height="100%">
            <pattern id="sidebarStars" width="60" height="60" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="15" r="1" fill="#D9B876" />
              <circle cx="40" cy="45" r="1" fill="#D9B876" />
              <circle cx="25" cy="5" r="0.7" fill="#D9B876" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#sidebarStars)" />
          </svg>
        </div>

        <div className="flex items-center gap-2.5 px-2 mb-10 relative">
          <Logo size={26} dark />
          <span className="font-display text-lg text-cream tracking-wide">Lucem</span>
        </div>

        <nav className="flex-1 flex flex-col gap-1 relative">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-ink-soft text-gold-soft"
                    : "text-cream/60 hover:text-cream hover:bg-ink-soft/60"
                }`
              }
            >
              <span className="w-4 text-center opacity-90">{item.glyph}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button
          onClick={() => {
            logout();
            navigate("/login");
          }}
          className="relative text-left px-3.5 py-2.5 text-sm text-cream/50 hover:text-gold-soft transition-colors border-t border-cream/10 pt-5 mt-4"
        >
          ↩ Log out
        </button>
      </aside>

      {/* Mobile topbar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-20 bg-ink px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Logo size={22} dark />
          <span className="font-display text-base text-cream">Lucem</span>
        </div>
        <button
          onClick={() => {
            logout();
            navigate("/login");
          }}
          className="text-xs text-cream/60"
        >
          Log out
        </button>
      </div>

      <main className="flex-1 min-w-0 pt-16 md:pt-0">
        {/* Light topbar with page title + profile chip, matching the reference */}
        <div className="hidden md:flex items-center justify-between px-10 py-5 border-b border-gold/15">
          <div>
            {eyebrow && (
              <p className="text-xs font-mono uppercase tracking-[0.2em] text-teal mb-1">{eyebrow}</p>
            )}
            {title && (
              <h1 className="font-display text-2xl text-ink flex items-center gap-2">
                {title}
                <span className="text-gold text-base">✦</span>
              </h1>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gold/70">🔔</span>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-violet text-cream text-xs font-medium flex items-center justify-center">
                {initial}
              </span>
              <span className="text-sm text-ink/80">{user?.name}</span>
            </div>
          </div>
        </div>

        <div className="px-5 md:px-10 py-8 md:py-10">
          <div className="max-w-5xl mx-auto">{children}</div>
        </div>
      </main>

      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-20 bg-ink flex justify-around py-2">
        {MOBILE_NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center text-[10px] px-2 py-1 ${isActive ? "text-gold-soft" : "text-cream/60"}`
            }
          >
            <span className="text-base">{item.glyph}</span>
            {item.label.split(" ")[0]}
          </NavLink>
        ))}
      </div>
    </div>
  );
}
