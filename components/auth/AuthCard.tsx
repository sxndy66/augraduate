"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

interface AuthCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function AuthCard({
  title,
  subtitle,
  children,
  footer,
  className,
}: AuthCardProps) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <Link
          href="/"
          className="mb-8 flex items-center justify-center gap-2.5 transition-opacity hover:opacity-90"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-electric-blue to-royal-indigo shadow-lg shadow-electric-blue/30">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold text-white">
            AU<span className="text-electric-blue">Track</span>
          </span>
        </Link>

        {/* Glassmorphism card */}
        <div
          className={cn(
            "relative rounded-2xl border border-white/10 bg-navy-800/40 p-8 shadow-2xl backdrop-blur-xl",
            "before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-br before:from-electric-blue/5 before:via-transparent before:to-royal-indigo/5 before:pointer-events-none",
            className
          )}
        >
          <div className="relative">
            <h1 className="text-2xl font-bold text-white">{title}</h1>
            {subtitle && (
              <p className="mt-1.5 text-sm text-gray-400">{subtitle}</p>
            )}

            <div className="mt-6">{children}</div>

            {footer && (
              <div className="mt-6 border-t border-white/5 pt-5 text-center text-sm text-gray-400">
                {footer}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}