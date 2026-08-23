'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FullReading } from '@/types';
import { api } from '@/lib/api';
import AuthGuard from '@/components/ui/AuthGuard';
import GlassCard from '@/components/ui/GlassCard';
import GoldButton from '@/components/ui/GoldButton';
import VioletButton from '@/components/ui/VioletButton';
import Eyebrow from '@/components/ui/Eyebrow';
import ErrorCard from '@/components/ui/ErrorCard';
import MoonMotif from '@/components/cosmic/MoonMotif';
import InsightScoreChart from '@/components/reading/InsightScoreChart';
import CategoryInsightsTabs from '@/components/reading/CategoryInsightsTabs';
import PersonalityBlock from '@/components/reading/PersonalityBlock';
import LifeTrendBlock from '@/components/reading/LifeTrendBlock';
import RecommendationsSection from '@/components/reading/RecommendationsSection';
import { exportReadingToPDF, exportReadingToExcel } from '@/lib/exportUtils';
import Link from 'next/link';
import {
  Sparkles,
  FileText,
  FileSpreadsheet,
  Hand,
  Layers,
  ArrowLeft,
  Share2,
  Calendar,
  Award,
  Crown,
  CheckCircle2,
  Flame,
  Droplets,
  Wind,
  Mountain,
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function ReadingResultPage() {
  const params = useParams();
  const router = useRouter();
  const id = (params?.id as string) || 'rdg_celtic_cross_master_001';

  const [reading, setReading] = useState<FullReading | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadReading() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await api.getReadingById(id);
        setReading(data);
      } catch (err: any) {
        setError(err?.message || 'Failed to retrieve stored reading.');
      } finally {
        setIsLoading(false);
      }
    }

    if (id) {
      loadReading();
    }
  }, [id]);

  const getElementIcon = (element: string) => {
    switch (element) {
      case 'Fire':
        return <Flame className="w-3 h-3 text-amber-400" />;
      case 'Water':
        return <Droplets className="w-3 h-3 text-sky-400" />;
      case 'Air':
        return <Wind className="w-3 h-3 text-violet-300" />;
      case 'Earth':
        return <Mountain className="w-3 h-3 text-emerald-400" />;
      default:
        return <Sparkles className="w-3 h-3 text-gold" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <MoonMotif size="md" variant="eclipse" />
        <h3 className="font-display text-xl text-gold-light font-bold">
          Consulting the Alchemical Codex...
        </h3>
        <p className="text-xs text-cosmic-muted max-w-sm">
          Calibrating stored biometric vectors and tarot alignments.
        </p>
      </div>
    );
  }

  if (error || !reading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <ErrorCard
          title="Reading Archive Unavailable"
          message={error || 'Unable to locate this celestial reading in the astral ledger.'}
          onRetry={() => window.location.reload()}
          homeLink
        />
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 pb-24">
        {/* Top Navigation & Action Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-border/60 pb-6">
          <div className="flex items-center gap-3">
            <Link href="/reading">
              <button className="p-2.5 rounded-xl bg-indigo-panel/60 border border-indigo-border hover:border-gold/50 text-cosmic-muted hover:text-cosmic-text transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </button>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <Eyebrow variant="gold">DOSSIER #{reading.id}</Eyebrow>
                <span className="text-xs text-cosmic-subtle font-mono flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(reading.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                </span>
              </div>
              <h1 className="font-display text-2xl sm:text-4xl font-bold text-cosmic-text mt-1">
                {reading.spread_title}
              </h1>
            </div>
          </div>

          {/* Quick Header CTAs */}
          <div className="flex flex-wrap items-center gap-2.5">
            <GoldButton
              size="sm"
              onClick={() => exportReadingToPDF(reading)}
              leftIcon={<FileText className="w-3.5 h-3.5" />}
            >
              PDF Report
            </GoldButton>

            <VioletButton
              size="sm"
              onClick={() => exportReadingToExcel(reading)}
              leftIcon={<FileSpreadsheet className="w-3.5 h-3.5" />}
            >
              Excel
            </VioletButton>

            <Link href="/reading">
              <VioletButton size="sm" variant="ghost" leftIcon={<Sparkles className="w-3.5 h-3.5" />}>
                New Reading
              </VioletButton>
            </Link>
          </div>
        </div>

        {/* SECTION 1: EXECUTIVE SYNTHESIS & RADIAL INSIGHT SCORE */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Executive Synthesis Summary */}
            <div className="lg:col-span-6 space-y-6">
              <GlassCard variant="default" className="p-6 sm:p-8 space-y-4 h-full" glow>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-gold-light" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-gold-light font-display">
                    Executive Alchemical Synthesis
                  </span>
                </div>

                <p className="text-sm sm:text-base text-cosmic-text font-sans leading-relaxed bg-midnight-deep/50 p-5 rounded-2xl border border-indigo-border/60">
                  {reading.interpretation.overview_summary}
                </p>

                {/* Quick Meta Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
                  <div className="p-3 rounded-xl bg-midnight-elevated/70 border border-violet/30 space-y-1">
                    <span className="text-[10px] text-cosmic-subtle font-mono uppercase block">
                      Hand Element
                    </span>
                    <span className="font-bold text-gold-light flex items-center gap-1.5">
                      <Hand className="w-3.5 h-3.5 text-gold" />
                      {reading.palm_result.hand_type}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-midnight-elevated/70 border border-violet/30 space-y-1">
                    <span className="text-[10px] text-cosmic-subtle font-mono uppercase block">
                      Archetype
                    </span>
                    <span className="font-bold text-lavender-soft flex items-center gap-1.5">
                      <Crown className="w-3.5 h-3.5 text-violet-light" />
                      {reading.personality.primary_archetype.replace('The ', '')}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-midnight-elevated/70 border border-violet/30 space-y-1 col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-cosmic-subtle font-mono uppercase block">
                      Cards Drawn
                    </span>
                    <span className="font-bold text-cosmic-text font-mono">
                      {reading.tarot_result.cards.length} Positions
                    </span>
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* Single Chart.js Radial Doughnut Breakdown */}
            <div className="lg:col-span-6">
              <InsightScoreChart score={reading.insight_score} />
            </div>
          </div>
        </div>

        {/* SECTION 2: PALM BIOMETRIC SUMMARY */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Hand className="w-5 h-5 text-gold-light" />
            <h2 className="font-display text-2xl font-bold text-cosmic-text">
              Palm Biometric Cartography
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Heart Line */}
            <GlassCard variant="default" className="p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-display text-sm font-bold text-gold-light">
                  {reading.palm_result.lines.heart_line.name.split(' (')[0]}
                </span>
                <span className="text-[10px] text-lavender font-mono px-2 py-0.5 rounded bg-violet/10 border border-violet/30">
                  {reading.palm_result.lines.heart_line.confidence}%
                </span>
              </div>
              <p className="text-xs text-cosmic-muted leading-relaxed line-clamp-3">
                {reading.palm_result.lines.heart_line.summary}
              </p>
            </GlassCard>

            {/* Head Line */}
            <GlassCard variant="default" className="p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-display text-sm font-bold text-gold-light">
                  {reading.palm_result.lines.head_line.name.split(' (')[0]}
                </span>
                <span className="text-[10px] text-lavender font-mono px-2 py-0.5 rounded bg-violet/10 border border-violet/30">
                  {reading.palm_result.lines.head_line.confidence}%
                </span>
              </div>
              <p className="text-xs text-cosmic-muted leading-relaxed line-clamp-3">
                {reading.palm_result.lines.head_line.summary}
              </p>
            </GlassCard>

            {/* Life Line */}
            <GlassCard variant="default" className="p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-display text-sm font-bold text-gold-light">
                  {reading.palm_result.lines.life_line.name.split(' (')[0]}
                </span>
                <span className="text-[10px] text-lavender font-mono px-2 py-0.5 rounded bg-violet/10 border border-violet/30">
                  {reading.palm_result.lines.life_line.confidence}%
                </span>
              </div>
              <p className="text-xs text-cosmic-muted leading-relaxed line-clamp-3">
                {reading.palm_result.lines.life_line.summary}
              </p>
            </GlassCard>

            {/* Fate Line */}
            <GlassCard variant="default" className="p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-display text-sm font-bold text-gold-light">
                  {reading.palm_result.lines.fate_line.name.split(' (')[0]}
                </span>
                <span className="text-[10px] text-lavender font-mono px-2 py-0.5 rounded bg-violet/10 border border-violet/30">
                  {reading.palm_result.lines.fate_line.confidence}%
                </span>
              </div>
              <p className="text-xs text-cosmic-muted leading-relaxed line-clamp-3">
                {reading.palm_result.lines.fate_line.summary}
              </p>
            </GlassCard>
          </div>
        </section>

        {/* SECTION 3: TAROT SPREAD MATRIX */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-violet-light" />
              <h2 className="font-display text-2xl font-bold text-cosmic-text">
                Tarot Archetypal Spread Matrix
              </h2>
            </div>
            <span className="text-xs text-cosmic-subtle font-mono">
              {reading.tarot_result.cards.length} Archetypes Positioned
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {reading.tarot_result.cards.map((item, idx) => (
              <GlassCard
                key={idx}
                variant="default"
                hoverEffect
                className="p-5 space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-indigo-border/60 pb-2 mb-2.5">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-gold-light font-mono truncate max-w-[140px]">
                      {item.position_label}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase font-mono ${
                        item.is_reversed
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {item.is_reversed ? 'Reversed' : 'Upright'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[10px] text-cosmic-subtle font-mono mb-1">
                    {getElementIcon(item.card.element)}
                    <span>{item.card.element}</span>
                    <span>·</span>
                    <span>{item.card.arcana} arcana</span>
                  </div>

                  <h4 className="font-display text-base font-bold text-cosmic-text leading-tight">
                    {item.card.name}
                  </h4>

                  <p className="text-xs text-cosmic-muted leading-relaxed mt-2 line-clamp-3">
                    {item.is_reversed ? item.card.reversed_meaning : item.card.upright_meaning}
                  </p>
                </div>

                <div className="pt-2 border-t border-indigo-border/40 text-[10px] text-cosmic-subtle">
                  <span className="text-gold-light/80 block font-semibold">Position Core:</span>
                  <span className="line-clamp-1">{item.position_meaning}</span>
                </div>
              </GlassCard>
            ))}
          </div>
        </section>

        {/* SECTION 4: 7-PILLAR CATEGORY INSIGHTS */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-gold" />
            <h2 className="font-display text-2xl font-bold text-cosmic-text">
              7-Pillar Neural Spiritual Intelligence
            </h2>
          </div>
          <CategoryInsightsTabs categories={reading.interpretation.categories} />
        </section>

        {/* SECTION 5: PERSONALITY INTELLIGENCE */}
        <section className="space-y-4">
          <PersonalityBlock personality={reading.personality} />
        </section>

        {/* SECTION 6: LIFE TREND ANALYSIS */}
        <section className="space-y-4">
          <LifeTrendBlock lifeTrend={reading.life_trend} />
        </section>

        {/* SECTION 7: ACTIONABLE RECOMMENDATIONS & EXPORT */}
        <section className="space-y-4">
          <RecommendationsSection reading={reading} />
        </section>
      </div>
    </AuthGuard>
  );
}
