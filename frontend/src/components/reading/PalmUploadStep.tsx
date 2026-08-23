'use client';

import React, { useState, useRef } from 'react';
import { PalmAnalysisResult } from '@/types';
import { PALM_PRESETS } from '@/lib/constants';
import { api } from '@/lib/api';
import GlassCard from '@/components/ui/GlassCard';
import GoldButton from '@/components/ui/GoldButton';
import VioletButton from '@/components/ui/VioletButton';
import Eyebrow from '@/components/ui/Eyebrow';
import {
  Upload,
  Camera,
  Sparkles,
  CheckCircle2,
  Scan,
  RefreshCw,
  Hand,
  Layers,
  Activity,
  Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PalmUploadStepProps {
  onComplete: (palmResult: PalmAnalysisResult) => void;
  initialResult?: PalmAnalysisResult | null;
}

export default function PalmUploadStep({
  onComplete,
  initialResult,
}: PalmUploadStepProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(
    initialResult?.image_url || null
  );
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [scanStepLabel, setScanStepLabel] = useState<string>('');
  const [analyzedResult, setAnalyzedResult] = useState<PalmAnalysisResult | null>(
    initialResult || null
  );
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (JPG, PNG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      setSelectedImage(url);
      runPalmScan(url, file);
    };
    reader.readAsDataURL(file);
  };

  const handlePresetSelect = (preset: (typeof PALM_PRESETS)[0]) => {
    setSelectedImage(preset.image_url);
    runPalmScan(preset.image_url);
  };

  const runPalmScan = async (imageUrl: string, rawFile?: File) => {
    setIsScanning(true);
    setScanProgress(10);
    setScanStepLabel('Initializing Computer Vision neural grid...');

    try {
      // Animated scanning steps
      setTimeout(() => {
        setScanProgress(35);
        setScanStepLabel('Isolating palm contours & flexion creases...');
      }, 500);

      setTimeout(() => {
        setScanProgress(65);
        setScanStepLabel('Calculating biometric depth of Heart, Head & Life lines...');
      }, 1100);

      setTimeout(() => {
        setScanProgress(85);
        setScanStepLabel('Evaluating Jupiter, Venus & Luna mount prominences...');
      }, 1600);

      const formData = new FormData();
      if (rawFile) {
        formData.append('file', rawFile);
        formData.append('image', rawFile);
      } else if (imageUrl) {
        formData.append('image_url', imageUrl);
        if (imageUrl.startsWith('data:')) {
          try {
            const res = await fetch(imageUrl);
            const blob = await res.blob();
            formData.append('file', blob, 'palm_preset.png');
            formData.append('image', blob, 'palm_preset.png');
          } catch {
            // fallback
          }
        }
      }

      const result = await api.analyzePalm(formData);

      setTimeout(() => {
        setScanProgress(100);
        setScanStepLabel('Biometric palm synthesis complete');
        setAnalyzedResult(result);
        setIsScanning(false);
      }, 2100);
    } catch (err: any) {
      setIsScanning(false);
      alert(err?.message || 'Palm scan failed. Please check backend connection.');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      {/* Step Header */}
      <div className="text-center space-y-3">
        <Eyebrow variant="gold">STEP 1 · PALM BIOMETRIC CARTOGRAPHY</Eyebrow>
        <h2 className="font-display text-3xl sm:text-4xl text-cosmic-text font-bold">
          Upload or Select Palm Archetype
        </h2>
        <p className="text-cosmic-muted text-sm sm:text-base max-w-2xl mx-auto">
          Our Computer Vision model segments flexion creases, depth vectors, and planetary mounts to
          quantify your innate energetic constitution.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Col: Upload & Scanning Portal */}
        <div className="lg:col-span-7 space-y-6">
          <GlassCard variant="default" className="p-6 relative overflow-hidden">
            {/* Drag & Drop Frame */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => !isScanning && fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all cursor-pointer min-h-[320px] flex flex-col items-center justify-center ${
                isDragging
                  ? 'border-gold bg-gold/10'
                  : selectedImage
                  ? 'border-gold/30 bg-midnight-deep/70'
                  : 'border-violet/40 hover:border-gold/60 bg-indigo-panel/40'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              />

              {selectedImage ? (
                <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden shadow-2xl border border-gold/30">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedImage}
                    alt="Palm Scan Preview"
                    className="w-full h-full object-cover"
                  />

                  {/* Scanning Animation Laser Overlay */}
                  {isScanning && (
                    <div className="absolute inset-0 bg-violet/20 pointer-events-none">
                      {/* Laser Bar */}
                      <div className="absolute left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-gold-bright to-transparent shadow-[0_0_15px_#FDE047] animate-laser-sweep" />

                      {/* Bio-grid mesh */}
                      <div
                        className="absolute inset-0 opacity-30"
                        style={{
                          backgroundImage:
                            'radial-gradient(rgba(212, 175, 55, 0.6) 1px, transparent 1px)',
                          backgroundSize: '20px 20px',
                        }}
                      />

                      {/* Scanning HUD Text */}
                      <div className="absolute bottom-4 left-4 right-4 bg-midnight-deep/90 border border-gold/40 rounded-xl p-3 backdrop-blur-md">
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="text-gold-light font-mono font-bold flex items-center gap-1.5">
                            <Scan className="w-4 h-4 animate-spin text-gold" />
                            {scanStepLabel}
                          </span>
                          <span className="text-gold font-mono">{scanProgress}%</span>
                        </div>
                        <div className="w-full bg-midnight-surface h-1.5 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-violet via-gold to-gold-bright rounded-full"
                            style={{ width: `${scanProgress}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Completed Scan Overlay Badge */}
                  {!isScanning && analyzedResult && (
                    <div className="absolute top-3 right-3 bg-midnight-elevated/90 backdrop-blur-md border border-gold/60 text-gold-bright text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-gold-glow">
                      <CheckCircle2 className="w-4 h-4 text-gold-bright" />
                      <span className="font-semibold">Biometrics Synthesized</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-16 h-16 rounded-full bg-violet-deep/50 border border-violet/50 flex items-center justify-center mx-auto text-gold-light shadow-violet-glow">
                    <Hand className="w-8 h-8 text-gold-light" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-base font-semibold text-cosmic-text">
                      Drag & Drop your palm photograph
                    </p>
                    <p className="text-xs text-cosmic-muted">
                      Open palm facing camera in clean, well-lit conditions · JPG, PNG, WebP
                    </p>
                  </div>
                  <GoldButton
                    size="sm"
                    variant="outline"
                    leftIcon={<Upload className="w-4 h-4" />}
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                  >
                    Browse Files
                  </GoldButton>
                </div>
              )}
            </div>

            {/* Quick Actions Under Image */}
            <div className="mt-4 flex items-center justify-between text-xs text-cosmic-muted">
              <span>Supports right or left palm</span>
              {selectedImage && !isScanning && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-gold hover:text-gold-bright flex items-center gap-1 font-medium transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Choose Different Photo</span>
                </button>
              )}
            </div>
          </GlassCard>

          {/* Preset Palms for Instant Testing */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-gold-light font-display">
                Or Select a Calibrated Preset Archetype:
              </span>
              <span className="text-[11px] text-cosmic-subtle">Instant CV Evaluation</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {PALM_PRESETS.map((preset) => {
                const isCurrent = selectedImage === preset.image_url;
                return (
                  <button
                    key={preset.id}
                    onClick={() => handlePresetSelect(preset)}
                    disabled={isScanning}
                    className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden group ${
                      isCurrent
                        ? 'border-gold bg-gold/15 shadow-gold-glow'
                        : 'border-indigo-border bg-indigo-panel/40 hover:border-violet/60 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="w-3.5 h-3.5 text-gold" />
                      <span className="text-xs font-bold text-cosmic-text group-hover:text-gold-light transition-colors">
                        {preset.title}
                      </span>
                    </div>
                    <p className="text-[11px] text-cosmic-muted line-clamp-2 leading-tight">
                      {preset.tagline}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Col: Live Biometric Breakdown or Placeholder */}
        <div className="lg:col-span-5 space-y-6">
          {analyzedResult ? (
            <GlassCard variant="gold" className="p-6 space-y-5" glow>
              <div className="flex items-center justify-between border-b border-gold/20 pb-4">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-gold-light">
                    Classification
                  </span>
                  <h3 className="font-display text-xl font-bold text-cosmic-text">
                    {analyzedResult.hand_type}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-gold-light">
                    Confidence
                  </span>
                  <div className="text-xl font-mono font-black text-gold-bright">
                    {analyzedResult.confidence_score}%
                  </div>
                </div>
              </div>

              {/* Line Metrics List */}
              <div className="space-y-3.5">
                <span className="text-xs font-semibold tracking-wider uppercase text-lavender-soft font-display">
                  Identified Major Vectors:
                </span>

                {/* Heart Line */}
                <div className="p-3 rounded-xl bg-midnight-elevated/70 border border-violet/30 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-gold-light">
                      {analyzedResult.lines.heart_line.name}
                    </span>
                    <span className="text-[10px] text-lavender font-mono">
                      {analyzedResult.lines.heart_line.depth} · {analyzedResult.lines.heart_line.curvature}
                    </span>
                  </div>
                  <p className="text-[11px] text-cosmic-muted leading-tight">
                    {analyzedResult.lines.heart_line.summary}
                  </p>
                </div>

                {/* Head Line */}
                <div className="p-3 rounded-xl bg-midnight-elevated/70 border border-violet/30 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-gold-light">
                      {analyzedResult.lines.head_line.name}
                    </span>
                    <span className="text-[10px] text-lavender font-mono">
                      {analyzedResult.lines.head_line.depth} · {analyzedResult.lines.head_line.curvature}
                    </span>
                  </div>
                  <p className="text-[11px] text-cosmic-muted leading-tight">
                    {analyzedResult.lines.head_line.summary}
                  </p>
                </div>

                {/* Life Line */}
                <div className="p-3 rounded-xl bg-midnight-elevated/70 border border-violet/30 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-gold-light">
                      {analyzedResult.lines.life_line.name}
                    </span>
                    <span className="text-[10px] text-lavender font-mono">
                      {analyzedResult.lines.life_line.depth} · {analyzedResult.lines.life_line.curvature}
                    </span>
                  </div>
                  <p className="text-[11px] text-cosmic-muted leading-tight">
                    {analyzedResult.lines.life_line.summary}
                  </p>
                </div>

                {/* Fate Line */}
                <div className="p-3 rounded-xl bg-midnight-elevated/70 border border-violet/30 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-gold-light">
                      {analyzedResult.lines.fate_line.name}
                    </span>
                    <span className="text-[10px] text-lavender font-mono">
                      {analyzedResult.lines.fate_line.depth} · {analyzedResult.lines.fate_line.curvature}
                    </span>
                  </div>
                  <p className="text-[11px] text-cosmic-muted leading-tight">
                    {analyzedResult.lines.fate_line.summary}
                  </p>
                </div>
              </div>

              {/* Mount Prominence Highlights */}
              <div className="pt-2 border-t border-gold/20">
                <span className="text-[11px] uppercase font-bold tracking-wider text-cosmic-muted block mb-2">
                  Planetary Mount Activity:
                </span>
                <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
                  <div className="p-1.5 rounded-lg bg-white/5 border border-indigo-border">
                    <span className="text-cosmic-subtle block">Jupiter</span>
                    <span className="text-gold font-bold">
                      {analyzedResult.mount_prominence.jupiter}%
                    </span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-white/5 border border-indigo-border">
                    <span className="text-cosmic-subtle block">Venus</span>
                    <span className="text-gold font-bold">
                      {analyzedResult.mount_prominence.venus}%
                    </span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-white/5 border border-indigo-border">
                    <span className="text-cosmic-subtle block">Luna</span>
                    <span className="text-gold font-bold">
                      {analyzedResult.mount_prominence.luna}%
                    </span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-white/5 border border-indigo-border">
                    <span className="text-cosmic-subtle block">Apollo</span>
                    <span className="text-gold font-bold">
                      {analyzedResult.mount_prominence.apollo}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Proceed CTA */}
              <div className="pt-3">
                <GoldButton
                  className="w-full"
                  size="lg"
                  onClick={() => onComplete(analyzedResult)}
                  rightIcon={<Zap className="w-4 h-4" />}
                >
                  Confirm Palm & Proceed to Spread
                </GoldButton>
              </div>
            </GlassCard>
          ) : (
            <GlassCard variant="subtle" className="p-8 text-center space-y-5">
              <div className="w-14 h-14 rounded-full bg-midnight-elevated border border-indigo-border flex items-center justify-center mx-auto text-cosmic-subtle">
                <Activity className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h4 className="font-display text-lg text-cosmic-text font-bold">
                  Biometric Engine Idle
                </h4>
                <p className="text-xs text-cosmic-muted leading-relaxed">
                  Upload your palm image or pick one of the preset archetypes on the left to activate
                  the computer vision segmentation pipeline.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-indigo-panel/50 border border-violet/20 text-left space-y-2 text-xs text-cosmic-muted">
                <span className="font-semibold text-gold-light block">What our CV analyzes:</span>
                <ul className="space-y-1 text-[11px] list-disc list-inside text-cosmic-subtle">
                  <li>Flexion crease length, branching & curvature</li>
                  <li>7 Classical Vedic planetary mounts (Jupiter to Luna)</li>
                  <li>Elemental hand archetype (Fire, Earth, Air, Water)</li>
                </ul>
              </div>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}
