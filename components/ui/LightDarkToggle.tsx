"use client";

import React, { useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { cn } from "@/lib/utils";

interface LightDarkToggleProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeConfig = {
  sm: { button: "h-8 w-8", icon: "h-4 w-4" },
  md: { button: "h-10 w-10", icon: "h-5 w-5" },
  lg: { button: "h-12 w-12", icon: "h-6 w-6" },
};

export function LightDarkToggle({ className, size = "md" }: LightDarkToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const config = sizeConfig[size];

  const handleToggle = useCallback(() => {
    toggleTheme();
  }, [toggleTheme]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleToggle();
    }
  };

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={handleToggle}
      onKeyDown={handleKeyDown}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={!isDark}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "relative inline-flex items-center justify-center rounded-xl border border-navy-600 bg-navy-700/50 text-gray-300 transition-all duration-200 hover:border-electric-blue/40 hover:bg-navy-600/50 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-electric-blue/50 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900",
        config.button,
        className
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.div
            key="moon"
            initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="absolute"
          >
            <Moon className={cn("text-electric-blue", config.icon)} />
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            initial={{ rotate: 90, opacity: 0, scale: 0.5 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: -90, opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="absolute"
          >
            <Sun className={cn("text-amber", config.icon)} />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}
