"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Card } from "./Card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: string;
    direction: "up" | "down";
  };
  color?: "blue" | "green" | "amber" | "red" | "indigo";
  className?: string;
}

const colorStyles = {
  blue: "text-electric-blue bg-electric-blue/10",
  green: "text-success-green bg-success-green/10",
  amber: "text-amber bg-amber/10",
  red: "text-error-red bg-error-red/10",
  indigo: "text-royal-indigo bg-royal-indigo/10",
};

export function StatCard({
  label,
  value,
  icon,
  trend,
  color = "blue",
  className,
}: StatCardProps) {
  return (
    <Card hover className={cn("p-5", className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-400">{label}</p>
          <motion.p
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="mt-2 text-2xl font-bold text-white"
          >
            {value}
          </motion.p>
        </div>
        <div
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-xl",
            colorStyles[color]
          )}
        >
          {icon}
        </div>
      </div>
      {trend && (
        <div className="mt-3 flex items-center gap-1.5">
          {trend.direction === "up" ? (
            <TrendingUp className="h-4 w-4 text-success-green" />
          ) : (
            <TrendingDown className="h-4 w-4 text-error-red" />
          )}
          <span
            className={cn(
              "text-xs font-medium",
              trend.direction === "up" ? "text-success-green" : "text-error-red"
            )}
          >
            {trend.value}
          </span>
        </div>
      )}
    </Card>
  );
}
