"use client";

import { useState, useEffect, useCallback } from "react";

interface OnlineStatus {
  isOnline: boolean;
  wasOffline: boolean;
}

/**
 * useOnlineStatus — React hook for tracking online/offline status.
 * Returns { isOnline, wasOffline }.
 * - isOnline: current connectivity status
 * - wasOffline: true if the app was offline at some point during this session
 * Listens to online/offline events and persists state across re-renders.
 */
export function useOnlineStatus(): OnlineStatus {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [wasOffline, setWasOffline] = useState<boolean>(false);

  const handleOnline = useCallback(() => {
    setIsOnline(true);
  }, []);

  const handleOffline = useCallback(() => {
    setIsOnline(false);
    setWasOffline(true);
  }, []);

  useEffect(() => {
    // Initialize from navigator
    if (typeof navigator !== "undefined") {
      setIsOnline(navigator.onLine);
      if (!navigator.onLine) {
        setWasOffline(true);
      }
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Also listen to custom events dispatched by the SW registration component
    const handleAppOnline = () => setIsOnline(true);
    const handleAppOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
    };

    window.addEventListener("app-online", handleAppOnline);
    window.addEventListener("app-offline", handleAppOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("app-online", handleAppOnline);
      window.removeEventListener("app-offline", handleAppOffline);
    };
  }, [handleOnline, handleOffline]);

  return { isOnline, wasOffline };
}
