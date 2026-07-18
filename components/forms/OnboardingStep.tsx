"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface OnboardingStepProps {
  step: number;
  totalSteps: number;
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function OnboardingStep({
  step,
  totalSteps,
  title,
  description,
  children,
}: OnboardingStepProps) {
  const progress = (step / totalSteps) * 100;

  return (
    <div className="w-full">
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-400">
            Step {step} of {totalSteps}
          </span>
          <span className="text-sm font-semibold text-electric-blue">
            {Math.round(progress)}%
          </span>
        </div>

        {/* Step dots */}
        <div className="mb-4 flex items-center gap-2">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div
              key={i}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-all duration-300",
                i + 1 < step &&
                  "border-success-green bg-success-green/20 text-success-green",
                i + 1 === step &&
                  "border-electric-blue bg-electric-blue/20 text-electric-blue",
                i + 1 > step && "border-navy-600 bg-navy-800 text-gray-500"
              )}
            >
              {i + 1 < step ? (
                <Check className="h-4 w-4" />
              ) : (
                i + 1
              )}
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="h-2 w-full overflow-hidden rounded-full bg-navy-700">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="h-full rounded-full bg-gradient-to-r from-electric-blue to-royal-indigo"
          />
        </div>
      </div>

      {/* Step content with transition */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          {description && (
            <p className="mt-1.5 text-sm text-gray-400">{description}</p>
          )}
          <div className="mt-6">{children}</div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}