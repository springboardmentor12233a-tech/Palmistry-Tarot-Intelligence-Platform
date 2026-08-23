'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/ui/AuthGuard';
import PalmUploadStep from '@/components/reading/PalmUploadStep';
import SpreadSelectStep from '@/components/reading/SpreadSelectStep';
import CardDrawStep from '@/components/reading/CardDrawStep';
import SynthesisLoadingStep from '@/components/reading/SynthesisLoadingStep';
import { PalmAnalysisResult, SpreadType, TarotDrawResult, FullReading } from '@/types';
import { api } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';

export default function ReadingWizardPage() {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [palmResult, setPalmResult] = useState<PalmAnalysisResult | null>(null);
  const [selectedSpread, setSelectedSpread] = useState<SpreadType>('three_card');
  const [userContext, setUserContext] = useState<{
    focus_topic?: string;
    specific_question?: string;
  }>({
    focus_topic: 'Career & Spiritual Purpose',
  });
  const [tarotResult, setTarotResult] = useState<TarotDrawResult | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);

  // Step 1: Palm completion
  const handlePalmComplete = (result: PalmAnalysisResult) => {
    setPalmResult(result);
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Step 2: Spread selection
  const handleSpreadSelect = (
    spread: SpreadType,
    context?: { focus_topic?: string; specific_question?: string }
  ) => {
    setSelectedSpread(spread);
    if (context) {
      setUserContext(context);
    }
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Step 3: Tarot cards drawn -> initiate synthesis
  const handleTarotComplete = async (drawRes: TarotDrawResult) => {
    setTarotResult(drawRes);
    setCurrentStep(4);
    setIsSynthesizing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      if (!palmResult) {
        throw new Error('Palm biometrics missing');
      }

      const synthesis = await api.generateReading({
        palm_result: palmResult,
        tarot_spread: drawRes,
        user_context: userContext,
      });

      // Allow ceremonial synthesis animation to finish smoothly
      setTimeout(() => {
        router.push(`/reading/${synthesis.id}`);
      }, 3500);
    } catch (err: any) {
      setIsSynthesizing(false);
      setCurrentStep(3);
      alert(err?.message || 'Synthesis failed. Please check backend connection.');
    }
  };

  return (
    <AuthGuard>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-[85vh]">
        {/* Wizard Progress Breadcrumb Indicator */}
        <div className="mb-10 flex items-center justify-center">
          <div className="flex items-center gap-2 sm:gap-4 text-xs font-mono">
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all ${
                currentStep === 1
                  ? 'bg-gold/20 text-gold-bright border-gold font-bold shadow-gold-glow'
                  : currentStep > 1
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  : 'bg-white/5 text-cosmic-subtle border-indigo-border'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-midnight-deep flex items-center justify-center text-[10px]">
                1
              </span>
              <span className="hidden sm:inline">Palm Biometrics</span>
            </div>

            <span className="text-cosmic-subtle">──</span>

            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all ${
                currentStep === 2
                  ? 'bg-gold/20 text-gold-bright border-gold font-bold shadow-gold-glow'
                  : currentStep > 2
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  : 'bg-white/5 text-cosmic-subtle border-indigo-border'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-midnight-deep flex items-center justify-center text-[10px]">
                2
              </span>
              <span className="hidden sm:inline">Tarot Spread</span>
            </div>

            <span className="text-cosmic-subtle">──</span>

            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all ${
                currentStep === 3
                  ? 'bg-gold/20 text-gold-bright border-gold font-bold shadow-gold-glow'
                  : currentStep > 3
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  : 'bg-white/5 text-cosmic-subtle border-indigo-border'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-midnight-deep flex items-center justify-center text-[10px]">
                3
              </span>
              <span className="hidden sm:inline">Sacred Draw</span>
            </div>

            <span className="text-cosmic-subtle">──</span>

            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all ${
                currentStep === 4
                  ? 'bg-gold/20 text-gold-bright border-gold font-bold shadow-gold-glow animate-pulse'
                  : 'bg-white/5 text-cosmic-subtle border-indigo-border'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-midnight-deep flex items-center justify-center text-[10px]">
                4
              </span>
              <span className="hidden sm:inline">Synthesis</span>
            </div>
          </div>
        </div>

        {/* Wizard Multi-Step Views with Smooth Transition */}
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <PalmUploadStep
                initialResult={palmResult}
                onComplete={handlePalmComplete}
              />
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <SpreadSelectStep
                initialSpread={selectedSpread}
                onSelect={handleSpreadSelect}
                onBack={() => setCurrentStep(1)}
              />
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <CardDrawStep
                spreadType={selectedSpread}
                onComplete={handleTarotComplete}
                onBack={() => setCurrentStep(2)}
              />
            </motion.div>
          )}

          {currentStep === 4 && (
            <motion.div
              key="step-4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <SynthesisLoadingStep />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AuthGuard>
  );
}
