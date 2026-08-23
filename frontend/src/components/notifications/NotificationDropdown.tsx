'use client';

import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '@/context/NotificationContext';
import { Sparkles, Bell, Check, ExternalLink, Moon } from 'lucide-react';
import Link from 'next/link';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationDropdown({ isOpen, onClose }: NotificationDropdownProps) {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={dropdownRef}
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-midnight-elevated/95 backdrop-blur-2xl border border-gold/30 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(124,58,237,0.2)] z-50 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-indigo-border bg-indigo-panel/60">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-gold-light" />
              <span className="font-display text-sm font-semibold tracking-wide text-gold-light">
                Celestial Oracle Transmissions
              </span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-gold/20 text-gold-bright text-[10px] font-bold border border-gold/40">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[11px] text-lavender hover:text-gold-bright transition-colors flex items-center gap-1"
              >
                <Check className="w-3 h-3" />
                <span>Mark read</span>
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto divide-y divide-indigo-border/40">
            {notifications.length === 0 ? (
              <div className="py-10 text-center px-4">
                <Moon className="w-8 h-8 text-cosmic-subtle mx-auto mb-2 opacity-50" />
                <p className="text-sm text-cosmic-muted">No pending celestial signals.</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => markAsRead(notif.id)}
                  className={`p-4 transition-colors hover:bg-white/5 cursor-pointer relative ${
                    !notif.read ? 'bg-violet/10' : ''
                  }`}
                >
                  {!notif.read && (
                    <span className="absolute left-2 top-5 w-1.5 h-1.5 rounded-full bg-gold shadow-[0_0_6px_#D4AF37]" />
                  )}

                  <div className="pl-2">
                    <div className="flex items-center justify-between mb-1">
                      <h5
                        className={`text-xs font-semibold ${
                          !notif.read ? 'text-gold-light' : 'text-cosmic-text'
                        }`}
                      >
                        {notif.title}
                      </h5>
                      <span className="text-[10px] text-cosmic-subtle">{notif.date}</span>
                    </div>

                    <p className="text-xs text-cosmic-muted leading-relaxed mb-2">
                      {notif.message}
                    </p>

                    {notif.link && (
                      <Link
                        href={notif.link}
                        onClick={onClose}
                        className="inline-flex items-center gap-1 text-[11px] text-gold hover:text-gold-bright font-medium"
                      >
                        <span>View Transmission</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer note */}
          <div className="px-4 py-2.5 bg-midnight-deep text-center border-t border-indigo-border/60">
            <span className="text-[10px] text-cosmic-subtle tracking-wider uppercase">
              Synchronized with Lunar Cycles & Archetypal Matrices
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
