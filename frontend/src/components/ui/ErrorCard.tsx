'use client';

import React from 'react';
import GlassCard from './GlassCard';
import GoldButton from './GoldButton';
import VioletButton from './VioletButton';
import { AlertCircle, RefreshCw, Compass } from 'lucide-react';
import Link from 'next/link';

interface ErrorCardProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  actionText?: string;
  homeLink?: boolean;
  className?: string;
}

export default function ErrorCard({
  title = 'Celestial Signal Disrupted',
  message = 'An unexpected planetary interference prevented data retrieval. The cosmos remains steadfast—please try reconnecting.',
  onRetry,
  actionText = 'Recalibrate Astral Link',
  homeLink = true,
  className = '',
}: ErrorCardProps) {
  return (
    <GlassCard variant="violet" className={`max-w-xl mx-auto my-12 text-center p-8 ${className}`}>
      <div className="w-16 h-16 rounded-full bg-violet-deep/50 border border-violet/50 flex items-center justify-center mx-auto mb-6 shadow-violet-glow">
        <AlertCircle className="w-8 h-8 text-gold-light" />
      </div>

      <h3 className="font-display text-2xl text-gold-light mb-3">{title}</h3>
      <p className="text-cosmic-muted text-sm leading-relaxed mb-8 max-w-md mx-auto">{message}</p>

      <div className="flex flex-wrap items-center justify-center gap-4">
        {onRetry && (
          <GoldButton onClick={onRetry} leftIcon={<RefreshCw className="w-4 h-4" />}>
            {actionText}
          </GoldButton>
        )}

        {homeLink && (
          <Link href="/">
            <VioletButton leftIcon={<Compass className="w-4 h-4" />}>
              Return to Sanctuary
            </VioletButton>
          </Link>
        )}
      </div>
    </GlassCard>
  );
}
