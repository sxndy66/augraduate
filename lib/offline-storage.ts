/**
 * Offline Data Storage Utility
 * Manages localStorage-based caching for offline support.
 * Used for caching grades, notes, arrears locally when offline.
 */

const PREFIX = "au-track:";
const PENDING_PREFIX = "au-track:pending:";

export interface PendingAction {
  id: string;
  type: "save" | "update" | "delete";
  entity: "grade" | "note" | "arrear" | "profile" | "settings";
  data: Record<string, unknown>;
  timestamp: number;
  retries: number;
}

interface StoredItem<T> {
  data: T;
  timestamp: number;
}

/**
 * Save data to localStorage with a timestamp.
 * @param key - Storage key (will be prefixed)
 * @param data - Data to store
 */
export function saveOffline<T>(key: string, data: T): void {
  try {
    const item: StoredItem<T> = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(`${PREFIX}${key}`, JSON.stringify(item));
  } catch (error) {
    console.error(`[offline-storage] Failed to save "${key}":`, error);
    // If quota exceeded, try to clear old pending actions
    if (error instanceof DOMException && error.name === "QuotaExceededError") {
      clearOldPendingActions(10);
      try {
        const item: StoredItem<T> = { data, timestamp: Date.now() };
        localStorage.setItem(`${PREFIX}${key}`, JSON.stringify(item));
      } catch {
        // Give up silently
      }
    }
  }
}

/**
 * Retrieve data from localStorage.
 * @param key - Storage key (will be prefixed)
 * @returns The stored data or null if not found / expired
 */
export function getOffline<T>(key: string, maxAgeMs?: number): T | null {
  try {
    const raw = localStorage.getItem(`${PREFIX}${key}`);
    if (!raw) return null;

    const item: StoredItem<T> = JSON.parse(raw);

    // Check expiration if maxAge is provided
    if (maxAgeMs !== undefined) {
      const age = Date.now() - item.timestamp;
      if (age > maxAgeMs) {
        localStorage.removeItem(`${PREFIX}${key}`);
        return null;
      }
    }

    return item.data;
  } catch (error) {
    console.error(`[offline-storage] Failed to read "${key}":`, error);
    return null;
  }
}

/**
 * Remove an item from localStorage.
 * @param key - Storage key (will be prefixed)
 */
export function removeOffline(key: string): void {
  try {
    localStorage.removeItem(`${PREFIX}${key}`);
  } catch (error) {
    console.error(`[offline-storage] Failed to remove "${key}":`, error);
  }
}

/**
 * Add a pending action to be synced later.
 * @param action - The pending action to store
 */
export function addPendingAction(action: Omit<PendingAction, "id" | "timestamp" | "retries">): string {
  const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  const fullAction: PendingAction = {
    ...action,
    id,
    timestamp: Date.now(),
    retries: 0,
  };

  try {
    localStorage.setItem(`${PENDING_PREFIX}${id}`, JSON.stringify(fullAction));
  } catch (error) {
    console.error("[offline-storage] Failed to add pending action:", error);
    if (error instanceof DOMException && error.name === "QuotaExceededError") {
      clearOldPendingActions(10);
      try {
        localStorage.setItem(`${PENDING_PREFIX}${id}`, JSON.stringify(fullAction));
      } catch {
        // Give up
      }
    }
  }

  return id;
}

/**
 * Get all pending sync actions, sorted by timestamp (oldest first).
 */
export function getPendingActions(): PendingAction[] {
  const actions: PendingAction[] = [];

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith(PENDING_PREFIX)) continue;

      try {
        const raw = localStorage.getItem(key);
        if (!raw) continue;
        const action: PendingAction = JSON.parse(raw);
        actions.push(action);
      } catch {
        // Skip malformed entries
      }
    }
  } catch (error) {
    console.error("[offline-storage] Failed to get pending actions:", error);
  }

  // Sort by timestamp ascending (oldest first for sync priority)
  actions.sort((a, b) => a.timestamp - b.timestamp);
  return actions;
}

/**
 * Remove a specific pending action by ID.
 */
export function removePendingAction(id: string): void {
  try {
    localStorage.removeItem(`${PENDING_PREFIX}${id}`);
  } catch (error) {
    console.error(`[offline-storage] Failed to remove pending action ${id}:`, error);
  }
}

/**
 * Clear all pending sync actions.
 */
export function clearPendingActions(): void {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(PENDING_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));
  } catch (error) {
    console.error("[offline-storage] Failed to clear pending actions:", error);
  }
}

/**
 * Remove the oldest N pending actions (for quota management).
 */
function clearOldPendingActions(count: number): void {
  const actions = getPendingActions();
  const toRemove = actions.slice(0, count);
  toRemove.forEach((action) => removePendingAction(action.id));
}

/**
 * Increment retry count for a pending action.
 * If retries exceed maxRetries, the action is removed.
 */
export function incrementRetry(id: string, maxRetries: number = 5): boolean {
  try {
    const raw = localStorage.getItem(`${PENDING_PREFIX}${id}`);
    if (!raw) return false;

    const action: PendingAction = JSON.parse(raw);
    action.retries += 1;

    if (action.retries >= maxRetries) {
      removePendingAction(id);
      return false;
    }

    localStorage.setItem(`${PENDING_PREFIX}${id}`, JSON.stringify(action));
    return true;
  } catch {
    return false;
  }
}

/**
 * Get the count of pending actions without loading all data.
 */
export function getPendingCount(): number {
  let count = 0;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(PENDING_PREFIX)) {
        count++;
      }
    }
  } catch {
    // Ignore
  }
  return count;
}

/**
 * Check if there are any pending actions.
 */
export function hasPendingActions(): boolean {
  return getPendingCount() > 0;
}

/**
 * Get all offline-cached keys (non-pending).
 */
export function getOfflineKeys(): string[] {
  const keys: string[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(PREFIX) && !key.startsWith(PENDING_PREFIX)) {
        keys.push(key.substring(PREFIX.length));
      }
    }
  } catch {
    // Ignore
  }
  return keys;
}

/**
 * Clear all offline-cached data (non-pending).
 */
export function clearOfflineCache(): void {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(PREFIX) && !key.startsWith(PENDING_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));
  } catch (error) {
    console.error("[offline-storage] Failed to clear offline cache:", error);
  }
}
