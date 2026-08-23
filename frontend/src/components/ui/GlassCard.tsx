'use client';

import React, { ReactNode } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface GlassCardProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  variant?: 'default' | 'violet' | 'gold' | 'subtle';
  hoverEffect?: boolean;
  className?: string;
  glow?: boolean;
}

export default function GlassCard({
  children,
  variant = 'default',
  hoverEffect = false,
  className = '',
  glow = false,
  ...motionProps
}: GlassCardProps) {
  const variantStyles = {
    default:
      'bg-indigo-panel/70 backdrop-blur-xl border border-gold/15 shadow-cosmic-card text-cosmic-text',
    violet:
      'bg-indigo-card/80 backdrop-blur-xl border border-violet/30 shadow-[0_8px_32px_0_rgba(124,58,237,0.15)] text-cosmic-text',
    gold:
      'bg-midnight-elevated/85 backdrop-blur-xl border border-gold/40 shadow-[0_8px_32px_0_rgba(212,175,55,0.2)] text-cosmic-text',
    subtle:
      'bg-midnight-surface/50 backdrop-blur-md border border-lavender/10 shadow-sm text-cosmic-text',
  };

  const hoverStyle = hoverEffect
    ? 'transition-all duration-300 hover:border-gold/45 hover:shadow-cosmic-card-hover hover:-translate-y-0.5'
    : '';

  return (
    <motion.div
      className={`relative rounded-2xl p-6 overflow-hidden ${variantStyles[variant]} ${hoverStyle} ${className}`}
      {...motionProps}
    >
      {/* Corner Ornate Accents */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-gold/40 pointer-events-none rounded-tl-sm" />
      <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-gold/40 pointer-events-none rounded-tr-sm" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-gold/40 pointer-events-none rounded-bl-sm" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-gold/40 pointer-events-none rounded-br-sm" />

      {/* Optional Inner Ambient Glow */}
      {glow && (
        <div
          className="absolute -top-16 -right-16 w-36 h-36 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #D4AF37 0%, transparent 70%)' }}
        />
      )}

      {children}
    </motion.div>
  );
}
