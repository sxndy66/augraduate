"use client"

export const dynamic = 'force-dynamic';;

import { useState } from "react";
import { Target, Sparkles } from "lucide-react";
import { PlannerForm, type PlannerFormValues } from "@/components/planner/PlannerForm";
import { PlannerResults } from "@/components/planner/PlannerResults";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";
import { useToast } from "@/components/ui/Toast";

interface PlanResult {
  safe: {
    requiredGPA: number;
    isAchievable: boolean;
    message: string;
  };
  aggressive: {
    requiredGPA: number;
    isAchievable: boolean;
    message: string;
  };
  remainingCredits: number;
  totalCredits: number;
}

export default function TargetPlannerPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PlanResult | null>(null);
  const [inputs, setInputs] = useState<PlannerFormValues | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCalculate(values: PlannerFormValues) {
    setIsLoading(true);
    setError(null);
    setInputs(values);

    try {
      const response = await fetch("/api/target-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || data.error || "Failed to calculate plan.");
      }

      setResult(data.data.plan);
      toast({
        type: "success",
        title: "Plan calculated!",
        message: "Check out your semester-wise breakdown below.",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to calculate plan.");
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <Target className="h-7 w-7 text-electric-blue" />
          <h1 className="text-2xl font-bold text-white sm:text-3xl">Target CGPA Planner</h1>
        </div>
        <p className="mt-1 text-sm text-gray-400">
          Set your target CGPA and get a semester-wise plan to achieve it. We'll calculate
          the required GPA and show you safe and aggressive strategies.
        </p>
      </div>

      {/* Form */}
      <div className="mb-6">
        <PlannerForm onCalculate={handleCalculate} isLoading={isLoading} />
      </div>

      {/* Loading */}
      {isLoading && (
        <Card className="flex items-center justify-center py-20">
          <Spinner size="lg" label="Calculating your plan..." />
        </Card>
      )}

      {/* Error */}
      {error && !isLoading && (
        <ErrorState
          title="Calculation failed"
          message={error}
          onRetry={() => inputs && handleCalculate(inputs)}
        />
      )}

      {/* Results */}
      {result && !isLoading && !error && inputs && (
        <PlannerResults result={result} inputs={inputs} />
      )}

      {/* Initial state hint */}
      {!result && !isLoading && !error && (
        <Card className="flex flex-col items-center justify-center py-16 text-center">
          <Sparkles className="h-10 w-10 text-electric-blue/50" />
          <h3 className="mt-4 text-lg font-semibold text-white">
            Ready when you are
          </h3>
          <p className="mt-1 max-w-sm text-sm text-gray-400">
            Fill in your academic details above and hit "Calculate Plan" to see your
            personalized CGPA roadmap.
          </p>
        </Card>
      )}
    </div>
  );
}
