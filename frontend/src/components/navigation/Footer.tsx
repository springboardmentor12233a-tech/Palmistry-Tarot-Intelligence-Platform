import React from 'react';
import Link from 'next/link';
import { Moon, Sparkles, Shield, HeartHandshake, Compass } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-indigo-border/60 bg-midnight-elevated/70 backdrop-blur-xl mt-24">
      {/* Decorative Top Accent Line */}
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Col 1: Brand & Philosophy */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-midnight-surface border border-gold/40 flex items-center justify-center text-gold-light shadow-gold-glow">
                <Moon className="w-5 h-5" />
              </div>
              <span className="font-display font-bold text-base tracking-wider text-gold-light">
                COSMIC ORACLE
              </span>
            </div>
            <p className="text-xs text-cosmic-muted leading-relaxed">
              Synthesizing ancient biometric palm line geometry and Hermetic tarot archetypes with
              modern computer vision and neural language intelligence.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-cosmic-subtle font-mono">
              <Sparkles className="w-3 h-3 text-gold-light" />
              <span>Calibrated to Lunar Cycles & Transits</span>
            </div>
          </div>

          {/* Col 2: Oracle Spreads */}
          <div className="space-y-3">
            <h4 className="font-display text-xs tracking-widest text-gold-light uppercase font-bold">
              Archetypal Spreads
            </h4>
            <ul className="space-y-2 text-xs text-cosmic-muted">
              <li>
                <Link href="/reading" className="hover:text-gold-bright transition-colors">
                  Daily Oracle Pulse (1 Card)
                </Link>
              </li>
              <li>
                <Link href="/reading" className="hover:text-gold-bright transition-colors">
                  Temporal Trinity (3 Cards)
                </Link>
              </li>
              <li>
                <Link href="/reading" className="hover:text-gold-bright transition-colors">
                  Soul Mirror & Dynamics (4 Cards)
                </Link>
              </li>
              <li>
                <Link href="/reading" className="hover:text-gold-bright transition-colors">
                  Vocation & Abundance Matrix (5 Cards)
                </Link>
              </li>
              <li>
                <Link href="/reading" className="hover:text-gold-bright transition-colors">
                  Grand Celtic Cross (10 Cards)
                </Link>
              </li>
              <li>
                <Link href="/reading" className="hover:text-gold-bright transition-colors">
                  Destiny Helix & Life Path (6 Cards)
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Spiritual Intelligence Pillars */}
          <div className="space-y-3">
            <h4 className="font-display text-xs tracking-widest text-gold-light uppercase font-bold">
              7 Insight Pillars
            </h4>
            <ul className="space-y-2 text-xs text-cosmic-muted">
              <li>Personality & Soul Architecture</li>
              <li>Relational Resonance & Soul Ties</li>
              <li>Career, Vocation & Sovereign Purpose</li>
              <li>Financial Alchemy & Wealth Flow</li>
              <li>Vitality & Somatic Nervous System</li>
              <li>Personal Growth & Shadow Alchemy</li>
              <li>Life Opportunities & Auspicious Portals</li>
            </ul>
          </div>

          {/* Col 4: Platform Integrity & Links */}
          <div className="space-y-3">
            <h4 className="font-display text-xs tracking-widest text-gold-light uppercase font-bold">
              Sanctuary
            </h4>
            <ul className="space-y-2 text-xs text-cosmic-muted">
              <li>
                <Link href="/about" className="hover:text-gold-bright transition-colors">
                  CV & AI Biometric Pipeline
                </Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-gold-bright transition-colors">
                  Soul Blueprint & Reading History
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-gold-bright transition-colors">
                  Begin Onboarding Ritual
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-gold-bright transition-colors">
                  Sign In to Sanctuary
                </Link>
              </li>
            </ul>

            <div className="pt-2">
              <div className="p-3 rounded-xl bg-indigo-panel/40 border border-violet/30 text-[11px] text-cosmic-muted leading-tight">
                <span className="text-gold-light font-semibold block mb-1">Ethical Sacred AI:</span>
                Your biometric scans and astrological inquiries are processed securely and never sold or shared.
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-indigo-border/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-cosmic-subtle">
          <p>© 2026 Palmistry & Tarot Intelligence Platform. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/about" className="hover:text-gold transition-colors">
              Methodology
            </Link>
            <span className="w-1 h-1 rounded-full bg-cosmic-subtle" />
            <Link href="/about#ethics" className="hover:text-gold transition-colors">
              Ethics & Privacy
            </Link>
            <span className="w-1 h-1 rounded-full bg-cosmic-subtle" />
            <span className="text-gold-light/70">Engineered with Next.js 14 & FastAPI</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
