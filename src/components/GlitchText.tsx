'use client';

import { useState, useEffect } from 'react';

interface GlitchTextProps {
  text: string;
  className?: string;
  glitchChance?: number; // 0-1, probability of glitch per render
}

const GLITCH_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?/\\~`ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

function randomChar() {
  return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
}

export default function GlitchText({ text, className = '', glitchChance = 0.02 }: GlitchTextProps) {
  const [rendered, setRendered] = useState(text);
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    setRendered(text);
  }, [text]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < glitchChance) {
        setIsGlitching(true);
        // Apply random character replacements
        const chars = text.split('');
        const numGlitches = Math.floor(Math.random() * 4) + 1;
        for (let i = 0; i < numGlitches; i++) {
          const pos = Math.floor(Math.random() * chars.length);
          if (chars[pos] !== ' ' && chars[pos] !== '\n') {
            chars[pos] = randomChar();
          }
        }
        setRendered(chars.join(''));

        // Restore after brief moment
        setTimeout(() => {
          setRendered(text);
          setIsGlitching(false);
        }, 80);
      }
    }, 200);

    return () => clearInterval(interval);
  }, [text, glitchChance]);

  return (
    <span
      className={`${className} ${isGlitching ? 'text-terminal-cyan' : ''}`}
      style={isGlitching ? { textShadow: '2px 0 #ff0040, -2px 0 #00ffff' } : undefined}
    >
      {rendered}
    </span>
  );
}
