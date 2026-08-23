import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        midnight: {
          DEFAULT: '#0A0A18',
          deep: '#060610',
          elevated: '#0D0B1F',
          surface: '#110E26',
        },
        indigo: {
          panel: '#161232',
          card: '#1C173E',
          border: 'rgba(124, 58, 237, 0.25)',
          glow: 'rgba(124, 58, 237, 0.4)',
        },
        violet: {
          DEFAULT: '#7C3AED',
          light: '#8B5CF6',
          bright: '#A78BFA',
          deep: '#5B21B6',
          glow: 'rgba(139, 92, 246, 0.35)',
        },
        gold: {
          DEFAULT: '#D4AF37',
          light: '#E8C468',
          bright: '#FDE047',
          deep: '#B8860B',
          glow: 'rgba(212, 175, 55, 0.35)',
          gradient: 'linear-gradient(135deg, #FDE047 0%, #D4AF37 50%, #B8860B 100%)',
        },
        lavender: {
          DEFAULT: '#C9B8F0',
          soft: '#DDD2F7',
          dim: '#9F8DC9',
          faint: 'rgba(201, 184, 240, 0.15)',
        },
        cosmic: {
          text: '#F5F3FA',
          muted: '#A59EB7',
          subtle: '#6F6885',
        },
      },
      fontFamily: {
        display: ['var(--font-cinzel)', 'var(--font-cormorant)', 'Cinzel', 'Playfair Display', 'serif'],
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'radial-glow': 'radial-gradient(circle at 50% 50%, rgba(124, 58, 237, 0.18) 0%, rgba(10, 10, 24, 0) 70%)',
        'gold-shimmer': 'linear-gradient(135deg, rgba(212,175,55,0.2) 0%, rgba(124,58,237,0.1) 50%, rgba(212,175,55,0.05) 100%)',
        'gold-btn': 'linear-gradient(135deg, #F5D77F 0%, #D4AF37 50%, #B8860B 100%)',
        'violet-btn': 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 50%, #5B21B6 100%)',
      },
      boxShadow: {
        'gold-glow': '0 0 25px -5px rgba(212, 175, 55, 0.4), 0 0 10px -2px rgba(212, 175, 55, 0.2)',
        'gold-glow-lg': '0 0 40px -5px rgba(212, 175, 55, 0.5), 0 0 15px 0px rgba(232, 196, 104, 0.3)',
        'violet-glow': '0 0 25px -5px rgba(124, 58, 237, 0.4), 0 0 10px -2px rgba(139, 92, 246, 0.2)',
        'cosmic-card': '0 8px 32px 0 rgba(6, 6, 16, 0.6), inset 0 0 0 1px rgba(212, 175, 55, 0.15)',
        'cosmic-card-hover': '0 12px 48px 0 rgba(124, 58, 237, 0.25), inset 0 0 0 1px rgba(212, 175, 55, 0.35)',
      },
      animation: {
        'float-slow': 'float 8s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 4s ease-in-out infinite',
        'scan-line': 'scanLine 3s cubic-bezier(0.4, 0, 0.2, 1) infinite',
        'rotate-slow': 'spin 60s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
        scanLine: {
          '0%': { top: '0%', opacity: '0.8' },
          '50%': { top: '95%', opacity: '1' },
          '100%': { top: '0%', opacity: '0.8' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
