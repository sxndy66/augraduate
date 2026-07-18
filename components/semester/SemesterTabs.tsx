"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface SemesterTabsProps {
  semesters: number[];
  activeSemester: number;
  semesterStatuses?: Record<number, "completed" | "in-progress" | "upcoming">;
}

export function SemesterTabs({
  semesters,
  activeSemester,
  semesterStatuses = {},
}: SemesterTabsProps) {
  const router = useRouter();

  return (
    <div className="flex flex-wrap gap-2">
      {semesters.map((sem) => {
        const status = semesterStatuses[sem];
        const isActive = sem === activeSemester;

        return (
          <button
            key={sem}
            onClick={() => router.push(`/semesters/${sem}`)}
            className={cn(
              "relative rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all duration-200",
              isActive
                ? "border-electric-blue bg-electric-blue/10 text-electric-blue"
                : "border-navy-600 bg-navy-800/40 text-gray-300 hover:border-electric-blue/40 hover:text-white"
            )}
          >
            Sem {sem}
            {status === "completed" && (
              <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-success-green" />
            )}
            {status === "in-progress" && (
              <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-amber" />
            )}
          </button>
        );
      })}
    </div>
  );
}