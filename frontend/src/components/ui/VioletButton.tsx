'use client';

import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface VioletButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'solid' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  className?: string;
}

export default function VioletButton({
  children,
  variant = 'outline',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}: VioletButtonProps) {
  const sizeStyles = {
    sm: 'px-3.5 py-1.5 text-xs font-medium rounded-lg gap-1.5',
    md: 'px-5 py-2.5 text-sm font-medium rounded-xl gap-2',
    lg: 'px-7 py-3.5 text-base font-semibold rounded-xl gap-2.5',
  };

  const variantStyles = {
    solid:
      'bg-gradient-to-r from-violet-light via-violet to-violet-deep text-white font-semibold shadow-violet-glow hover:shadow-[0_0_30px_rgba(124,58,237,0.6)] border border-violet-bright/50 active:scale-[0.98]',
    outline:
      'bg-indigo-panel/50 backdrop-blur-md text-lavender border border-violet/40 hover:border-violet-bright hover:bg-violet/15 hover:text-white active:scale-[0.98]',
    ghost:
      'bg-transparent text-lavender-dim hover:text-cosmic-text hover:bg-violet/10 active:scale-[0.98]',
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
          <span>Channeling...</span>
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
