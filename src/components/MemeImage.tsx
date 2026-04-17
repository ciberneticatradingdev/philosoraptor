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
      <div
        className={`
          meme-frame relative w-full
          transition-all duration-500
          ${loaded ? 'opacity-100' : 'opacity-0'}
        `}
        style={{ maxWidth: '420px' }}
      >
        {!error ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={`Philosoraptor thought ${cycleNumber}: ${phrase}`}
            className="w-full h-auto block"
            onLoad={() => setLoaded(true)}
            onError={() => {
              setError(true);
              setLoaded(true);
            }}
          />
        ) : (
          <div className="bg-meme-green-light/20 flex items-center justify-center p-8 min-h-32 rounded-lg">
            <div className="text-center">
              <div className="text-4xl mb-3">🦕</div>
              <div className="meme-text-green text-base">{phrase}</div>
            </div>
          </div>
        )}
      </div>

      {/* Meme phrase caption */}
      <div className="meme-text-green text-sm md:text-base text-center px-4">
        &ldquo;{phrase}&rdquo;
      </div>
    </div>
  );
}
