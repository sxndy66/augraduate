"use client";

import React, { useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Filter, X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

export interface NotificationFiltersState {
  category: string; // "all" or a category key
  degree: string; // "all" or a degree id
  branch: string; // "all" or a branch id
}

export interface NotificationFiltersProps {
  filters: NotificationFiltersState;
  onChange: (filters: NotificationFiltersState) => void;
  categoryOptions: { label: string; value: string }[];
  degreeOptions: { label: string; value: string }[];
  branchOptions: { label: string; value: string }[];
  mutedCategories: string[];
  onToggleMuteCategory: (category: string) => void;
  muteAll: boolean;
  onToggleMuteAll: () => void;
  resultCount: number;
  className?: string;
}

export function NotificationFilters({
  filters,
  onChange,
  categoryOptions,
  degreeOptions,
  branchOptions,
  mutedCategories,
  onToggleMuteCategory,
  muteAll,
  onToggleMuteAll,
  resultCount,
  className,
}: NotificationFiltersProps) {
  const allCategoryOptions = [
    { label: "All Categories", value: "all" },
    ...categoryOptions,
  ];
  const allDegreeOptions = [{ label: "All Degrees", value: "all" }, ...degreeOptions];
  const allBranchOptions = [{ label: "All Branches", value: "all" }, ...branchOptions];

  const handleCategoryChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onChange({ ...filters, category: e.target.value });
    },
    [filters, onChange]
  );

  const handleDegreeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onChange({ ...filters, degree: e.target.value, branch: "all" });
    },
    [filters, onChange]
  );

  const handleBranchChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onChange({ ...filters, branch: e.target.value });
    },
    [filters, onChange]
  );

  const handleClear = useCallback(() => {
    onChange({ category: "all", degree: "all", branch: "all" });
  }, [onChange]);

  const hasActiveFilters =
    filters.category !== "all" || filters.degree !== "all" || filters.branch !== "all";

  return (
    <Card className={cn("p-4", className)}>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-electric-blue" />
          <h3 className="text-sm font-semibold text-white">Filters</h3>
          {hasActiveFilters && (
            <Button size="sm" variant="ghost" onClick={handleClear} className="!px-2 !py-0.5 !text-xs">
              <X className="h-3 w-3" /> Clear
            </Button>
          )}
        </div>
        <span className="text-xs text-gray-400">{resultCount} results</span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Select
          label="Category"
          options={allCategoryOptions}
          value={filters.category}
          onChange={handleCategoryChange}
        />
        <Select
          label="Degree"
          options={allDegreeOptions}
          value={filters.degree}
          onChange={handleDegreeChange}
        />
        <Select
          label="Branch"
          options={allBranchOptions}
          value={filters.branch}
          onChange={handleBranchChange}
        />
      </div>

      {/* Mute controls */}
      <div className="mt-4 space-y-3 border-t border-navy-700 pt-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-300">Notification Preferences</span>
          </div>
          <Button
            size="sm"
            variant={muteAll ? "danger" : "outline"}
            onClick={onToggleMuteAll}
            className="!text-xs"
          >
            {muteAll ? "Unmute All" : "Mute All"}
          </Button>
        </div>

        {categoryOptions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {categoryOptions.map((cat) => {
              const isMuted = mutedCategories.includes(cat.value);
              return (
                <button
                  key={cat.value}
                  onClick={() => onToggleMuteCategory(cat.value)}
                  className={cn(
                    "rounded-full border px-2.5 py-0.5 text-xs font-medium transition-all",
                    isMuted
                      ? "border-error-red/30 bg-error-red/10 text-error-red line-through"
                      : "border-navy-600 bg-navy-800/50 text-gray-400 hover:border-electric-blue/40 hover:text-electric-blue"
                  )}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
}