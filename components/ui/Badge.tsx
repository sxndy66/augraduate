import React from "react";
import { cn } from "@/lib/utils";

type BadgeColor =
  | "blue"
  | "indigo"
  | "green"
  | "amber"
  | "red"
  | "gray";

interface BadgeProps {
  color?: BadgeColor;
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

const colorStyles: Record<BadgeColor, string> = {
  blue: "bg-electric-blue/15 text-electric-blue border-electric-blue/30",
  indigo: "bg-royal-indigo/15 text-royal-indigo border-royal-indigo/30",
  green: "bg-success-green/15 text-success-green border-success-green/30",
  amber: "bg-amber/15 text-amber border-amber/30",
  red: "bg-error-red/15 text-error-red border-error-red/30",
  gray: "bg-gray-500/15 text-gray-400 border-gray-500/30",
};

export function Badge({ color = "gray", children, className, icon }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        colorStyles[color],
        className
      )}
    >
      {icon}
      {children}
    </span>
  );
}
