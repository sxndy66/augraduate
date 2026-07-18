"use client";

import React from "react";
import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SemesterSelectorProps {
  value: number | null;
  onChange: (value: number) => void;
  maxSemesters?: number;
  error?: string;
}

export function SemesterSelector({
  value,
  onChange,
  maxSemesters = 8,
  error,
}: SemesterSelectorProps) {
  const semesters = Array.from({ length: maxSemesters }, (_, i) => i + 1);

  return (
    <div className="w-full">
      <label className="mb-1.5 block text-sm font-medium text-gray-200">
        Current semester
      </label>

      <div className="grid grid-cols-4 gap-3">
        {semesters.map((sem) => {
          const isSelected = value === sem;
          return (
            <motion.button
              key={sem}
              type="button"
              onClick={() => onChange(sem)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "flex aspect-square items-center justify-center rounded-xl border-2 text-lg font-bold transition-all duration-200",
                isSelected
                  ? "border-electric-blue bg-electric-blue/15 text-electric-blue shadow-lg shadow-electric-blue/20"
                  : "border-navy-600 bg-navy-800/40 text-gray-400 hover:border-electric-blue/40 hover:text-gray-200",
                error && !isSelected && "border-error-red/20"
              )}
            >
              {sem}
            </motion.button>
          );
        })}
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-2 flex items-center gap-1.5 text-sm text-error-red"
        >
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {error}
        </motion.p>
      )}
    </div>
  );
}