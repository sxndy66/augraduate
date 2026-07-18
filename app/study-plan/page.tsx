"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Brain, Sparkles, AlertCircle } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { StudyPlanForm, type StudyPlanFormValues } from "@/components/planner/StudyPlanForm";
import { StudyPlanResults } from "@/components/planner/StudyPlanResults";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { generateStudyPlan, type StudyPlanOutput } from "@/lib/validators/study-plan";

export default function StudyPlanPage() {
  const { toast } = useToast();
  const [plan, setPlan] = useState<StudyPlanOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<StudyPlanFormValues | null>(null);

  async function handleGenerate(values: StudyPlanFormValues) {
    setIsLoading(true);
    setError(null);
    setFormValues(values);

    try {
      const response = await fetch("/api/study-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || data.error || "Failed to generate study plan");
      }

      setPlan(data.data);
      toast({
        type: "success",
        title: "Study plan generated!",
        message: data.source === "ai" ? "Enhanced with AI." : "Your personalized plan is ready.",
      });
    } catch (err) {
      // Fallback to local generation if API fails
      try {
        const localPlan = generateStudyPlan({
          currentCGPA: values.currentCGPA,
          targetCGPA: values.targetCGPA,
          remainingSemesters: values.remainingSemesters,
          completedCredits: values.completedCredits,
          totalCredits: values.totalCredits,
          weakSubjects: values.weakSubjects,
          strongSubjects: values.strongSubjects,
          studyHoursPerDay: values.studyHoursPerDay,
          examDaysLeft: values.examDaysLeft,
          preferredStudyTime: values.preferredStudyTime,
        });
        setPlan(localPlan);
        toast({
          type: "info",
          title: "Plan generated locally",
          message: "API was unavailable, used local generator.",
        });
      } catch {
        const msg = err instanceof Error ? err.message : "Unknown error";
        setError(msg);
        toast({ type: "error", title: "Generation failed", message: msg });
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSave() {
    if (!plan || !formValues) return;
    setIsSaving(true);

    try {
      const response = await fetch("/api/study-plan/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan,
          currentCGPA: formValues.currentCGPA,
          targetCGPA: formValues.targetCGPA,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || data.error || "Failed to save plan");
      }

      toast({
        type: "success",
        title: "Plan saved!",
        message: "You can access it from your dashboard.",
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      toast({ type: "error", title: "Save failed", message: msg });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="relative z-10 min-h-screen pt-20 pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-electric-blue/20 to-royal-indigo/20">
                <Brain className="h-6 w-6 text-electric-blue" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white sm:text-3xl">AI Study Plan</h1>
                <p className="mt-1 text-sm text-gray-400">
                  Get a personalized study schedule based on your CGPA, weak subjects, and exam timeline.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Form */}
          <div className="mb-8">
            <StudyPlanForm onGenerate={handleGenerate} isLoading={isLoading} />
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20">
              <Spinner size="xl" label="Generating your personalized study plan..." />
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <ErrorState
              title="Failed to generate plan"
              message={error}
              onRetry={() => formValues && handleGenerate(formValues)}
            />
          )}

          {/* Results */}
          {plan && !isLoading && !error && (
            <StudyPlanResults
              plan={plan}
              currentCGPA={formValues?.currentCGPA ?? 0}
              targetCGPA={formValues?.targetCGPA ?? 0}
              onSave={handleSave}
              isSaving={isSaving}
            />
          )}

          {/* Empty State */}
          {!plan && !isLoading && !error && (
            <EmptyState
              icon={<Sparkles className="h-8 w-8" />}
              title="No study plan yet"
              description="Fill in the form above and click 'Generate Study Plan' to get your personalized schedule with subject strategies, daily goals, and CGPA improvement projections."
            />
          )}
        </div>
        <Footer />
      </main>
    </>
  );
}
