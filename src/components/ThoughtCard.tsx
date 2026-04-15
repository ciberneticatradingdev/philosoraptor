'use client';

import { useRef, useEffect, useState } from 'react';
import type { Thought } from '@/types';
import TypewriterText from './TypewriterText';
import GlitchText from './GlitchText';
import MemeImage from './MemeImage';

interface ThoughtCardProps {
  thought: Thought;
  isLatest?: boolean;
}

function formatTimestamp(cycleNumber: number, createdAt: string): string {
  const padded = String(cycleNumber).padStart(4, '0');
  const date = new Date(createdAt + (createdAt.endsWith('Z') ? '' : 'Z'));
  const iso = date.toISOString();
  return `[CYCLE_${padded} // ${iso}]`;
}

export default function ThoughtCard({ thought, isLatest = false }: ThoughtCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(isLatest);

  // Fade-in for older cards using IntersectionObserver
  useEffect(() => {
    if (isLatest) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [isLatest]);

  const timestamp = formatTimestamp(thought.cycle_number, thought.created_at);

  return (
    <div
      ref={cardRef}
      className={`
        border border-terminal-green/20 bg-black/80 p-6 md:p-8
        transition-all duration-700
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        ${isLatest ? 'border-terminal-green/50 shadow-[0_0_20px_rgba(0,255,65,0.1)]' : ''}
        relative overflow-hidden
      `}
    >
      {/* Corner decorations */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-terminal-green/60" />
      <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-terminal-green/60" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-terminal-green/60" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-terminal-green/60" />

      {/* Timestamp */}
      <div className="mb-4">
        <GlitchText
          text={timestamp}
          className={`text-xs md:text-sm font-mono ${isLatest ? 'text-terminal-amber animate-pulse-glow' : 'text-terminal-green/60'}`}
          glitchChance={isLatest ? 0.03 : 0.005}
        />
        {isLatest && (
          <span className="ml-3 text-xs font-mono text-terminal-red animate-cursor-blink uppercase tracking-widest">
            ● LIVE
          </span>
        )}
      </div>

      {/* Thought content */}
      <div className="font-mono text-sm md:text-base leading-relaxed space-y-4">
        {isLatest ? (
          <TypewriterText
            text={thought.content}
            speed={15}
            className="text-terminal-green whitespace-pre-wrap"
          />
        ) : (
          <p className="text-terminal-green/80 whitespace-pre-wrap">{thought.content}</p>
        )}
      </div>

      {/* Meme image */}
      <MemeImage
        src={thought.meme_image_path}
        phrase={thought.meme_phrase}
        cycleNumber={thought.cycle_number}
      />

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-terminal-green/10 flex items-center justify-between text-xs font-mono text-terminal-green/30">
        <span>PHILOSORAPTOR TERMINAL v2.0</span>
        <span>EOF</span>
      </div>
    </div>
  );
}
