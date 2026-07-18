"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface RateLimitState {
  canAct: boolean;
  remainingActions: number;
  timeUntilReset: number; // in milliseconds
  resetAt: number | null; // timestamp in ms
}

interface UseRateLimitOptions {
  maxActions: number;
  windowMs: number;
  key?: string;
}

/**
 * Rate limiting hook for client-side actions.
 * Tracks action count per time window and prevents spam on forms and uploads.
 *
 * @param options Configuration object
 * @param options.maxActions Maximum actions allowed in the window
 * @param options.windowMs Time window in milliseconds
 * @param options.key Optional storage key for persistence across reloads
 * @returns { canAct, remainingActions, timeUntilReset, resetAt, recordAction, reset }
 */
export function useRateLimit({
  maxActions,
  windowMs,
  key,
}: UseRateLimitOptions) {
  const actionsRef = useRef<number[]>([]);
  const [state, setState] = useState<RateLimitState>({
    canAct: true,
    remainingActions: maxActions,
    timeUntilReset: 0,
    resetAt: null,
  });

  const storageKey = key ? `au-track-ratelimit-${key}` : null;

  // Load persisted state on mount
  useEffect(() => {
    if (storageKey) {
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const timestamps: number[] = JSON.parse(stored);
          const now = Date.now();
          const valid = timestamps.filter((ts) => now - ts < windowMs);
          actionsRef.current = valid;
          if (valid.length !== timestamps.length) {
            localStorage.setItem(storageKey, JSON.stringify(valid));
          }
        }
      } catch {
        // Ignore parse errors
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Tick to update countdown
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const valid = actionsRef.current.filter((ts) => now - ts < windowMs);
      actionsRef.current = valid;

      const remaining = maxActions - valid.length;
      const oldestAction = valid.length > 0 ? Math.min(...valid) : null;
      const resetAt = oldestAction !== null ? oldestAction + windowMs : null;
      const timeUntilReset = resetAt !== null ? Math.max(0, resetAt - now) : 0;

      setState({
        canAct: remaining > 0,
        remainingActions: remaining,
        timeUntilReset,
        resetAt,
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [maxActions, windowMs]);

  const recordAction = useCallback(() => {
    const now = Date.now();
    const valid = actionsRef.current.filter((ts) => now - ts < windowMs);
    valid.push(now);
    actionsRef.current = valid;

    if (storageKey) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(valid));
      } catch {
        // Ignore storage errors
      }
    }

    const remaining = maxActions - valid.length;
    const oldestAction = valid.length > 0 ? Math.min(...valid) : null;
    const resetAt = oldestAction !== null ? oldestAction + windowMs : null;

    setState({
      canAct: remaining > 0,
      remainingActions: remaining,
      timeUntilReset: resetAt !== null ? Math.max(0, resetAt - now) : 0,
      resetAt,
    });

    return remaining > 0;
  }, [maxActions, windowMs, storageKey]);

  const reset = useCallback(() => {
    actionsRef.current = [];
    if (storageKey) {
      try {
        localStorage.removeItem(storageKey);
      } catch {
        // Ignore
      }
    }
    setState({
      canAct: true,
      remainingActions: maxActions,
      timeUntilReset: 0,
      resetAt: null,
    });
  }, [maxActions, storageKey]);

  return {
    ...state,
    recordAction,
    reset,
  };
}
