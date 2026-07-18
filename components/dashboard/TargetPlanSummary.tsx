import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { EmptyState } from "@/components/ui/EmptyState";
import Link from "next/link";
import { Target, ArrowRight, TrendingUp, Zap } from "lucide-react";
import { formatGPA } from "@/lib/utils";
import type { PlanResult } from "@/lib/validators/target-plan";

interface TargetPlanSummaryProps {
  currentCGPA: number;
  targetCGPA: number;
  completedCredits: number;
  totalCredits: number;
  plan: PlanResult | null;
}

export function TargetPlanSummary({
  currentCGPA,
  targetCGPA,
  completedCredits,
  totalCredits,
  plan,
}: TargetPlanSummaryProps) {
  const progress =
    totalCredits > 0 ? (completedCredits / totalCredits) * 100 : 0;

  return (
    <Card className="p-6">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-royal-indigo" />
          <h2 className="text-lg font-semibold text-white">Target CGPA Plan</h2>
        </div>
        <Link
          href="/target-plan"
          className="flex items-center gap-1 text-sm font-medium text-electric-blue hover:text-electric-blue/80"
        >
          Details <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {!plan ? (
        <EmptyState
          icon={<Target className="h-8 w-8" />}
          title="No target set"
          description="Set a target CGPA to see your personalized plan."
        />
      ) : (
        <div className="space-y-5">
          {/* CGPA Progress */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Current
              </p>
              <p className="mt-1 text-2xl font-bold text-white">
                {formatGPA(currentCGPA)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Target
              </p>
              <p className="mt-1 text-2xl font-bold text-electric-blue">
                {formatGPA(targetCGPA)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Credits
              </p>
              <p className="mt-1 text-2xl font-bold text-white">
                {completedCredits}
                <span className="text-sm text-gray-400">/{totalCredits}</span>
              </p>
            </div>
          </div>

          <ProgressBar
            value={completedCredits}
            max={totalCredits}
            label="Credit Progress"
            showValue
            color="blue"
          />

          {/* Plans */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {/* Safe Plan */}
            <div className="rounded-xl border border-success-green/20 bg-success-green/5 p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-success-green" />
                <span className="text-sm font-semibold text-white">
                  Safe Plan
                </span>
                {plan.safe.isAchievable ? (
                  <Badge color="green">Achievable</Badge>
                ) : (
                  <Badge color="red">Not feasible</Badge>
                )}
              </div>
              <p className="mt-2 text-2xl font-bold text-success-green">
                {plan.safe.requiredGPA.toFixed(2)}
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Avg GPA needed per semester
              </p>
            </div>

            {/* Aggressive Plan */}
            <div className="rounded-xl border border-amber/20 bg-amber/5 p-4">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber" />
                <span className="text-sm font-semibold text-white">
                  Aggressive
                </span>
                {plan.aggressive.isAchievable ? (
                  <Badge color="amber">Buffer</Badge>
                ) : (
                  <Badge color="red">Not feasible</Badge>
                )}
              </div>
              <p className="mt-2 text-2xl font-bold text-amber">
                {plan.aggressive.requiredGPA.toFixed(2)}
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Aim higher for a buffer
              </p>
            </div>
          </div>

          <p className="text-xs text-gray-400">
            {plan.safe.message}
          </p>
        </div>
      )}
    </Card>
  );
}