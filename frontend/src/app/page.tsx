'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import MoonMotif from '@/components/cosmic/MoonMotif';
import ConstellationOverlay from '@/components/cosmic/ConstellationOverlay';
import GlassCard from '@/components/ui/GlassCard';
import GoldButton from '@/components/ui/GoldButton';
import VioletButton from '@/components/ui/VioletButton';
import Eyebrow from '@/components/ui/Eyebrow';
import {
  Sparkles,
  Hand,
  Layers,
  Cpu,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Award,
  BookOpen,
  Crown,
  Heart,
  Briefcase,
  Coins,
  Activity,
  Compass,
  CheckCircle2,
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingPage() {
  const { isAuthenticated, user } = useAuth();

  const steps = [
    {
      step: '01',
      eyebrow: 'BIOMETRIC CARTOGRAPHY',
      title: 'Upload or Scan Your Palm',
      description:
        'Advanced computer vision isolates the Heart, Head, Life, and Fate lines, evaluating mount prominences and elemental hand geometry.',
      icon: <Hand className="w-8 h-8 text-gold" />,
    },
    {
      step: '02',
      eyebrow: 'HERMETIC ARCHETYPES',
      title: 'Draw From the Sacred Deck',
      description:
        'Choose from 6 metaphysical spreads—from the quick Daily Oracle Pulse to the profound 10-card Grand Celtic Cross.',
      icon: <Layers className="w-8 h-8 text-violet-light" />,
    },
    {
      step: '03',
      eyebrow: 'NEURAL ALCHEMY',
      title: 'Synthesize Unified Guidance',
      description:
        'Our neural engine weaves palm biometrics with tarot archetypes to generate 7-pillar intelligence, personality profiling, and actionable counsel.',
      icon: <Cpu className="w-8 h-8 text-gold-bright" />,
    },
  ];

  const pillars = [
    {
      title: 'Personality & Soul Architecture',
      desc: 'Unveil your primary archetype, core strengths, and shadow growth vectors.',
      icon: <Crown className="w-5 h-5 text-gold" />,
    },
    {
      title: 'Relational Resonance & Soul Ties',
      desc: 'Elevate partnerships through vulnerable truth-telling and conscious boundaries.',
      icon: <Heart className="w-5 h-5 text-rose-400" />,
    },
    {
      title: 'Career & Sovereign Purpose',
      desc: 'Identify high-leverage vocational crossroads, leadership potential, and offerings.',
      icon: <Briefcase className="w-5 h-5 text-amber-400" />,
    },
    {
      title: 'Financial Alchemy & Wealth Flow',
      desc: 'Shift from survival saving into generative, value-backed asset creation.',
      icon: <Coins className="w-5 h-5 text-gold-bright" />,
    },
    {
      title: 'Vitality & Somatic Balance',
      desc: 'Regulate nervous system prana and align physical vigor with mental intensity.',
      icon: <Activity className="w-5 h-5 text-sky-400" />,
    },
    {
      title: 'Personal Growth & Shadow Alchemy',
      desc: 'Transmute perfectionism into courage, integrating sensitive intuition into power.',
      icon: <Sparkles className="w-5 h-5 text-violet-bright" />,
    },
    {
      title: 'Life Opportunities & Auspicious Portals',
      desc: 'Navigate upcoming cosmic timing windows, pivotal alliances, and milestone expansions.',
      icon: <Compass className="w-5 h-5 text-emerald-400" />,
    },
  ];

  return (
    <div className="relative overflow-hidden space-y-24 sm:space-y-32 pb-16">
      {/* Constellation Subtle Overlay */}
      <ConstellationOverlay />

      {/* HERO SECTION */}
      <section className="relative pt-12 sm:pt-20 lg:pt-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Soft Radial Ambient Aura Behind Hero */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-radial-glow pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto space-y-8">
          {/* Eyebrow Pill */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Eyebrow variant="gold">WHERE BIOMETRICS MEETS METAPHYSICS</Eyebrow>
          </motion.div>

          {/* Hero Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-cosmic-text leading-[1.1]"
          >
            Synthesize Your Palm Biometrics with{' '}
            <span className="text-gold-gradient">Archetypal Tarot</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-xl text-cosmic-muted max-w-2xl mx-auto leading-relaxed"
          >
            The world’s first spiritual intelligence platform fusing computer vision palmistry with
            Hermetic tarot archetypes to reveal your calibrated soul blueprint.
          </motion.p>

          {/* Hero CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2"
          >
            {isAuthenticated ? (
              <>
                <Link href="/reading">
                  <GoldButton size="lg" leftIcon={<Sparkles className="w-5 h-5" />}>
                    Continue Your Reading ({user?.name || 'Aurelia'})
                  </GoldButton>
                </Link>
                <Link href="/profile">
                  <VioletButton size="lg" leftIcon={<Compass className="w-5 h-5" />}>
                    View Soul Profile
                  </VioletButton>
                </Link>
              </>
            ) : (
              <>
                <Link href="/login">
                  <GoldButton size="lg" leftIcon={<Sparkles className="w-5 h-5" />}>
                    Sign In to Sanctuary
                  </GoldButton>
                </Link>
                <Link href="/register">
                  <VioletButton size="lg" leftIcon={<Compass className="w-5 h-5" />}>
                    Begin Onboarding Ritual
                  </VioletButton>
                </Link>
              </>
            )}
          </motion.div>

          {/* Trust Badges */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-cosmic-subtle font-mono">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-gold-light" />
              <span>Zero-Storage Biometric Privacy</span>
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-border" />
            <span className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-violet-light" />
              <span>Calibrated 5-Factor Score</span>
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-border" />
            <span className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-gold-bright" />
              <span>7-Pillar Neural Synthesis</span>
            </span>
          </div>
        </div>

        {/* Hero Visual Element: Moon Motif & Celestial Rings */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-14 relative flex justify-center"
        >
          <MoonMotif size="lg" variant="eclipse" />
        </motion.div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center space-y-3 mb-16">
          <Eyebrow variant="violet">THE 3-STEP ALCHEMICAL PROCESS</Eyebrow>
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-cosmic-text">
            How the Cosmic Oracle Operates
          </h2>
          <p className="text-cosmic-muted text-sm sm:text-base max-w-xl mx-auto">
            A frictionless union of ancient mystical wisdom and cutting-edge neural computation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((s, idx) => (
            <GlassCard
              key={idx}
              variant="default"
              hoverEffect
              className="p-8 space-y-5 relative overflow-hidden group"
            >
              {/* Step Number Watermark */}
              <div className="absolute top-4 right-4 font-display font-black text-4xl text-white/5 group-hover:text-gold/15 transition-colors font-mono">
                {s.step}
              </div>

              <div className="w-16 h-16 rounded-2xl bg-midnight-elevated border border-gold/30 flex items-center justify-center shadow-gold-glow group-hover:border-gold transition-colors">
                {s.icon}
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-widest text-gold-light font-mono">
                  {s.eyebrow}
                </span>
                <h3 className="font-display text-xl font-bold text-cosmic-text">{s.title}</h3>
              </div>

              <p className="text-xs sm:text-sm text-cosmic-muted leading-relaxed">
                {s.description}
              </p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* 7-PILLAR SPIRITUAL INTELLIGENCE SECTION */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <GlassCard variant="gold" className="p-8 sm:p-12 space-y-12" glow>
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <Eyebrow variant="gold">SYNTHESIZED INSIGHT CATEGORIES</Eyebrow>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-cosmic-text">
              7 Pillars of Spiritual Intelligence
            </h2>
            <p className="text-cosmic-muted text-sm leading-relaxed">
              Every reading generates a granular breakdown across all major dimensions of human
              experience, scored and cross-correlated.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {pillars.map((p, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-midnight-deep/70 border border-indigo-border hover:border-gold/40 transition-all space-y-2.5"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-midnight-surface border border-violet/30 flex items-center justify-center flex-shrink-0">
                    {p.icon}
                  </div>
                  <h4 className="font-display text-sm font-bold text-cosmic-text leading-snug">
                    {p.title}
                  </h4>
                </div>
                <p className="text-xs text-cosmic-muted leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center pt-4">
            <Link href="/reading">
              <GoldButton size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Experience a Live Reading Now
              </GoldButton>
            </Link>
          </div>
        </GlassCard>
      </section>

      {/* SAMPLE READING PREVIEW TEASER */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-5 space-y-6">
            <Eyebrow variant="violet">SAMPLE INTELLIGENCE REPORT</Eyebrow>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-cosmic-text">
              A Complete Dossier of Your Soul’s Trajectory
            </h2>
            <p className="text-sm text-cosmic-muted leading-relaxed">
              From high-resolution biometric contour classification to 3-stage horizon forecasting,
              your reading provides tangible clarity for high-stakes decisions.
            </p>

            <ul className="space-y-3 text-xs text-cosmic-text">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-gold-bright" />
                <span>Life / Head / Heart / Fate line biometric metrics</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-gold-bright" />
                <span>Major & Minor Arcana position interpretations</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-gold-bright" />
                <span>Single Chart.js radial breakdown with 5 weighted factors</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-gold-bright" />
                <span>One-click PDF & Excel report downloads</span>
              </li>
            </ul>

            <div className="pt-2">
              <Link href="/reading/rdg_celtic_cross_master_001">
                <VioletButton size="md" leftIcon={<BookOpen className="w-4 h-4" />}>
                  Inspect Interactive Sample Reading
                </VioletButton>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-7">
            <GlassCard variant="default" className="p-6 sm:p-8 space-y-5" glow>
              <div className="flex items-center justify-between border-b border-indigo-border pb-4">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-gold-light font-mono">
                    Master Reading #001
                  </span>
                  <h3 className="font-display text-xl font-bold text-cosmic-text">
                    Grand Celtic Cross · 10 Cards
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-display font-black text-gold-gradient">
                    95 / 100
                  </span>
                  <span className="block text-[10px] text-lavender font-mono">
                    Celestial Alignment
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-midnight-deep/70 border border-violet/30 text-xs text-cosmic-muted leading-relaxed">
                &ldquo;Fire Hand structure and deep Writer’s Fork on your Head line corroborate the
                presence of I · The Magician, pointing to a critical cycle of sovereign manifestation
                and creative autonomy.&rdquo;
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-[11px]">
                <div className="p-2.5 rounded-xl bg-indigo-panel/50 border border-indigo-border">
                  <span className="text-cosmic-subtle block">Hand Type</span>
                  <span className="font-bold text-gold-light">Fire Hand</span>
                </div>
                <div className="p-2.5 rounded-xl bg-indigo-panel/50 border border-indigo-border">
                  <span className="text-cosmic-subtle block">Primary Line</span>
                  <span className="font-bold text-gold-light">Writer’s Fork</span>
                </div>
                <div className="p-2.5 rounded-xl bg-indigo-panel/50 border border-indigo-border">
                  <span className="text-cosmic-subtle block">Archetype</span>
                  <span className="font-bold text-gold-light">Alchemist</span>
                </div>
                <div className="p-2.5 rounded-xl bg-indigo-panel/50 border border-indigo-border">
                  <span className="text-cosmic-subtle block">Growth Horizon</span>
                  <span className="font-bold text-gold-light">96%</span>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* FINAL CTA RITUAL BANNER */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <GlassCard variant="gold" className="p-10 sm:p-16 space-y-6 relative overflow-hidden" glow>
          <MoonMotif size="sm" variant="crescent" className="mx-auto" />
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-cosmic-text">
            Ready to Unveil Your Cosmic Blueprint?
          </h2>
          <p className="text-cosmic-muted text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Begin the sacred onboarding ritual or enter the Oracle Engine to generate your first
            synthesized palm and tarot report.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/register">
              <GoldButton size="lg" leftIcon={<Sparkles className="w-5 h-5" />}>
                Begin Sacred Ritual
              </GoldButton>
            </Link>
            <Link href="/about">
              <VioletButton size="lg">Explore Pipeline Science</VioletButton>
            </Link>
          </div>
        </GlassCard>
      </section>
    </div>
  );
}
