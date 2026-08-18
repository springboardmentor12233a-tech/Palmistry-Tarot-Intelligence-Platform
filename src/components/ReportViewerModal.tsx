import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Share2, 
  Printer, 
  Layers, 
  Hand, 
  UserCheck, 
  Compass, 
  Heart, 
  Briefcase, 
  Flame,
  Check,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { SynthesisReadingReport } from '../types';
import { generateMysticalPDFReport, exportReadingAsExcelCSV } from '../services/pdfReportGenerator';
import { getCardImageUrl } from '../utils/tarotImages';
import { GuidanceScoreCard } from './GuidanceScoreCard';

interface ReportViewerModalProps {
  report: SynthesisReadingReport;
  onClose?: () => void;
}

export const ReportViewerModal: React.FC<ReportViewerModalProps> = ({ report, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'palm' | 'tarot' | 'timeline' | 'career_love' | 'chakras'>('overview');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);

  // Web Speech API for voice reading
  const toggleSpeech = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const textToRead = `${report.executiveSummary}. Your core archetype is ${report.personalityProfile.coreArchetype}. In your immediate future: ${report.lifeTrendTimeline.immediateHorizon}`;
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      setExportingPDF(true);
      await generateMysticalPDFReport(report);
    } catch (err) {
      console.error('PDF export failed:', err);
    } finally {
      setExportingPDF(false);
    }
  };

  const handleCopyLink = () => {
    // We are generating a textual summary since this is a modal, not a sharable URL.
    const reportText = `Mystiq Synthesis Reading for ${report.seekerName}\n\n` + 
                       `Guidance Score: ${report.insightScoreBreakdown.final_score}/100\n\n` +
                       `Executive Summary:\n${report.executiveSummary}\n\n` + 
                       `Generated on: ${report.createdAt?.toDate ? report.createdAt.toDate().toLocaleDateString() : new Date(report.createdAt).toLocaleDateString()}`;
    
    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="mystical-report-viewer" className="w-full space-y-6">
      
      {/* Report Header Bar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40">
              SYNTHESIS REPORT
            </span>
            <span className="text-xs text-slate-400 font-mono">
              ID: {report.id ? report.id.substring(0, 12) : 'pending...'}
            </span>
          </div>
          <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-amber-200">
            Mystiq Reading for <span className="font-serif text-amber-300 text-3xl font-normal ml-1">{report.seekerName}</span>
          </h2>
          <p className="text-xs text-slate-400 flex items-center space-x-3">
            <span className="flex items-center space-x-1">
              <Calendar className="w-3 h-3 text-amber-400" />
              <span>{report.createdAt?.toDate ? report.createdAt.toDate().toLocaleDateString() : new Date(report.createdAt).toLocaleDateString()}</span>
            </span>
            <span>•</span>
            <span className="text-purple-300 capitalize">{(report.tarotSpread?.spreadType || report.spreadType || 'past_present_future').replace('_', ' ')} Spread</span>
            <span>•</span>
            <span className="text-cyan-300">{report.palmData?.palmShape || (report as any).palmReading?.palmShape || 'Unknown'} Hand</span>
          </p>
        </div>

        {/* Action Buttons: PDF, CSV, Audio, Share */}
        <div className="flex flex-wrap items-center gap-2">
          
          <button
            id="read-aloud-btn"
            onClick={toggleSpeech}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
              isSpeaking
                ? 'bg-purple-600 text-white border-purple-400 animate-pulse'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-200 border-slate-700'
            }`}
          >
            {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-purple-400" />}
            <span>{isSpeaking ? 'Stop Voice' : 'Spoken Oracle'}</span>
          </button>

          <button
            id="download-pdf-btn"
            onClick={handleDownloadPDF}
            disabled={exportingPDF}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-xs font-bold shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{exportingPDF ? 'Generating...' : 'Export High-Res PDF'}</span>
          </button>

          <button
            id="export-csv-btn"
            onClick={() => exportReadingAsExcelCSV(report)}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 text-xs font-medium border border-slate-700"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            <span>Excel / CSV</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex overflow-x-auto space-x-2 border-b border-slate-800/80 pb-2 scrollbar-thin">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
            activeTab === 'overview'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Executive Summary & Score</span>
        </button>

        <button
          onClick={() => setActiveTab('palm')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
            activeTab === 'palm'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Hand className="w-3.5 h-3.5 text-cyan-400" />
          <span>Topography of Fate</span>
        </button>

        <button
          onClick={() => setActiveTab('tarot')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
            activeTab === 'tarot'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-purple-400" />
          <span>Tarot Spread Arcana</span>
        </button>

        <button
          onClick={() => setActiveTab('timeline')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
            activeTab === 'timeline'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Compass className="w-3.5 h-3.5 text-emerald-400" />
          <span>Life Timeline & Personality</span>
        </button>

        <button
          onClick={() => setActiveTab('career_love')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
            activeTab === 'career_love'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Heart className="w-3.5 h-3.5 text-rose-400" />
          <span>Love & Vocation Trajectory</span>
        </button>

        <button
          onClick={() => setActiveTab('chakras')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
            activeTab === 'chakras'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-amber-400" />
          <span>Chakra Energy & Rituals</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW & SCORING */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {report.scoreData && <GuidanceScoreCard scoreData={report.scoreData} />}

          {/* Executive Summary Card */}
          <div className="pb-8 border-b border-white/10 space-y-4">
            <h3 className="font-cinzel text-base font-bold text-amber-200 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>The Oracle's Synthesis</span>
            </h3>
            <p className="text-sm text-slate-200 leading-relaxed font-sans">
              {report.executiveSummary || (report as any).synthesis?.executiveSummary || 'No summary available.'}
            </p>

            {/* Core Personality Highlight */}
            {report.personalityProfile && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="pb-4">
                  <span className="text-[10px] font-mono uppercase text-amber-400 block mb-1">Core Archetype</span>
                  <strong className="text-sm text-white font-cinzel">{report.personalityProfile.coreArchetype}</strong>
                </div>
                <div className="pb-4">
                  <span className="text-[10px] font-mono uppercase text-cyan-400 block mb-1">Intuitive Capacity</span>
                  <p className="text-xs text-slate-200">{report.personalityProfile.intuitiveCapacity}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: TOPOGRAPHY OF FATE */}
      {activeTab === 'palm' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Visual Scan Image */}
            <div className="lg:col-span-5 space-y-3">
              <div className="space-y-4 pb-6">
                <h4 className="text-xs font-mono text-amber-300 mb-2">THE PALM CANVAS</h4>
                <div className="aspect-square rounded-xl overflow-hidden border border-slate-800">
                  <img 
                    src={report.palmData?.annotatedImageUrl || report.palmData?.rawImageUrl || 'https://images.unsplash.com/photo-1544603954-c9b2d354b02b?auto=format&fit=crop&q=80'} 
                    alt="Topography of Fate"
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div className="mt-3 text-xs text-slate-400">
                  <strong>Elemental Shape:</strong> {report.palmBiometricInsights?.elementalArchetype || 'Synthesizing...'}
                </div>
              </div>
            </div>

            {/* Line-by-Line In-Depth Analysis */}
            <div className="lg:col-span-7 space-y-3">
              
              <div className="pb-4 border-b border-cyan-500/20 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-cyan-300 font-cinzel">Heart Line Analysis</span>
                  <span className="font-mono text-[10px] text-slate-400">Primary Emotion Axis</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {report.palmBiometricInsights?.heartLineAnalysis || 'No heart line analysis recorded.'}
                </p>
              </div>

              <div className="pb-4 border-b border-amber-500/20 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-amber-300 font-cinzel">Head Line Analysis</span>
                  <span className="font-mono text-[10px] text-slate-400">Cognitive Framework</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {report.palmBiometricInsights?.headLineAnalysis || 'No head line analysis recorded.'}
                </p>
              </div>

              <div className="pb-4 border-b border-rose-500/20 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-rose-300 font-cinzel">Life Line Analysis</span>
                  <span className="font-mono text-[10px] text-slate-400">Vitality Index</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {report.palmBiometricInsights?.lifeLineAnalysis || 'No life line analysis recorded.'}
                </p>
              </div>

              <div className="pb-4 border-b border-purple-500/20 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-purple-300 font-cinzel">Fate & Karmic Destiny Line</span>
                  <span className="font-mono text-[10px] text-slate-400">Destiny Trajectory</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {report.palmBiometricInsights?.fateLineAnalysis || 'No fate line analysis recorded.'}
                </p>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* TAB 3: TAROT ARCANA */}
      {activeTab === 'tarot' && (
        <div className="space-y-6">
          <div className="pb-6 border-b border-amber-500/20 space-y-4">
            <h3 className="font-cinzel text-sm font-bold text-amber-200">
              Cosmic Tarot Theme: {report.tarotCosmicInsights?.overallTheme || 'Legacy Tarot Sequence'}
            </h3>
            <p className="text-xs text-slate-300">
              Elemental Dominance: <strong className="text-amber-300">{report.tarotCosmicInsights?.elementalDominance || 'Unknown'}</strong>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(report.drawnCards || []).map((dc, idx) => {
              const interp = report.tarotCosmicInsights?.cardInterpretations?.[idx]?.synthesis || dc.card.meanings[dc.orientation === 'Upright' ? 'light' : 'shadow'][0];

              return (
                <div 
                  key={idx}
                  className="pb-6 border-b border-white/10 flex gap-6 items-start"
                >
                  <div className="w-20 h-32 rounded-xl border border-amber-500/40 bg-[#0c0d18] flex flex-col justify-between overflow-hidden flex-shrink-0 text-center shadow-[0_0_15px_rgba(245,158,11,0.2)] relative">
                    <img 
                      src={getCardImageUrl(dc.card)} 
                      alt={dc.card.name}
                      className={`w-full h-full object-cover opacity-90 ${dc.orientation === 'Reversed' ? 'rotate-180' : ''}`}
                      crossOrigin="anonymous"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute top-1 left-1 bg-black/70 px-1 py-0.5 rounded text-[8px] font-mono text-amber-300 border border-amber-500/30">#{dc.card.number}</span>
                  </div>

                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-amber-400 uppercase">
                        [{dc.positionName}]
                      </span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        dc.orientation === 'Upright' ? 'bg-amber-500/20 text-amber-300' : 'bg-purple-500/20 text-purple-300'
                      }`}>
                        {dc.orientation}
                      </span>
                    </div>

                    <h4 className="font-cinzel text-sm font-bold text-white">
                      {dc.card.name}
                    </h4>

                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {interp}
                    </p>

                    <div className="text-[10px] text-slate-400 font-mono pt-1">
                      Keywords: {dc.card.keywords.slice(0, 3).join(', ')}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: TIMELINE & PERSONALITY */}
      {activeTab === 'timeline' && (
        <div className="space-y-6">
          <div className="pb-8 space-y-4">
            <h3 className="font-cinzel text-base font-bold text-amber-200">
              Evolutionary Life Timeline & Trend Forecast
            </h3>

            <div className="space-y-4 border-l-2 border-amber-500/30 pl-4 ml-2">
              
              <div className="relative space-y-1">
                <div className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-cyan-400 ring-4 ring-cyan-400/20" />
                <h4 className="text-xs font-bold text-cyan-300 font-mono uppercase">Immediate Horizon (1-3 Months)</h4>
                <p className="text-xs text-slate-200 leading-relaxed">{report.lifeTrendTimeline?.immediateHorizon || 'N/A'}</p>
              </div>

              <div className="relative space-y-1 pt-2">
                <div className="absolute -left-[23px] top-3 w-3 h-3 rounded-full bg-amber-400 ring-4 ring-amber-400/20" />
                <h4 className="text-xs font-bold text-amber-300 font-mono uppercase">Emerging Cycle (6-12 Months)</h4>
                <p className="text-xs text-slate-200 leading-relaxed">{report.lifeTrendTimeline?.emergingCycle || 'N/A'}</p>
              </div>

              <div className="relative space-y-1 pt-2">
                <div className="absolute -left-[23px] top-3 w-3 h-3 rounded-full bg-purple-400 ring-4 ring-purple-400/20" />
                <h4 className="text-xs font-bold text-purple-300 font-mono uppercase">Long-Term Destiny Milestone (2-5 Years)</h4>
                <p className="text-xs text-slate-200 leading-relaxed">{report.lifeTrendTimeline?.longTermDestiny || 'N/A'}</p>
              </div>

            </div>

            {/* Catalyst & Challenges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-slate-800">
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                <h5 className="text-xs font-bold text-emerald-300 mb-1">Catalyst Opportunity</h5>
                <p className="text-xs text-slate-200">{report.lifeTrendTimeline?.catalystOpportunity || 'N/A'}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30">
                <h5 className="text-xs font-bold text-rose-300 mb-1">Pivotal Challenge to Transcend</h5>
                <p className="text-xs text-slate-200">{report.lifeTrendTimeline?.pivotalChallenge || 'N/A'}</p>
              </div>
            </div>

          </div>

          {/* Strengths & Growth Areas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="pb-6 space-y-3">
              <h5 className="text-xs font-bold text-emerald-300 uppercase font-mono">Innate Strengths</h5>
              <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-4">
                {report.strengthsAndWeaknesses?.strengths?.map((s, i) => (
                  <li key={i}>{s}</li>
                )) || <li>No strengths listed.</li>}
              </ul>
            </div>

            <div className="pb-6 space-y-3">
              <h5 className="text-xs font-bold text-amber-300 uppercase font-mono">Growth Areas</h5>
              <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-4">
                {report.strengthsAndWeaknesses?.growthAreas?.map((g, i) => (
                  <li key={i}>{g}</li>
                )) || <li>No growth areas listed.</li>}
              </ul>
            </div>

            <div className="pb-6 space-y-3">
              <h5 className="text-xs font-bold text-purple-300 uppercase font-mono">Unconscious Blindspots</h5>
              <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-4">
                {report.strengthsAndWeaknesses?.blindspots?.map((b, i) => (
                  <li key={i}>{b}</li>
                )) || <li>No blindspots listed.</li>}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: CAREER & LOVE */}
      {activeTab === 'career_love' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Love & Relationships */}
          <div className="pb-8 space-y-4">
            <h3 className="font-cinzel text-base font-bold text-rose-200 flex items-center space-x-2">
              <Heart className="w-4 h-4 text-rose-400" />
              <span>Relationships & Emotional Dynamics</span>
            </h3>

            <div className="space-y-3 text-xs text-slate-200">
              <div>
                <strong className="text-rose-300 block mb-0.5">Emotional Disposition:</strong>
                <p className="leading-relaxed">{report.relationshipsGuidance?.emotionalDisposition || 'N/A'}</p>
              </div>

              <div>
                <strong className="text-rose-300 block mb-0.5">Connection Dynamics:</strong>
                <p className="leading-relaxed">{report.relationshipsGuidance?.connectionDynamics || 'N/A'}</p>
              </div>

              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <strong className="text-rose-200 block mb-1">Harmonization Key:</strong>
                <p className="italic text-rose-100">{report.relationshipsGuidance?.guidanceForHarmonizing || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Vocation & Prosperity */}
          <div className="pb-8 space-y-4">
            <h3 className="font-cinzel text-base font-bold text-amber-200 flex items-center space-x-2">
              <Briefcase className="w-4 h-4 text-amber-400" />
              <span>Vocation, Prosperity & Destiny Strategy</span>
            </h3>

            <div className="space-y-3 text-xs text-slate-200">
              <div>
                <strong className="text-amber-300 block mb-0.5">Vocation Alignment:</strong>
                <p className="leading-relaxed">{report.careerFinancialTrajectory?.vocationAlignment || 'N/A'}</p>
              </div>

              <div>
                <strong className="text-amber-300 block mb-0.5">Wealth Attunement:</strong>
                <p className="leading-relaxed">{report.careerFinancialTrajectory?.wealthAttunement || 'N/A'}</p>
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <strong className="text-amber-200 block mb-1">Immediate Strategic Move:</strong>
                <p className="font-medium text-amber-100">{report.careerFinancialTrajectory?.strategicMove || 'N/A'}</p>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB 6: CHAKRAS & RITUALS */}
      {activeTab === 'chakras' && (
        <div className="space-y-6">
          
          {/* Daily Rituals & Affirmations */}
          <div className="pb-8 space-y-4">
            <h3 className="font-cinzel text-base font-bold text-amber-200">
              Daily Empowering Rituals & Affirmations
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(report.spiritualRecommendations || (report as any).synthesis?.spiritualRecommendations || []).map((rec, i) => (
                <div key={i} className="pb-6 border-b border-white/5 space-y-3">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 inline-block">
                    {rec.category}
                  </span>
                  <p className="text-xs text-slate-200">{rec.action}</p>
                  <div className="pt-2 border-t border-slate-800 text-[11px] text-emerald-300 italic">
                    "{rec.affirmation}"
                  </div>
                </div>
              ))}
              {(!(report.spiritualRecommendations || (report as any).synthesis?.spiritualRecommendations) || (report.spiritualRecommendations || (report as any).synthesis?.spiritualRecommendations).length === 0) && (
                <p className="text-xs text-slate-400">No rituals recorded for this session.</p>
              )}
            </div>
          </div>

          {/* Chakra Balances */}
          <div className="pb-8 space-y-4">
            <h3 className="font-cinzel text-base font-bold text-amber-200">
              7-Chakra Energy Alignment Analysis
            </h3>

            <div className="space-y-3">
              {(report.chakraEnergyBalance || []).map((ch, i) => (
                <div key={i} className="pb-4 border-b border-white/5 text-xs space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-100">{ch.chakra}</span>
                    <span className="font-mono text-amber-300">{ch.status} ({ch.intensity}%)</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-500 to-amber-400 h-full" style={{ width: `${ch.intensity}%` }} />
                  </div>
                  <p className="text-[11px] text-slate-400">{ch.recommendation}</p>
                </div>
              ))}
              {(!report.chakraEnergyBalance || report.chakraEnergyBalance.length === 0) && (
                <p className="text-xs text-slate-400">No chakra alignment details available.</p>
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
