'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { AgeGroup } from '@/types';
import { SPIRITUAL_INTERESTS_OPTIONS, SPIRITUAL_GOALS_OPTIONS } from '@/lib/constants';
import GlassCard from '@/components/ui/GlassCard';
import GoldButton from '@/components/ui/GoldButton';
import VioletButton from '@/components/ui/VioletButton';
import Eyebrow from '@/components/ui/Eyebrow';
import MoonMotif from '@/components/cosmic/MoonMotif';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  User,
  Mail,
  Lock,
  Calendar,
  Compass,
  Heart,
  Crown,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AGE_GROUPS: AgeGroup[] = ['18-24', '25-34', '35-44', '45-54', '55+'];

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser } = useAuth();

  const [step, setStep] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [ageGroup, setAgeGroup] = useState<AgeGroup>('25-34');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    'Vedic Palmistry & Hastarekha',
    'Hermetic Tarot & Kabbalah',
  ]);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([
    'Discovering my Higher Life Purpose & Soul Mission',
    'Navigating Deep Career & Vocation Crossroads',
  ]);

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const toggleGoal = (goal: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      setErrorMessage('Please provide your name and email to proceed.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      await registerUser({
        name,
        email,
        password: password || 'CelestialOracle888',
        age_group: ageGroup,
        interests: selectedInterests,
        spiritual_goals: selectedGoals,
      });

      router.push('/reading');
    } catch (err: any) {
      setErrorMessage(err?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 py-12 relative">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-violet/15 blur-3xl pointer-events-none" />

      <div className="w-full max-w-2xl mx-auto space-y-8 relative z-10">
        {/* Onboarding Header */}
        <div className="text-center space-y-3">
          <MoonMotif size="sm" variant="eclipse" className="mx-auto mb-2" />
          <Eyebrow variant="gold">CREATE ACCOUNT</Eyebrow>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-cosmic-text">
            Create Your Account
          </h1>
          <p className="text-cosmic-muted text-xs sm:text-sm max-w-md mx-auto">
            Set up your profile to personalize your palm and tarot readings.
          </p>
        </div>

        {/* Step Progression Bar */}
        <div className="flex items-center justify-center gap-2 text-xs font-mono">
          <span
            className={`px-3 py-1 rounded-full border transition-all ${
              step === 1
                ? 'bg-gold/20 text-gold-bright border-gold font-bold shadow-gold-glow'
                : 'bg-white/5 text-cosmic-subtle border-indigo-border'
            }`}
          >
            1. Account Details
          </span>
          <span className="text-cosmic-subtle">›</span>
          <span
            className={`px-3 py-1 rounded-full border transition-all ${
              step === 2
                ? 'bg-gold/20 text-gold-bright border-gold font-bold shadow-gold-glow'
                : 'bg-white/5 text-cosmic-subtle border-indigo-border'
            }`}
          >
            2. Interests
          </span>
          <span className="text-cosmic-subtle">›</span>
          <span
            className={`px-3 py-1 rounded-full border transition-all ${
              step === 3
                ? 'bg-gold/20 text-gold-bright border-gold font-bold shadow-gold-glow'
                : 'bg-white/5 text-cosmic-subtle border-indigo-border'
            }`}
          >
            3. Goals
          </span>
        </div>

        {/* Form Panel */}
        <GlassCard variant="gold" className="p-6 sm:p-10" glow>
          {errorMessage && (
            <div className="mb-6 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs text-center">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
              {/* STEP 1: Basic Details */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-5"
                >
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-gold-light font-display flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-gold" />
                      <span>Full Name</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Aurelia Vance"
                      className="w-full bg-midnight-elevated border border-indigo-border focus:border-gold rounded-xl px-4 py-3 text-sm text-cosmic-text placeholder-cosmic-subtle outline-none transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-gold-light font-display flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-gold" />
                      <span>Email Address</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full bg-midnight-elevated border border-indigo-border focus:border-gold rounded-xl px-4 py-3 text-sm text-cosmic-text placeholder-cosmic-subtle outline-none transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-gold-light font-display flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-gold" />
                      <span>Password</span>
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter a password"
                      className="w-full bg-midnight-elevated border border-indigo-border focus:border-gold rounded-xl px-4 py-3 text-sm text-cosmic-text placeholder-cosmic-subtle outline-none transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-gold-light font-display flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-gold" />
                      <span>Age Group</span>
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                      {AGE_GROUPS.map((ag) => (
                        <button
                          type="button"
                          key={ag}
                          onClick={() => setAgeGroup(ag)}
                          className={`py-2 rounded-xl text-xs font-mono font-semibold border transition-all ${
                            ageGroup === ag
                              ? 'bg-gold text-midnight-deep border-gold-bright shadow-gold-glow font-bold'
                              : 'bg-midnight-elevated text-cosmic-muted border-indigo-border hover:border-violet/50'
                          }`}
                        >
                          {ag}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <GoldButton
                      type="button"
                      size="md"
                      onClick={() => {
                        if (!name || !email) {
                          setErrorMessage('Please enter your name and email.');
                          return;
                        }
                        setErrorMessage(null);
                        setStep(2);
                      }}
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                    >
                      Next: Choose Interests
                    </GoldButton>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: Interests */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-5"
                >
                  <div className="space-y-1">
                    <h3 className="font-display text-lg font-bold text-gold-light">
                      What spiritual topics are you interested in?
                    </h3>
                    <p className="text-xs text-cosmic-muted">
                      Select all that apply to personalize your readings.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {SPIRITUAL_INTERESTS_OPTIONS.map((interest) => {
                      const isSelected = selectedInterests.includes(interest);
                      return (
                        <button
                          type="button"
                          key={interest}
                          onClick={() => toggleInterest(interest)}
                          className={`p-3.5 rounded-xl border text-left transition-all flex items-start justify-between gap-2 ${
                            isSelected
                              ? 'bg-gold/15 border-gold text-gold-bright shadow-sm'
                              : 'bg-midnight-elevated/70 border-indigo-border text-cosmic-muted hover:border-violet/50'
                          }`}
                        >
                          <span className="text-xs font-medium leading-snug">{interest}</span>
                          <div
                            className={`w-4 h-4 rounded-md border flex items-center justify-center flex-shrink-0 mt-0.5 ${
                              isSelected
                                ? 'bg-gold border-gold text-midnight-deep'
                                : 'border-indigo-border'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-4 flex items-center justify-between">
                    <VioletButton type="button" size="md" onClick={() => setStep(1)}>
                      Back
                    </VioletButton>
                    <GoldButton
                      type="button"
                      size="md"
                      onClick={() => setStep(3)}
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                    >
                      Next: Choose Goals
                    </GoldButton>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: Goals */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-5"
                >
                  <div className="space-y-1">
                    <h3 className="font-display text-lg font-bold text-gold-light">
                      What are your main personal and spiritual goals?
                    </h3>
                    <p className="text-xs text-cosmic-muted">
                      Your choices will help guide your life-trend predictions and recommendations.
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    {SPIRITUAL_GOALS_OPTIONS.map((goal) => {
                      const isSelected = selectedGoals.includes(goal);
                      return (
                        <button
                          type="button"
                          key={goal}
                          onClick={() => toggleGoal(goal)}
                          className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-center justify-between gap-3 ${
                            isSelected
                              ? 'bg-gold/15 border-gold text-gold-bright shadow-sm'
                              : 'bg-midnight-elevated/70 border-indigo-border text-cosmic-muted hover:border-violet/50'
                          }`}
                        >
                          <span className="text-xs font-medium leading-snug">{goal}</span>
                          <div
                            className={`w-4 h-4 rounded-md border flex items-center justify-center flex-shrink-0 ${
                              isSelected
                                ? 'bg-gold border-gold text-midnight-deep'
                                : 'border-indigo-border'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-4 flex items-center justify-between">
                    <VioletButton type="button" size="md" onClick={() => setStep(2)}>
                      Back
                    </VioletButton>
                    <GoldButton
                      type="submit"
                      size="lg"
                      isLoading={isLoading}
                      leftIcon={<Sparkles className="w-4 h-4" />}
                    >
                      Complete Registration & Start Reading
                    </GoldButton>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          {/* Link to Login */}
          <div className="mt-8 pt-6 border-t border-indigo-border/60 text-center text-xs text-cosmic-muted">
            <span>Already have an account? </span>
            <Link href="/login" className="text-gold font-bold hover:underline">
              Sign In Here
            </Link>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
