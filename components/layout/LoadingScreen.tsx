"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { GraduationCap } from "lucide-react";

const subjectCodes = [
  "MA3251", "CS3351", "EC3351", "GE3361", "CS3391",
  "AD3351", "CS3491", "OCS351", "PCCS301", "GE3362",
];

export function LoadingScreen({ onComplete }: { onComplete?: () => void }) {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion) {
      setProgress(10);
      const t = setTimeout(() => {
        setIsComplete(true);
        onComplete?.();
      }, 500);
      return () => clearTimeout(t);
    }

    const duration = 2000;
    const interval = 50;
    const increment = (10 / duration) * interval;
    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = Math.min(prev + increment, 10);
        if (next >= 10) {
          clearInterval(timer);
          setTimeout(() => {
            setIsComplete(true);
            onComplete?.();
          }, 400);
        }
        return next;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [onComplete, shouldReduceMotion]);

  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - (progress / 10) * circumference;

  return (
    <AnimatePresence>
      {!isComplete && (
        <motion.div
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-navy-950"
        >
          {/* Grid background */}
          <div className="absolute inset-0 grid-bg opacity-40" />
          <div className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-electric-blue/10 blur-[100px]" />

          {/* Floating subject codes */}
          {!shouldReduceMotion && (
            <div className="absolute inset-0 overflow-hidden">
              {subjectCodes.map((code, i) => (
                <motion.span
                  key={code}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{
                    opacity: [0, 0.4, 0],
                    y: [50, -100 - i * 30],
                    x: [0, (i % 2 === 0 ? 20 : -20)],
                  }}
                  transition={{
                    duration: 3 + i * 0.3,
                    delay: i * 0.15,
                    repeat: Infinity,
                    ease: "easeOut",
                  }}
                  className="absolute text-xs font-mono font-medium text-electric-blue/30"
                  style={{
                    left: `${10 + (i * 8) % 80}%`,
                    top: `${60 + (i * 7) % 30}%`,
                  }}
                >
                  {code}
                </motion.span>
              ))}
            </div>
          )}

          {/* Progress ring */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="relative h-[160px] w-[160px]">
              <svg
                className="h-full w-full -rotate-90"
                viewBox="0 0 140 140"
              >
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  fill="none"
                  stroke="rgba(59, 130, 246, 0.1)"
                  strokeWidth="4"
                />
                <motion.circle
                  cx="70"
                  cy="70"
                  r={radius}
                  fill="none"
                  stroke="url(#progressGradient)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeOffset}
                  transition={{ ease: "easeOut" }}
                />
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Logo in center */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 15 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-electric-blue to-royal-indigo shadow-xl shadow-electric-blue/30">
                  <GraduationCap className="h-8 w-8 text-white" />
                </div>
              </motion.div>
            </div>

            {/* Progress text */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-8 text-center"
            >
              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-2xl font-bold text-white"
              >
                AU<span className="gradient-text"> Track</span>
              </motion.h1>
              <p className="mt-2 text-sm text-gray-400">
                Loading your academic companion...
              </p>
              <p className="mt-3 font-mono text-xs text-electric-blue/60">
                {progress.toFixed(1)} / 10
              </p>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
