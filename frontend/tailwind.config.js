// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#060b18',
          900: '#0a1128',
          800: '#0f172a',
          700: '#1e293b',
          600: '#253352',
        },
        accent: {
          orange: '#f97316',
          cyan:   '#06b6d4',
          green:  '#22c55e',
          red:    '#ef4444',
          yellow: '#f59e0b',
        },
      },
      fontFamily: {
        display: ['"DM Sans"', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      backdropBlur: { xs: '2px' },
      animation: {
        'fade-up':   'fadeUp 0.4s ease forwards',
        'pulse-slow':'pulse 3s ease-in-out infinite',
        'shimmer':   'shimmer 2s infinite',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};
