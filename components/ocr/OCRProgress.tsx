"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ScanText, CheckCircle2, Loader2 } from "lucide-react";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { cn } from "@/lib/utils";

export type OCRStage = "idle" | "loading" | "recognizing" | "extracting" | "done" | "error";

export interface OCRProgressProps {
  stage: OCRStage;
  progress: number; // 0–100
  message?: string;
  className?: string;
}

const STAGE_LABELS: Record<OCRStage, string> = {
  idle: "Waiting to start",
  loading: "Loading OCR engine…",
  recognizing: "Recognizing text…",
  extracting: "Extracting grade data…",
  done: "OCR complete!",
  error: "OCR failed",
};

const STAGE_ICONS: Record<OCRStage, React.ReactNode> = {
  idle: <ScanText className="h-5 w-5" />,
  loading: <Loader2 className="h-5 w-5 animate-spin" />,
  recognizing: <Loader2 className="h-5 w-5 animate-spin" />,
  extracting: <Loader2 className="h-5 w-5 animate-spin" />,
  done: <CheckCircle2 className="h-5 w-5" />,
  error: <ScanText className="h-5 w-5" />,
};

export function OCRProgress({ stage, progress, message, className }: OCRProgressProps) {
  if (stage === "idle") return null;

  const isError = stage === "error";
  const isDone = stage === "done";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={cn(
          "rounded-2xl border p-5",
          isError
            ? "border-error-red/30 bg-error-red/5"
            : isDone
              ? "border-success-green/30 bg-success-green/5"
              : "border-electric-blue/30 bg-electric-blue/5",
          className
        )}
      >
        <div className="mb-3 flex items-center gap-3">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl",
              isError
                ? "bg-error-red/10 text-error-red"
                : isDone
                  ? "bg-success-green/10 text-success-green"
                  : "bg-electric-blue/10 text-electric-blue"
            )}
          >
            {STAGE_ICONS[stage]}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-white">{STAGE_LABELS[stage]}</p>
            {message && <p className="mt-0.5 text-xs text-gray-400">{message}</p>}
          </div>
          {!isDone && !isError && (
            <span className="text-lg font-bold text-white">{progress.toFixed(0)}%</span>
          )}
        </div>

        {!isError && (
          <ProgressBar
            value={progress}
            color={isDone ? "green" : "blue"}
            size="md"
            showValue={false}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}