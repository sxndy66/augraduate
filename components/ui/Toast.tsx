"use client";

import React, { createContext, useCallback, useContext, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "info" | "warning";

interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextValue {
  toast: (t: Omit<ToastItem, "id">) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

const toastConfig: Record<
  ToastType,
  { icon: React.ReactNode; border: string; bg: string; iconColor: string }
> = {
  success: {
    icon: <CheckCircle2 className="h-5 w-5" />,
    border: "border-success-green/40",
    bg: "bg-success-green/10",
    iconColor: "text-success-green",
  },
  error: {
    icon: <XCircle className="h-5 w-5" />,
    border: "border-error-red/40",
    bg: "bg-error-red/10",
    iconColor: "text-error-red",
  },
  info: {
    icon: <Info className="h-5 w-5" />,
    border: "border-electric-blue/40",
    bg: "bg-electric-blue/10",
    iconColor: "text-electric-blue",
  },
  warning: {
    icon: <AlertTriangle className="h-5 w-5" />,
    border: "border-amber/40",
    bg: "bg-amber/10",
    iconColor: "text-amber",
  },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (t: Omit<ToastItem, "id">) => {
      const id = Math.random().toString(36).substring(2, 11);
      const duration = t.duration ?? 4000;
      setToasts((prev) => [...prev, { ...t, id }]);
      if (duration > 0) {
        setTimeout(() => dismiss(id), duration);
      }
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 sm:bottom-6 sm:right-6">
        <AnimatePresence>
          {toasts.map((t) => {
            const cfg = toastConfig[t.type];
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, x: 100, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 100, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className={cn(
                  "glass-card flex items-start gap-3 rounded-xl border p-4 pr-10 shadow-xl min-w-[280px] max-w-sm",
                  cfg.border,
                  cfg.bg
                )}
              >
                <div className={cn("shrink-0", cfg.iconColor)}>{cfg.icon}</div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">{t.title}</p>
                  {t.message && (
                    <p className="mt-0.5 text-xs text-gray-400">{t.message}</p>
                  )}
                </div>
                <button
                  onClick={() => dismiss(t.id)}
                  className="absolute right-2 top-2 rounded-md p-1 text-gray-500 hover:text-white transition-colors"
                  aria-label="Dismiss"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
