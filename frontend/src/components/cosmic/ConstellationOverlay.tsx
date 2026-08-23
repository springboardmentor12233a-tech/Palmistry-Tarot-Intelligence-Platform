'use client';

import React from 'react';

export default function ConstellationOverlay({ className = '' }: { className?: string }) {
  return (
    <div
      className={`absolute inset-0 pointer-events-none overflow-hidden opacity-25 ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1200 800"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full object-cover"
      >
        {/* Constellation 1: Cassiopeia / Oracle Crown */}
        <g stroke="rgba(212, 175, 55, 0.4)" strokeWidth="0.75" strokeDasharray="3 3">
          <line x1="150" y1="120" x2="220" y2="80" />
          <line x1="220" y1="80" x2="290" y2="130" />
          <line x1="290" y1="130" x2="360" y2="90" />
          <line x1="360" y1="90" x2="430" y2="140" />
        </g>
        <circle cx="150" cy="120" r="2.5" fill="#E8C468" />
        <circle cx="220" cy="80" r="3" fill="#FDE047" />
        <circle cx="290" cy="130" r="2" fill="#E8C468" />
        <circle cx="360" cy="90" r="3" fill="#FDE047" />
        <circle cx="430" cy="140" r="2" fill="#E8C468" />

        {/* Constellation 2: Cygnus / Northern Cross */}
        <g stroke="rgba(167, 139, 250, 0.35)" strokeWidth="0.75">
          <line x1="950" y1="180" x2="1020" y2="240" />
          <line x1="1020" y1="240" x2="1090" y2="300" />
          <line x1="970" y1="260" x2="1070" y2="220" />
        </g>
        <circle cx="950" cy="180" r="2.5" fill="#C9B8F0" />
        <circle cx="1020" cy="240" r="3.5" fill="#DDD2F7" />
        <circle cx="1090" cy="300" r="2" fill="#C9B8F0" />
        <circle cx="970" cy="260" r="2" fill="#C9B8F0" />
        <circle cx="1070" cy="220" r="2" fill="#C9B8F0" />

        {/* Constellation 3: Orion / Bio-Geometry Belt */}
        <g stroke="rgba(212, 175, 55, 0.3)" strokeWidth="0.75" strokeDasharray="2 4">
          <line x1="120" y1="520" x2="180" y2="480" />
          <line x1="180" y1="480" x2="240" y2="520" />
          <line x1="120" y1="640" x2="180" y2="600" />
          <line x1="180" y1="600" x2="240" y2="640" />
          {/* Belt */}
          <line x1="160" y1="550" x2="180" y2="540" />
          <line x1="180" y1="540" x2="200" y2="530" />
        </g>
        <circle cx="120" cy="520" r="2" fill="#E8C468" />
        <circle cx="240" cy="520" r="2" fill="#E8C468" />
        <circle cx="160" cy="550" r="2" fill="#FDE047" />
        <circle cx="180" cy="540" r="2" fill="#FDE047" />
        <circle cx="200" cy="530" r="2" fill="#FDE047" />
        <circle cx="120" cy="640" r="2.5" fill="#E8C468" />
        <circle cx="240" cy="640" r="2.5" fill="#E8C468" />

        {/* Faint Astrological Palm Curve Lines */}
        <path
          d="M 850 680 Q 950 560 1100 620"
          stroke="rgba(201, 184, 240, 0.18)"
          strokeWidth="1"
          fill="none"
          strokeDasharray="6 6"
        />
        <path
          d="M 880 720 Q 980 620 1130 670"
          stroke="rgba(212, 175, 55, 0.15)"
          strokeWidth="0.75"
          fill="none"
        />
      </svg>
    </div>
  );
}
