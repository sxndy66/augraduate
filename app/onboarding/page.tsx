"use client"

export const dynamic = 'force-dynamic';;

import React, { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  AlertCircle,
  Target,
  TrendingUp,
  Award,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import { OnboardingStep } from "@/components/forms/OnboardingStep";
import { DegreeSelector } from "@/components/forms/DegreeSelector";
import { RegulationSelector } from "@/components/forms/RegulationSelector";
import { BranchSelector } from "@/components/forms/BranchSelector";
import { SemesterSelector } from "@/components/forms/SemesterSelector";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import degreesData from "@/data/anna-university/degrees.json";
import regulationsData from "@/data/anna-university/regulations.json";
import branchesData from "@/data/anna-university/branches.json";

interface Degree {
  id: string;
  code: string;
  name: string;
  level: string;
  duration: number;
  totalSemesters: number;
  defaultCredits: number;
}

interface Regulation {
  id: string;
  name: string;
  shortName: string;
  fullName: string;
  effectiveFrom: number;
  effectiveTo: number | null;
  isActive: boolean;
  gradingSystem: Record<string, number>;
  passMark: number;
  totalSemesters: number;
  creditsRequired: Record<string, number>;
  description: string;
}

interface Branch {
  id: string;
  code: string;
  name: string;
  degree_id: string;
  regulations: string[];
  totalSemesters: number;
}

interface OnboardingData {
  degreeId: string;
  regulationId: string;
  branchId: string;
  currentSemester: number | null;
  previousCgpa: string;
  previousCredits: string;
  targetCgpa: string;
}

const TOTAL_STEPS = 4;

const initialData: OnboardingData = {
  degreeId: "",
  regulationId: "",
  branchId: "",
  currentSemester: null,
  previousCgpa: "",
  previousCredits: "",
  targetCgpa: "",
};

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const { user, isLoading: authLoading } = useSupabase();

  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const degrees = degreesData as Degree[];
  const regulations = regulationsData as Regulation[];
  const branches = branchesData as Branch[];

  const selectedDegree = useMemo(
    () => degrees.find((d) => d.id === data.degreeId),
    [degrees, data.degreeId]
  );
  const selectedRegulation = useMemo(
    () => regulations.find((r) => r.id === data.regulationId),
    [regulations, data.regulationId]
  );
  const selectedBranch = useMemo(
    () => branches.find((b) => b.id === data.branchId),
    [branches, data.branchId]
  );

  const maxSemesters = useMemo(() => {
    if (selectedDegree) return selectedDegree.totalSemesters;
    if (selectedBranch) return selectedBranch.totalSemesters;
    return 8;
  }, [selectedDegree, selectedBranch]);

  const updateData = useCallback(<K extends keyof OnboardingData>(
    key: K,
    value: OnboardingData[K]
  ) => {
    setData((prev) => ({ ...prev, [key]: value }));
    // Clear error for this field
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  // ── Step validation ──────────────────────────────────────────────
  const validateStep = (currentStep: number): boolean => {
    const stepErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!data.degreeId) stepErrors.degreeId = "Please select a degree";
    }

    if (currentStep === 2) {
      if (!data.regulationId)
        stepErrors.regulationId = "Please select a regulation";
      if (!data.branchId) stepErrors.branchId = "Please select a branch";
    }

    if (currentStep === 3) {
      if (!data.currentSemester)
        stepErrors.currentSemester = "Please select your current semester";

      if (data.previousCgpa) {
        const cgpa = parseFloat(data.previousCgpa);
        if (isNaN(cgpa) || cgpa < 0 || cgpa > 10)
          stepErrors.previousCgpa = "CGPA must be between 0 and 10";
      }

      if (data.previousCredits) {
        const credits = parseInt(data.previousCredits, 10);
        if (isNaN(credits) || credits < 0)
          stepErrors.previousCredits = "Credits must be a positive number";
      }

      if (data.targetCgpa) {
        const target = parseFloat(data.targetCgpa);
        if (isNaN(target) || target < 0 || target > 10)
          stepErrors.targetCgpa = "Target CGPA must be between 0 and 10";
      }
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setSubmitError(null);
      setStep((s) => Math.min(s + 1, TOTAL_STEPS));
    }
  };

  const handleBack = () => {
    setSubmitError(null);
    setErrors({});
    setStep((s) => Math.max(s - 1, 1));
  };

  // ── Final submission ─────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!user) {
      setSubmitError("You must be signed in to complete onboarding.");
      return;
    }

    // Validate final step
    if (!validateStep(3)) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const profileData = {
        id: user.id,
        degree_id: data.degreeId,
        regulation_id: data.regulationId,
        branch_id: data.branchId,
        current_semester: data.currentSemester,
        previous_cgpa: data.previousCgpa ? parseFloat(data.previousCgpa) : null,
        previous_credits: data.previousCredits
          ? parseInt(data.previousCredits, 10)
          : null,
        target_cgpa: data.targetCgpa ? parseFloat(data.targetCgpa) : null,
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("profiles")
        .upsert(profileData, { onConflict: "id" });

      if (error) throw error;

      // Redirect to dashboard
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : "Failed to save your profile. Please try again."
      );
      setIsSubmitting(false);
    }
  };

  // ── Auth loading state ───────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="xl" label="Loading..." />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="max-w-md text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-error-red" />
          <h1 className="text-xl font-bold text-white">Authentication required</h1>
          <p className="mt-2 text-sm text-gray-400">
            Please sign in to continue with onboarding.
          </p>
          <Link href="/login">
            <Button className="mt-6" fullWidth>
              Go to sign in
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-2xl"
      >
        {/* Header */}
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2.5 transition-opacity hover:opacity-90"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-electric-blue to-royal-indigo shadow-lg shadow-electric-blue/30">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">
              AU<span className="text-electric-blue">Track</span>
            </span>
          </Link>
          <h1 className="text-3xl font-bold text-white">
            Let&apos;s set up your profile
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            Tell us about your academic journey to get personalized insights
          </p>
        </div>

        {/* Glassmorphism card */}
        <div className="relative rounded-2xl border border-white/10 bg-navy-800/40 p-8 shadow-2xl backdrop-blur-xl">
          {/* Submit error */}
          <AnimatePresence>
            {submitError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 overflow-hidden rounded-xl border border-error-red/40 bg-error-red/10 px-4 py-3 text-sm text-error-red"
              >
                {submitError}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Step 1: Degree ──────────────────────────────────── */}
          {step === 1 && (
            <OnboardingStep
              step={1}
              totalSteps={TOTAL_STEPS}
              title="Select your degree"
              description="Choose the degree program you are currently enrolled in"
            >
              <DegreeSelector
                value={data.degreeId}
                onChange={(v) => updateData("degreeId", v)}
                error={errors.degreeId}
              />
            </OnboardingStep>
          )}

          {/* ── Step 2: Regulation + Branch ─────────────────────── */}
          {step === 2 && (
            <OnboardingStep
              step={2}
              totalSteps={TOTAL_STEPS}
              title="Regulation & Branch"
              description="Select your curriculum regulation and engineering branch"
            >
              <div className="space-y-5">
                <RegulationSelector
                  value={data.regulationId}
                  onChange={(v) => updateData("regulationId", v)}
                  error={errors.regulationId}
                />

                <BranchSelector
                  degreeId={data.degreeId}
                  regulationId={data.regulationId}
                  value={data.branchId}
                  onChange={(v) => updateData("branchId", v)}
                  error={errors.branchId}
                />
              </div>
            </OnboardingStep>
          )}

          {/* ── Step 3: Semester & CGPA ─────────────────────────── */}
          {step === 3 && (
            <OnboardingStep
              step={3}
              totalSteps={TOTAL_STEPS}
              title="Academic details"
              description="Tell us about your current semester and academic standing"
            >
              <div className="space-y-5">
                <SemesterSelector
                  value={data.currentSemester}
                  onChange={(v) => updateData("currentSemester", v)}
                  maxSemesters={maxSemesters}
                  error={errors.currentSemester}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Previous CGPA (optional)"
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    placeholder="e.g. 8.25"
                    leftIcon={<TrendingUp className="h-4 w-4" />}
                    error={errors.previousCgpa}
                    hint="Your CGPA from completed semesters"
                    value={data.previousCgpa}
                    onChange={(e) =>
                      updateData("previousCgpa", e.target.value)
                    }
                  />

                  <Input
                    label="Completed credits (optional)"
                    type="number"
                    min="0"
                    placeholder="e.g. 80"
                    leftIcon={<Award className="h-4 w-4" />}
                    error={errors.previousCredits}
                    hint="Total credits earned so far"
                    value={data.previousCredits}
                    onChange={(e) =>
                      updateData("previousCredits", e.target.value)
                    }
                  />
                </div>

                <Input
                  label="Target CGPA (optional)"
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  placeholder="e.g. 9.00"
                  leftIcon={<Target className="h-4 w-4" />}
                  error={errors.targetCgpa}
                  hint="Set a goal CGPA to track your progress towards"
                  value={data.targetCgpa}
                  onChange={(e) => updateData("targetCgpa", e.target.value)}
                />
              </div>
            </OnboardingStep>
          )}

          {/* ── Step 4: Review & Confirm ────────────────────────── */}
          {step === 4 && (
            <OnboardingStep
              step={4}
              totalSteps={TOTAL_STEPS}
              title="Review & confirm"
              description="Please verify your details before completing setup"
            >
              <div className="space-y-3">
                <ReviewRow
                  label="Degree"
                  value={
                    selectedDegree
                      ? `${selectedDegree.code} — ${selectedDegree.name}`
                      : "—"
                  }
                />
                <ReviewRow
                  label="Regulation"
                  value={selectedRegulation?.name ?? "—"}
                />
                <ReviewRow
                  label="Branch"
                  value={
                    selectedBranch
                      ? `${selectedBranch.code} — ${selectedBranch.name}`
                      : "—"
                  }
                />
                <ReviewRow
                  label="Current semester"
                  value={
                    data.currentSemester
                      ? `Semester ${data.currentSemester}`
                      : "—"
                  }
                />
                <ReviewRow
                  label="Previous CGPA"
                  value={data.previousCgpa || "Not provided"}
                />
                <ReviewRow
                  label="Completed credits"
                  value={data.previousCredits || "Not provided"}
                />
                <ReviewRow
                  label="Target CGPA"
                  value={data.targetCgpa || "Not provided"}
                />
              </div>

              <div className="mt-6 rounded-xl border border-electric-blue/20 bg-electric-blue/5 p-4">
                <p className="text-sm text-gray-300">
                  You can change these details later in your profile settings.
                </p>
              </div>
            </OnboardingStep>
          )}

          {/* ── Navigation buttons ──────────────────────────────── */}
          <div className="mt-8 flex items-center justify-between gap-3 border-t border-white/5 pt-6">
            <Button
              variant="ghost"
              size="md"
              onClick={handleBack}
              disabled={step === 1 || isSubmitting}
              leftIcon={<ArrowLeft className="h-4 w-4" />}
            >
              Back
            </Button>

            {step < TOTAL_STEPS ? (
              <Button
                variant="primary"
                size="md"
                onClick={handleNext}
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                Next
              </Button>
            ) : (
              <Button
                variant="primary"
                size="md"
                onClick={handleSubmit}
                isLoading={isSubmitting}
                leftIcon={
                  !isSubmitting ? <Check className="h-4 w-4" /> : undefined
                }
              >
                Complete setup
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ── Review row helper ───────────────────────────────────────────────
function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-navy-600 bg-navy-800/40 px-4 py-3">
      <span className="text-sm text-gray-400">{label}</span>
      <span className="text-sm font-semibold text-white">{value}</span>
    </div>
  );
}