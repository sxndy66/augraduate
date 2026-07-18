"use client";

import React from "react";
import { motion } from "framer-motion";
import { GraduationCap, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import degrees from "@/data/anna-university/degrees.json";

interface Degree {
  id: string;
  code: string;
  name: string;
  level: string;
  duration: number;
  totalSemesters: number;
  defaultCredits: number;
}

interface DegreeSelectorProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function DegreeSelector({ value, onChange, error }: DegreeSelectorProps) {
  const degreeList = degrees as Degree[];

  return (
    <div className="w-full">
      <label className="mb-1.5 block text-sm font-medium text-gray-200">
        Select your degree
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        {degreeList.map((degree) => {
          const isSelected = value === degree.id;
          return (
            <motion.button
              key={degree.id}
              type="button"
              onClick={() => onChange(degree.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "flex items-start gap-3 rounded-xl border p-4 text-left transition-all duration-200",
                isSelected
                  ? "border-electric-blue bg-electric-blue/10 shadow-lg shadow-electric-blue/20"
                  : "border-navy-600 bg-navy-800/40 hover:border-electric-blue/40 hover:bg-navy-800/60",
                error && !isSelected && "border-error-red/30"
              )}
            >
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors",
                  isSelected
                    ? "bg-electric-blue/20 text-electric-blue"
                    : "bg-navy-700 text-gray-400"
                )}
              >
                <GraduationCap className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p
                  className={cn(
                    "text-sm font-semibold",
                    isSelected ? "text-white" : "text-gray-200"
                  )}
                >
                  {degree.code}
                </p>
                <p className="mt-0.5 text-xs text-gray-400">{degree.name}</p>
                <p className="mt-1 text-xs text-gray-500">
                  {degree.duration} years · {degree.totalSemesters} semesters
                </p>
              </div>
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