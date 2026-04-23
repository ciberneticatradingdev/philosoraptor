'use client';

import { useRef, useEffect, useState } from 'react';
import type { Thought } from '@/types';
import TypewriterText from './TypewriterText';
import MemeImage from './MemeImage';
import { API_BASE } from '@/lib/api';

interface ThoughtCardProps {
  thought: Thought;
  isLatest?: boolean;
}

function formatTimestamp(cycleNumber: number, createdAt: string): string {
  const padded = String(cycleNumber).padStart(4, '0');
  const date = new Date(createdAt + (createdAt.endsWith('Z') ? '' : 'Z'));
  const timeStr = date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
  return `Thought #${padded} · ${timeStr}`;
}

function timeAgo(createdAt: string): string {
  const date = new Date(createdAt + (createdAt.endsWith('Z') ? '' : 'Z'));
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
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
  const ago = timeAgo(thought.created_at);

  return (
    <div
      ref={cardRef}
      className={`
        thought-card
        bg-white/80 backdrop-blur-sm rounded-2xl p-6 md:p-8
        border transition-all duration-700
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        ${isLatest
          ? 'border-meme-green-mid shadow-lg ring-2 ring-meme-green-light/30'
          : 'border-meme-green-light/30 shadow-sm'
        }
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="" className="w-6 h-6 rounded" />
          <span className="text-sm font-semibold text-meme-green-dark">
            {timestamp}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isLatest && (
            <span className="bg-meme-green-mid text-white text-xs font-bold px-2.5 py-0.5 rounded-full animate-think-pulse">
              ● LATEST
            </span>
          )}
          <span className="text-xs text-meme-text-light">{ago}</span>
        </div>
      </div>

      {/* Thought content */}
      <div className="text-sm md:text-base leading-relaxed space-y-4">
        {isLatest ? (
          <TypewriterText
            text={thought.content}
            speed={15}
            className="text-meme-text-dark whitespace-pre-wrap"
          />
        ) : (
          <p className="text-meme-text-dark/85 whitespace-pre-wrap">{thought.content}</p>
        )}
      </div>

      {/* Meme image */}
      <MemeImage
        src={`${API_BASE}${thought.meme_image_path.startsWith('/api/memes/') ? thought.meme_image_path : thought.meme_image_path.replace('/memes/', '/api/memes/')}`}
        phrase={thought.meme_phrase}
        cycleNumber={thought.cycle_number}
      />
    </div>
  );
}
