'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import GlassCard from '@/components/ui/GlassCard';
import GoldButton from '@/components/ui/GoldButton';
import Eyebrow from '@/components/ui/Eyebrow';
import MoonMotif from '@/components/cosmic/MoonMotif';
import Link from 'next/link';
import { Mail, Lock, LogIn, ShieldAlert, Loader2 } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/reading';
  const sessionExpired = searchParams.get('session_expired') === 'true';

  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      await login(email, password);
      router.push(redirect);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Login failed. Please check your email and password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-8 relative z-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <MoonMotif size="sm" variant="crescent" className="mx-auto mb-2" />
        <Eyebrow variant="gold">SIGN IN</Eyebrow>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-cosmic-text">
          Welcome Back
        </h1>
        <p className="text-cosmic-muted text-xs sm:text-sm">
          Log in to view your palm readings, tarot card spreads, and personal reports.
        </p>
      </div>

      {/* Expired Session Alert */}
      {sessionExpired && (
        <div className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 flex-shrink-0" />
          <span>Your session has expired. Please sign in again to continue.</span>
        </div>
      )}

      {/* Login Glass Panel */}
      <GlassCard variant="gold" className="p-6 sm:p-8" glow>
        {errorMessage && (
          <div className="mb-6 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs text-center">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
              placeholder="you@example.com"
              className="w-full bg-midnight-elevated border border-indigo-border focus:border-gold rounded-xl px-4 py-3 text-sm text-cosmic-text placeholder-cosmic-subtle outline-none transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-gold-light font-display flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-gold" />
                <span>Password</span>
              </label>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full bg-midnight-elevated border border-indigo-border focus:border-gold rounded-xl px-4 py-3 text-sm text-cosmic-text placeholder-cosmic-subtle outline-none transition-colors"
            />
          </div>

          <div className="pt-2">
            <GoldButton
              type="submit"
              size="lg"
              className="w-full"
              isLoading={isLoading}
              leftIcon={<LogIn className="w-4 h-4" />}
            >
              Sign In
            </GoldButton>
          </div>
        </form>

        {/* Link to Register */}
        <div className="mt-6 pt-6 border-t border-indigo-border/60 text-center text-xs text-cosmic-muted">
          <span>Don&apos;t have an account? </span>
          <Link href="/register" className="text-gold font-bold hover:underline">
            Register / Create Account
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 py-12 relative">
      {/* Soft Ambient Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-violet/15 blur-3xl pointer-events-none" />

      <Suspense
        fallback={
          <div className="text-center p-12 text-gold-light">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-gold" />
            <span className="text-xs font-mono">Loading login portal...</span>
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
