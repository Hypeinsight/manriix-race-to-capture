/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Brand — matches manriix.com exactly
        'brand-orange': '#fbb238',
        'brand-yellow': '#fed700',
        'brand-gold':   '#ffd700',   // site uses ffd700 on most elements
        // Dark theme — pure black just like the site
        'dark-bg':      '#000000',
        'dark-surface': '#0d0d0d',
        'dark-card':    '#141414',
        'dark-border':  'rgba(255,255,255,0.1)',
        'dark-muted':   '#8d8d8d',
        // Light theme
        'light-bg':     '#f4f4f0',
        'light-surface':'#ffffff',
        'light-card':   '#f8f8f5',
        'light-border': '#e2e2da',
        'light-muted':  '#525252',
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'flash-white': {
          '0%':   { opacity: '0.9' },
          '100%': { opacity: '0' },
        },
        'float-up': {
          '0%':   { transform: 'translateY(0)',     opacity: '1' },
          '100%': { transform: 'translateY(-64px)', opacity: '0' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 16px 2px rgba(251,178,56,0.35)' },
          '50%':      { boxShadow: '0 0 36px 8px rgba(251,178,56,0.75)' },
        },
        'shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%':      { transform: 'translateX(-6px)' },
          '40%':      { transform: 'translateX(6px)' },
          '60%':      { transform: 'translateX(-4px)' },
          '80%':      { transform: 'translateX(4px)' },
        },
        'score-pop': {
          '0%':   { transform: 'scale(0.5)', opacity: '0' },
          '50%':  { transform: 'scale(1.3)', opacity: '1' },
          '100%': { transform: 'scale(1)',   opacity: '1' },
        },
        'slide-in-right': {
          '0%':   { transform: 'translateX(40px)', opacity: '0' },
          '100%': { transform: 'translateX(0)',    opacity: '1' },
        },
        'speed-line': {
          '0%':   { transform: 'translateX(100vw)' },
          '100%': { transform: 'translateX(-100vw)' },
        },
      },
      animation: {
        'flash-white':     'flash-white 0.25s ease-out forwards',
        'float-up':        'float-up 1s ease-out forwards',
        'pulse-glow':      'pulse-glow 2s ease-in-out infinite',
        'shake':           'shake 0.35s ease-in-out',
        'score-pop':       'score-pop 0.3s ease-out forwards',
        'slide-in-right':  'slide-in-right 0.4s ease-out',
        'speed-line':      'speed-line 0.6s linear infinite',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};
