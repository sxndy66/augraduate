"use client";

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";

export interface PlannerFormValues {
  currentCGPA: number;
  targetCGPA: number;
  completedCredits: number;
  totalCredits: number;
  remainingCredits: number;
  remainingSemesters: number;
}

interface PlannerFormProps {
  onCalculate: (values: PlannerFormValues) => void;
  isLoading: boolean;
  defaultValues?: Partial<PlannerFormValues>;
}

export function PlannerForm({ onCalculate, isLoading, defaultValues }: PlannerFormProps) {
  const { toast } = useToast();
  const [values, setValues] = useState<PlannerFormValues>({
    currentCGPA: defaultValues?.currentCGPA ?? 0,
    targetCGPA: defaultValues?.targetCGPA ?? 8.5,
    completedCredits: defaultValues?.completedCredits ?? 0,
    totalCredits: defaultValues?.totalCredits ?? 160,
    remainingCredits: defaultValues?.remainingCredits ?? 0,
    remainingSemesters: defaultValues?.remainingSemesters ?? 4,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function update<K extends keyof PlannerFormValues>(key: K, val: string) {
    const num = parseFloat(val);
    setValues((prev) => ({ ...prev, [key]: isNaN(num) ? 0 : num }));
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (values.currentCGPA < 0 || values.currentCGPA > 10)
      e.currentCGPA = "CGPA must be between 0 and 10";
    if (values.targetCGPA < 0 || values.targetCGPA > 10)
      e.targetCGPA = "Target CGPA must be between 0 and 10";
    if (values.completedCredits < 0) e.completedCredits = "Cannot be negative";
    if (values.totalCredits <= 0) e.totalCredits = "Must be greater than 0";
    if (values.remainingCredits < 0) e.remainingCredits = "Cannot be negative";
    if (values.remainingSemesters < 1) e.remainingSemesters = "At least 1 semester";
    if (values.completedCredits + values.remainingCredits > values.totalCredits)
      e.remainingCredits = "Completed + remaining exceeds total credits";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) {
      toast({ type: "error", title: "Please fix the errors", message: "Some fields need attention." });
      return;
    }
    onCalculate(values);
  }

  function handleReset() {
    setValues({
      currentCGPA: 0,
      targetCGPA: 8.5,
      completedCredits: 0,
      totalCredits: 160,
      remainingCredits: 0,
      remainingSemesters: 4,
    });
    setErrors({});
  }

  return (
    <Card gradientBorder className="p-6">
      <div className="mb-5 flex items-center gap-2">
        <Calculator className="h-5 w-5 text-electric-blue" />
        <h3 className="text-lg font-semibold text-white">Plan Your Target CGPA</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Current CGPA"
            type="number"
            step="0.01"
            min="0"
            max="10"
            placeholder="e.g. 7.50"
            value={values.currentCGPA || ""}
            onChange={(e) => update("currentCGPA", e.target.value)}
            error={errors.currentCGPA}
          />
          <Input
            label="Target CGPA"
            type="number"
            step="0.01"
            min="0"
            max="10"
            placeholder="e.g. 8.50"
            value={values.targetCGPA || ""}
            onChange={(e) => update("targetCGPA", e.target.value)}
            error={errors.targetCGPA}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Input
            label="Completed Credits"
            type="number"
            min="0"
            placeholder="e.g. 80"
            value={values.completedCredits || ""}
            onChange={(e) => update("completedCredits", e.target.value)}
            error={errors.completedCredits}
          />
          <Input
            label="Total Credits"
            type="number"
            min="1"
            placeholder="e.g. 160"
            value={values.totalCredits || ""}
            onChange={(e) => update("totalCredits", e.target.value)}
            error={errors.totalCredits}
          />
          <Input
            label="Remaining Credits"
            type="number"
            min="0"
            placeholder="e.g. 80"
            value={values.remainingCredits || ""}
            onChange={(e) => update("remainingCredits", e.target.value)}
            error={errors.remainingCredits}
          />
        </div>

        <Input
          label="Remaining Semesters"
          type="number"
          min="1"
          max="8"
          placeholder="e.g. 4"
          value={values.remainingSemesters || ""}
          onChange={(e) => update("remainingSemesters", e.target.value)}
          error={errors.remainingSemesters}
          hint="How many semesters do you have left?"
        />

        <div className="flex items-center gap-3 pt-2">
          <Button type="submit" isLoading={isLoading} leftIcon={<Calculator className="h-4 w-4" />}>
            Calculate Plan
          </Button>
          <Button type="button" variant="ghost" onClick={handleReset} leftIcon={<RotateCcw className="h-4 w-4" />}>
            Reset
          </Button>
        </div>
      </form>
    </Card>
  );
}
