"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getPendingActions,
  clearPendingActions,
  removePendingAction,
  type PendingAction,
} from "@/lib/offline-storage";
import { useOnlineStatus } from "@/lib/hooks/useOnlineStatus";

interface UsePendingSyncResult {
  pendingCount: number;
  syncAll: () => Promise<{ success: number; failed: number }>;
  clearPending: () => void;
  isSyncing: boolean;
}

/**
 * usePendingSync — Hook for tracking and syncing offline actions.
 * Stores pending actions in localStorage when offline.
 * Syncs to Supabase when back online.
 *
 * The syncFn prop should be a function that takes a PendingAction
 * and returns a Promise<boolean> (true = success, false = failure).
 */
export function usePendingSync(
  syncFn: (action: PendingAction) => Promise<boolean>
): UsePendingSyncResult {
  const { isOnline, wasOffline } = useOnlineStatus();
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Refresh pending count on mount and when online status changes
  const refreshCount = useCallback(() => {
    const pending = getPendingActions();
    setPendingCount(pending.length);
  }, []);

  useEffect(() => {
    refreshCount();
  }, [refreshCount]);

  // Listen for background sync events from the service worker
  useEffect(() => {
    const handleSyncGrades = () => {
      if (isOnline) {
        syncAll();
      }
    };
    const handleSyncActions = () => {
      if (isOnline) {
        syncAll();
      }
    };

    window.addEventListener("sw-sync-grades", handleSyncGrades);
    window.addEventListener("sw-sync-actions", handleSyncActions);

    return () => {
      window.removeEventListener("sw-sync-grades", handleSyncGrades);
      window.removeEventListener("sw-sync-actions", handleSyncActions);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline]);

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && wasOffline) {
      syncAll();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline, wasOffline]);

  const syncAll = useCallback(async (): Promise<{ success: number; failed: number }> => {
    const pending = getPendingActions();
    if (pending.length === 0) {
      setPendingCount(0);
      return { success: 0, failed: 0 };
    }

    setIsSyncing(true);
    let success = 0;
    let failed = 0;

    for (const action of pending) {
      try {
        const result = await syncFn(action);
        if (result) {
          removePendingAction(action.id);
          success++;
        } else {
          failed++;
        }
      } catch (error) {
        console.error(`[usePendingSync] Sync failed for action ${action.id}:`, error);
        failed++;
      }
    }

    // Update count after sync
    const remaining = getPendingActions();
    setPendingCount(remaining.length);
    setIsSyncing(false);

    // Dispatch event for UI components
    window.dispatchEvent(
      new CustomEvent("sync-complete", {
        detail: { success, failed, total: pending.length },
      })
    );

    return { success, failed };
  }, [syncFn]);

  const clearPending = useCallback(() => {
    clearPendingActions();
    setPendingCount(0);
  }, []);

  return { pendingCount, syncAll, clearPending, isSyncing };
}
