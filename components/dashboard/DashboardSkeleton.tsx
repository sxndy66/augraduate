"use client";

import React from "react";
import { Skeleton, SkeletonText } from "@/components/ui/Skeleton";
import { SkeletonCard } from "@/components/ui/SkeletonCard";

export function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Skeleton variant="text" width="180px" height="1.75rem" />
          <Skeleton variant="text" width="220px" height="0.875rem" className="mt-2" />
        </div>
        <Skeleton variant="circular" width={40} height={40} />
      </div>

      {/* CGPA Hero Card */}
      <SkeletonCard className="mb-6" showHeader={false}>
        <div className="flex flex-col items-center gap-4 py-6">
          <Skeleton variant="text" width="120px" height="0.875rem" />
          <Skeleton variant="text" width="160px" height="3.5rem" />
          <Skeleton variant="text" width="200px" height="0.875rem" />
          <div className="mt-2 w-full max-w-md">
            <Skeleton variant="rectangular" height="8px" rounded="9999px" />
          </div>
        </div>
      </SkeletonCard>

      {/* Stats Grid */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} showHeader={false}>
            <div className="flex items-center gap-3">
              <Skeleton variant="circular" width={40} height={40} />
              <div className="flex-1">
                <Skeleton variant="text" width="60%" height="0.75rem" />
                <Skeleton variant="text" width="80%" height="1.25rem" className="mt-1.5" />
              </div>
            </div>
          </SkeletonCard>
        ))}
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left: Semester Progress */}
        <SkeletonCard showHeader showList listItems={4} />

        {/* Right: Recent Activity */}
        <SkeletonCard showHeader showList listItems={4} />
      </div>

      {/* Chart placeholder */}
      <div className="mt-6">
        <SkeletonCard showHeader showChart />
      </div>
    </div>
  );
}
