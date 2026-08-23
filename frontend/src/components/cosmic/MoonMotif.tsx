'use client';

import React from 'react';

interface MoonMotifProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'crescent' | 'eclipse' | 'full';
  className?: string;
  glow?: boolean;
}

export default function MoonMotif({
  size = 'md',
  variant = 'eclipse',
  className = '',
  glow = true,
}: MoonMotifProps) {
  const sizeMap = {
    sm: 'w-24 h-24',
    md: 'w-48 h-48',
    lg: 'w-72 h-72',
    xl: 'w-96 h-96',
  };

  return (
    <div className={`relative flex items-center justify-center ${sizeMap[size]} ${className}`}>
      {/* Radiant Background Aura */}
      {glow && (
        <div
          className="absolute inset-0 rounded-full blur-3xl opacity-40 pointer-events-none animate-pulse-glow"
          style={{
            background:
              'radial-gradient(circle, rgba(212,175,55,0.45) 0%, rgba(124,58,237,0.3) 50%, rgba(10,10,24,0) 80%)',
          }}
        />
      )}

      {/* Orbit Rings */}
      <svg
        viewBox="0 0 200 200"
        className="absolute inset-0 w-full h-full animate-rotate-slow pointer-events-none opacity-40"
      >
        <circle
          cx="100"
          cy="100"
          r="92"
          fill="none"
          stroke="url(#goldRingGrad)"
          strokeWidth="0.75"
          strokeDasharray="4 8"
        />
        <circle
          cx="100"
          cy="100"
          r="78"
          fill="none"
          stroke="rgba(201, 184, 240, 0.2)"
          strokeWidth="0.5"
        />
        <defs>
          <linearGradient id="goldRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#7C3AED" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#E8C468" stopOpacity="0.8" />
          </linearGradient>
        </defs>
      </svg>

      {/* Celestial Moon / Eclipse Core */}
      <svg
        viewBox="0 0 120 120"
        className="relative w-3/4 h-3/4 drop-shadow-[0_0_25px_rgba(212,175,55,0.4)]"
      >
        <defs>
          <radialGradient id="solarCorona" cx="50%" cy="50%" r="50%">
            <stop offset="60%" stopColor="#D4AF37" stopOpacity="0.2" />
            <stop offset="85%" stopColor="#E8C468" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#FDE047" stopOpacity="1" />
          </radialGradient>
          <linearGradient id="moonSurface" x1="20%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stopColor="#161232" />
            <stop offset="50%" stopColor="#0D0B1F" />
            <stop offset="100%" stopColor="#060610" />
          </linearGradient>
          <filter id="coronaBlur">
            <feGaussianBlur stdDeviation="2.5" />
          </filter>
        </defs>

        {/* Outer Solar Corona Flame */}
        <circle cx="60" cy="60" r="54" fill="url(#solarCorona)" filter="url(#coronaBlur)" opacity="0.9" />

        {/* Golden Rim Accent */}
        <circle
          cx="60"
          cy="60"
          r="50"
          fill="none"
          stroke="#D4AF37"
          strokeWidth="1.2"
          opacity="0.85"
        />

        {/* Eclipse Body */}
        {variant === 'eclipse' && (
          <>
            <circle cx="60" cy="60" r="48" fill="url(#moonSurface)" />
            {/* Subtle Crescent Rim Highlight */}
            <path
              d="M 60,12 A 48,48 0 0,1 108,60 A 46,46 0 0,0 60,16 Z"
              fill="#E8C468"
              opacity="0.65"
            />
            {/* Sacred Geometry Star within the disc */}
            <circle cx="60" cy="60" r="28" fill="none" stroke="rgba(212,175,55,0.2)" strokeWidth="0.6" strokeDasharray="2 4" />
            <path
              d="M 60,36 L 66,54 L 84,60 L 66,66 L 60,84 L 54,66 L 36,60 L 54,54 Z"
              fill="rgba(212, 175, 55, 0.15)"
              stroke="rgba(232, 196, 104, 0.5)"
              strokeWidth="0.5"
            />
          </>
        )}

        {variant === 'crescent' && (
          <path
            d="M 60,12 A 48,48 0 1,0 60,108 A 40,40 0 0,1 60,12 Z"
            fill="url(#solarCorona)"
          />
        )}

        {variant === 'full' && (
          <circle cx="60" cy="60" r="48" fill="url(#solarCorona)" opacity="0.95" />
        )}
      </svg>
    </div>
  );
}
