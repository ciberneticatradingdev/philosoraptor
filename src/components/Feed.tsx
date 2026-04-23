'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Thought, PaginatedThoughts } from '@/types';
import ThoughtCard from './ThoughtCard';
import { API_BASE } from '@/lib/api';

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
      const res = await fetch(`${API_BASE}/api/thoughts/latest`, { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      const latest: Thought | null = data.thought;

      if (latest && latest.id !== latestId) {
        setLatestId(latest.id);
        setPage(1);

        const feedRes = await fetch(`${API_BASE}/api/thoughts?page=1&limit=10`, { cache: 'no-store' });
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
        const res = await fetch(`${API_BASE}/api/thoughts?page=1&limit=10`);
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
      const res = await fetch(`${API_BASE}/api/thoughts?page=${nextPage}&limit=10`);
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
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="text-6xl animate-bounce-subtle">🦕</div>
        <div className="text-meme-green-dark font-bold text-xl">
          Philosoraptor is thinking...
        </div>
        <div className="thinking-dots flex gap-2 mt-2">
          <span className="w-3 h-3 bg-meme-green-mid rounded-full inline-block" />
          <span className="w-3 h-3 bg-meme-green-mid rounded-full inline-block" />
          <span className="w-3 h-3 bg-meme-green-mid rounded-full inline-block" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="text-5xl">😵</div>
        <div className="text-red-600 font-semibold text-lg">{error}</div>
        <p className="text-meme-text-light text-sm">
          Even dinosaurs have bad days. Try refreshing.
        </p>
      </div>
    );
  }

  if (thoughts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="text-6xl">🤔</div>
        <div className="text-meme-green-dark font-bold text-xl">
          Awaiting first thought...
        </div>
        <p className="text-meme-text-light text-sm text-center max-w-md">
          The Philosoraptor is contemplating. First thought arrives in ~5 minutes.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status bar */}
      <div className="flex items-center justify-between text-sm text-meme-text-light px-1">
        <span className="font-medium">
          🦕 {thoughts.length} thought{thoughts.length !== 1 ? 's' : ''} so far
        </span>
        <span className="text-xs bg-meme-green-light/20 text-meme-green-dark px-3 py-1 rounded-full font-medium">
          Next check in {nextRefreshIn}s
        </span>
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
              font-bold text-sm text-white
              bg-meme-green-mid hover:bg-meme-green-dark
              px-8 py-3 rounded-full
              disabled:opacity-40 disabled:cursor-not-allowed
              transition-all duration-200
              shadow-md hover:shadow-lg
              active:scale-95
            "
          >
            {loadingMore ? '🦕 Loading...' : '🔽 Load older thoughts'}
          </button>
        </div>
      )}

      {!hasMore && thoughts.length > 0 && (
        <div className="text-center text-meme-text-light text-sm py-8 italic">
          🦕 That&apos;s all the thoughts... for now.
        </div>
      )}
    </div>
  );
}
