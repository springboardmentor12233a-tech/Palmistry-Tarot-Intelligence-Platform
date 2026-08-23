'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '@/context/NotificationContext';
import { Sparkles, Bell, X, Compass, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function NotificationToast() {
  const { toastMessage, dismissToast } = useNotifications();

  return (
    <div className="fixed bottom-6 right-6 z-50 pointer-events-none max-w-md w-full px-4">
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="pointer-events-auto bg-midnight-elevated/95 backdrop-blur-2xl border border-gold/40 rounded-2xl p-4 shadow-[0_10px_40px_rgba(0,0,0,0.7),0_0_20px_rgba(212,175,55,0.25)] relative overflow-hidden"
          >
            {/* Ambient Corner Glow */}
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-violet/30 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-violet-deep/60 border border-violet/50 flex items-center justify-center flex-shrink-0 text-gold-light mt-0.5 shadow-sm">
                {toastMessage.type === 'celestial_transit' ? (
                  <Sparkles className="w-5 h-5 text-gold-bright" />
                ) : (
                  <Bell className="w-4 h-4 text-lavender" />
                )}
              </div>

              <div className="flex-1 pr-2">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-gold-light font-sans">
                    {toastMessage.title}
                  </h4>
                  <span className="text-[10px] text-cosmic-subtle">{toastMessage.date}</span>
                </div>
                <p className="text-xs text-cosmic-muted leading-relaxed mb-2">
                  {toastMessage.message}
                </p>

                {toastMessage.link && (
                  <Link
                    href={toastMessage.link}
                    onClick={dismissToast}
                    className="inline-flex items-center gap-1.5 text-xs text-gold hover:text-gold-bright font-semibold underline underline-offset-4 decoration-gold/40 hover:decoration-gold"
                  >
                    <span>Explore Guidance</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                )}
              </div>

              <button
                onClick={dismissToast}
                className="text-cosmic-subtle hover:text-cosmic-text transition-colors p-1 rounded-lg hover:bg-white/5"
                aria-label="Dismiss notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
