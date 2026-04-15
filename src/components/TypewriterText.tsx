'use client';

import { useState, useEffect, useRef } from 'react';

interface TypewriterTextProps {
  text: string;
  speed?: number; // ms per character
  className?: string;
  onComplete?: () => void;
}

export default function TypewriterText({
  text,
  speed = 18,
  className = '',
  onComplete,
}: TypewriterTextProps) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const indexRef = useRef(0);
  const prevTextRef = useRef('');

  useEffect(() => {
    if (text === prevTextRef.current) return;
    prevTextRef.current = text;
    indexRef.current = 0;
    setDisplayed('');
    setDone(false);

    const interval = setInterval(() => {
      indexRef.current += 1;
      setDisplayed(text.slice(0, indexRef.current));

      if (indexRef.current >= text.length) {
        clearInterval(interval);
        setDone(true);
        onComplete?.();
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, onComplete]);

  return (
    <span className={className}>
      {displayed}
      {!done && (
        <span className="inline-block w-2 h-4 bg-terminal-green animate-cursor-blink ml-0.5 align-middle" />
      )}
    </span>
  );
}
