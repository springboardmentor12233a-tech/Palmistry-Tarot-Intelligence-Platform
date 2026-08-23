'use client';

import React, { useState } from 'react';
import { FullReading, Recommendations } from '@/types';
import { exportReadingToPDF, exportReadingToExcel } from '@/lib/exportUtils';
import GlassCard from '@/components/ui/GlassCard';
import GoldButton from '@/components/ui/GoldButton';
import VioletButton from '@/components/ui/VioletButton';
import {
  FileText,
  FileSpreadsheet,
  Sparkles,
  Quote,
  Gem,
  CheckCircle2,
  Share2,
  Check,
  Compass,
} from 'lucide-react';

interface RecommendationsSectionProps {
  reading: FullReading;
}

export default function RecommendationsSection({ reading }: RecommendationsSectionProps) {
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const { recommendations } = reading;

  const handlePDF = () => {
    setIsExportingPDF(true);
    setTimeout(() => {
      try {
        exportReadingToPDF(reading);
      } catch (err) {
        alert('Failed to generate PDF. Please try again.');
      } finally {
        setIsExportingPDF(false);
      }
    }, 400);
  };

  const handleExcel = () => {
    setIsExportingExcel(true);
    setTimeout(() => {
      try {
        exportReadingToExcel(reading);
      } catch (err) {
        alert('Failed to generate Excel file.');
      } finally {
        setIsExportingExcel(false);
      }
    }, 400);
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  return (
    <div className="space-y-8">
      {/* Daily Alchemical Mantra Hero Card */}
      <GlassCard variant="gold" className="p-8 text-center space-y-4 relative overflow-hidden" glow>
        <div className="w-12 h-12 rounded-full bg-gold/15 border border-gold/40 flex items-center justify-center mx-auto text-gold-light shadow-gold-glow">
          <Quote className="w-6 h-6 text-gold-bright" />
        </div>

        <span className="text-[10px] uppercase font-bold tracking-widest text-gold-light block font-mono">
          Your Sacred Daily Alchemical Mantra
        </span>

        <p className="font-display text-xl sm:text-2xl lg:text-3xl text-gold-bright font-bold max-w-2xl mx-auto italic leading-relaxed">
          &ldquo;{recommendations.daily_mantra}&rdquo;
        </p>

        <p className="text-xs text-cosmic-muted max-w-md mx-auto">
          Recite this transmission upon waking to calibrate your morning mental and cardiac field.
        </p>

        {/* Recommended Crystals & Sigils */}
        <div className="pt-4 border-t border-gold/20 flex flex-wrap items-center justify-center gap-2">
          <span className="text-xs font-semibold text-lavender flex items-center gap-1.5 mr-2">
            <Gem className="w-3.5 h-3.5 text-gold-light" />
            <span>Harmonic Crystals & Sigils:</span>
          </span>
          {recommendations.recommended_crystals_or_symbols.map((item, idx) => (
            <span
              key={idx}
              className="px-3 py-1 rounded-full bg-midnight-deep border border-gold/30 text-[11px] font-mono text-gold-light"
            >
              {item}
            </span>
          ))}
        </div>
      </GlassCard>

      {/* 5-Domain Actionable Blueprint */}
      <GlassCard variant="default" className="p-6 sm:p-8 space-y-6">
        <div className="border-b border-gold/20 pb-4">
          <span className="text-[10px] uppercase font-bold tracking-widest text-gold-light block font-mono">
            Actionable Blueprint
          </span>
          <h3 className="font-display text-2xl font-bold text-cosmic-text">
            Strategic Soul Recommendations
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Growth */}
          <div className="p-5 rounded-2xl bg-indigo-panel/40 border border-violet/30 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gold-light font-display">
              Personal Growth & Mind
            </h4>
            <ul className="space-y-2 text-xs text-cosmic-muted">
              {recommendations.growth.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-gold flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Relationships */}
          <div className="p-5 rounded-2xl bg-indigo-panel/40 border border-violet/30 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gold-light font-display">
              Relational Harmony
            </h4>
            <ul className="space-y-2 text-xs text-cosmic-muted">
              {recommendations.relationships.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-gold flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Career */}
          <div className="p-5 rounded-2xl bg-indigo-panel/40 border border-violet/30 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gold-light font-display">
              Career & Sovereign Purpose
            </h4>
            <ul className="space-y-2 text-xs text-cosmic-muted">
              {recommendations.career.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-gold flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Goal Alignment */}
          <div className="p-5 rounded-2xl bg-indigo-panel/40 border border-violet/30 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gold-light font-display">
              Goal & Timing Calibration
            </h4>
            <ul className="space-y-2 text-xs text-cosmic-muted">
              {recommendations.goal_alignment.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-gold flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Spiritual Development */}
          <div className="p-5 rounded-2xl bg-indigo-panel/40 border border-violet/30 space-y-3 md:col-span-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gold-light font-display">
              Spiritual Mastery & Rituals
            </h4>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-cosmic-muted">
              {recommendations.spiritual_development.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-gold flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </GlassCard>

      {/* Export & Sharing Bar */}
      <GlassCard variant="gold" className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4" glow>
        <div className="space-y-1 text-center sm:text-left">
          <h4 className="font-display text-base font-bold text-gold-light">
            Preserve Your Soul Intelligence Report
          </h4>
          <p className="text-xs text-cosmic-muted">
            Export the complete synthesized dossier with palm biometrics, tarot matrices, and 7-pillar
            breakdowns.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-center">
          <GoldButton
            size="md"
            onClick={handlePDF}
            isLoading={isExportingPDF}
            leftIcon={<FileText className="w-4 h-4" />}
          >
            Download PDF Report
          </GoldButton>

          <VioletButton
            size="md"
            onClick={handleExcel}
            isLoading={isExportingExcel}
            leftIcon={<FileSpreadsheet className="w-4 h-4" />}
          >
            Export to Excel
          </VioletButton>

          <VioletButton
            size="md"
            variant="ghost"
            onClick={handleShare}
            leftIcon={copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
          >
            {copiedLink ? 'Link Copied' : 'Share'}
          </VioletButton>
        </div>
      </GlassCard>
    </div>
  );
}
