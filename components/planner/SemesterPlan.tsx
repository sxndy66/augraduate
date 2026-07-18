"use client";

import { motion } from "framer-motion";
import { TrendingUp, Shield, Zap } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { formatGPA } from "@/lib/utils";

interface SemesterPlanProps {
  type: "safe" | "aggressive";
  requiredGPA: number;
  isAchievable: boolean;
  message: string;
  remainingSemesters: number;
  remainingCredits: number;
}

export function SemesterPlan({
  type,
  requiredGPA,
  isAchievable,
  message,
  remainingSemesters,
  remainingCredits,
}: SemesterPlanProps) {
  const isSafe = type === "safe";
  const icon = isSafe ? <Shield className="h-5 w-5" /> : <Zap className="h-5 w-5" />;
  const title = isSafe ? "Safe Plan" : "Aggressive Plan";
  const color = isSafe ? "green" : "amber";
  const barColor = isSafe ? "green" : "amber";

  // Distribute credits evenly across remaining semesters
  const creditsPerSem = remainingSemesters > 0 ? remainingCredits / remainingSemesters : 0;

  // For safe plan: even GPA each semester
  // For aggressive plan: front-load higher GPA, taper down
  const semesterBreakdown = Array.from({ length: remainingSemesters }, (_, i) => {
    if (isSafe) {
      return { semester: i + 1, gpa: requiredGPA, credits: Math.round(creditsPerSem) };
    }
    // Aggressive: start 10% higher, taper to required
    const taper = 1.1 - (i / Math.max(remainingSemesters - 1, 1)) * 0.2;
    return {
      semester: i + 1,
      gpa: Math.min(10, requiredGPA * taper),
      credits: Math.round(creditsPerSem),
    };
  });

  return (
    <Card hover className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${
              isSafe ? "bg-success-green/10 text-success-green" : "bg-amber/10 text-amber"
            }`}
          >
            {icon}
          </div>
          <div>
            <h4 className="font-semibold text-white">{title}</h4>
            <p className="text-xs text-gray-500">
              {isSafe ? "Conservative, steady approach" : "Ambitious, front-loaded approach"}
            </p>
          </div>
        </div>
        <Badge color={isAchievable ? color : "red"}>
          {isAchievable ? "Achievable" : "Not Feasible"}
        </Badge>
      </div>

      {/* Required GPA Display */}
      <div className="mb-4 rounded-xl bg-navy-800/50 p-4">
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-gray-400">Required Average GPA</span>
          <span className={`text-2xl font-bold ${isAchievable ? "text-white" : "text-error-red"}`}>
            {formatGPA(requiredGPA)}
          </span>
        </div>
        <ProgressBar
          value={Math.min(requiredGPA, 10)}
          max={10}
          color={isAchievable ? barColor : "red"}
          size="sm"
          className="mt-2"
        />
      </div>

      {/* Message */}
      <p className="mb-4 text-sm text-gray-400">{message}</p>

      {/* Semester Breakdown */}
      <div className="space-y-2">
        <h5 className="text-xs font-medium uppercase tracking-wider text-gray-500">
          Semester-wise Breakdown
        </h5>
        {semesterBreakdown.map((sem) => (
          <motion.div
            key={sem.semester}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: sem.semester * 0.05 }}
            className="flex items-center justify-between rounded-lg bg-navy-800/30 px-3 py-2"
          >
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-navy-700 text-xs font-semibold text-gray-300">
                S{sem.semester}
              </span>
              <span className="text-sm text-gray-400">{sem.credits} credits</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-3.5 w-3.5 text-gray-500" />
              <span className="text-sm font-semibold text-white">{formatGPA(sem.gpa)}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}
