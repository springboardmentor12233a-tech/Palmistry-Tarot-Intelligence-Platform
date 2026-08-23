'use client';

import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface GoldButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onAnimationStart' | 'onDragStart' | 'onDragEnd' | 'onDrag'> {
  children: ReactNode;
  variant?: 'solid' | 'outline' | 'glow';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  className?: string;
  asMotion?: boolean;
}

export default function GoldButton({
  children,
  variant = 'solid',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}: GoldButtonProps) {
  const sizeStyles = {
    sm: 'px-3.5 py-1.5 text-xs font-semibold rounded-lg gap-1.5',
    md: 'px-5 py-2.5 text-sm font-semibold rounded-xl gap-2',
    lg: 'px-7 py-3.5 text-base font-semibold rounded-xl gap-2.5',
  };

  const variantStyles = {
    solid:
      'bg-gradient-to-r from-[#FDE047] via-[#D4AF37] to-[#B8860B] text-midnight-deep font-bold shadow-gold-glow hover:shadow-gold-glow-lg border border-gold-bright/60 active:scale-[0.98]',
    outline:
      'bg-midnight-surface/60 backdrop-blur-md text-gold-light border border-gold/40 hover:border-gold hover:bg-gold/10 hover:text-gold-bright active:scale-[0.98]',
    glow:
      'bg-midnight-elevated text-gold-light border border-gold/50 shadow-gold-glow hover:border-gold-bright hover:shadow-gold-glow-lg active:scale-[0.98]',
  };

  return (
    <button
      className={`relative inline-flex items-center justify-center font-sans tracking-wide transition-all duration-300 ease-out select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none ${
        sizeStyles[size]
      } ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-current" />
          <span>Transmuting...</span>
        </>
      ) : (
        <>
          {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
}
