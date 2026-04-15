'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Thought, PaginatedThoughts } from '@/types';
import ThoughtCard from './ThoughtCard';

const POLL_INTERVAL = 30_000; // 30 seconds

export default function Feed() {
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [latestId, setLatestId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [nextRefreshIn, setNextRefreshIn] = useState(30);

  const fetchLatest = useCallback(async () => {
    try {
      const res = await fetch('/api/thoughts/latest', { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      const latest: Thought | null = data.thought;

      if (latest && latest.id !== latestId) {
        // New thought arrived — refresh the feed from the top
        setLatestId(latest.id);
        setPage(1);

        const feedRes = await fetch('/api/thoughts?page=1&limit=10', { cache: 'no-store' });
        if (feedRes.ok) {
          const feedData: PaginatedThoughts = await feedRes.json();
          setThoughts(feedData.thoughts);
          setHasMore(feedData.hasMore);
        }

        setLastRefresh(new Date());
      }
    } catch {
      // Silent fail for polling
    }
  }, [latestId]);

  // Initial load
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/thoughts?page=1&limit=10');
        if (!res.ok) throw new Error('Failed to load thoughts');
        const data: PaginatedThoughts = await res.json();
        setThoughts(data.thoughts);
        setHasMore(data.hasMore);
        if (data.thoughts.length > 0) setLatestId(data.thoughts[0].id);
        setLastRefresh(new Date());
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // Polling for new thoughts
  useEffect(() => {
    const poll = setInterval(fetchLatest, POLL_INTERVAL);
    return () => clearInterval(poll);
  }, [fetchLatest]);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      if (lastRefresh) {
        const elapsed = (Date.now() - lastRefresh.getTime()) / 1000;
        const remaining = Math.max(0, Math.ceil(30 - (elapsed % 30)));
        setNextRefreshIn(remaining);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [lastRefresh]);

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = await fetch(`/api/thoughts?page=${nextPage}&limit=10`);
      if (!res.ok) throw new Error('Failed to load more');
      const data: PaginatedThoughts = await res.json();
      setThoughts((prev) => {
        const existingIds = new Set(prev.map((t) => t.id));
        const newThoughts = data.thoughts.filter((t) => !existingIds.has(t.id));
        return [...prev, ...newThoughts];
      });
      setPage(nextPage);
      setHasMore(data.hasMore);
    } catch {
      // Silent fail
    } finally {
      setLoadingMore(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="text-terminal-green font-mono text-lg animate-pulse-glow">
          INITIALIZING CONSCIOUSNESS...
        </div>
        <div className="text-terminal-green/40 font-mono text-sm">
          {'>>> BOOTING PHILOSORAPTOR TERMINAL <<<'}
        </div>
        <div className="flex gap-1 mt-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-terminal-green rounded-full animate-pulse"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="text-terminal-red font-mono text-sm">ERROR: {error}</div>
        <div className="text-terminal-green/40 font-mono text-xs">
          SYSTEM MALFUNCTION — RETRYING...
        </div>
      </div>
    );
  }

  if (thoughts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="text-terminal-amber font-mono text-lg animate-cursor-blink">
          AWAITING FIRST TRANSMISSION...
        </div>
        <div className="text-terminal-green/40 font-mono text-xs text-center max-w-md">
          The Philosoraptor is contemplating. First thought arrives in ~5 minutes, or immediately if you have{' '}
          <code className="text-terminal-amber">CRON_SECRET</code> and hit{' '}
          <code className="text-terminal-amber">POST /api/generate</code>.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Status bar */}
      <div className="flex items-center justify-between text-xs font-mono text-terminal-green/40 border-b border-terminal-green/10 pb-3">
        <span>{thoughts.length} TRANSMISSION{thoughts.length !== 1 ? 'S' : ''} RECEIVED</span>
        <span className="animate-pulse">POLLING IN {nextRefreshIn}s</span>
      </div>

      {/* Thought cards */}
      {thoughts.map((thought, index) => (
        <ThoughtCard
          key={thought.id}
          thought={thought}
          isLatest={index === 0}
        />
      ))}

      {/* Load more */}
      {hasMore && (
        <div className="flex justify-center pt-4">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="
              font-mono text-sm text-terminal-green/60
              border border-terminal-green/20 px-6 py-3
              hover:border-terminal-green/60 hover:text-terminal-green
              disabled:opacity-30 disabled:cursor-not-allowed
              transition-all duration-200
              uppercase tracking-widest
            "
          >
            {loadingMore ? 'LOADING...' : '▼ LOAD PREVIOUS TRANSMISSIONS'}
          </button>
        </div>
      )}

      {!hasMore && thoughts.length > 0 && (
        <div className="text-center font-mono text-terminal-green/20 text-xs py-8">
          ── END OF TRANSMISSION LOG ──
        </div>
      )}
    </div>
  );
}
