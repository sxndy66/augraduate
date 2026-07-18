"use client";

import { useEffect, useState, useCallback } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/**
 * Service Worker Registration Component
 * Registers /sw.js in production, handles updates and offline/online status.
 * Renders nothing visually — it's a headless utility component.
 */
export function ServiceWorkerRegistration() {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  const handleUpdate = useCallback(() => {
    setUpdateAvailable(true);
    // Notify the user via a custom event that the Toast/OfflineIndicator can pick up
    window.dispatchEvent(
      new CustomEvent("sw-update-available", {
        detail: { message: "A new version of AU Track is available." },
      })
    );
  }, []);

  const handleOffline = useCallback(() => {
    window.dispatchEvent(new CustomEvent("app-offline"));
  }, []);

  const handleOnline = useCallback(() => {
    window.dispatchEvent(new CustomEvent("app-online"));
  }, []);

  useEffect(() => {
    // Only register in production
    if (process.env.NODE_ENV !== "production") return;

    if (!("serviceWorker" in navigator)) return;

    let registration: ServiceWorkerRegistration | null = null;

    const register = async () => {
      try {
        registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        });

        // Listen for updates
        registration.addEventListener("updatefound", () => {
          const newWorker = registration?.installing;
          if (!newWorker) return;

          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              // New version installed and there's an existing controller → update available
              handleUpdate();
            }
          });
        });

        // Check for updates periodically (every hour)
        const updateInterval = setInterval(() => {
          registration?.update().catch(() => {
            // Silently fail — network might be offline
          });
        }, 60 * 60 * 1000);

        // Listen for controller change (new SW took over)
        navigator.serviceWorker.addEventListener("controllerchange", () => {
          // Reload to ensure the new SW controls the page
          if (registration?.waiting) {
            registration.waiting.postMessage({ type: "SKIP_WAITING" });
          }
        });

        // Listen for messages from the service worker
        navigator.serviceWorker.addEventListener("message", (event) => {
          const data = event.data;
          if (data && data.type === "SYNC_GRADES") {
            window.dispatchEvent(
              new CustomEvent("sw-sync-grades", { detail: data })
            );
          }
          if (data && data.type === "SYNC_ACTIONS") {
            window.dispatchEvent(
              new CustomEvent("sw-sync-actions", { detail: data })
            );
          }
        });

        return () => clearInterval(updateInterval);
      } catch (error) {
        console.error("[SW] Registration failed:", error);
      }
    };

    register();

    // Online/offline event listeners
    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    // Handle beforeinstallprompt for PWA install
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      window.dispatchEvent(
        new CustomEvent("beforeinstallprompt", { detail: e })
      );
    };

    const handleAppInstalled = () => {
      window.dispatchEvent(new CustomEvent("appinstalled"));
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [handleUpdate, handleOffline, handleOnline]);

  // Handle update: prompt user to refresh
  useEffect(() => {
    if (!updateAvailable) return;

    const handleConfirmUpdate = () => {
      if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
        // Tell the waiting SW to skip waiting
        navigator.serviceWorker.getRegistration().then((reg) => {
          if (reg?.waiting) {
            reg.waiting.postMessage({ type: "SKIP_WAITING" });
          }
        });
      }
      // Reload after a short delay
      setTimeout(() => window.location.reload(), 500);
    };

    // Dispatch event for toast system to show
    window.dispatchEvent(
      new CustomEvent("sw-update-ready", {
        detail: {
          message: "AU Track updated! Refresh to get the latest version.",
          action: "Refresh",
          onAction: handleConfirmUpdate,
        },
      })
    );
  }, [updateAvailable]);

  return null;
}
