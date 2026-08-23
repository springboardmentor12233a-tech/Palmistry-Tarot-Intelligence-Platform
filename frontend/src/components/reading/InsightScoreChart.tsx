'use client';

import React from 'react';
import { InsightScore } from '@/types';
import GlassCard from '@/components/ui/GlassCard';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { Sparkles, ShieldCheck, CheckCircle2, Award } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend);

interface InsightScoreChartProps {
  score: InsightScore;
}

export default function InsightScoreChart({ score }: InsightScoreChartProps) {
  const chartData = {
    labels: [
      'Palm Biometric Confidence (30%)',
      'Tarot Archetype Relevance (25%)',
      'Personality Alignment (20%)',
      'User Context Resonance (15%)',
      'Reading Consistency (10%)',
    ],
    datasets: [
      {
        label: 'Weight Contribution',
        data: [
          score.palm_confidence * 0.3,
          score.tarot_relevance * 0.25,
          score.personality_alignment * 0.2,
          score.context_relevance * 0.15,
          score.consistency * 0.1,
        ],
        backgroundColor: [
          'rgba(212, 175, 55, 0.85)', // Gold
          'rgba(124, 58, 237, 0.85)', // Violet
          'rgba(167, 139, 250, 0.85)', // Bright Violet
          'rgba(232, 196, 104, 0.85)', // Light Gold
          'rgba(201, 184, 240, 0.85)', // Lavender
        ],
        borderColor: [
          '#FDE047',
          '#7C3AED',
          '#A78BFA',
          '#E8C468',
          '#C9B8F0',
        ],
        borderWidth: 1.5,
        hoverOffset: 6,
      },
    ],
  };

  const chartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '72%',
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#0D0B1F',
        titleColor: '#E8C468',
        bodyColor: '#F5F3FA',
        borderColor: 'rgba(212, 175, 55, 0.4)',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          label: function (context) {
            const rawScoreMap = [
              score.palm_confidence,
              score.tarot_relevance,
              score.personality_alignment,
              score.context_relevance,
              score.consistency,
            ];
            const raw = rawScoreMap[context.dataIndex];
            return ` Weighted Points: ${context.parsed.toFixed(1)} / Raw Score: ${raw}%`;
          },
        },
      },
    },
  };

  const metrics = [
    {
      label: 'Palm Confidence',
      weight: '30%',
      value: score.palm_confidence,
      color: 'bg-[#D4AF37]',
      border: 'border-gold',
    },
    {
      label: 'Tarot Relevance',
      weight: '25%',
      value: score.tarot_relevance,
      color: 'bg-[#7C3AED]',
      border: 'border-violet',
    },
    {
      label: 'Personality Alignment',
      weight: '20%',
      value: score.personality_alignment,
      color: 'bg-[#A78BFA]',
      border: 'border-violet-bright',
    },
    {
      label: 'Context Resonance',
      weight: '15%',
      value: score.context_relevance,
      color: 'bg-[#E8C468]',
      border: 'border-gold-light',
    },
    {
      label: 'Reading Consistency',
      weight: '10%',
      value: score.consistency,
      color: 'bg-[#C9B8F0]',
      border: 'border-lavender',
    },
  ];

  return (
    <GlassCard variant="gold" className="p-6 sm:p-8" glow>
      <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
        {/* Left Col: Radial Chart with Center Score Badge */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex-shrink-0 flex items-center justify-center">
          <Doughnut data={chartData} options={chartOptions} />

          {/* Centered Composite Score Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="text-[10px] uppercase font-bold tracking-widest text-gold-light font-mono">
              Composite Score
            </span>
            <div className="text-4xl sm:text-5xl font-display font-black text-gold-gradient leading-none my-1">
              {score.overall}
            </div>
            <span className="text-[11px] text-lavender font-semibold px-2.5 py-0.5 rounded-full bg-violet-deep/60 border border-violet/40">
              {score.tier}
            </span>
          </div>
        </div>

        {/* Right Col: Weighted Component Breakdown */}
        <div className="flex-1 w-full space-y-4">
          <div className="flex items-center justify-between border-b border-gold/20 pb-3">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-gold-light">
                Mathematical Model
              </span>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-cosmic-text">
                Composite Insight Calibration
              </h3>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gold-bright font-mono bg-gold/10 px-3 py-1 rounded-full border border-gold/30">
              <Award className="w-3.5 h-3.5" />
              <span>5-Vector Synthesis</span>
            </div>
          </div>

          <p className="text-xs text-cosmic-muted leading-relaxed">
            The Composite Insight Score blends computer-vision biometric palm clarity with tarot
            archetypal relevance, user inquiry alignment, and cross-discipline consistency.
          </p>

          {/* Metric Rows */}
          <div className="space-y-2.5 pt-1">
            {metrics.map((m, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-midnight-deep/60 border border-indigo-border/70 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className={`w-3 h-3 rounded-full ${m.color}`} />
                  <div>
                    <span className="font-semibold text-cosmic-text">{m.label}</span>
                    <span className="text-[10px] text-cosmic-subtle ml-2 font-mono">
                      (Weight: {m.weight})
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 font-mono">
                  <div className="w-20 sm:w-28 bg-midnight-surface h-1.5 rounded-full overflow-hidden hidden sm:block">
                    <div
                      className={`h-full ${m.color}`}
                      style={{ width: `${m.value}%` }}
                    />
                  </div>
                  <span className="font-bold text-gold-light min-w-[36px] text-right">
                    {m.value}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
