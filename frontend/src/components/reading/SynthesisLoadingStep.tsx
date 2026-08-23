'use client';

import React, { useState, useEffect } from 'react';
import MoonMotif from '@/components/cosmic/MoonMotif';
import Eyebrow from '@/components/ui/Eyebrow';
import { Sparkles, Check, Compass, Cpu, Activity, Stars } from 'lucide-react';
import { motion } from 'framer-motion';

interface SynthesisLoadingStepProps {
  onSynthesisReady?: () => void;
}

export default function SynthesisLoadingStep({ onSynthesisReady }: SynthesisLoadingStepProps) {
  const [activeStage, setActiveStage] = useState<number>(0);

  const stages = [
    {
      label: 'Fusing Palm Crease Vectors & Hand Biometrics',
      desc: 'Mount of Jupiter & Luna intersecting with elemental Fire Hand matrix',
      icon: <Activity className="w-4 h-4 text-gold" />,
    },
    {
      label: 'Interpreting Archetypal Hermetic Tarot Polarities',
      desc: 'Resolving Major & Minor Arcana spreads against current celestial transits',
      icon: <Stars className="w-4 h-4 text-violet-light" />,
    },
    {
      label: 'Generating 7-Pillar Neural Spiritual Intelligence',
      desc: 'Synthesizing Career, Relational Resonance, Wealth Alchemy & Vitality',
      icon: <Cpu className="w-4 h-4 text-gold-bright" />,
    },
    {
      label: 'Constructing Personality Blueprint & Life Horizons',
      desc: 'Calculating archetypal temperament balance (Intuition, Logic, Emotion, Action)',
      icon: <Compass className="w-4 h-4 text-lavender" />,
    },
    {
      label: 'Computing Composite Insight Score & Action Blueprint',
      desc: 'Calibrating weighted 5-factor confidence model and personal mantra',
      icon: <Sparkles className="w-4 h-4 text-gold-light" />,
    },
  ];

  useEffect(() => {
    const intervals = [700, 1400, 2200, 2900, 3600];

    intervals.forEach((time, idx) => {
      setTimeout(() => {
        setActiveStage(idx);
      }, time);
    });
  }, []);

  return (
    <div className="py-12 max-w-3xl mx-auto text-center space-y-8">
      <Eyebrow variant="gold">STEP 4 · ALCHEMICAL SYNTHESIS</Eyebrow>

      {/* Constellation Connecting Animated Motif */}
      <div className="relative w-64 h-64 mx-auto flex items-center justify-center">
        {/* Animated Moon Core */}
        <MoonMotif size="md" variant="eclipse" className="z-10" />

        {/* Constellation Connection Web Lines SVG */}
        <svg
          viewBox="0 0 300 300"
          className="absolute inset-0 w-full h-full pointer-events-none z-20"
        >
          {/* Animated Connecting Nodes */}
          <motion.line
            x1="50"
            y1="50"
            x2="150"
            y2="150"
            stroke="#D4AF37"
            strokeWidth="1"
            strokeDasharray="4 4"
            animate={{ strokeDashoffset: [0, -20], opacity: [0.3, 0.9, 0.3] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
          />
          <motion.line
            x1="250"
            y1="50"
            x2="150"
            y2="150"
            stroke="#8B5CF6"
            strokeWidth="1"
            strokeDasharray="4 4"
            animate={{ strokeDashoffset: [0, 20], opacity: [0.3, 0.9, 0.3] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: 'linear' }}
          />
          <motion.line
            x1="50"
            y1="250"
            x2="150"
            y2="150"
            stroke="#8B5CF6"
            strokeWidth="1"
            strokeDasharray="4 4"
            animate={{ strokeDashoffset: [0, -20], opacity: [0.3, 0.9, 0.3] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
          />
          <motion.line
            x1="250"
            y1="250"
            x2="150"
            y2="150"
            stroke="#D4AF37"
            strokeWidth="1"
            strokeDasharray="4 4"
            animate={{ strokeDashoffset: [0, 20], opacity: [0.3, 0.9, 0.3] }}
            transition={{ repeat: Infinity, duration: 2.2, ease: 'linear' }}
          />

          {/* Orbiting Satellite Star Nodes */}
          <motion.circle
            cx="50"
            cy="50"
            r="4"
            fill="#FDE047"
            animate={{ scale: [1, 1.4, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          />
          <motion.circle
            cx="250"
            cy="50"
            r="4"
            fill="#C9B8F0"
            animate={{ scale: [1, 1.4, 1] }}
            transition={{ repeat: Infinity, duration: 2.3, delay: 0.3 }}
          />
          <motion.circle
            cx="50"
            cy="250"
            r="4"
            fill="#C9B8F0"
            animate={{ scale: [1, 1.4, 1] }}
            transition={{ repeat: Infinity, duration: 2.6, delay: 0.6 }}
          />
          <motion.circle
            cx="250"
            cy="250"
            r="4"
            fill="#FDE047"
            animate={{ scale: [1, 1.4, 1] }}
            transition={{ repeat: Infinity, duration: 2.1, delay: 0.9 }}
          />
        </svg>
      </div>

      {/* Main Title */}
      <div className="space-y-2">
        <h3 className="font-display text-2xl sm:text-3xl font-bold text-cosmic-text">
          Transmuting Biometrics & Tarot Archetypes
        </h3>
        <p className="text-sm text-cosmic-muted max-w-lg mx-auto">
          The neural oracle is synthesizing your unique biometric markers with universal Hermetic
          principles. Please hold your conscious presence.
        </p>
      </div>

      {/* Sequential Progress Stages */}
      <div className="bg-midnight-elevated/80 border border-gold/30 rounded-2xl p-6 backdrop-blur-xl text-left space-y-4 max-w-xl mx-auto shadow-cosmic-card">
        {stages.map((stage, idx) => {
          const isDone = idx < activeStage;
          const isCurrent = idx === activeStage;

          return (
            <div
              key={idx}
              className={`flex items-start gap-3.5 transition-all duration-300 ${
                isCurrent
                  ? 'opacity-100 scale-[1.01]'
                  : isDone
                  ? 'opacity-70'
                  : 'opacity-30'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 border ${
                  isDone
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                    : isCurrent
                    ? 'bg-gold/20 border-gold text-gold-bright shadow-gold-glow animate-pulse'
                    : 'bg-white/5 border-indigo-border text-cosmic-subtle'
                }`}
              >
                {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : stage.icon}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h5
                    className={`text-xs font-semibold ${
                      isCurrent ? 'text-gold-light' : 'text-cosmic-text'
                    }`}
                  >
                    {stage.label}
                  </h5>
                  {isCurrent && (
                    <span className="text-[10px] font-mono text-gold-bright uppercase tracking-wider animate-pulse">
                      In Progress
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-cosmic-muted leading-tight mt-0.5">
                  {stage.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
