"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  color?: "blue" | "green" | "amber" | "red";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const colorStyles = {
  blue: "from-electric-blue to-royal-indigo",
  green: "from-success-green to-success-green/70",
  amber: "from-amber to-amber/70",
  red: "from-error-red to-error-red/70",
};

const sizeStyles = {
  sm: "h-1.5",
  md: "h-2.5",
  lg: "h-4",
};

export function ProgressBar({
  value,
  max = 100,
  label,
  showValue = false,
  color = "blue",
  size = "md",
  className,
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={cn("w-full", className)}>
      {(label || showValue) && (
        <div className="mb-1.5 flex items-center justify-between">
          {label && <span className="text-sm font-medium text-gray-300">{label}</span>}
          {showValue && (
            <span className="text-sm font-semibold text-white">
              {percentage.toFixed(0)}%
            </span>
          )}
        </div>
      )}
      <div
        className={cn(
          "w-full overflow-hidden rounded-full bg-navy-700",
          sizeStyles[size]
        )}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={cn(
            "h-full rounded-full bg-gradient-to-r",
            colorStyles[color]
          )}
        />
      </div>
    </div>
  );
}
