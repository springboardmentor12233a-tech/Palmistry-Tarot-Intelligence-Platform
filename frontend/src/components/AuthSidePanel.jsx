import Starfield from "./Starfield.jsx";

export default function AuthSidePanel() {
  return (
    <div className="hidden lg:flex relative bg-ink items-center justify-center overflow-hidden">
      <Starfield count={35} />
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(circle at 50% 40%, rgba(139,58,82,0.4), transparent 65%)" }}
      />
      <svg viewBox="0 0 300 360" className="w-64 relative">
        {/* candle */}
        <rect x="140" y="180" width="20" height="90" rx="3" fill="#4A1428" stroke="#8A6A34" strokeWidth="1" />
        <rect x="136" y="270" width="28" height="10" rx="2" fill="#3D0F1F" />
        <path d="M150 178 Q150 160 150 150" stroke="#8A6A34" strokeWidth="1.5" />
        <path
          d="M150 150 C144 138, 156 130, 150 118 C144 130, 156 138, 150 150z"
          fill="#D9B876"
        >
          <animate attributeName="opacity" values="0.7;1;0.7" dur="2.4s" repeatCount="indefinite" />
        </path>

        {/* stacked books */}
        <rect x="80" y="280" width="140" height="14" rx="2" fill="#421729" stroke="#6B1F3A" strokeWidth="0.6" />
        <rect x="85" y="266" width="130" height="14" rx="2" fill="#33101E" stroke="#6B1F3A" strokeWidth="0.6" />

        {/* palm/tarot card */}
        <g transform="translate(95 190) rotate(-6)">
          <rect width="60" height="80" rx="4" fill="#33101E" stroke="#D9B876" strokeWidth="1" />
          <path
            d="M30 65 C18 60, 14 45, 16 32 L16 15 C16 12, 20 12, 20 15 L21 30 M21 18 C21 15, 25 15, 25 18 L26 30 M26 16 C26 13, 30 13, 30 16 L31 30 M31 18 C31 16, 35 16, 35 18 L36 32 C36 29, 40 29, 40 32 L40 40"
            stroke="#D9B876"
            strokeWidth="1"
            fill="none"
            opacity="0.85"
          />
        </g>

        {/* scattered sparkles */}
        {[
          [40, 40],
          [230, 60],
          [250, 200],
          [30, 220],
          [200, 30],
        ].map(([x, y], i) => (
          <text key={i} x={x} y={y} fill="#D9B876" fontSize="10" opacity="0.6">
            ✦
          </text>
        ))}
      </svg>
    </div>
  );
}
