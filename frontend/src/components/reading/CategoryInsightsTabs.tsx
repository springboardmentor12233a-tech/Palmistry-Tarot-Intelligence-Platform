'use client';

import React, { useState } from 'react';
import { CategoryInsight } from '@/types';
import GlassCard from '@/components/ui/GlassCard';
import {
  User,
  Heart,
  Briefcase,
  Coins,
  Activity,
  Sparkles,
  Compass,
  CheckCircle2,
  Stars,
  Hand,
  Layers,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CategoryInsightsTabsProps {
  categories: CategoryInsight[];
}

export default function CategoryInsightsTabs({ categories }: CategoryInsightsTabsProps) {
  const [activeKey, setActiveKey] = useState<string>(categories[0]?.key || 'personality');

  const iconMap: Record<string, React.ReactNode> = {
    personality: <User className="w-4 h-4" />,
    relationships: <Heart className="w-4 h-4" />,
    career: <Briefcase className="w-4 h-4" />,
    finance: <Coins className="w-4 h-4" />,
    health_wellness: <Activity className="w-4 h-4" />,
    personal_growth: <Sparkles className="w-4 h-4" />,
    life_opportunities: <Compass className="w-4 h-4" />,
  };

  const currentCategory =
    categories.find((c) => c.key === activeKey) || categories[0];

  return (
    <div className="space-y-6">
      {/* Category Tab Bar (Horizontal scrolling on mobile) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-indigo-border/50">
        {categories.map((cat) => {
          const isActive = cat.key === activeKey;
          return (
            <button
              key={cat.key}
              onClick={() => setActiveKey(cat.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-gold-btn text-midnight-deep shadow-gold-glow font-bold'
                  : 'bg-indigo-panel/50 text-cosmic-muted hover:text-cosmic-text hover:bg-white/5 border border-indigo-border/60'
              }`}
            >
              {iconMap[cat.key] || <Sparkles className="w-4 h-4" />}
              <span>{cat.title}</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                  isActive ? 'bg-midnight-deep/20 text-midnight-deep' : 'bg-white/10 text-gold-light'
                }`}
              >
                {cat.score}%
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Tab Panel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentCategory.key}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
        >
          <GlassCard variant="default" className="p-6 sm:p-8 space-y-6" glow>
            {/* Header: Title & Correlation Badges */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gold/20 pb-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-gold-light">{iconMap[currentCategory.key]}</span>
                  <h3 className="font-display text-2xl font-bold text-cosmic-text">
                    {currentCategory.title}
                  </h3>
                </div>
                <p className="text-xs text-cosmic-muted">{currentCategory.summary}</p>
              </div>

              {/* Score Indicator */}
              <div className="flex items-center gap-3 bg-midnight-elevated px-4 py-2 rounded-2xl border border-gold/30 flex-shrink-0">
                <div className="text-right">
                  <span className="text-[9px] uppercase font-bold tracking-widest text-gold-light block font-mono">
                    Resonance
                  </span>
                  <span className="text-xl font-mono font-black text-gold-bright">
                    {currentCategory.score}%
                  </span>
                </div>
                <div className="w-10 h-10 rounded-full border-2 border-gold flex items-center justify-center text-xs font-bold text-gold-light">
                  {currentCategory.score >= 90 ? 'A+' : 'A'}
                </div>
              </div>
            </div>

            {/* Detailed Narrative */}
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-gold-light font-display">
                Metaphysical Synthesis & Narrative:
              </span>
              <p className="text-sm text-cosmic-text leading-relaxed font-sans bg-midnight-deep/50 p-5 rounded-2xl border border-indigo-border/60">
                {currentCategory.detailed_narrative}
              </p>
            </div>

            {/* Key Strategic Takeaways */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-lavender-soft font-display">
                Key Strategic Counsel:
              </span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {currentCategory.key_takeaways.map((takeaway, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-indigo-panel/60 border border-violet/30 flex items-start gap-2.5 text-xs text-cosmic-muted"
                  >
                    <CheckCircle2 className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                    <span className="leading-snug">{takeaway}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Multi-System Correlation Badges */}
            <div className="pt-4 border-t border-gold/20 flex flex-wrap items-center gap-4 text-xs">
              {currentCategory.astrological_influence && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-deep/40 border border-violet/40 text-lavender-soft font-mono">
                  <Stars className="w-3.5 h-3.5 text-violet-light" />
                  <span>Transit: {currentCategory.astrological_influence}</span>
                </div>
              )}

              {currentCategory.palm_correlation && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-midnight-deep border border-gold/30 text-gold-light font-mono">
                  <Hand className="w-3.5 h-3.5 text-gold" />
                  <span>Palm Marker: {currentCategory.palm_correlation}</span>
                </div>
              )}

              {currentCategory.tarot_correlation && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-panel border border-indigo-border text-cosmic-text font-mono">
                  <Layers className="w-3.5 h-3.5 text-violet-bright" />
                  <span>Tarot Alignment: {currentCategory.tarot_correlation}</span>
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
