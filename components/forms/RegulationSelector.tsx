"use client";

import React from "react";
import { motion } from "framer-motion";
import { Calendar, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import regulations from "@/data/anna-university/regulations.json";

interface Regulation {
  id: string;
  name: string;
  shortName: string;
  fullName: string;
  effectiveFrom: number;
  effectiveTo: number | null;
  isActive: boolean;
  gradingSystem: Record<string, number>;
  passMark: number;
  totalSemesters: number;
  creditsRequired: Record<string, number>;
  description: string;
}

interface RegulationSelectorProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function RegulationSelector({
  value,
  onChange,
  error,
}: RegulationSelectorProps) {
  const regulationList = regulations as Regulation[];

  return (
    <div className="w-full">
      <label className="mb-1.5 block text-sm font-medium text-gray-200">
        Select your regulation
      </label>

      <div className="space-y-3">
        {regulationList.map((reg) => {
          const isSelected = value === reg.id;
          return (
            <motion.button
              key={reg.id}
              type="button"
              onClick={() => onChange(reg.id)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className={cn(
                "flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-all duration-200",
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
                <Calendar className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p
                    className={cn(
                      "text-sm font-semibold",
                      isSelected ? "text-white" : "text-gray-200"
                    )}
                  >
                    {reg.name}
                  </p>
                  {reg.isActive && (
                    <span className="flex items-center gap-1 rounded-full bg-success-green/15 px-2 py-0.5 text-xs font-medium text-success-green">
                      <CheckCircle2 className="h-3 w-3" />
                      Current
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-gray-400">
                  {reg.description}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Effective: {reg.effectiveFrom}
                  {reg.effectiveTo ? ` – ${reg.effectiveTo}` : " – Present"}
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