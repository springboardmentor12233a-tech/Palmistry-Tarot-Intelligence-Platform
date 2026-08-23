'use client';

import React, { useState, useEffect } from 'react';
import { DrawnCard, SpreadType, TarotDrawResult } from '@/types';
import { SPREAD_CONFIGS } from '@/lib/constants';
import { api } from '@/lib/api';
import GlassCard from '@/components/ui/GlassCard';
import GoldButton from '@/components/ui/GoldButton';
import VioletButton from '@/components/ui/VioletButton';
import Eyebrow from '@/components/ui/Eyebrow';
import ErrorCard from '@/components/ui/ErrorCard';
import {
  Sparkles,
  RotateCw,
  Eye,
  CheckCircle2,
  ArrowRight,
  Flame,
  Droplets,
  Wind,
  Mountain,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CardDrawStepProps {
  spreadType: SpreadType;
  onComplete: (drawResult: TarotDrawResult) => void;
  onBack: () => void;
}

export default function CardDrawStep({
  spreadType,
  onComplete,
  onBack,
}: CardDrawStepProps) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [drawResult, setDrawResult] = useState<TarotDrawResult | null>(null);
  const [revealedCards, setRevealedCards] = useState<Record<number, boolean>>({});
  const [isShuffling, setIsShuffling] = useState<boolean>(false);

  const spreadConfig =
    SPREAD_CONFIGS.find((s) => s.id === spreadType) || SPREAD_CONFIGS[1];

  const fetchCards = async () => {
    setIsLoading(true);
    setError(null);
    setRevealedCards({});
    try {
      const result = await api.drawTarot(spreadType);
      setDrawResult(result);
    } catch (err: any) {
      setError(err?.message || 'Failed to draw tarot cards from the oracle deck.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, [spreadType]);

  const handleFlipCard = (index: number) => {
    setRevealedCards((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleRevealAll = () => {
    if (!drawResult) return;
    const allRevealed: Record<number, boolean> = {};
    drawResult.cards.forEach((_, idx) => {
      allRevealed[idx] = true;
    });
    setRevealedCards(allRevealed);
  };

  const handleReshuffle = () => {
    setIsShuffling(true);
    setRevealedCards({});
    setTimeout(() => {
      fetchCards();
      setIsShuffling(false);
    }, 800);
  };

  const allCardsRevealed =
    drawResult &&
    drawResult.cards.length > 0 &&
    drawResult.cards.every((_, idx) => revealedCards[idx]);

  const getElementIcon = (element: string) => {
    switch (element) {
      case 'Fire':
        return <Flame className="w-3.5 h-3.5 text-amber-400" />;
      case 'Water':
        return <Droplets className="w-3.5 h-3.5 text-sky-400" />;
      case 'Air':
        return <Wind className="w-3.5 h-3.5 text-violet-300" />;
      case 'Earth':
        return <Mountain className="w-3.5 h-3.5 text-emerald-400" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-gold" />;
    }
  };

  return (
    <div className="space-y-10 max-w-6xl mx-auto">
      {/* Step Header */}
      <div className="text-center space-y-3">
        <Eyebrow variant="gold">STEP 3 · THE SACRED REVELATION</Eyebrow>
        <h2 className="font-display text-3xl sm:text-4xl text-cosmic-text font-bold">
          Draw & Flip Archetypal Cards
        </h2>
        <p className="text-cosmic-muted text-sm sm:text-base max-w-2xl mx-auto">
          Tap each face-down card to initiate the ceremonial 3D reveal. Observe both upright and
          reversed polarities as they align with your biometric energy fields.
        </p>
      </div>

      {/* Control Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-indigo-panel/40 p-4 rounded-2xl border border-indigo-border backdrop-blur-md">
        <div className="flex items-center gap-3">
          <span className="font-display font-bold text-sm text-gold-light">
            {spreadConfig.title}
          </span>
          <span className="text-xs text-cosmic-subtle font-mono">
            ({Object.values(revealedCards).filter(Boolean).length} / {spreadConfig.card_count} revealed)
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <VioletButton
            size="sm"
            onClick={handleReshuffle}
            isLoading={isShuffling}
            leftIcon={<RotateCw className="w-3.5 h-3.5" />}
          >
            Reshuffle Deck
          </VioletButton>

          <GoldButton
            size="sm"
            variant="outline"
            onClick={handleRevealAll}
            leftIcon={<Eye className="w-3.5 h-3.5" />}
          >
            Reveal All Cards
          </GoldButton>
        </div>
      </div>

      {/* Cards Grid / Layout / Error State */}
      {error ? (
        <ErrorCard
          title="Oracle Deck Connection Interrupted"
          message={error}
          onRetry={fetchCards}
        />
      ) : isLoading || isShuffling ? (
        <div className="py-24 text-center space-y-4">
          <div className="w-16 h-16 rounded-full border-2 border-gold/40 border-t-gold animate-spin mx-auto shadow-gold-glow" />
          <p className="font-display text-lg text-gold-light">
            Reshuffling Astral Deck and Aligning Frequencies...
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-center">
          {drawResult?.cards.map((drawnCard, index) => {
            const isFlipped = !!revealedCards[index];
            const { card, position_label, position_meaning, is_reversed } = drawnCard;

            return (
              <div
                key={index}
                className="perspective-1000 w-full min-h-[380px] cursor-pointer group"
                onClick={() => handleFlipCard(index)}
              >
                <motion.div
                  className="relative w-full h-full transform-style-3d transition-transform duration-700 ease-out"
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  whileHover={{ scale: 1.02 }}
                >
                  {/* FACE DOWN (Card Back) */}
                  <div className="absolute inset-0 backface-hidden rounded-2xl bg-gradient-to-br from-indigo-card via-midnight-surface to-midnight-elevated border-2 border-gold/30 p-4 flex flex-col justify-between shadow-[0_10px_30px_rgba(0,0,0,0.6)] group-hover:border-gold/60 transition-colors">
                    {/* Position Label Tag */}
                    <div className="text-center pt-2">
                      <span className="px-2.5 py-1 rounded-full bg-midnight-deep/80 border border-gold/30 text-[10px] uppercase tracking-wider font-semibold text-gold-light font-mono">
                        {position_label}
                      </span>
                    </div>

                    {/* Ornate Card Back Sacred Pattern */}
                    <div className="my-auto flex flex-col items-center justify-center p-6 text-center relative">
                      {/* Sacred Mandala SVG */}
                      <div className="w-24 h-24 rounded-full border border-gold/30 flex items-center justify-center relative animate-pulse-glow">
                        <div className="w-16 h-16 rounded-full border border-violet/50 flex items-center justify-center">
                          <Sparkles className="w-8 h-8 text-gold" />
                        </div>
                      </div>
                      <span className="text-xs text-cosmic-muted mt-4 font-display tracking-widest uppercase">
                        Tap to Reveal
                      </span>
                    </div>

                    {/* Footer Pos Index */}
                    <div className="text-center pb-2 text-[10px] text-cosmic-subtle font-mono">
                      Position {index + 1} of {spreadConfig.card_count}
                    </div>
                  </div>

                  {/* FACE UP (Card Front) */}
                  <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-2xl bg-midnight-elevated border-2 border-gold p-4 flex flex-col justify-between shadow-gold-glow overflow-hidden">
                    {/* Top Bar: Position & Reversal */}
                    <div className="flex items-center justify-between border-b border-gold/20 pb-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-gold-light font-mono truncate max-w-[150px]">
                        {position_label}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                          is_reversed
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        }`}
                      >
                        {is_reversed ? 'Reversed' : 'Upright'}
                      </span>
                    </div>

                    {/* Card Body / Art Frame */}
                    <div className="my-auto py-2 text-center space-y-2">
                      {/* Arcana & Element Icon */}
                      <div className="flex items-center justify-center gap-2">
                        <span className="flex items-center gap-1 text-[10px] font-mono uppercase text-cosmic-muted bg-white/5 px-2 py-0.5 rounded-full border border-indigo-border">
                          {getElementIcon(card.element)}
                          <span>{card.element}</span>
                        </span>
                        <span className="text-[10px] font-mono uppercase text-gold-light bg-gold/10 px-2 py-0.5 rounded-full border border-gold/30">
                          {card.arcana} Arcana
                        </span>
                      </div>

                      {/* Card Title */}
                      <h4 className="font-display text-lg font-bold text-cosmic-text leading-tight group-hover:text-gold-bright transition-colors">
                        {card.name}
                      </h4>

                      {/* Astrological / Planetary association */}
                      <span className="text-[10px] text-lavender font-mono block">
                        {card.astrological_association}
                      </span>

                      {/* Keywords */}
                      <div className="flex flex-wrap justify-center gap-1 pt-1">
                        {card.keywords.slice(0, 3).map((kw, kIdx) => (
                          <span
                            key={kIdx}
                            className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-panel border border-violet/30 text-cosmic-text"
                          >
                            {kw}
                          </span>
                        ))}
                      </div>

                      {/* Meaning Excerpt */}
                      <p className="text-[11px] text-cosmic-muted leading-relaxed line-clamp-3 pt-1 text-left bg-midnight-deep/60 p-2.5 rounded-xl border border-indigo-border/60">
                        {is_reversed ? card.reversed_meaning : card.upright_meaning}
                      </p>
                    </div>

                    {/* Bottom Position Meaning */}
                    <div className="pt-2 border-t border-gold/20 text-[10px] text-cosmic-subtle leading-tight">
                      <span className="text-gold-light/80 font-semibold block">Position Intent:</span>
                      <span className="line-clamp-1">{position_meaning}</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>
      )}

      {/* Synthesis Transition Footer */}
      <GlassCard variant="gold" className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4" glow>
        <div className="space-y-1 text-center sm:text-left">
          <div className="flex items-center gap-2 justify-center sm:justify-start">
            <Sparkles className="w-4 h-4 text-gold-light" />
            <h4 className="font-display text-base font-bold text-gold-light">
              {allCardsRevealed ? 'All Sacred Cards Revealed' : 'Cards Drawn & Positioned'}
            </h4>
          </div>
          <p className="text-xs text-cosmic-muted">
            {allCardsRevealed
              ? 'Ready to fuse your biometric palm creases with tarot archetypes into composite intelligence.'
              : 'You may reveal cards individually or proceed directly to synthesis.'}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <VioletButton onClick={onBack} size="md">
            Change Spread
          </VioletButton>

          <GoldButton
            size="lg"
            className="flex-1 sm:flex-none"
            onClick={() => drawResult && onComplete(drawResult)}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Synthesize with Palm Biometrics
          </GoldButton>
        </div>
      </GlassCard>
    </div>
  );
}
