'use client';

import React, { useState } from 'react';
import { SpreadConfig, SpreadType } from '@/types';
import { SPREAD_CONFIGS } from '@/lib/constants';
import GlassCard from '@/components/ui/GlassCard';
import GoldButton from '@/components/ui/GoldButton';
import VioletButton from '@/components/ui/VioletButton';
import Eyebrow from '@/components/ui/Eyebrow';
import {
  Sparkles,
  Orbit,
  HeartHandshake,
  Compass,
  Crown,
  Infinity as InfinityIcon,
  Layers,
  ArrowRight,
  HelpCircle,
  Check,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface SpreadSelectStepProps {
  onSelect: (
    spreadType: SpreadType,
    userContext?: { focus_topic?: string; specific_question?: string }
  ) => void;
  initialSpread?: SpreadType;
  onBack: () => void;
}

export default function SpreadSelectStep({
  onSelect,
  initialSpread = 'three_card',
  onBack,
}: SpreadSelectStepProps) {
  const [selectedSpreadId, setSelectedSpreadId] = useState<SpreadType>(initialSpread);
  const [focusTopic, setFocusTopic] = useState<string>('Career & Spiritual Purpose');
  const [specificQuestion, setSpecificQuestion] = useState<string>('');

  const iconMap: Record<string, React.ReactNode> = {
    Sparkles: <Sparkles className="w-6 h-6 text-gold-light" />,
    Orbit: <Orbit className="w-6 h-6 text-gold-light" />,
    HeartHandshake: <HeartHandshake className="w-6 h-6 text-gold-light" />,
    Compass: <Compass className="w-6 h-6 text-gold-light" />,
    Crown: <Crown className="w-6 h-6 text-gold-light" />,
    Infinity: <InfinityIcon className="w-6 h-6 text-gold-light" />,
  };

  const selectedSpread =
    SPREAD_CONFIGS.find((s) => s.id === selectedSpreadId) || SPREAD_CONFIGS[1];

  const handleConfirm = () => {
    onSelect(selectedSpreadId, {
      focus_topic: focusTopic,
      specific_question: specificQuestion.trim() ? specificQuestion : undefined,
    });
  };

  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      {/* Step Header */}
      <div className="text-center space-y-3">
        <Eyebrow variant="violet">STEP 2 · ARCHETYPAL CARTOGRAPHY</Eyebrow>
        <h2 className="font-display text-3xl sm:text-4xl text-cosmic-text font-bold">
          Select Your Tarot Spread
        </h2>
        <p className="text-cosmic-muted text-sm sm:text-base max-w-2xl mx-auto">
          Choose the metaphysical geometric layout that matches the depth and focus of your inquiry.
        </p>
      </div>

      {/* 6 Spreads Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {SPREAD_CONFIGS.map((spread) => {
          const isSelected = selectedSpreadId === spread.id;
          return (
            <motion.div
              key={spread.id}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSelectedSpreadId(spread.id)}
              className={`cursor-pointer rounded-2xl p-5 transition-all relative overflow-hidden flex flex-col justify-between border ${
                isSelected
                  ? 'bg-midnight-elevated/95 border-gold shadow-gold-glow'
                  : 'bg-indigo-panel/60 border-indigo-border hover:border-violet/60 hover:bg-indigo-panel/80'
              }`}
            >
              {/* Corner Checkmark if Selected */}
              {isSelected && (
                <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-gold flex items-center justify-center text-midnight-deep shadow-sm">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              )}

              <div>
                {/* Header Icon + Count */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-11 h-11 rounded-xl bg-midnight-surface border border-violet/30 flex items-center justify-center">
                    {iconMap[spread.icon_name] || <Sparkles className="w-6 h-6 text-gold" />}
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-gold-light block font-mono">
                      {spread.card_count} {spread.card_count === 1 ? 'Card' : 'Cards'}
                    </span>
                    <h3 className="font-display text-base font-bold text-cosmic-text leading-tight">
                      {spread.title}
                    </h3>
                  </div>
                </div>

                <p className="text-xs text-cosmic-muted leading-relaxed mb-4">
                  {spread.description}
                </p>
              </div>

              {/* Suitability Tags */}
              <div className="pt-3 border-t border-indigo-border/50">
                <div className="flex flex-wrap gap-1.5">
                  {spread.suitability.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-white/5 border border-indigo-border text-[10px] text-lavender font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Selected Spread Details & User Context Box */}
      <GlassCard variant="gold" className="p-6 sm:p-8 space-y-6" glow>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gold/20 pb-5">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-gold-light block">
              Active Configuration
            </span>
            <h3 className="font-display text-2xl font-bold text-cosmic-text">
              {selectedSpread.title} · {selectedSpread.card_count} Cards
            </h3>
            <p className="text-xs text-cosmic-muted mt-1">{selectedSpread.subtitle}</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-lavender font-mono">
              {selectedSpread.positions.length} Archetypal Positions
            </span>
          </div>
        </div>

        {/* Position Preview Badges */}
        <div className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-gold-light font-display block">
            Position Matrix Breakdown:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {selectedSpread.positions.map((pos) => (
              <div
                key={pos.index}
                className="p-2.5 rounded-xl bg-midnight-deep/70 border border-violet/30 text-xs"
              >
                <div className="flex items-center gap-1.5 text-gold-light font-semibold mb-0.5">
                  <span className="w-4 h-4 rounded-full bg-gold/20 text-[10px] flex items-center justify-center text-gold-bright">
                    {pos.index + 1}
                  </span>
                  <span>{pos.label}</span>
                </div>
                <p className="text-[11px] text-cosmic-subtle pl-5 leading-tight">{pos.meaning}</p>
              </div>
            ))}
          </div>
        </div>

        {/* User Context Formulation */}
        <div className="pt-4 border-t border-gold/20 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-gold-light" />
            <span className="text-xs font-semibold uppercase tracking-wider text-gold-light font-display">
              Anchor Your Sacred Context (Optional):
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-cosmic-muted font-medium">Primary Focus Domain</label>
              <select
                value={focusTopic}
                onChange={(e) => setFocusTopic(e.target.value)}
                className="w-full bg-midnight-elevated border border-indigo-border focus:border-gold rounded-xl px-3.5 py-2.5 text-xs text-cosmic-text outline-none transition-colors"
              >
                <option value="Career & Spiritual Purpose">Career & Spiritual Purpose</option>
                <option value="Romantic Harmony & Soul Ties">Romantic Harmony & Soul Ties</option>
                <option value="Financial Flow & Asset Creation">Financial Flow & Asset Creation</option>
                <option value="Shadow Alchemy & Emotional Healing">Shadow Alchemy & Emotional Healing</option>
                <option value="Vitality, Prana & Somatic Wellness">Vitality, Prana & Somatic Wellness</option>
                <option value="Holistic Life Path Awakening">Holistic Life Path Awakening</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-cosmic-muted font-medium">Specific Question / Intent</label>
              <input
                type="text"
                value={specificQuestion}
                onChange={(e) => setSpecificQuestion(e.target.value)}
                placeholder="e.g. What higher lesson is unfolding in my upcoming pivot?"
                className="w-full bg-midnight-elevated border border-indigo-border focus:border-gold rounded-xl px-3.5 py-2.5 text-xs text-cosmic-text placeholder-cosmic-subtle outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-4 flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
          <VioletButton onClick={onBack} size="md">
            Back to Palm Scan
          </VioletButton>

          <GoldButton
            onClick={handleConfirm}
            size="lg"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Enter Card Sanctuary & Draw Deck
          </GoldButton>
        </div>
      </GlassCard>
    </div>
  );
}
