'use client';

import React from 'react';
import MoonMotif from '@/components/cosmic/MoonMotif';
import GlassCard from '@/components/ui/GlassCard';
import GoldButton from '@/components/ui/GoldButton';
import VioletButton from '@/components/ui/VioletButton';
import Eyebrow from '@/components/ui/Eyebrow';
import Link from 'next/link';
import {
  Sparkles,
  Hand,
  Layers,
  Cpu,
  ShieldCheck,
  Award,
  BookOpen,
  Compass,
  ArrowRight,
  Brain,
  Lock,
  Zap,
} from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16 pb-24">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <MoonMotif size="sm" variant="eclipse" className="mx-auto mb-2" />
        <Eyebrow variant="gold">METHODOLOGY & CREDIBILITY</Eyebrow>
        <h1 className="font-display text-3xl sm:text-5xl font-bold text-cosmic-text">
          The Computer Vision & Neural Tarot Pipeline
        </h1>
        <p className="text-cosmic-muted text-sm sm:text-base leading-relaxed">
          How the Cosmic Oracle synthesizes ancient bio-geometric Hastarekha with modern neural
          language reasoning to deliver calibrated spiritual intelligence.
        </p>
      </div>

      {/* 3 Core Architecture Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* CV Palm Line Extraction */}
        <GlassCard variant="default" className="p-8 space-y-5" glow>
          <div className="w-14 h-14 rounded-2xl bg-midnight-elevated border border-gold/40 flex items-center justify-center text-gold-light shadow-gold-glow">
            <Hand className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase text-gold-light tracking-widest font-bold">
              Layer 01 · Biometrics
            </span>
            <h3 className="font-display text-xl font-bold text-cosmic-text">
              Computer Vision Segmentation
            </h3>
          </div>

          <p className="text-xs sm:text-sm text-cosmic-muted leading-relaxed">
            Our vision pipeline detects flexion contours on the palm surface. By mapping curvature
            derivatives along the Heart, Head, Life, and Fate lines, the model computes confidence
            scores and classifies hand geometry into classical elemental archetypes.
          </p>

          <div className="pt-2 text-[11px] text-cosmic-subtle space-y-1 border-t border-indigo-border">
            <span className="block font-semibold text-gold-light">Key Algorithms:</span>
            <span>Edge curvature tensors · Mount elevation analysis</span>
          </div>
        </GlassCard>

        {/* Hermetic Tarot Engine */}
        <GlassCard variant="default" className="p-8 space-y-5" glow>
          <div className="w-14 h-14 rounded-2xl bg-midnight-elevated border border-violet/40 flex items-center justify-center text-violet-light shadow-violet-glow">
            <Layers className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase text-lavender-soft tracking-widest font-bold">
              Layer 02 · Metaphysics
            </span>
            <h3 className="font-display text-xl font-bold text-cosmic-text">
              Hermetic Tarot Archetypes
            </h3>
          </div>

          <p className="text-xs sm:text-sm text-cosmic-muted leading-relaxed">
            Drawing upon classical Rider-Waite-Smith and Golden Dawn iconography, the spread engine
            contextualizes 78 cards across 6 archetypal layouts. Upright and reversed polarities are
            correlated with current planetary transit ephemerides.
          </p>

          <div className="pt-2 text-[11px] text-cosmic-subtle space-y-1 border-t border-indigo-border">
            <span className="block font-semibold text-lavender-soft">Key Systems:</span>
            <span>Major/Minor Arcana polarities · Kabbalistic Tree vectors</span>
          </div>
        </GlassCard>

        {/* Neural Synthesis & Scoring */}
        <GlassCard variant="default" className="p-8 space-y-5" glow>
          <div className="w-14 h-14 rounded-2xl bg-midnight-elevated border border-gold/40 flex items-center justify-center text-gold-bright shadow-gold-glow">
            <Cpu className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase text-gold-bright tracking-widest font-bold">
              Layer 03 · Intelligence
            </span>
            <h3 className="font-display text-xl font-bold text-cosmic-text">
              Neural Synthesis & Scoring
            </h3>
          </div>

          <p className="text-xs sm:text-sm text-cosmic-muted leading-relaxed">
            A specialized LLM reasoning engine fuses the biometric and symbolic inputs into 7
            granular life domains. A calibrated mathematical model computes the composite Insight
            Score across 5 weighted factors to guarantee consistency.
          </p>

          <div className="pt-2 text-[11px] text-cosmic-subtle space-y-1 border-t border-indigo-border">
            <span className="block font-semibold text-gold-bright">Scoring Architecture:</span>
            <span>Weighted 5-factor deterministic confidence model</span>
          </div>
        </GlassCard>
      </div>

      {/* SCORING WEIGHTS BREAKDOWN */}
      <GlassCard variant="gold" className="p-8 sm:p-12 space-y-8" glow>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gold/20 pb-5">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-gold-light font-mono">
              Transparent Mathematical Architecture
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-cosmic-text">
              Insight Score Weight Distribution
            </h2>
          </div>
          <div className="flex items-center gap-1 text-xs text-gold-bright font-mono bg-gold/10 px-3 py-1 rounded-full border border-gold/30">
            <Award className="w-4 h-4" />
            <span>100% Total Calibration</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="p-4 rounded-2xl bg-midnight-deep/80 border border-gold/40 text-center space-y-2">
            <span className="text-2xl font-mono font-black text-gold-bright">30%</span>
            <h4 className="font-display text-xs font-bold text-gold-light">Palm Confidence</h4>
            <p className="text-[11px] text-cosmic-subtle">
              CV edge clarity, line continuity & mount prominence certainty.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-midnight-deep/80 border border-violet/40 text-center space-y-2">
            <span className="text-2xl font-mono font-black text-violet-light">25%</span>
            <h4 className="font-display text-xs font-bold text-lavender-soft">Tarot Relevance</h4>
            <p className="text-[11px] text-cosmic-subtle">
              Archetypal polarity coherence and spread geometry resonance.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-midnight-deep/80 border border-gold/40 text-center space-y-2">
            <span className="text-2xl font-mono font-black text-gold-bright">20%</span>
            <h4 className="font-display text-xs font-bold text-gold-light">
              Personality Alignment
            </h4>
            <p className="text-[11px] text-cosmic-subtle">
              Match between user bio-temperament and identified archetypes.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-midnight-deep/80 border border-violet/40 text-center space-y-2">
            <span className="text-2xl font-mono font-black text-violet-light">15%</span>
            <h4 className="font-display text-xs font-bold text-lavender-soft">Context Relevance</h4>
            <p className="text-[11px] text-cosmic-subtle">
              Specificity and relevance to user’s active life focus question.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-midnight-deep/80 border border-gold/40 text-center space-y-2">
            <span className="text-2xl font-mono font-black text-gold-bright">10%</span>
            <h4 className="font-display text-xs font-bold text-gold-light">Reading Consistency</h4>
            <p className="text-[11px] text-cosmic-subtle">
              Cross-disciplinary harmony between palm lines and card draws.
            </p>
          </div>
        </div>
      </GlassCard>

      {/* ETHICAL SOVEREIGNTY & PRIVACY COMMITMENT */}
      <section id="ethics" className="space-y-6">
        <div className="text-center space-y-2">
          <Eyebrow variant="violet">SACRED AI ETHICS</Eyebrow>
          <h2 className="font-display text-3xl font-bold text-cosmic-text">
            Our Sacred Privacy Commitment
          </h2>
        </div>

        <GlassCard variant="default" className="p-8 sm:p-10 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gold-light font-display text-sm font-bold">
                <ShieldCheck className="w-5 h-5 text-gold" />
                <span>Zero Image Exploitation</span>
              </div>
              <p className="text-xs text-cosmic-muted leading-relaxed">
                Your uploaded palm photographs are processed strictly in ephemeral memory for
                feature vectorization and are never used to train public models or shared with third
                parties.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gold-light font-display text-sm font-bold">
                <Lock className="w-5 h-5 text-gold" />
                <span>Empowerment, Not Fatalism</span>
              </div>
              <p className="text-xs text-cosmic-muted leading-relaxed">
                In authentic hastarekha and hermeticism, the lines on your hand shift as your
                consciousness evolves. Our readings provide strategic mirrors, never fatalistic
                predictions.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gold-light font-display text-sm font-bold">
                <Brain className="w-5 h-5 text-gold" />
                <span>Transparent AI Explanations</span>
              </div>
              <p className="text-xs text-cosmic-muted leading-relaxed">
                We clearly cite every palm line marker and tarot card correlation behind each
                generated insight so you understand the exact metaphysical reasoning.
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-indigo-border/60 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-cosmic-muted">
              Ready to generate your calibrated soul report?
            </span>
            <Link href="/reading">
              <GoldButton size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Launch Oracle Engine
              </GoldButton>
            </Link>
          </div>
        </GlassCard>
      </section>
    </div>
  );
}
