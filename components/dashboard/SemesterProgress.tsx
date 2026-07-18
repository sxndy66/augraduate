import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import { CheckCircle2, Clock, Lock } from "lucide-react";

interface SemesterInfo {
  semester: number;
  gpa: number | null;
  credits: number;
  status: "completed" | "in-progress" | "upcoming";
}

interface SemesterProgressProps {
  semesters: SemesterInfo[];
  currentSemester: number;
}

export function SemesterProgress({
  semesters,
  currentSemester,
}: SemesterProgressProps) {
  const completedCount = semesters.filter(
    (s) => s.status === "completed"
  ).length;
  const totalCount = semesters.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const statusConfig = {
    completed: {
      icon: <CheckCircle2 className="h-4 w-4" />,
      color: "green" as const,
      label: "Completed",
    },
    "in-progress": {
      icon: <Clock className="h-4 w-4" />,
      color: "amber" as const,
      label: "In Progress",
    },
    upcoming: {
      icon: <Lock className="h-4 w-4" />,
      color: "gray" as const,
      label: "Upcoming",
    },
  };

  return (
    <Card className="p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">
            Semester Progress
          </h2>
          <p className="mt-0.5 text-sm text-gray-400">
            {completedCount} of {totalCount} semesters completed
          </p>
        </div>
        <Link
          href="/semesters"
          className="text-sm font-medium text-electric-blue hover:text-electric-blue/80"
        >
          View all →
        </Link>
      </div>

      <ProgressBar
        value={completedCount}
        max={totalCount}
        showValue
        color="blue"
        size="lg"
        className="mb-6"
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {semesters.map((sem) => {
          const config = statusConfig[sem.status];
          return (
            <Link
              key={sem.semester}
              href={`/semesters/${sem.semester}`}
              className="group"
            >
              <div className="rounded-xl border border-navy-600 bg-navy-800/40 p-4 transition-all duration-200 hover:border-electric-blue/40 hover:bg-navy-800/60">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">
                    Sem {sem.semester}
                  </span>
                  <div
                    className={`text-${config.color === "gray" ? "gray-400" : config.color === "green" ? "success-green" : config.color === "amber" ? "amber" : "electric-blue"}`}
                  >
                    {config.icon}
                  </div>
                </div>
                <p className="mt-2 text-xs text-gray-400">
                  {sem.gpa !== null ? `GPA: ${sem.gpa.toFixed(2)}` : "No grades"}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {sem.credits} credits
                </p>
                <Badge color={config.color} className="mt-2">
                  {config.label}
                </Badge>
              </div>
            </Link>
          );
        })}
      </div>
    </Card>
  );
}