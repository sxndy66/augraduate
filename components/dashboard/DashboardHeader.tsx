import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { formatGPA, getInitials } from "@/lib/utils";
import { GraduationCap, Target, Calendar } from "lucide-react";

interface DashboardHeaderProps {
  userName: string;
  currentSemester: number | null;
  currentCGPA: number;
  targetCGPA: number;
}

export function DashboardHeader({
  userName,
  currentSemester,
  currentCGPA,
  targetCGPA,
}: DashboardHeaderProps) {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const cgpaDiff = currentCGPA - targetCGPA;
  const isAboveTarget = cgpaDiff >= 0;

  return (
    <Card gradientBorder className="p-6 sm:p-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        {/* Greeting */}
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-electric-blue to-royal-indigo text-xl font-bold text-white">
            {getInitials(userName || "Student")}
          </div>
          <div>
            <p className="text-sm text-gray-400">{greeting},</p>
            <h1 className="text-2xl font-bold text-white sm:text-3xl">
              {userName || "Student"}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {currentSemester !== null && (
                <Badge color="blue" icon={<Calendar className="h-3 w-3" />}>
                  Semester {currentSemester}
                </Badge>
              )}
              <Badge
                color="indigo"
                icon={<GraduationCap className="h-3 w-3" />}
              >
                AIDS R2021
              </Badge>
            </div>
          </div>
        </div>

        {/* CGPA Display */}
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Current CGPA
            </p>
            <p className="mt-1 text-3xl font-bold text-white">
              {formatGPA(currentCGPA)}
            </p>
          </div>
          <div className="h-12 w-px bg-navy-600" />
          <div className="text-center">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Target CGPA
            </p>
            <p className="mt-1 text-3xl font-bold text-electric-blue">
              {formatGPA(targetCGPA)}
            </p>
            <p
              className={`mt-0.5 text-xs font-medium ${
                isAboveTarget ? "text-success-green" : "text-amber"
              }`}
            >
              {isAboveTarget ? "+" : ""}
              {cgpaDiff.toFixed(2)} to target
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}