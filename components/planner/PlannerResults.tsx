"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Target, AlertTriangle, Save, CheckCircle2, Flame, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Badge } from "@/components/ui/Badge";
import { SemesterPlan } from "./SemesterPlan";
import { formatGPA } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

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

interface PlannerResultsProps {
  result: PlanResult;
  inputs: {
    currentCGPA: number;
    targetCGPA: number;
    completedCredits: number;
    totalCredits: number;
    remainingCredits: number;
    remainingSemesters: number;
  };
}

export function PlannerResults({ result, inputs }: PlannerResultsProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const { safe, aggressive } = result;
  const isImpossible = !safe.isAchievable;
  const requiredGPA = safe.requiredGPA;

  // Max achievable CGPA
  const maxAchievableCGPA =
    inputs.totalCredits > 0
      ? (inputs.currentCGPA * inputs.completedCredits + 10 * inputs.remainingCredits) /
        inputs.totalCredits
      : 0;

  // Progress: current CGPA vs target
  const progressPercent =
    inputs.targetCGPA > 0 ? (inputs.currentCGPA / inputs.targetCGPA) * 100 : 0;

  // Motivational message
  let motivation = "";
  let motivationIcon = <CheckCircle2 className="h-5 w-5" />;
  let motivationColor = "text-success-green";

  if (isImpossible) {
    motivation = `Reaching ${formatGPA(inputs.targetCGPA)} isn't mathematically possible, but your max achievable CGPA is ${formatGPA(maxAchievableCGPA)}. Consider adjusting your target — you can still achieve great results!`;
    motivationIcon = <AlertTriangle className="h-5 w-5" />;
    motivationColor = "text-amber";
  } else if (requiredGPA <= 6) {
    motivation = "You're in a comfortable position! Consistent effort will easily get you there.";
    motivationIcon = <CheckCircle2 className="h-5 w-5" />;
    motivationColor = "text-success-green";
  } else if (requiredGPA <= 8) {
    motivation = "You need solid, consistent performance. Stay focused and you'll reach your target!";
    motivationIcon = <TrendingUp className="h-5 w-5" />;
    motivationColor = "text-electric-blue";
  } else if (requiredGPA <= 9.5) {
    motivation = "This is ambitious but achievable! You'll need excellent grades — push hard!";
    motivationIcon = <Flame className="h-5 w-5" />;
    motivationColor = "text-amber";
  } else {
    motivation = "This requires near-perfect performance. Give it everything you've got!";
    motivationIcon = <Flame className="h-5 w-5" />;
    motivationColor = "text-error-red";
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast({ type: "error", title: "Not authenticated", message: "Please log in again." });
        return;
      }

      // Save target CGPA to profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ target_cgpa: inputs.targetCGPA })
        .eq("id", user.id);

      if (profileError) throw profileError;

      // Save plan to target_plans table
      const { error: planError } = await supabase.from("target_plans").insert({
        user_id: user.id,
        current_cgpa: inputs.currentCGPA,
        target_cgpa: inputs.targetCGPA,
        completed_credits: inputs.completedCredits,
        total_credits: inputs.totalCredits,
        remaining_credits: inputs.remainingCredits,
        remaining_semesters: inputs.remainingSemesters,
        required_gpa: requiredGPA,
        is_achievable: safe.isAchievable,
        safe_plan: safe,
        aggressive_plan: aggressive,
      });

      if (planError) throw planError;

      toast({ type: "success", title: "Plan saved!", message: "Your target plan has been saved." });
      setIsSaved(true);
    } catch (err) {
      toast({
        type: "error",
        title: "Failed to save plan",
        message: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Big Required GPA Display */}
      <Card gradientBorder className="p-8 text-center">
        <div className="mb-2 flex items-center justify-center gap-2">
          <Target className="h-5 w-5 text-electric-blue" />
          <span className="text-sm font-medium text-gray-400">Required Average GPA</span>
        </div>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className={`text-6xl font-bold ${isImpossible ? "text-error-red" : "gradient-text"}`}
        >
          {formatGPA(requiredGPA)}
        </motion.div>
        <p className="mt-2 text-sm text-gray-500">
          per semester for {inputs.remainingSemesters} semester{inputs.remainingSemesters > 1 ? "s" : ""}
        </p>

        {/* Progress bar: current vs target */}
        <div className="mx-auto mt-6 max-w-md">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-gray-400">
              Current: <span className="font-semibold text-white">{formatGPA(inputs.currentCGPA)}</span>
            </span>
            <span className="text-gray-400">
              Target: <span className="font-semibold text-electric-blue">{formatGPA(inputs.targetCGPA)}</span>
            </span>
          </div>
          <ProgressBar
            value={Math.min(inputs.currentCGPA, 10)}
            max={10}
            color={isImpossible ? "red" : "blue"}
            size="lg"
          />
        </div>

        {/* Impossible Warning */}
        <AnimatePresence>
          {isImpossible && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 rounded-xl border border-error-red/30 bg-error-red/10 p-4"
            >
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-error-red" />
                <div className="text-left">
                  <p className="text-sm font-semibold text-error-red">
                    Mathematically Impossible
                  </p>
                  <p className="mt-1 text-sm text-gray-400">
                    Even with a perfect 10.0 GPA in all remaining semesters, your maximum
                    achievable CGPA would be <span className="font-semibold text-white">{formatGPA(maxAchievableCGPA)}</span>.
                    Consider lowering your target to {formatGPA(maxAchievableCGPA)} or below.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Motivational Message */}
      <Card className="flex items-start gap-3 p-5">
        <div className={`shrink-0 ${motivationColor}`}>{motivationIcon}</div>
        <p className="text-sm text-gray-300">{motivation}</p>
      </Card>

      {/* Plans */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SemesterPlan
          type="safe"
          requiredGPA={safe.requiredGPA}
          isAchievable={safe.isAchievable}
          message={safe.message}
          remainingSemesters={inputs.remainingSemesters}
          remainingCredits={inputs.remainingCredits}
        />
        <SemesterPlan
          type="aggressive"
          requiredGPA={aggressive.requiredGPA}
          isAchievable={aggressive.isAchievable}
          message={aggressive.message}
          remainingSemesters={inputs.remainingSemesters}
          remainingCredits={inputs.remainingCredits}
        />
      </div>

      {/* Save Button */}
      <div className="flex justify-center">
        <Button
          onClick={handleSave}
          isLoading={isSaving}
          leftIcon={isSaved ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          variant={isSaved ? "secondary" : "primary"}
          size="lg"
        >
          {isSaved ? "Plan Saved!" : "Save Plan"}
        </Button>
      </div>
    </motion.div>
  );
}
