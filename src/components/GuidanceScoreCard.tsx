import React, { useState } from 'react';
import { 
  Sparkles, 
  HelpCircle, 
  ChevronRight, 
  Layers, 
  Hand, 
  UserCheck, 
  Target, 
  RefreshCw,
  Scale
} from 'lucide-react';
import { InsightScoreBreakdown } from '../types';

interface GuidanceScoreCardProps {
  scoreData: InsightScoreBreakdown;
}

export const GuidanceScoreCard: React.FC<GuidanceScoreCardProps> = ({ scoreData }) => {
  const [showFormulaDetails, setShowFormulaDetails] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-amber-300 stroke-amber-400';
    if (score >= 80) return 'text-purple-300 stroke-purple-400';
    if (score >= 70) return 'text-cyan-300 stroke-cyan-400';
    return 'text-emerald-300 stroke-emerald-400';
  };

  const circumference = 2 * Math.PI * 42; // radius = 42
  const strokeDashoffset = circumference - (scoreData.final_score / 100) * circumference;

  return (
    <div id="guidance-score-widget" className="p-6 rounded-2xl bg-gradient-to-br from-[#121429] via-[#0f1022] to-[#14162e] border border-amber-500/30 shadow-2xl space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="font-cinzel text-base font-bold text-amber-200">
              5-Factor Spiritual Guidance Scoring Engine
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Harmonic resonance across physical and symbolic planes.computed from physical & symbolic metrics
          </p>
        </div>

        <div className="relative w-32 h-32 flex items-center justify-center flex-shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background Track */}
            <circle
              cx="50"
              cy="50"
              r="42"
              className="stroke-slate-800"
              strokeWidth="7"
              fill="transparent"
            />
            {/* Animated Progress Fill */}
            <circle
              cx="50"
              cy="50"
              r="42"
              className={`transition-all duration-1000 ease-out ${getScoreColor(scoreData.final_score)}`}
              strokeWidth="7"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          {/* Center Score Readout */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="font-cinzel text-3xl font-extrabold text-white tracking-tight">
              {scoreData.final_score}
            </span>
            <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider">
              / 100
            </span>
          </div>
        </div>

        {/* Rating Band & Summary text */}
        <div className="space-y-2 text-center sm:text-left flex-1">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-bold font-mono">
            <span>BAND:</span>
            <span>{scoreData.ratingBand}</span>
          </div>
          <h4 className="text-sm font-bold text-slate-100 font-cinzel">
            Exceptional Spiritual Coherence
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            The weighted combination of palm line curvature ({scoreData.s_palm}%) and drawn tarot archetype resonance ({scoreData.s_tarot}%) reflects high clarity for practical manifestation.
          </p>
        </div>

      </div>

      {/* 5 Factors Breakdown Progress Bars */}
      <div className="space-y-3">
        <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between">
          <span>Weighted Component Breakdown</span>
          <span className="text-amber-400">Total: 100% Weight</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          
          {/* Factor 1: Palm Confidence */}
          <div className="pb-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center space-x-1.5 font-medium text-slate-200">
                <Hand className="w-3.5 h-3.5 text-cyan-400" />
                <span>Topography of Fate (S_palm)</span>
              </span>
              <div className="flex items-center space-x-1.5 font-mono">
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300">30% Weight</span>
                <strong className="text-white">{scoreData.s_palm}%</strong>
              </div>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-cyan-400 h-full transition-all duration-700" style={{ width: `${scoreData.s_palm}%` }} />
            </div>
            <p className="text-[10px] text-slate-400">Derived from continuous skeleton line density & curvature metrics.</p>
          </div>

          {/* Factor 2: Archetypal Gravity */}
          <div className="pb-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center space-x-1.5 font-medium text-slate-200">
                <Layers className="w-3.5 h-3.5 text-purple-400" />
                <span>Archetypal Gravity (S_tarot)</span>
              </span>
              <div className="flex items-center space-x-1.5 font-mono">
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">25% Weight</span>
                <strong className="text-white">{scoreData.s_tarot}%</strong>
              </div>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-purple-400 h-full transition-all duration-700" style={{ width: `${scoreData.s_tarot}%` }} />
            </div>
            <p className="text-[10px] text-slate-400">Orientation balance (light vs shadow) & Major/Minor Arcana gravity.</p>
          </div>

          {/* Factor 3: Personality Alignment */}
          <div className="pb-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center space-x-1.5 font-medium text-slate-200">
                <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Personality Alignment (S_pers)</span>
              </span>
              <div className="flex items-center space-x-1.5 font-mono">
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">20% Weight</span>
                <strong className="text-white">{scoreData.s_pers}%</strong>
              </div>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-amber-400 h-full transition-all duration-700" style={{ width: `${scoreData.s_pers}%` }} />
            </div>
            <p className="text-[10px] text-slate-400">Archetype profile overlap across user spiritual interests & goals.</p>
          </div>

          {/* Factor 4: User Intention Resonance */}
          <div className="pb-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center space-x-1.5 font-medium text-slate-200">
                <Target className="w-3.5 h-3.5 text-emerald-400" />
                <span>Intention Resonance (S_ctx)</span>
              </span>
              <div className="flex items-center space-x-1.5 font-mono">
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">15% Weight</span>
                <strong className="text-white">{scoreData.s_ctx}%</strong>
              </div>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-400 h-full transition-all duration-700" style={{ width: `${scoreData.s_ctx}%` }} />
            </div>
            <p className="text-[10px] text-slate-400">Direct semantic alignment of reading intention with drawn arcana.</p>
          </div>

        </div>

        {/* Factor 5 Full width: Reading Consistency */}
        <div className="pb-4 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="flex items-center space-x-1.5 font-medium text-slate-200">
              <Scale className="w-3.5 h-3.5 text-rose-400" />
              <span>Karmic Consistency (S_cons)</span>
            </span>
            <div className="flex items-center space-x-1.5 font-mono">
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300">10% Weight</span>
              <strong className="text-white">{scoreData.s_cons}%</strong>
            </div>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-rose-400 h-full transition-all duration-700" style={{ width: `${scoreData.s_cons}%` }} />
          </div>
          <p className="text-[10px] text-slate-400">Algorithmic cross-reading semantic stability and harmonic resonance.</p>
        </div>

      </div>

    </div>
  );
};
