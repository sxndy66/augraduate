"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronDown, AlertCircle, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import branchesData from "@/data/anna-university/branches.json";

interface Branch {
  id: string;
  code: string;
  name: string;
  degree_id: string;
  regulations: string[];
  totalSemesters: number;
}

interface BranchSelectorProps {
  degreeId: string;
  regulationId?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function BranchSelector({
  degreeId,
  regulationId,
  value,
  onChange,
  error,
}: BranchSelectorProps) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const allBranches = branchesData as Branch[];

  const filteredBranches = useMemo(() => {
    return allBranches.filter((b) => {
      if (b.degree_id !== degreeId) return false;
      if (regulationId && !b.regulations.includes(regulationId)) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          b.name.toLowerCase().includes(q) ||
          b.code.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [allBranches, degreeId, regulationId, search]);

  const selectedBranch = allBranches.find((b) => b.id === value);

  return (
    <div className="w-full">
      <label className="mb-1.5 block text-sm font-medium text-gray-200">
        Select your branch
      </label>

      <div className="relative">
        {/* Trigger button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex w-full items-center justify-between rounded-xl border bg-navy-800/50 px-4 py-2.5 text-left transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-electric-blue/40 focus:border-electric-blue/50",
            error
              ? "border-error-red/50 focus:ring-error-red/40 focus:border-error-red"
              : "border-navy-600",
            !degreeId && "cursor-not-allowed opacity-50"
          )}
          disabled={!degreeId}
        >
          <span
            className={cn(
              "text-sm",
              selectedBranch ? "text-white" : "text-gray-500"
            )}
          >
            {selectedBranch
              ? `${selectedBranch.code} — ${selectedBranch.name}`
              : degreeId
                ? "Search and select your branch..."
                : "Select a degree first"}
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200",
              isOpen && "rotate-180"
            )}
          />
        </button>

        {/* Dropdown */}
        <AnimatePresence>
          {isOpen && degreeId && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-navy-600 bg-navy-800 shadow-2xl"
            >
              {/* Search input */}
              <div className="border-b border-navy-600 p-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search branches..."
                    className="w-full rounded-lg border border-navy-600 bg-navy-900/50 py-2 pl-9 pr-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-electric-blue/40"
                    autoFocus
                  />
                </div>
              </div>

              {/* Options */}
              <div className="max-h-60 overflow-y-auto p-1.5">
                {filteredBranches.length === 0 ? (
                  <p className="px-3 py-4 text-center text-sm text-gray-500">
                    No branches found
                  </p>
                ) : (
                  filteredBranches.map((branch) => {
                    const isSelected = value === branch.id;
                    return (
                      <button
                        key={branch.id}
                        type="button"
                        onClick={() => {
                          onChange(branch.id);
                          setIsOpen(false);
                          setSearch("");
                        }}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                          isSelected
                            ? "bg-electric-blue/15 text-white"
                            : "text-gray-300 hover:bg-navy-700/60"
                        )}
                      >
                        <span className="flex h-8 w-12 shrink-0 items-center justify-center rounded-md bg-navy-700 text-xs font-bold text-electric-blue">
                          {branch.code}
                        </span>
                        <span className="flex-1 text-sm">{branch.name}</span>
                        {isSelected && (
                          <Check className="h-4 w-4 shrink-0 text-electric-blue" />
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-2 flex items-center gap-1.5 text-sm text-error-red"
        >
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {error}
        </motion.p>
      )}
    </div>
  );
}