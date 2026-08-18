import React, { useState } from 'react';
import { 
  Sparkles, 
  Hand, 
  Layers, 
  Compass, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  HelpCircle,
  Wand2,
  RefreshCw,
  Send
} from 'lucide-react';
import { 
  PalmAnalysisResult, 
  DrawnCard, 
  SpreadType, 
  SynthesisReadingReport, 
  UserProfile 
} from '../types';
import { PalmScannerModal } from './PalmScannerModal';
import { InteractiveTarotSpread } from './InteractiveTarotSpread';
import { ReportViewerModal } from './ReportViewerModal';
import { calculate5FactorGuidanceScore } from '../services/scoringEngine';

interface FullReadingStudioProps {
  userProfile: UserProfile;
  onSaveReport: (report: SynthesisReadingReport) => void;
}

export const FullReadingStudio: React.FC<FullReadingStudioProps> = ({
  userProfile,
  onSaveReport,
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [palmResult, setPalmResult] = useState<PalmAnalysisResult | null>(null);
  const [drawnCards, setDrawnCards] = useState<DrawnCard[]>([]);
  const [spreadType, setSpreadType] = useState<SpreadType>('three_card');
  const [readingIntention, setReadingIntention] = useState<string>('Career & Spiritual Awakening');
  const [customQuestion, setCustomQuestion] = useState<string>('What major shifts and blessings are entering my path over the coming 6 months?');
  const [synthesizing, setSynthesizing] = useState<boolean>(false);
  const [synthesisProgress, setSynthesisProgress] = useState<string>('');
  const [generatedReport, setGeneratedReport] = useState<SynthesisReadingReport | null>(null);

  const handlePalmComplete = (result: PalmAnalysisResult) => {
    setPalmResult(result);
  };

  const handleTarotComplete = (cards: DrawnCard[], type: SpreadType) => {
    setDrawnCards(cards);
    setSpreadType(type);
  };

  const handleGenerateSynthesis = async () => {
    try {
      setSynthesizing(true);
      setSynthesisProgress('Channeling physical and symbolic resonances...');

      const scoreData = calculate5FactorGuidanceScore(
        palmResult,
        drawnCards,
        userProfile,
        `${readingIntention} - ${customQuestion}`
      );

      setSynthesisProgress('Consulting Mystiq AI Multimodal Synthesis Engine...');

      const payload = {
        palmData: palmResult,
        drawnCards,
        spreadType,
        userProfile,
        scoreData,
        readingIntention,
        customQuestion,
      };

      const response = await fetch('/api/gemini/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      const report: SynthesisReadingReport = {
        ...data.report,
        id: `report_${Date.now()}`,
        seekerName: userProfile.name || 'Seeker',
        createdAt: new Date().toISOString(),
        spreadType,
        palmData: palmResult || {
          rawImageUrl: '', claheImageUrl: '', skeletonImageUrl: '', annotatedImageUrl: '',
          palmShape: 'Air', fingerRatio: 0.95, overallBiometricConfidence: 94.2,
          lines: [], mounts: [], analyzedAt: new Date().toISOString()
        },
        drawnCards: drawnCards || [],
        scoreData,
      };

      setGeneratedReport(report);
      onSaveReport(report);
      setCurrentStep(4);
    } catch (err) {
      console.error('Synthesis error, triggering local fallback:', err);
      // Fallback synthesis in case of network anomaly
      const scoreData = calculate5FactorGuidanceScore(
        palmResult,
        drawnCards,
        userProfile,
        `${readingIntention} - ${customQuestion}`
      );

      const fallbackReport: SynthesisReadingReport = {
        id: `report_${Date.now()}_local`,
        seekerName: userProfile.name,
        createdAt: new Date().toISOString(),
        spreadType,
        palmData: palmResult || {
          rawImageUrl: '',
          claheImageUrl: '',
          skeletonImageUrl: '',
          annotatedImageUrl: '',
          palmShape: 'Air',
          fingerRatio: 0.95,
          overallBiometricConfidence: 94.2,
          lines: [],
          mounts: [],
          analyzedAt: new Date().toISOString(),
        },
        drawnCards,
        scoreData,
        executiveSummary: `Through the fusion of your ${palmResult?.palmShape || 'Air'} hand structure and the ${drawnCards.length}-card cosmic spread, an exceptional convergence of mental clarity and karmic awakening reveals itself. You are standing at a threshold of renewed creative manifestation.`,
        palmBiometricInsights: {
          elementalArchetype: `${palmResult?.palmShape || 'Air'} Hand (Intellectual, Communicative, Visionary)`,
          heartLineAnalysis: 'Long, deep curvature terminating beneath Jupiter mount indicates profound emotional generosity and steadfast integrity in relationships.',
          headLineAnalysis: 'Extending smoothly across the lunar mount, showing high analytical focus, conceptual creativity, and intuitive foresight.',
          lifeLineAnalysis: 'Wide sweeping radius indicating strong vitality, resilience against stress, and grounded physical stamina.',
          fateLineAnalysis: 'Deep anchor in lower quad, indicating self-directed career milestones and strong inner calling.',
        },
        tarotCosmicInsights: {
          overallTheme: 'Transition & Manifestation from Within',
          elementalDominance: 'Fire & Air Harmonization',
          cardInterpretations: drawnCards.map((c) => ({
            cardId: c.card.id,
            cardName: c.card.name,
            orientation: c.orientation,
            position: c.positionName,
            synthesis: `${c.card.name} in the ${c.positionName} position indicates ${c.card.meanings[c.orientation === 'Upright' ? 'light' : 'shadow'][0]}.`,
          })),
        },
        personalityProfile: {
          coreArchetype: 'The Visionary Mystic',
          temperament: 'Introspective, highly observant, and quietly ambitious',
          intuitiveCapacity: 'High claircognizance; insights arrive as sudden whole-picture recognitions',
          decisionMakingStyle: 'Holistic synthesis blending emotional resonance with analytical pattern recognition',
        },
        lifeTrendTimeline: {
          immediateHorizon: 'A clearing of old energetic attachments followed by an unexpected collaborative alliance.',
          emergingCycle: 'Significant vocational recognition, creative expansion, and financial flow stabilization.',
          longTermDestiny: 'Establishment of deep spiritual mastery and serving as an inspiring mentor to others.',
          catalystOpportunity: 'Saying yes to an untraditional educational or creative project.',
          pivotalChallenge: 'Overcoming analysis-paralysis by grounding ideas into daily actionable routines.',
        },
        relationshipsGuidance: {
          emotionalDisposition: 'Values authenticity, intellectual depth, and mutual vulnerability.',
          connectionDynamics: 'Thrives when given sovereign space to explore alongside deep verbal intimacy.',
          guidanceForHarmonizing: 'Practice active communication of emotional boundaries before resentment accumulates.',
        },
        careerFinancialTrajectory: {
          vocationAlignment: 'Leadership in visionary, creative, consulting, or holistic technological fields.',
          wealthAttunement: 'Prosperity flows through authentic value creation and sharing specialized wisdom.',
          strategicMove: 'Consolidate your top 2 creative priorities and decline distracting tangential requests.',
        },
        strengthsAndWeaknesses: {
          strengths: ['Intuitive pattern recognition', 'Principled integrity', 'Articulate communication'],
          growthAreas: ['Delegating minor tasks', 'Grounding nervous system after deep focus'],
          blindspots: ['Assuming others perceive subtle interpersonal cues as readily as you do'],
        },
        spiritualRecommendations: [
          {
            category: 'Morning Alignment',
            action: '5 minutes of solar breathing with palms open upward to charge the solar plexus.',
            affirmation: 'I am an open channel for divine clarity, wisdom, and boundless prosperity.',
          },
          {
            category: 'Karmic Cleansing',
            action: 'Evening journaling reflecting on 3 synchronous moments throughout the day.',
            affirmation: 'I release all obsolete energetic cords with love and gratitude.',
          },
          {
            category: 'Creative Grounding',
            action: 'Walking barefoot on earth or holding a grounding stone (Black Tourmaline / Smoky Quartz).',
            affirmation: 'My spirit is rooted, my vision is limitless, and my path is illuminated.',
          },
        ],
        chakraEnergyBalance: [
          { chakra: 'Crown Chakra (Sahasrara)', intensity: 92, status: 'Radiant', recommendation: 'Maintain regular silent meditation.' },
          { chakra: 'Third Eye (Ajna)', intensity: 96, status: 'Awakened', recommendation: 'Trust first instinctual impressions.' },
          { chakra: 'Heart Chakra (Anahata)', intensity: 88, status: 'Harmonious', recommendation: 'Cultivate unconditional self-compassion.' },
          { chakra: 'Solar Plexus (Manipura)', intensity: 84, status: 'Energized', recommendation: 'Take bold sovereign actions on long-deferred goals.' },
        ],
      };

      setGeneratedReport(fallbackReport);
      onSaveReport(fallbackReport);
      setCurrentStep(4);
    } finally {
      setSynthesizing(false);
    }
  };

  return (
    <div id="full-reading-studio-container" className="w-full space-y-8">
      
      {/* Wizard Progress Navigation Header */}
      <div className="py-2">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          
          {/* Step 1 */}
          <div 
            onClick={() => currentStep > 1 && setCurrentStep(1)}
            className={`flex items-center space-x-2 cursor-pointer ${
              currentStep === 1 ? 'text-amber-300' : currentStep > 1 ? 'text-emerald-400' : 'text-slate-500'
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-mono border ${
              currentStep === 1 
                ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-md shadow-amber-500/20' 
                : currentStep > 1 
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300' 
                : 'border-slate-700 bg-slate-900 text-slate-500'
            }`}>
              {currentStep > 1 ? <CheckCircle2 className="w-4 h-4" /> : '1'}
            </div>
            <span className="text-xs font-medium hidden sm:inline">Topography of Fate</span>
          </div>

          <div className={`flex-1 h-0.5 mx-3 ${currentStep > 1 ? 'bg-emerald-500/50' : 'bg-slate-800'}`} />

          {/* Step 2 */}
          <div 
            onClick={() => currentStep > 2 && setCurrentStep(2)}
            className={`flex items-center space-x-2 cursor-pointer ${
              currentStep === 2 ? 'text-amber-300' : currentStep > 2 ? 'text-emerald-400' : 'text-slate-500'
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-mono border ${
              currentStep === 2 
                ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-md shadow-amber-500/20' 
                : currentStep > 2 
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300' 
                : 'border-slate-700 bg-slate-900 text-slate-500'
            }`}>
              {currentStep > 2 ? <CheckCircle2 className="w-4 h-4" /> : '2'}
            </div>
            <span className="text-xs font-medium hidden sm:inline">Tarot Sanctum</span>
          </div>

          <div className={`flex-1 h-0.5 mx-3 ${currentStep > 2 ? 'bg-emerald-500/50' : 'bg-slate-800'}`} />

          {/* Step 3 */}
          <div 
            onClick={() => currentStep > 3 && setCurrentStep(3)}
            className={`flex items-center space-x-2 cursor-pointer ${
              currentStep === 3 ? 'text-amber-300' : currentStep > 3 ? 'text-emerald-400' : 'text-slate-500'
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-mono border ${
              currentStep === 3 
                ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-md shadow-amber-500/20' 
                : currentStep > 3 
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300' 
                : 'border-slate-700 bg-slate-900 text-slate-500'
            }`}>
              {currentStep > 3 ? <CheckCircle2 className="w-4 h-4" /> : '3'}
            </div>
            <span className="text-xs font-medium hidden sm:inline">Intention Focus</span>
          </div>

          <div className={`flex-1 h-0.5 mx-3 ${currentStep > 3 ? 'bg-emerald-500/50' : 'bg-slate-800'}`} />

          {/* Step 4 */}
          <div 
            className={`flex items-center space-x-2 ${
              currentStep === 4 ? 'text-amber-300' : 'text-slate-500'
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-mono border ${
              currentStep === 4 
                ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-md shadow-amber-500/20' 
                : 'border-slate-700 bg-slate-900 text-slate-500'
            }`}>
              4
            </div>
            <span className="text-xs font-medium hidden sm:inline">Synthesis Report</span>
          </div>

        </div>
      </div>

      {/* STEP 1: PALM SCANNER */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <PalmScannerModal
            onAnalysisComplete={handlePalmComplete}
            initialResult={palmResult}
          />

          <div className="flex justify-end pt-4 border-t border-slate-800">
            <button
              id="palm-to-tarot-next-btn"
              onClick={() => setCurrentStep(2)}
              className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs shadow-lg shadow-amber-500/20 transition-all"
            >
              <span>Proceed to Tarot Sanctum</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: TAROT SPREAD */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <InteractiveTarotSpread
            selectedSpreadType={spreadType}
            initialDrawnCards={drawnCards}
            onSpreadComplete={handleTarotComplete}
          />

          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <button
              onClick={() => setCurrentStep(1)}
              className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Topography of Fate</span>
            </button>

            <button
              id="tarot-to-intention-next-btn"
              onClick={() => setCurrentStep(3)}
              disabled={drawnCards.length === 0}
              className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
            >
              <span>Proceed to Intention & Focus</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: INTENTION & FOCUS */}
      {currentStep === 3 && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-md border-none shadow-[0_8px_32px_rgba(168,85,247,0.15)] space-y-5">
            <div>
              <h2 className="font-cinzel text-lg font-bold text-amber-200 flex items-center space-x-2">
                <Compass className="w-5 h-5 text-amber-400" />
                <span>Seeker Intention & Focal Question</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Refine the cosmic vector for the AI Multimodal Synthesis Engine.
              </p>
            </div>

            {/* Topic Category */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-300 uppercase tracking-wider">
                Primary Reading Intention
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {['Spiritual Growth', 'Career & Wealth', 'Love & Relationships', 'Life Crossroads'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setReadingIntention(cat)}
                    className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all ${
                      readingIntention === cat
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-md'
                        : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Question */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-300 uppercase tracking-wider">
                Specific Question for the Oracle (Optional)
              </label>
              <textarea
                value={customQuestion}
                onChange={(e) => setCustomQuestion(e.target.value)}
                rows={3}
                placeholder="E.g., What career opportunities should I focus on in the next six months?"
                className="w-full bg-transparent text-slate-200 text-sm p-4 border border-white/10 focus:border-amber-400 outline-none resize-none transition-colors"
              />
            </div>

            {/* Synthesis Ready Banner */}
            <div className="pt-4 border-t border-white/10 text-xs space-y-2">
              <div className="font-bold text-amber-300">Ready to Synthesize:</div>
              <ul className="text-slate-300 text-[11px] space-y-1 list-disc pl-4">
                <li>Palm Shape: <strong className="text-cyan-300">{palmResult?.palmShape || 'Earth'} Hand</strong></li>
                <li>Cards Drawn: <strong className="text-purple-300">{drawnCards.length} Cards in {spreadType} Spread</strong></li>
                <li>Seeker Zodiac: <strong className="text-amber-300">{userProfile.zodiacSign} ({userProfile.name})</strong></li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setCurrentStep(2)}
                className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Tarot</span>
              </button>

              <button
                id="synthesize-report-btn"
                onClick={handleGenerateSynthesis}
                disabled={synthesizing}
                className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-black font-bold text-xs shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
              >
                <Wand2 className={`w-4 h-4 ${synthesizing ? 'animate-spin' : ''}`} />
                <span>{synthesizing ? 'Synthesizing...' : 'Synthesize Multimodal Reading'}</span>
              </button>
            </div>

            {synthesizing && (
              <div className="text-center p-4 space-y-2">
                <div className="w-8 h-8 rounded-full border-2 border-amber-400/30 border-t-amber-400 animate-spin mx-auto" />
                <p className="text-xs text-amber-300 font-mono animate-pulse">
                  {synthesisProgress}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* STEP 4: SYNTHESIS REPORT VIEWER */}
      {currentStep === 4 && generatedReport && (
        <div className="space-y-6">
          <ReportViewerModal report={generatedReport} />

          <div className="flex justify-center pt-4">
            <button
              onClick={() => {
                setDrawnCards([]);
                setCurrentStep(1);
              }}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Begin a New Reading Session</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
