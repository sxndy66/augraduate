"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Sparkles, Target, CheckCircle2, Circle, Trophy,
  Calendar, BookOpen, Lightbulb, Save, Printer, TrendingUp,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { WeeklySchedule } from "./WeeklySchedule";
import { SubjectStrategy } from "./SubjectStrategy";
import { useToast } from "@/components/ui/Toast";
import type { StudyPlanOutput } from "@/lib/validators/study-plan";

interface StudyPlanResultsProps {
  plan: StudyPlanOutput;
  currentCGPA: number;
  targetCGPA: number;
  onSave: () => void;
  isSaving: boolean;
}

export function StudyPlanResults({
  plan,
  currentCGPA,
  targetCGPA,
  onSave,
  isSaving,
}: StudyPlanResultsProps) {
  const { toast } = useToast();
  const [checkedGoals, setCheckedGoals] = useState<Set<number>>(new Set());

  function toggleGoal(index: number) {
    setCheckedGoals((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  function handlePrint() {
    window.print();
  }

  const goalProgress = (checkedGoals.size / plan.dailyGoals.length) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Plan Title & Summary */}
      <Card gradientBorder className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-electric-blue" />
              <h2 className="text-xl font-bold text-white">{plan.planTitle}</h2>
            </div>
            <p className="text-sm leading-relaxed text-gray-300">{plan.summary}</p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onSave}
              isLoading={isSaving}
              leftIcon={<Save className="h-4 w-4" />}
            >
              Save
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrint}
              leftIcon={<Printer className="h-4 w-4" />}
            >
              Print
            </Button>
          </div>
        </div>

        {/* Estimated improvement */}
        <div className="mt-5 grid grid-cols-3 gap-4">
          <div className="rounded-xl border border-navy-600 bg-navy-800/40 p-4 text-center">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Current</p>
            <p className="mt-1 text-2xl font-bold text-white">{currentCGPA.toFixed(2)}</p>
          </div>
          <div className="rounded-xl border border-electric-blue/20 bg-electric-blue/5 p-4 text-center">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Target</p>
            <p className="mt-1 text-2xl font-bold text-electric-blue">{targetCGPA.toFixed(2)}</p>
          </div>
          <div className="rounded-xl border border-success-green/20 bg-success-green/5 p-4 text-center">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Est. Gain</p>
            <p className="mt-1 text-2xl font-bold text-success-green">
              +{plan.estimatedImprovement.toFixed(2)}
            </p>
          </div>
        </div>
      </Card>

      {/* Weekly Schedule */}
      <WeeklySchedule schedule={plan.weeklySchedule} />

      {/* Subject Strategies */}
      {plan.subjectStrategies.length > 0 && (
        <div>
          <div className="mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-royal-indigo" />
            <h3 className="text-lg font-semibold text-white">Subject Strategies</h3>
            <Badge color="indigo">{plan.subjectStrategies.length}</Badge>
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {plan.subjectStrategies.map((strategy, i) => (
              <SubjectStrategy key={i} strategy={strategy} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* Daily Goals & Weekly Goals */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Daily Goals */}
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-amber" />
              <h3 className="text-lg font-semibold text-white">Daily Goals</h3>
            </div>
            <Badge color="amber">
              {checkedGoals.size}/{plan.dailyGoals.length}
            </Badge>
          </div>

          <ProgressBar
            value={checkedGoals.size}
            max={plan.dailyGoals.length}
            color="amber"
            size="sm"
            className="mb-4"
          />

          <ul className="space-y-2.5">
            {plan.dailyGoals.map((goal, i) => (
              <li key={i}>
                <button
                  onClick={() => toggleGoal(i)}
                  className="flex w-full items-start gap-3 text-left transition-colors hover:bg-navy-800/40 rounded-lg p-2 -m-2"
                >
                  {checkedGoals.has(i) ? (
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success-green" />
                  ) : (
                    <Circle className="mt-0.5 h-5 w-5 shrink-0 text-gray-500" />
                  )}
                  <span
                    className={`text-sm ${
                      checkedGoals.has(i)
                        ? "text-gray-500 line-through"
                        : "text-gray-300"
                    }`}
                  >
                    {goal}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </Card>

        {/* Weekly Goals */}
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-electric-blue" />
            <h3 className="text-lg font-semibold text-white">Weekly Goals</h3>
          </div>

          <ul className="space-y-2.5">
            {plan.weeklyGoals.map((goal, i) => (
              <li key={i} className="flex items-start gap-3 rounded-lg p-2 -m-2">
                <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-electric-blue" />
                <span className="text-sm text-gray-300">{goal}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Motivational Message */}
      <Card gradientBorder className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber/20 to-royal-indigo/20">
            <Trophy className="h-6 w-6 text-amber" />
          </div>
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-amber" />
              <h3 className="text-sm font-semibold text-white">Motivation</h3>
            </div>
            <p className="text-sm leading-relaxed text-gray-300">
              {plan.motivationalMessage}
            </p>
          </div>
        </div>
      </Card>

      {/* CGPA Improvement Projection */}
      <Card className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-success-green" />
          <h3 className="text-lg font-semibold text-white">Estimated CGPA Improvement</h3>
        </div>

        <div className="space-y-4">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm text-gray-400">Current → Projected</span>
              <span className="text-sm font-semibold text-white">
                {currentCGPA.toFixed(2)} → {(currentCGPA + plan.estimatedImprovement).toFixed(2)}
              </span>
            </div>
            <ProgressBar
              value={currentCGPA + plan.estimatedImprovement}
              max={10}
              color="green"
              showValue
              label="Projected CGPA"
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm text-gray-400">Progress to Target</span>
              <span className="text-sm font-semibold text-white">
                {((plan.estimatedImprovement / Math.max(0.01, targetCGPA - currentCGPA)) * 100).toFixed(0)}%
              </span>
            </div>
            <ProgressBar
              value={plan.estimatedImprovement}
              max={Math.max(0.01, targetCGPA - currentCGPA)}
              color="blue"
              showValue
            />
          </div>

          <p className="text-xs text-gray-500">
            * Estimates are based on your study hours, days until exams, and CGPA gap. Actual results depend on consistent effort and effective study techniques.
          </p>
        </div>
      </Card>
    </motion.div>
  );
}
