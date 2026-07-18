"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, AlertTriangle, Save, RotateCcw } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { isValidGrade, getGradePoint, calculateGPA, type GradeEntry } from "@/lib/validators/gpa";
import type { OCRGradeEntry } from "@/lib/validators/ocr";

export interface OCRConfirmProps {
  entries: OCRGradeEntry[];
  semesterNumber: number;
  onConfirm: () => void;
  onBack: () => void;
  isSaving: boolean;
  className?: string;
}

export function OCRConfirm({
  entries,
  semesterNumber,
  onConfirm,
  onBack,
  isSaving,
  className,
}: OCRConfirmProps) {
  const validEntries = entries.filter(
    (e) => isValidGrade(e.grade) && e.subject_code.trim().length > 0 && e.credits > 0
  );
  const invalidCount = entries.length - validEntries.length;

  const gpaEntries: GradeEntry[] = validEntries.map((e) => ({
    credits: e.credits,
    gradePoint: getGradePoint(e.grade),
  }));
  const projectedGPA = calculateGPA(gpaEntries);

  const totalCredits = validEntries.reduce((sum, e) => sum + e.credits, 0);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn("space-y-4", className)}
      >
        <Card gradientBorder className="p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-success-green/10 text-success-green">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-white">Confirm & Save Grades</h3>
              <p className="mt-1 text-sm text-gray-400">
                Review the summary below. Once confirmed, these grades will be saved to your
                profile for Semester {semesterNumber}. You can edit them later from the semester
                page.
              </p>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className="p-4">
            <p className="text-xs font-medium text-gray-400">Total Subjects</p>
            <p className="mt-1 text-2xl font-bold text-white">{validEntries.length}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs font-medium text-gray-400">Total Credits</p>
            <p className="mt-1 text-2xl font-bold text-white">{totalCredits}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs font-medium text-gray-400">Projected GPA</p>
            <p className="mt-1 text-2xl font-bold text-electric-blue">
              {projectedGPA.toFixed(2)}
            </p>
          </Card>
        </div>

        {invalidCount > 0 && (
          <div className="flex items-center gap-2 rounded-xl border border-amber/30 bg-amber/10 px-4 py-3">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber" />
            <p className="text-sm text-amber">
              {invalidCount} {invalidCount === 1 ? "entry has" : "entries have"} missing or
              invalid data and will be skipped. Go back to fix them.
            </p>
          </div>
        )}

        <div className="flex items-center gap-2 rounded-xl border border-electric-blue/20 bg-electric-blue/5 px-4 py-3">
          <Badge color="blue">Semester {semesterNumber}</Badge>
          <span className="text-sm text-gray-400">
            Grades will be saved to your profile and included in CGPA calculations.
          </span>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            onClick={onBack}
            disabled={isSaving}
            leftIcon={<RotateCcw className="h-4 w-4" />}
          >
            Back to Edit
          </Button>
          <Button
            variant="primary"
            onClick={onConfirm}
            isLoading={isSaving}
            leftIcon={<Save className="h-4 w-4" />}
            disabled={validEntries.length === 0}
          >
            {isSaving ? "Saving…" : `Confirm & Save ${validEntries.length} Grades`}
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}