'use client';

import { useState } from 'react';

interface MemeImageProps {
  src: string;
  phrase: string;
  cycleNumber: number;
}

export default function MemeImage({ src, phrase, cycleNumber }: MemeImageProps) {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="mt-6 flex flex-col items-center gap-3">
      <div className="text-terminal-amber text-xs font-mono opacity-60 uppercase tracking-widest">
        ── TRANSMISSION IMAGE ──
      </div>
      <div
        className={`
          relative border border-terminal-green/30 overflow-hidden
          transition-all duration-700 w-full
          ${loaded ? 'opacity-100' : 'opacity-0'}
        `}
        style={{ maxWidth: '420px' }}
      >
        {!error ? (
          // Plain img tag to avoid Next.js Image optimization config requirements
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={`Philosoraptor cycle ${cycleNumber}: ${phrase}`}
            className="w-full h-auto block"
            onLoad={() => setLoaded(true)}
            onError={() => {
              setError(true);
              setLoaded(true);
            }}
          />
        ) : (
          <div className="bg-terminal-gray flex items-center justify-center p-8 min-h-32">
            <div className="text-center font-mono">
              <div className="text-4xl mb-3">🦕</div>
              <div className="text-terminal-amber text-sm">{phrase}</div>
            </div>
          </div>
        )}

        {/* CRT scanline overlay on image */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,65,0.06) 2px, rgba(0,255,65,0.06) 4px)',
          }}
        />
      </div>
      <div className="text-terminal-green/50 text-xs font-mono italic text-center px-4">
        {`"${phrase}"`}
      </div>
    </div>
  );
}
