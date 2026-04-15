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
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
      },
      colors: {
        terminal: {
          black: '#000000',
          green: '#00ff41',
          'green-dim': '#00cc33',
          'green-glow': '#00ff4180',
          amber: '#ffb000',
          'amber-dim': '#cc8800',
          cyan: '#00ffff',
          red: '#ff0040',
          'red-dim': '#cc0033',
          gray: '#333333',
          'gray-light': '#555555',
        },
      },
      animation: {
        'crt-flicker': 'crt-flicker 0.15s infinite',
        'scanline': 'scanline 8s linear infinite',
        'glitch': 'glitch 2s infinite',
        'typewriter': 'typewriter 3s steps(40) forwards',
        'cursor-blink': 'cursor-blink 1s step-end infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'flicker-text': 'flicker-text 5s infinite',
      },
      keyframes: {
        'crt-flicker': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.97' },
        },
        'scanline': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        'glitch': {
          '0%, 90%, 100%': { transform: 'translate(0)' },
          '92%': { transform: 'translate(-2px, 1px)', color: '#ff0040' },
          '94%': { transform: 'translate(2px, -1px)', color: '#00ffff' },
          '96%': { transform: 'translate(-1px, 2px)' },
          '98%': { transform: 'translate(1px, -1px)' },
        },
        'typewriter': {
          'from': { width: '0' },
          'to': { width: '100%' },
        },
        'cursor-blink': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        'pulse-glow': {
          '0%, 100%': { textShadow: '0 0 5px #00ff41, 0 0 10px #00ff41' },
          '50%': { textShadow: '0 0 10px #00ff41, 0 0 20px #00ff41, 0 0 30px #00ff41' },
        },
        'flicker-text': {
          '0%, 19%, 21%, 23%, 25%, 54%, 56%, 100%': { opacity: '1' },
          '20%, 24%, 55%': { opacity: '0.4' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
