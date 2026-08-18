import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  Eye, 
  Layers, 
  CheckCircle2, 
  RefreshCw, 
  Hand, 
  Activity, 
  HelpCircle,
  Sliders,
  ShieldCheck
} from 'lucide-react';
import { PalmAnalysisResult, PalmLineMetrics } from '../types';
import { analyzePalmImage } from '../services/palmVisionEngine';

interface PalmScannerModalProps {
  onAnalysisComplete: (result: PalmAnalysisResult) => void;
  initialResult?: PalmAnalysisResult | null;
  readOnly?: boolean;
}

export const PalmScannerModal: React.FC<PalmScannerModalProps> = ({
  onAnalysisComplete,
  initialResult,
  readOnly = false,
}) => {
  const [activeMode, setActiveMode] = useState<'upload' | 'camera'>('upload');
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [analysisProgress, setAnalysisProgress] = useState<{ stage: string; percent: number }>({
    stage: 'Idle',
    percent: 0,
  });
  const [analysisResult, setAnalysisResult] = useState<PalmAnalysisResult | null>(initialResult || null);
  const [activeFilterView, setActiveFilterView] = useState<'hud' | 'skeleton' | 'clahe' | 'raw'>('hud');
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [cameraActive, setCameraActive] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const runAnalysisOnSource = async (source: string | HTMLCanvasElement) => {
    try {
      setAnalyzing(true);
      const result = await analyzePalmImage(source, (stage, percent) => {
        setAnalysisProgress({ stage, percent });
      });
      setAnalysisResult(result);
      onAnalysisComplete(result);
    } catch (err) {
      console.error('Palm analysis error:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        runAnalysisOnSource(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Camera handling
  const startCamera = async () => {
    try {
      setCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: 'user' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const captureCameraSnapshot = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(videoRef.current, 0, 0, 512, 512);
    stopCamera();
    runAnalysisOnSource(canvas);
  };

  return (
    <div id="palm-biometrics-studio" className="w-full space-y-6">
      
      {/* Studio Header & Mode Switcher */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-5 rounded-2xl bg-white/5 backdrop-blur-md border-none shadow-[0_8px_32px_rgba(168,85,247,0.15)]">
        <div>
          <div className="flex items-center space-x-2">
            <Hand className="w-5 h-5 text-cyan-400" />
            <h2 className="font-cinzel text-2xl font-bold text-amber-200">
              Palm Analysis Engine
            </h2>
          </div>
          <p className="font-serif text-amber-300/80 text-base mt-1 max-w-2xl">
            Extracts major lines, computes Prominence Scores, and classifies palm elemental archetype.
          </p>
        </div>

        {/* Input Switcher */}
        {!readOnly && (
          <div className="flex items-center space-x-2 bg-black/40 p-1.5 rounded-xl border border-white/5">
            <button
              onClick={() => {
                setActiveMode('upload');
                stopCamera();
                fileInputRef.current?.click();
              }}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeMode === 'upload'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Upload className="w-3 h-3" />
              <span>Upload Photo</span>
            </button>
            <button
              onClick={() => {
                setActiveMode('camera');
                startCamera();
              }}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeMode === 'camera'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Camera className="w-3 h-3" />
              <span>Live Scanner</span>
            </button>
          </div>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
      />

      {/* LIVE CAMERA CAPTURE VIEW */}
      {activeMode === 'camera' && cameraActive && (
        <div className="relative rounded-2xl overflow-hidden border-2 border-cyan-500/50 bg-black aspect-video max-w-xl mx-auto flex items-center justify-center">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          {/* Hand alignment frame guide */}
          <div className="absolute inset-0 border-4 border-dashed border-cyan-400/40 rounded-2xl m-8 flex items-center justify-center pointer-events-none">
            <div className="text-center bg-black/70 px-4 py-2 rounded-xl backdrop-blur-sm border border-cyan-500/30">
              <Hand className="w-8 h-8 text-cyan-400 mx-auto animate-pulse mb-1" />
              <span className="text-xs font-mono text-cyan-200">Align open palm inside frame</span>
            </div>
          </div>

          <div className="absolute bottom-4 inset-x-0 flex justify-center space-x-3">
            <button
              onClick={captureCameraSnapshot}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-xs flex items-center space-x-2 shadow-lg shadow-cyan-500/30"
            >
              <Camera className="w-4 h-4" />
              <span>Capture & Extract Lines</span>
            </button>
            <button
              onClick={stopCamera}
              className="px-4 py-2.5 rounded-xl bg-slate-800/90 text-slate-300 text-xs font-medium border border-slate-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* MAIN DIAGNOSTIC WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Interactive Multi-View Canvas Display */}
        <div className="lg:col-span-6 space-y-3">
          <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-md border-none shadow-[0_8px_32px_rgba(168,85,247,0.15)] space-y-3">
            
            {/* View Mode Filters */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-serif text-amber-300 flex items-center space-x-1.5">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span>The Palm Canvas</span>
              </span>

              <div className="flex space-x-1 bg-black/40 p-1 rounded-lg border border-white/5 text-[11px]">
                <button
                  onClick={() => setActiveFilterView('hud')}
                  className={`px-2.5 py-1 rounded font-medium transition-all ${
                    activeFilterView === 'hud' ? 'bg-amber-500/20 text-amber-300 border-none' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  HUD Overlay
                </button>
                {showAdvanced && (
                  <>
                    <button
                      onClick={() => setActiveFilterView('skeleton')}
                      className={`px-2.5 py-1 rounded font-medium transition-all ${
                        activeFilterView === 'skeleton' ? 'bg-purple-500/20 text-purple-300 border-none' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Line Isolation
                    </button>
                    <button
                      onClick={() => setActiveFilterView('clahe')}
                      className={`px-2.5 py-1 rounded font-medium transition-all ${
                        activeFilterView === 'clahe' ? 'bg-blue-500/20 text-blue-300 border-none' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Depth Enhancement
                    </button>
                  </>
                )}
                <button
                  onClick={() => setActiveFilterView('raw')}
                  className={`px-2.5 py-1 rounded font-medium transition-all ${
                    activeFilterView === 'raw' ? 'bg-slate-700/50 text-slate-200 border-none' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Raw View
                </button>
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className={`px-2 py-1 ml-1 rounded font-medium transition-all ${
                    showAdvanced ? 'bg-indigo-500/20 text-indigo-300 border-none' : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Advanced Metrics"
                >
                  <Sliders className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Canvas Viewport Frame */}
            <div className="relative aspect-square rounded-xl overflow-hidden border border-white/10 bg-black/40 flex items-center justify-center">
              {analyzing ? (
                <div className="text-center p-6 space-y-3">
                  <div className="w-12 h-12 rounded-full border-4 border-amber-400/30 border-t-amber-400 animate-spin mx-auto" />
                  <div className="text-xs font-bold text-amber-300 font-cinzel">
                    {analysisProgress.stage}
                  </div>
                  <div className="w-48 bg-slate-800 h-1.5 rounded-full overflow-hidden mx-auto">
                    <div 
                      className="bg-gradient-to-r from-amber-500 to-cyan-400 h-full transition-all duration-300"
                      style={{ width: `${analysisProgress.percent}%` }}
                    />
                  </div>
                </div>
              ) : analysisResult ? (
                <img
                  src={
                    activeFilterView === 'hud'
                      ? analysisResult.annotatedImageUrl
                      : activeFilterView === 'skeleton'
                      ? analysisResult.skeletonImageUrl
                      : activeFilterView === 'clahe'
                      ? analysisResult.claheImageUrl
                      : analysisResult.rawImageUrl
                  }
                  alt="Palm Analysis Viewport"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center text-slate-500 p-6">
                  <Hand className="w-12 h-12 mx-auto mb-2 opacity-40" />
                  <p className="text-xs">No palm scan loaded. Choose a sample or upload.</p>
                </div>
              )}

              {/* Viewport Corner Reticles */}
              <div className="absolute top-2 left-2 text-[9px] font-mono text-cyan-400/70 bg-black/60 px-1.5 py-0.5 rounded border border-cyan-500/20 pointer-events-none">
                RECTIFIED: 512×512
              </div>
              <div className="absolute bottom-2 right-2 text-[9px] font-mono text-emerald-400/80 bg-black/60 px-1.5 py-0.5 rounded border border-emerald-500/20 pointer-events-none">
                CONFIDENCE: {analysisResult?.overallBiometricConfidence || 94.8}%
              </div>
            </div>

            {/* Quick Status Bar */}
            {analysisResult && (
              <div className="pb-2 border-b border-white/5 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="font-medium text-slate-200">
                    Archetype: <strong className="text-amber-300">{analysisResult.palmShape} Hand</strong>
                  </span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  Finger Ratio: {analysisResult.fingerRatio}
                </span>
              </div>
            )}

          </div>
        </div>

        {/* Right: Quantitative Line Metrics & Mounts Breakdown */}
        <div className="lg:col-span-6 space-y-4">
          
          {/* Quantitative Palm Line Metrics Table (Milestone 2 & 3 deliverable specification) */}
          <div className="p-5 rounded-2xl bg-white/5 backdrop-blur-md border-none shadow-[0_8px_32px_rgba(168,85,247,0.15)] space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-cinzel text-sm font-bold text-amber-200 flex items-center space-x-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>Line Resonance Analysis</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-400">
                4 Primary Classified Lines
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                    <th className="py-2 px-2 font-medium">Palm Line Identifier</th>
                    <th className="py-2 px-2 font-medium">Length Ratio</th>
                    <th className="py-2 px-2 font-medium">Curvature Index</th>
                    <th className="py-2 px-2 font-medium">Prominence</th>
                    <th className="py-2 px-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {analysisResult?.lines.map((line) => (
                    <tr key={line.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-2.5 px-2 font-bold text-slate-200 flex items-center space-x-2">
                        <span 
                          className="w-2.5 h-2.5 rounded-full inline-block" 
                          style={{ backgroundColor: line.color }}
                        />
                        <span>{line.displayName}</span>
                      </td>
                      <td className="py-2.5 px-2 font-mono text-slate-300">{line.lengthRatio}</td>
                      <td className="py-2.5 px-2 font-mono text-slate-300">{line.curvatureIndex}</td>
                      <td className="py-2.5 px-2 font-mono text-slate-300">{line.prominenceScore}</td>
                      <td className="py-2.5 px-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                          line.status === 'Prominent'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : line.status === 'Detected'
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {line.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Line Significance Cards */}
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              {analysisResult?.lines.slice(0, 3).map((line) => (
                <div key={line.id} className="pb-3 border-b border-white/5 text-xs">
                  <div className="flex justify-between font-medium text-amber-300 mb-0.5">
                    <span>{line.displayName} Alignment:</span>
                    <span className="text-[10px] font-mono text-slate-400">Curv: {line.curvatureIndex}</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {line.significance}
                  </p>
                </div>
              ))}
            </div>

          </div>

          {/* Mounts & Elemental Classification */}
          {analysisResult && (
            <div className="p-5 rounded-2xl bg-white/5 backdrop-blur-md border-none shadow-[0_8px_32px_rgba(168,85,247,0.15)] space-y-3">
              <h3 className="font-cinzel text-sm font-bold text-amber-200 flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>Palmar Mounts & Planetary Archetypes</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {analysisResult.mounts.map((mount, i) => (
                  <div key={i} className="pb-3 border-b border-white/5 text-xs space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-200 truncate">{mount.name}</span>
                      <span className="text-[9px] font-mono text-amber-400">{mount.elevation}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 line-clamp-2">{mount.energy}</p>
                    <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                      <div className="bg-amber-400 h-full" style={{ width: `${mount.score}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
