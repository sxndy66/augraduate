"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
  hint?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, hint, className, id, ...props }, ref) => {
    const selectId = id || React.useId();

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="mb-1.5 block text-sm font-medium text-gray-200"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              "w-full appearance-none rounded-xl border bg-navy-800/50 px-4 py-2.5 pr-11 text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-electric-blue/40 focus:border-electric-blue/50",
              error
                ? "border-error-red/50 focus:ring-error-red/40 focus:border-error-red"
                : "border-navy-600",
              className
            )}
            aria-invalid={!!error}
            aria-describedby={error ? `${selectId}-error` : undefined}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-navy-800 text-white">
                {opt.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>
        <AnimatePresence mode="wait">
          {error ? (
            <motion.p
              id={`${selectId}-error`}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-1.5 flex items-center gap-1.5 text-sm text-error-red"
            >
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              {error}
            </motion.p>
          ) : hint ? (
            <p className="mt-1.5 text-xs text-gray-500">{hint}</p>
          ) : null}
        </AnimatePresence>
      </div>
    );
  }
);

Select.displayName = "Select";
