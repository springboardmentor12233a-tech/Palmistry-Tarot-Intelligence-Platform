'use client';

import React, { ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2, Sparkles } from 'lucide-react';
import MoonMotif from '@/components/cosmic/MoonMotif';

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export default function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isLoading, isAuthenticated, router, pathname]);

  if (isLoading) {
    return (
      fallback || (
        <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
          <MoonMotif size="md" variant="eclipse" className="mb-8" />
          <div className="flex items-center gap-3 text-gold-light font-display text-xl mb-2">
            <Loader2 className="w-5 h-5 animate-spin text-gold" />
            <span>Consulting Celestial Registry...</span>
          </div>
          <p className="text-cosmic-muted text-sm max-w-sm">
            Authenticating your soul presence against the astral ledger.
          </p>
        </div>
      )
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
