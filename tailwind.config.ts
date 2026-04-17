import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        impact: ['Impact', 'Haettenschweiler', 'Arial Narrow Bold', 'sans-serif'],
        body: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        meme: {
          'green-light': '#7CB668',
          'green-mid': '#5B8C4A',
          'green-dark': '#3A6B3A',
          'green-darker': '#2E5A2E',
          'green-bg': '#E8F5E9',
          'green-card': '#F1F8E9',
          'text-dark': '#1B3A1B',
          'text-mid': '#3D6B3D',
          'text-light': '#5A8A5A',
          'accent': '#4A7C3F',
          'highlight': '#93C47D',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
        'think-pulse': 'thinkPulse 2s ease-in-out infinite',
        'cursor-blink': 'cursorBlink 1s step-end infinite',
        'bounce-subtle': 'bounceSub 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        thinkPulse: {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
        cursorBlink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        bounceSub: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
      },
      backgroundImage: {
        'meme-quad': 'conic-gradient(from 0deg at 50% 50%, #7CB668 0deg, #7CB668 90deg, #5B8C4A 90deg, #5B8C4A 180deg, #7CB668 180deg, #7CB668 270deg, #5B8C4A 270deg, #5B8C4A 360deg)',
      },
    },
  },
  plugins: [],
};

export default config;
