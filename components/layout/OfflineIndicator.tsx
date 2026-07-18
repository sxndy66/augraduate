"use client";

import { useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

/**
 * Offline Status Indicator
 * Shows a non-intrusive banner when the app goes offline,
 * and a brief "Back online" confirmation when connectivity returns.
 */
export function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(false);
  const [showBackOnline, setShowBackOnline] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  const handleOffline = useCallback(() => {
    setIsOffline(true);
    setWasOffline(true);
  }, []);

  const handleOnline = useCallback(() => {
    setIsOffline(false);
    if (wasOffline) {
      setShowBackOnline(true);
      const timer = setTimeout(() => setShowBackOnline(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [wasOffline]);

  useEffect(() => {
    // Initialize from current status
    if (typeof navigator !== "undefined") {
      setIsOffline(!navigator.onLine);
    }

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    // Also listen to custom events from the SW registration component
    const handleAppOffline = () => handleOffline();
    const handleAppOnline = () => handleOnline();

    window.addEventListener("app-offline", handleAppOffline);
    window.addEventListener("app-online", handleAppOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("app-offline", handleAppOffline);
      window.removeEventListener("app-online", handleAppOnline);
    };
  }, [handleOffline, handleOnline]);

  // Don't render anything if online and no "back online" message
  if (!isOffline && !showBackOnline) return null;

  return (
    <>
      {/* Offline banner — persistent while offline */}
      {isOffline && (
        <div
          className={cn(
            "fixed top-0 left-0 right-0 z-[60]",
            "animate-in slide-in-from-top duration-300"
          )}
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center justify-center gap-2 bg-amber-500/95 px-4 py-2 text-sm font-medium text-white shadow-lg backdrop-blur-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5M2 12l10 5 10-5" opacity="0.5" />
            </svg>
            <span>You&apos;re offline — changes will sync when you reconnect</span>
            <div className="ml-1 flex items-center gap-1">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/80" />
            </div>
          </div>
        </div>
      )}

      {/* Back online toast — temporary */}
      {showBackOnline && !isOffline && (
        <div
          className={cn(
            "fixed top-4 left-1/2 z-[60] -translate-x-1/2",
            "animate-in slide-in-from-top-4 fade-in duration-300"
          )}
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/95 px-4 py-2 text-sm font-medium text-white shadow-xl backdrop-blur-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
              <path d="M5 12.5l5 5L20 7" />
            </svg>
            <span>Back online — syncing your data</span>
          </div>
        </div>
      )}
    </>
  );
}
