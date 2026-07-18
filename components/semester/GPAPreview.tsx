"use client";

import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { formatGPA } from "@/lib/utils";
import { TrendingUp, BookOpen } from "lucide-react";

interface GPAPreviewProps {
  gpa: number;
  enteredCount: number;
  totalSubjects: number;
  totalCredits: number;
}

export function GPAPreview({
  gpa,
  enteredCount,
  totalSubjects,
  totalCredits,
}: GPAPreviewProps) {
  const isComplete = enteredCount === totalSubjects && totalSubjects > 0;
  const gpaColor =
    gpa >= 8
      ? "text-success-green"
      : gpa >= 6
        ? "text-electric-blue"
        : gpa >= 5
          ? "text-amber"
          : gpa > 0
            ? "text-error-red"
            : "text-gray-400";

  const progressColor =
    gpa >= 8 ? "green" : gpa >= 6 ? "blue" : gpa >= 5 ? "amber" : "red";

  return (
    <Card gradientBorder className="p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-electric-blue/10">
            <TrendingUp className="h-6 w-6 text-electric-blue" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-400">
              Live GPA Preview
            </p>
            <p className={`text-3xl font-bold ${gpaColor}`}>
              {enteredCount > 0 ? formatGPA(gpa) : "—.——"}
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className="flex items-center gap-1.5 text-sm text-gray-400">
            <BookOpen className="h-4 w-4" />
            <span>
              {enteredCount}/{totalSubjects} subjects
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            {totalCredits} total credits
          </p>
          {isComplete && (
            <p className="mt-1 text-xs font-medium text-success-green">
              All grades entered ✓
            </p>
          )}
        </div>
      </div>

      {enteredCount > 0 && (
        <div className="mt-4">
          <ProgressBar
            value={gpa}
            max={10}
            label="GPA Scale"
            showValue
            color={progressColor as "blue" | "green" | "amber" | "red"}
            size="md"
          />
        </div>
      )}
    </Card>
  );
}