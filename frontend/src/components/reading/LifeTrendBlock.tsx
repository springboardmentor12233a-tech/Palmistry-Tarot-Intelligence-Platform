'use client';

import React from 'react';
import { LifeTrendAnalysis } from '@/types';
import GlassCard from '@/components/ui/GlassCard';
import {
  Compass,
  TrendingUp,
  Sparkles,
  AlertCircle,
  Calendar,
  Layers,
  Clock,
} from 'lucide-react';

interface LifeTrendBlockProps {
  lifeTrend: LifeTrendAnalysis;
}

export default function LifeTrendBlock({ lifeTrend }: LifeTrendBlockProps) {
  return (
    <GlassCard variant="default" className="p-6 sm:p-8 space-y-6" glow>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gold/20 pb-5">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-gold-light block font-mono">
            Temporal Arc & Evolution
          </span>
          <h3 className="font-display text-2xl font-bold text-cosmic-text">
            Life Trend & Destiny Vectors
          </h3>
        </div>

        <div className="flex items-center gap-3 bg-midnight-elevated px-4 py-2 rounded-2xl border border-violet/40">
          <TrendingUp className="w-5 h-5 text-gold-bright" />
          <div>
            <span className="text-[9px] uppercase font-bold tracking-widest text-gold-light block font-mono">
              Growth Potential
            </span>
            <span className="text-xl font-mono font-black text-gold-bright">
              {lifeTrend.growth_potential_rating}%
            </span>
          </div>
        </div>
      </div>

      {/* Life Path Summary & Current Cycle */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-2 bg-midnight-deep/60 p-5 rounded-2xl border border-indigo-border/60">
          <span className="text-xs font-semibold uppercase tracking-wider text-gold-light font-display">
            Grand Life Path Synthesis:
          </span>
          <p className="text-sm text-cosmic-text leading-relaxed font-sans">
            {lifeTrend.life_path_summary}
          </p>
        </div>

        <div className="lg:col-span-4 p-5 rounded-2xl bg-indigo-panel/40 border border-violet/30 flex flex-col justify-center space-y-1.5">
          <span className="text-[10px] uppercase font-bold tracking-widest text-lavender-soft font-mono">
            Active Cycle Phase
          </span>
          <h4 className="font-display text-base font-bold text-gold-light leading-snug">
            {lifeTrend.current_cycle}
          </h4>
        </div>
      </div>

      {/* 3-Stage Horizon Forecast */}
      <div className="space-y-3 pt-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-gold-light font-display block">
          3-Stage Horizon Forecast:
        </span>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Near Term */}
          <div className="p-4 rounded-2xl bg-midnight-elevated/90 border border-gold/20 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-gold-light font-mono">
              <Clock className="w-4 h-4 text-gold" />
              <span>NEAR TERM (1–3 MO)</span>
            </div>
            <p className="text-xs text-cosmic-muted leading-relaxed">
              {lifeTrend.horizon_forecast.near_term}
            </p>
          </div>

          {/* Mid Term */}
          <div className="p-4 rounded-2xl bg-midnight-elevated/90 border border-violet/30 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-lavender-soft font-mono">
              <Calendar className="w-4 h-4 text-violet-light" />
              <span>MID TERM (3–12 MO)</span>
            </div>
            <p className="text-xs text-cosmic-muted leading-relaxed">
              {lifeTrend.horizon_forecast.mid_term}
            </p>
          </div>

          {/* Long Term */}
          <div className="p-4 rounded-2xl bg-midnight-elevated/90 border border-gold/30 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-gold-bright font-mono">
              <Sparkles className="w-4 h-4 text-gold-bright" />
              <span>LONG TERM (1–3 YR)</span>
            </div>
            <p className="text-xs text-cosmic-muted leading-relaxed">
              {lifeTrend.horizon_forecast.long_term}
            </p>
          </div>
        </div>
      </div>

      {/* Upcoming Opportunities & Challenges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* Opportunities */}
        <div className="p-5 rounded-2xl bg-indigo-panel/40 border border-gold/20 space-y-3">
          <div className="flex items-center gap-2 text-gold-light font-display text-sm font-bold">
            <Sparkles className="w-4 h-4 text-gold" />
            <span>Auspicious Upcoming Portals</span>
          </div>
          <ul className="space-y-2 text-xs text-cosmic-muted">
            {lifeTrend.upcoming_opportunities.map((opp, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0 mt-1.5" />
                <span className="leading-relaxed">{opp}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Challenges */}
        <div className="p-5 rounded-2xl bg-indigo-panel/40 border border-violet/30 space-y-3">
          <div className="flex items-center gap-2 text-lavender-soft font-display text-sm font-bold">
            <AlertCircle className="w-4 h-4 text-violet-light" />
            <span>Potential Roadblocks & Antidotes</span>
          </div>
          <ul className="space-y-2 text-xs text-cosmic-muted">
            {lifeTrend.potential_challenges.map((chl, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 flex-shrink-0 mt-1.5" />
                <span className="leading-relaxed">{chl}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </GlassCard>
  );
}
