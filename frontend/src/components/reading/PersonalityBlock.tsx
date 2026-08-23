'use client';

import React from 'react';
import { PersonalityIntelligence } from '@/types';
import GlassCard from '@/components/ui/GlassCard';
import {
  Crown,
  Shield,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  Zap,
  Flame,
  Brain,
  Heart,
  Compass,
} from 'lucide-react';

interface PersonalityBlockProps {
  personality: PersonalityIntelligence;
}

export default function PersonalityBlock({ personality }: PersonalityBlockProps) {
  const temperament = [
    {
      label: 'Intuition (Lunar / Mystic)',
      value: personality.temperament_balance.intuition,
      color: 'bg-violet-light',
      icon: <Sparkles className="w-3.5 h-3.5 text-violet-bright" />,
    },
    {
      label: 'Logic (Mercurial / Head Line)',
      value: personality.temperament_balance.logic,
      color: 'bg-sky-400',
      icon: <Brain className="w-3.5 h-3.5 text-sky-300" />,
    },
    {
      label: 'Emotion (Venus / Heart Line)',
      value: personality.temperament_balance.emotion,
      color: 'bg-rose-400',
      icon: <Heart className="w-3.5 h-3.5 text-rose-300" />,
    },
    {
      label: 'Action (Mars / Prana)',
      value: personality.temperament_balance.action,
      color: 'bg-amber-400',
      icon: <Flame className="w-3.5 h-3.5 text-amber-300" />,
    },
  ];

  return (
    <GlassCard variant="default" className="p-6 sm:p-8 space-y-6" glow>
      {/* Header with Archetypes */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gold/20 pb-5">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-gold-light block font-mono">
            Archetypal Intelligence
          </span>
          <h3 className="font-display text-2xl font-bold text-cosmic-text">
            Soul Architecture & Temperament
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="px-3.5 py-1 rounded-full bg-gold/15 border border-gold/40 text-gold-bright text-xs font-bold font-mono flex items-center gap-1.5 shadow-gold-glow">
            <Crown className="w-3.5 h-3.5" />
            <span>{personality.primary_archetype}</span>
          </div>

          <div className="px-3 py-1 rounded-full bg-violet-deep/50 border border-violet/40 text-lavender-soft text-xs font-mono flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{personality.secondary_archetype}</span>
          </div>
        </div>
      </div>

      {/* Temperament Balance Gauges */}
      <div className="space-y-3 bg-midnight-deep/60 p-5 rounded-2xl border border-indigo-border/60">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-gold-light font-display">
            4-Vector Temperament Equilibrium:
          </span>
          <span className="text-[10px] text-cosmic-subtle font-mono">Calibrated via Palm Mounts</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {temperament.map((t, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-cosmic-text font-medium">
                  {t.icon}
                  <span>{t.label}</span>
                </span>
                <span className="font-mono font-bold text-gold-light">{t.value}%</span>
              </div>
              <div className="w-full bg-midnight-surface h-2 rounded-full overflow-hidden border border-indigo-border/40">
                <div className={`h-full ${t.color} rounded-full`} style={{ width: `${t.value}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Strengths & Growth Edges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* Core Strengths */}
        <div className="p-5 rounded-2xl bg-indigo-panel/40 border border-gold/20 space-y-3">
          <div className="flex items-center gap-2 text-gold-light font-display text-sm font-bold">
            <Shield className="w-4 h-4 text-gold" />
            <span>Core Strengths & Superpowers</span>
          </div>
          <ul className="space-y-2 text-xs text-cosmic-muted">
            {personality.core_strengths.map((str, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0 mt-1.5" />
                <span className="leading-relaxed">{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Growth Edges / Shadow Integration */}
        <div className="p-5 rounded-2xl bg-indigo-panel/40 border border-violet/30 space-y-3">
          <div className="flex items-center gap-2 text-lavender-soft font-display text-sm font-bold">
            <AlertTriangle className="w-4 h-4 text-violet-light" />
            <span>Growth Edges & Shadow Vectors</span>
          </div>
          <ul className="space-y-2 text-xs text-cosmic-muted">
            {personality.growth_edges.map((edge, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-light flex-shrink-0 mt-1.5" />
                <span className="leading-relaxed">{edge}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Behavioral Insights & Development Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl bg-midnight-elevated/80 border border-indigo-border space-y-3">
          <div className="flex items-center gap-2 text-cosmic-text font-display text-sm font-bold">
            <Lightbulb className="w-4 h-4 text-gold-bright" />
            <span>Behavioral Dynamics</span>
          </div>
          <ul className="space-y-2 text-xs text-cosmic-muted">
            {personality.behavioral_insights.map((b, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-gold-light font-bold">›</span>
                <span className="leading-relaxed">{b}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-5 rounded-2xl bg-midnight-elevated/80 border border-indigo-border space-y-3">
          <div className="flex items-center gap-2 text-gold-light font-display text-sm font-bold">
            <Zap className="w-4 h-4 text-gold" />
            <span>Actionable Development Disciplines</span>
          </div>
          <ul className="space-y-2 text-xs text-cosmic-muted">
            {personality.development_recommendations.map((d, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-violet-light font-bold">›</span>
                <span className="leading-relaxed">{d}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </GlassCard>
  );
}
