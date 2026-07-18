"use client";

import React from "react";
import { cn } from "@/lib/utils";

type SkeletonVariant = "text" | "circular" | "rectangular" | "card";

interface SkeletonProps {
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
  rounded?: string | number;
  className?: string;
  children?: React.ReactNode;
}

const variantDefaults: Record<SkeletonVariant, { width: string; height: string; rounded: string }> = {
  text: { width: "100%", height: "0.875rem", rounded: "0.25rem" },
  circular: { width: "2.5rem", height: "2.5rem", rounded: "9999px" },
  rectangular: { width: "100%", height: "6rem", rounded: "0.5rem" },
  card: { width: "100%", height: "8rem", rounded: "1rem" },
};

export function Skeleton({
  variant = "text",
  width,
  height,
  rounded,
  className,
  children,
}: SkeletonProps) {
  const defaults = variantDefaults[variant];

  const resolvedWidth = width ?? defaults.width;
  const resolvedHeight = height ?? defaults.height;
  const resolvedRounded = rounded ?? defaults.rounded;

  const dimensionStyle: React.CSSProperties = {
    width: typeof resolvedWidth === "number" ? `${resolvedWidth}px` : resolvedWidth,
    height: typeof resolvedHeight === "number" ? `${resolvedHeight}px` : resolvedHeight,
    borderRadius: typeof resolvedRounded === "number" ? `${resolvedRounded}px` : resolvedRounded,
  };

  if (children) {
    return (
      <div
        className={cn(
          "relative overflow-hidden bg-navy-700/50 animate-shimmer",
          className
        )}
        style={dimensionStyle}
      >
        <div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
          style={{ backgroundSize: "1000px 100%" }}
        />
        <div className="relative z-10">{children}</div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-navy-700/50 animate-shimmer",
        className
      )}
      style={dimensionStyle}
    >
      <div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
        style={{ backgroundSize: "1000px 100%" }}
      />
    </div>
  );
}

// ─── Composed Skeleton Helpers ──────────────────────────────────────

export function SkeletonText({
  lines = 3,
  className,
  lineHeight = "0.875rem",
  gap = "0.5rem",
}: {
  lines?: number;
  className?: string;
  lineHeight?: string;
  gap?: string;
}) {
  return (
    <div className={cn("flex flex-col", className)} style={{ gap }}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          height={lineHeight}
          width={i === lines - 1 ? "60%" : "100%"}
        />
      ))}
    </div>
  );
}

export function SkeletonRow({
  columns = 3,
  className,
}: {
  columns?: number;
  className?: string;
}) {
  return (
    <div className={cn("flex gap-4", className)}>
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} variant="rectangular" height="3rem" className="flex-1" />
      ))}
    </div>
  );
}
