"use client";

import { useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "au-track-install-dismissed";
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * PWA Install Prompt Component
 * Shows a glassmorphism install banner when the browser fires beforeinstallprompt.
 * Dismissable with localStorage persistence (7-day cooldown).
 */
export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  // Check if already installed or previously dismissed
  useEffect(() => {
    // Check if running in standalone mode (already installed)
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    // Check iOS standalone
    if ((window.navigator as any).standalone === true) {
      setIsInstalled(true);
      return;
    }

    // Check dismiss timestamp
    const dismissedAt = localStorage.getItem(DISMISS_KEY);
    if (dismissedAt) {
      const elapsed = Date.now() - parseInt(dismissedAt, 10);
      if (elapsed < DISMISS_DURATION) return;
    }
  }, []);

  const handleBeforeInstallPrompt = useCallback((e: Event) => {
    e.preventDefault();
    const promptEvent = e as BeforeInstallPromptEvent;
    setDeferredPrompt(promptEvent);

    // Only show if not dismissed recently
    const dismissedAt = localStorage.getItem(DISMISS_KEY);
    if (dismissedAt) {
      const elapsed = Date.now() - parseInt(dismissedAt, 10);
      if (elapsed < DISMISS_DURATION) return;
    }

    // Small delay for better UX
    setTimeout(() => setShowPrompt(true), 2000);
  }, []);

  const handleAppInstalled = useCallback(() => {
    setIsInstalled(true);
    setShowPrompt(false);
    setDeferredPrompt(null);
    localStorage.removeItem(DISMISS_KEY);
  }, []);

  useEffect(() => {
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [handleBeforeInstallPrompt, handleAppInstalled]);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;

    setIsInstalling(true);
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setIsInstalled(true);
      } else {
        // User dismissed — set cooldown
        localStorage.setItem(DISMISS_KEY, Date.now().toString());
      }
    } catch (error) {
      console.error("[InstallPrompt] Install failed:", error);
    } finally {
      setDeferredPrompt(null);
      setShowPrompt(false);
      setIsInstalling(false);
    }
  }, [deferredPrompt]);

  const handleDismiss = useCallback(() => {
    setShowPrompt(false);
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
  }, []);

  if (isInstalled || !showPrompt || !deferredPrompt) return null;

  return (
    <div
      className={cn(
        "fixed bottom-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2",
        "animate-in slide-in-from-bottom-4 duration-300"
      )}
      role="dialog"
      aria-label="Install AU Track"
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border border-white/10",
          "bg-navy-900/80 backdrop-blur-xl shadow-2xl shadow-electric-blue/10",
          "p-4 sm:p-5"
        )}
      >
        {/* Gradient accent */}
        <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-electric-blue/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-royal-indigo/20 blur-3xl" />

        <div className="relative flex items-start gap-3">
          {/* Icon */}
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-electric-blue to-royal-indigo shadow-lg shadow-electric-blue/30">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 10L2 7l10-3 10 3-10 3z" />
              <path d="M6 9v5c0 1 2.5 3 6 3s6-2 6-3V9" />
              <path d="M22 7v6" />
            </svg>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-white">
              Install AU Track
            </h3>
            <p className="mt-0.5 text-xs text-gray-400 leading-relaxed">
              Add to your home screen for quick access to your CGPA, grades, and exam alerts — even offline.
            </p>

            {/* Actions */}
            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={handleInstall}
                disabled={isInstalling}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium",
                  "bg-electric-blue text-white transition-all",
                  "hover:bg-electric-blue/90 active:scale-95",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                {isInstalling ? (
                  <>
                    <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Installing…
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" />
                    </svg>
                    Install App
                  </>
                )}
              </button>
              <button
                onClick={handleDismiss}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-400 transition-colors hover:text-gray-200"
              >
                Not now
              </button>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={handleDismiss}
            aria-label="Dismiss install prompt"
            className="shrink-0 rounded-md p-1 text-gray-500 transition-colors hover:text-gray-300"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
