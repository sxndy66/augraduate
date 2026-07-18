import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { Brain, ArrowRight, Calendar, Target, TrendingUp } from "lucide-react";

interface StudyPlanPreviewData {
  planTitle: string;
  summary: string;
  estimatedImprovement: number;
  weeklySchedule: { day: string; sessions: { subject: string; topic: string; duration: number; priority: string }[] }[];
  subjectStrategies: { subjectCode: string; subjectName: string; priority: string }[];
  dailyGoals: string[];
}

interface StudyPlanPreviewProps {
  plan: StudyPlanPreviewData | null;
  currentCGPA: number;
  targetCGPA: number;
}

export function StudyPlanPreview({ plan, currentCGPA, targetCGPA }: StudyPlanPreviewProps) {
  return (
    <Card className="p-6">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-electric-blue" />
          <h2 className="text-lg font-semibold text-white">AI Study Plan</h2>
        </div>
        <Link
          href="/study-plan"
          className="flex items-center gap-1 text-sm font-medium text-electric-blue hover:text-electric-blue/80"
        >
          {plan ? "View Full Plan" : "Create Plan"} <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {!plan ? (
        <EmptyState
          icon={<Brain className="h-8 w-8" />}
          title="No study plan yet"
          description="Generate a personalized AI study plan based on your CGPA, weak subjects, and exam timeline."
        />
      ) : (
        <div className="space-y-4">
          {/* Plan title */}
          <div>
            <p className="text-sm font-semibold text-white">{plan.planTitle}</p>
            <p className="mt-1 line-clamp-2 text-xs text-gray-400">{plan.summary}</p>
          </div>

          {/* CGPA stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Current</p>
              <p className="mt-1 text-xl font-bold text-white">{currentCGPA.toFixed(2)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Target</p>
              <p className="mt-1 text-xl font-bold text-electric-blue">{targetCGPA.toFixed(2)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Est. Gain</p>
              <p className="mt-1 text-xl font-bold text-success-green">
                +{plan.estimatedImprovement.toFixed(2)}
              </p>
            </div>
          </div>

          <ProgressBar
            value={currentCGPA + plan.estimatedImprovement}
            max={10}
            color="green"
            size="sm"
            label="Projected CGPA"
            showValue
          />

          {/* Quick stats */}
          <div className="flex flex-wrap gap-2">
            <Badge color="blue" icon={<Calendar className="h-3 w-3" />}>
              {plan.weeklySchedule.length} days scheduled
            </Badge>
            <Badge color="amber" icon={<Target className="h-3 w-3" />}>
              {plan.subjectStrategies.filter((s) => s.priority === "high").length} high priority
            </Badge>
            <Badge color="green" icon={<TrendingUp className="h-3 w-3" />}>
              {plan.dailyGoals.length} daily goals
            </Badge>
          </div>

          {/* Upcoming sessions preview */}
          {plan.weeklySchedule.length > 0 && plan.weeklySchedule[0].sessions.length > 0 && (
            <div className="rounded-xl border border-navy-600 bg-navy-800/40 p-3">
              <p className="mb-2 text-xs font-semibold text-gray-300">Today&apos;s first sessions:</p>
              <div className="space-y-1.5">
                {plan.weeklySchedule[0].sessions.slice(0, 3).map((s, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="text-gray-300">{s.subject}</span>
                    <span className="text-gray-500">{s.duration}m</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
