import React, { ReactNode } from 'react';

interface EyebrowProps {
  children: ReactNode;
  variant?: 'gold' | 'violet' | 'lavender';
  className?: string;
  dot?: boolean;
}

export default function Eyebrow({
  children,
  variant = 'gold',
  className = '',
  dot = true,
}: EyebrowProps) {
  const variantStyles = {
    gold: 'text-gold-light border-gold/30 bg-gold/10',
    violet: 'text-violet-bright border-violet/30 bg-violet/10',
    lavender: 'text-lavender border-lavender/30 bg-lavender/10',
  };

  const dotStyles = {
    gold: 'bg-gold shadow-[0_0_8px_#D4AF37]',
    violet: 'bg-violet-light shadow-[0_0_8px_#8B5CF6]',
    lavender: 'bg-lavender shadow-[0_0_8px_#C9B8F0]',
  };

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[11px] font-semibold tracking-[0.2em] uppercase font-sans ${variantStyles[variant]} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${dotStyles[variant]}`} />}
      <span>{children}</span>
    </div>
  );
}
