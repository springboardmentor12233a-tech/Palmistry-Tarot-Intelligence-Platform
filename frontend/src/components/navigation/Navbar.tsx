'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import NotificationDropdown from '@/components/notifications/NotificationDropdown';
import GoldButton from '@/components/ui/GoldButton';
import VioletButton from '@/components/ui/VioletButton';
import {
  Sparkles,
  Bell,
  User as UserIcon,
  Compass,
  BookOpen,
  LogOut,
  LogIn,
  Menu,
  X,
  History,
  Moon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Sanctuary', icon: <Compass className="w-4 h-4" /> },
    { href: '/reading', label: 'Oracle Engine', icon: <Sparkles className="w-4 h-4" /> },
    { href: '/about', label: 'CV & AI Pipeline', icon: <BookOpen className="w-4 h-4" /> },
    ...(isAuthenticated
      ? [{ href: '/profile', label: 'Soul Profile', icon: <UserIcon className="w-4 h-4" /> }]
      : [
          { href: '/login', label: 'Sign In', icon: <LogIn className="w-4 h-4" /> },
          { href: '/register', label: 'Ritual', icon: <Sparkles className="w-4 h-4" /> },
        ]),
  ];

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-indigo-border/60 bg-midnight/80 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link
          href="/"
          className="flex items-center gap-3 group transition-transform duration-300 hover:scale-[1.02]"
        >
          <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-panel to-midnight-surface border border-gold/40 flex items-center justify-center shadow-gold-glow group-hover:border-gold-bright transition-colors">
            {/* Ambient inner glow */}
            <div className="absolute inset-0 rounded-xl bg-gold/10 blur-sm" />
            <Moon className="w-6 h-6 text-gold-light group-hover:text-gold-bright transition-colors" />
            <Sparkles className="w-3.5 h-3.5 text-violet-light absolute -top-1 -right-1 animate-pulse" />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-lg tracking-wider text-gold-light group-hover:text-gold-bright transition-colors">
                COSMIC ORACLE
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold tracking-widest bg-violet-deep/60 text-lavender-soft border border-violet/40 uppercase hidden sm:inline-block">
                v1.0 AI
              </span>
            </div>
            <span className="text-[10px] tracking-[0.2em] uppercase text-cosmic-subtle font-sans font-medium">
              Palmistry & Tarot Intelligence
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1.5 lg:gap-3 bg-indigo-panel/40 px-3.5 py-1.5 rounded-full border border-indigo-border/50 backdrop-blur-md">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 flex items-center gap-2 ${
                  active
                    ? 'text-midnight-deep bg-gradient-to-r from-gold-light to-gold font-bold shadow-gold-glow'
                    : 'text-cosmic-muted hover:text-cosmic-text hover:bg-white/5'
                }`}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Section: Notifications + Auth State */}
        <div className="hidden md:flex items-center gap-3 relative">
          {/* Notifications Button */}
          <div className="relative">
            <button
              onClick={() => setIsNotifOpen((prev) => !prev)}
              aria-label="View notifications"
              className="relative p-2.5 rounded-xl bg-indigo-panel/60 border border-indigo-border hover:border-gold/40 text-cosmic-muted hover:text-gold-light transition-all shadow-sm"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gold text-midnight-deep text-[10px] font-black flex items-center justify-center shadow-gold-glow animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Drawer */}
            <NotificationDropdown
              isOpen={isNotifOpen}
              onClose={() => setIsNotifOpen(false)}
            />
          </div>

          {/* Authenticated vs Guest CTAs */}
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link href="/reading">
                <GoldButton size="sm" leftIcon={<Sparkles className="w-3.5 h-3.5" />}>
                  Begin Reading
                </GoldButton>
              </Link>

              <Link
                href="/profile"
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-card/60 border border-violet/30 hover:border-violet-light transition-all text-xs text-lavender-soft"
              >
                <div className="w-6 h-6 rounded-full bg-violet-deep border border-gold/40 flex items-center justify-center text-gold-light text-[10px] font-bold">
                  {user?.name?.charAt(0) || 'A'}
                </div>
                <span className="max-w-[100px] truncate font-medium">{user?.name || 'Aurelia'}</span>
              </Link>

              <button
                onClick={() => logout()}
                title="Sign Out"
                className="p-2 rounded-xl text-cosmic-subtle hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                aria-label="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link href="/login">
                <VioletButton size="sm" variant="ghost">
                  Sign In
                </VioletButton>
              </Link>
              <Link href="/register">
                <GoldButton size="sm" leftIcon={<Sparkles className="w-3.5 h-3.5" />}>
                  Begin Ritual
                </GoldButton>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={() => setIsNotifOpen((prev) => !prev)}
            className="relative p-2 rounded-lg bg-indigo-panel/60 border border-indigo-border text-cosmic-muted"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-gold text-midnight-deep text-[9px] font-black flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="p-2 rounded-lg bg-indigo-panel/60 border border-indigo-border text-cosmic-muted hover:text-cosmic-text"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <NotificationDropdown
            isOpen={isNotifOpen}
            onClose={() => setIsNotifOpen(false)}
          />
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-indigo-border bg-midnight-elevated/95 backdrop-blur-2xl px-6 py-5 space-y-4"
          >
            <div className="flex flex-col space-y-2">
              {navLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                      active
                        ? 'bg-gold/15 text-gold-bright border border-gold/40'
                        : 'text-cosmic-muted hover:bg-white/5 hover:text-cosmic-text'
                    }`}
                  >
                    {link.icon}
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>

            <div className="pt-4 border-t border-indigo-border flex flex-col gap-3">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center justify-between px-2 text-xs text-cosmic-muted">
                    <span>Signed in as <strong className="text-gold-light">{user?.name}</strong></span>
                    <button
                      onClick={() => {
                        logout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="text-rose-400 font-medium hover:underline flex items-center gap-1"
                    >
                      <LogOut className="w-3 h-3" />
                      <span>Sign out</span>
                    </button>
                  </div>
                  <Link href="/reading" onClick={() => setIsMobileMenuOpen(false)}>
                    <GoldButton className="w-full" leftIcon={<Sparkles className="w-4 h-4" />}>
                      Enter Oracle Engine
                    </GoldButton>
                  </Link>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <VioletButton className="w-full" size="md">
                      Sign In
                    </VioletButton>
                  </Link>
                  <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                    <GoldButton className="w-full" size="md">
                      Join Ritual
                    </GoldButton>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
