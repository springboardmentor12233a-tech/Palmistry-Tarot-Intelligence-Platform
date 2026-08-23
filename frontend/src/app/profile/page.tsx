'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { AgeGroup, ReadingHistoryItem, User } from '@/types';
import { SPIRITUAL_INTERESTS_OPTIONS, SPIRITUAL_GOALS_OPTIONS } from '@/lib/constants';
import AuthGuard from '@/components/ui/AuthGuard';
import GlassCard from '@/components/ui/GlassCard';
import GoldButton from '@/components/ui/GoldButton';
import VioletButton from '@/components/ui/VioletButton';
import Eyebrow from '@/components/ui/Eyebrow';
import Link from 'next/link';
import {
  User as UserIcon,
  Mail,
  Calendar,
  Sparkles,
  History,
  Check,
  ArrowRight,
  Settings,
  Shield,
  Layers,
  Crown,
  BookOpen,
} from 'lucide-react';

const AGE_GROUPS: AgeGroup[] = ['18-24', '25-34', '35-44', '45-54', '55+'];

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [historyReadings, setHistoryReadings] = useState<ReadingHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Profile Form State
  const [name, setName] = useState(user?.name || 'Aurelia Vance');
  const [ageGroup, setAgeGroup] = useState<AgeGroup>(user?.age_group || '25-34');
  const [interests, setInterests] = useState<string[]>(user?.interests || []);
  const [goals, setGoals] = useState<string[]>(user?.spiritual_goals || []);
  const [primaryFocus, setPrimaryFocus] = useState(
    user?.reading_preferences?.primary_focus || 'Career & Spiritual Purpose'
  );
  const [includeReversed, setIncludeReversed] = useState(
    user?.reading_preferences?.include_reversed_cards ?? true
  );

  const loadHistory = async () => {
    setIsLoadingHistory(true);
    setHistoryError(null);
    try {
      const readings = await api.getMyReadings();
      setHistoryReadings(readings);
    } catch (err: any) {
      setHistoryError(err?.message || 'Unable to retrieve reading history from sanctuary archives.');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (user) {
      setName(user.name);
      setAgeGroup(user.age_group || '25-34');
      setInterests(user.interests || []);
      setGoals(user.spiritual_goals || []);
      setPrimaryFocus(user.reading_preferences?.primary_focus || 'Career & Spiritual Purpose');
      setIncludeReversed(user.reading_preferences?.include_reversed_cards ?? true);
    }
  }, [user]);

  useEffect(() => {
    loadHistory();
  }, []);

  const toggleInterest = (item: string) => {
    setInterests((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const toggleGoal = (item: string) => {
    setGoals((prev) =>
      prev.includes(item) ? prev.filter((g) => g !== item) : [...prev, item]
    );
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage(null);

    try {
      await updateProfile({
        name,
        age_group: ageGroup as any,
        interests,
        spiritual_goals: goals,
        reading_preferences: {
          primary_focus: primaryFocus,
          include_reversed_cards: includeReversed,
          notification_frequency: 'weekly',
        },
      });

      setSuccessMessage('Soul blueprint calibrated successfully.');
      setIsEditing(false);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch {
      alert('Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AuthGuard>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 pb-24">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-border/60 pb-6">
          <div className="space-y-1">
            <Eyebrow variant="gold">SANCTUARY DOSSIER</Eyebrow>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-cosmic-text">
              Your Soul Profile & Reading History
            </h1>
            <p className="text-xs text-cosmic-muted">
              Manage your esoteric preferences and review past synthesized readings.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/reading">
              <GoldButton size="md" leftIcon={<Sparkles className="w-4 h-4" />}>
                Launch New Reading
              </GoldButton>
            </Link>
          </div>
        </div>

        {successMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{successMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Col: Profile & Reading Preferences Form */}
          <div className="lg:col-span-5 space-y-6">
            <GlassCard variant="gold" className="p-6 sm:p-8 space-y-6" glow>
              <div className="flex items-center justify-between border-b border-gold/20 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-violet-deep border border-gold/40 flex items-center justify-center text-gold-light font-display text-lg font-bold shadow-gold-glow">
                    {user?.name?.charAt(0) || 'A'}
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-cosmic-text">
                      {user?.name || 'Aurelia Vance'}
                    </h3>
                    <span className="text-xs text-cosmic-muted font-mono">{user?.email}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsEditing(!isEditing)}
                  className="p-2 rounded-xl bg-midnight-elevated border border-gold/30 text-gold-light hover:text-gold-bright text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>{isEditing ? 'Cancel' : 'Edit'}</span>
                </button>
              </div>

              {isEditing ? (
                <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="text-gold-light font-semibold uppercase tracking-wider font-mono">
                      Soul Moniker / Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-midnight-elevated border border-indigo-border focus:border-gold rounded-xl px-3.5 py-2.5 text-xs text-cosmic-text outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-gold-light font-semibold uppercase tracking-wider font-mono">
                      Age Group
                    </label>
                    <div className="grid grid-cols-5 gap-1.5">
                      {AGE_GROUPS.map((ag) => (
                        <button
                          type="button"
                          key={ag}
                          onClick={() => setAgeGroup(ag)}
                          className={`py-1.5 rounded-lg text-[10px] font-mono border ${
                            ageGroup === ag
                              ? 'bg-gold text-midnight-deep border-gold-bright font-bold'
                              : 'bg-midnight-elevated text-cosmic-muted border-indigo-border'
                          }`}
                        >
                          {ag}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-gold-light font-semibold uppercase tracking-wider font-mono">
                      Default Focus Domain
                    </label>
                    <select
                      value={primaryFocus}
                      onChange={(e) => setPrimaryFocus(e.target.value)}
                      className="w-full bg-midnight-elevated border border-indigo-border focus:border-gold rounded-xl px-3 py-2 text-xs text-cosmic-text outline-none"
                    >
                      <option value="Career & Spiritual Purpose">Career & Spiritual Purpose</option>
                      <option value="Romantic Harmony & Soul Ties">Romantic Harmony & Soul Ties</option>
                      <option value="Financial Flow & Asset Creation">Financial Flow & Asset Creation</option>
                      <option value="Shadow Alchemy & Emotional Healing">Shadow Alchemy & Emotional Healing</option>
                      <option value="Holistic Life Path Awakening">Holistic Life Path Awakening</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="reversed"
                      checked={includeReversed}
                      onChange={(e) => setIncludeReversed(e.target.checked)}
                      className="accent-gold rounded"
                    />
                    <label htmlFor="reversed" className="text-cosmic-muted cursor-pointer">
                      Include reversed cards in tarot spreads
                    </label>
                  </div>

                  <div className="pt-3">
                    <GoldButton type="submit" size="md" className="w-full" isLoading={isSaving}>
                      Save Changes
                    </GoldButton>
                  </div>
                </form>
              ) : (
                <div className="space-y-4 text-xs">
                  <div className="p-3 rounded-xl bg-midnight-deep/60 border border-indigo-border/60 space-y-1">
                    <span className="text-[10px] text-cosmic-subtle font-mono uppercase block">
                      Spiritual Focus
                    </span>
                    <span className="font-semibold text-gold-light">{primaryFocus}</span>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] text-cosmic-subtle font-mono uppercase block">
                      Esoteric Traditions
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {interests.map((item, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-full bg-midnight-elevated border border-violet/30 text-[11px] text-lavender-soft"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-gold/10">
                    <span className="text-[10px] text-cosmic-subtle font-mono uppercase block">
                      Sacred Goals
                    </span>
                    <div className="space-y-1.5">
                      {goals.map((g, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2 text-[11px] text-cosmic-muted"
                        >
                          <Check className="w-3.5 h-3.5 text-gold flex-shrink-0 mt-0.5" />
                          <span>{g}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </GlassCard>
          </div>

          {/* Right Col: Personal Reading History List */}
          <div className="lg:col-span-7 space-y-6">
            <GlassCard variant="default" className="p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-indigo-border pb-4">
                <div className="flex items-center gap-2.5">
                  <History className="w-5 h-5 text-gold-light" />
                  <h3 className="font-display text-xl font-bold text-cosmic-text">
                    Personal Reading History
                  </h3>
                </div>
                <span className="text-xs text-cosmic-subtle font-mono">
                  {historyReadings.length} Recorded Readings
                </span>
              </div>

              {isLoadingHistory ? (
                <div className="py-14 text-center space-y-3">
                  <div className="w-8 h-8 rounded-full border-2 border-gold/30 border-t-gold animate-spin mx-auto" />
                  <p className="text-xs text-cosmic-muted font-mono">Retrieving soul reading records...</p>
                </div>
              ) : historyError ? (
                <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-center space-y-3">
                  <p className="text-xs text-rose-300">{historyError}</p>
                  <VioletButton size="sm" onClick={loadHistory}>
                    Retry Retrieval
                  </VioletButton>
                </div>
              ) : historyReadings.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <BookOpen className="w-8 h-8 text-cosmic-subtle mx-auto opacity-50" />
                  <p className="text-xs text-cosmic-muted">No past readings recorded yet.</p>
                  <Link href="/reading">
                    <GoldButton size="sm">Perform First Reading</GoldButton>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {historyReadings.map((item) => (
                    <Link
                      key={item.id}
                      href={`/reading/${item.id}`}
                      className="block p-4 rounded-2xl bg-midnight-elevated/80 border border-indigo-border hover:border-gold/50 hover:bg-midnight-elevated transition-all group"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono uppercase text-cosmic-subtle">
                              {new Date(item.date).toLocaleDateString(undefined, {
                                dateStyle: 'medium',
                              })}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-violet/15 border border-violet/30 text-[10px] text-lavender font-mono">
                              {item.primary_archetype}
                            </span>
                          </div>

                          <h4 className="font-display text-base font-bold text-cosmic-text group-hover:text-gold-bright transition-colors">
                            {item.spread_title}
                          </h4>

                          <p className="text-xs text-cosmic-muted line-clamp-1">
                            {item.key_theme}
                          </p>
                        </div>

                        <div className="text-right flex-shrink-0 flex flex-col items-end justify-between h-full">
                          <div className="px-3 py-1 rounded-xl bg-midnight-deep border border-gold/30 text-gold-bright font-mono font-bold text-xs shadow-sm">
                            {item.overall_score}%
                          </div>
                          <span className="text-[11px] text-gold flex items-center gap-1 mt-3 group-hover:translate-x-0.5 transition-transform">
                            <span>Inspect</span>
                            <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </GlassCard>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
