"use client";

import React from "react";
import { Skeleton, SkeletonText } from "./Skeleton";
import { cn } from "@/lib/utils";

interface SkeletonCardProps {
  className?: string;
  showHeader?: boolean;
  showStats?: boolean;
  showChart?: boolean;
  showList?: boolean;
  listItems?: number;
  children?: React.ReactNode;
}

export function SkeletonCard({
  className,
  showHeader = true,
  showStats = false,
  showChart = false,
  showList = false,
  listItems = 3,
  children,
}: SkeletonCardProps) {
  return (
    <div
      className={cn(
        "glass-card rounded-2xl p-6",
        className
      )}
    >
      {showHeader && (
        <div className="mb-5 flex items-center gap-3">
          <Skeleton variant="circular" width={36} height={36} />
          <div className="flex-1">
            <Skeleton variant="text" width="40%" height="1.125rem" />
            <Skeleton variant="text" width="60%" height="0.75rem" className="mt-1.5" />
          </div>
        </div>
      )}

      {showStats && (
        <div className="mb-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl bg-navy-800/50 p-4">
              <Skeleton variant="text" width="50%" height="0.75rem" />
              <Skeleton variant="text" width="70%" height="1.5rem" className="mt-2" />
            </div>
          ))}
        </div>
      )}

      {showChart && (
        <div className="mb-5">
          <Skeleton variant="rectangular" height="200px" rounded="0.75rem" />
        </div>
      )}

      {showList && (
        <div className="space-y-3">
          {Array.from({ length: listItems }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl bg-navy-800/30 p-3">
              <Skeleton variant="circular" width={32} height={32} />
              <div className="flex-1">
                <SkeletonText lines={2} lineHeight="0.75rem" gap="0.375rem" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!showStats && !showChart && !showList && !children && (
        <SkeletonText lines={4} />
      )}

      {children}
    </div>
  );
}
