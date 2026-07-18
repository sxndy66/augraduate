"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";
import { createClient } from "@/lib/supabase/client";

interface Subject {
  subject_code: string;
  subject_name: string;
  credits: number;
  category: string;
  is_elective: boolean;
  semester_number: number;
}

interface ArrearFormProps {
  subjects: Subject[];
  onAdded: () => void;
}

const EXAM_MONTHS = [
  { label: "May / June 2025", value: "May/June 2025" },
  { label: "November / December 2025", value: "Nov/Dec 2025" },
  { label: "May / June 2026", value: "May/June 2026" },
  { label: "November / December 2026", value: "Nov/Dec 2026" },
];

const TARGET_GRADES = [
  { label: "O (10)", value: "O" },
  { label: "A+ (9)", value: "A+" },
  { label: "A (8)", value: "A" },
  { label: "B+ (7)", value: "B+" },
  { label: "B (6)", value: "B" },
  { label: "Pass (C / 5)", value: "C" },
];

const SEMESTER_OPTIONS = Array.from({ length: 8 }, (_, i) => ({
  label: `Semester ${i + 1}`,
  value: String(i + 1),
}));

export function ArrearForm({ subjects, onAdded }: ArrearFormProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subjectCode, setSubjectCode] = useState("");
  const [semester, setSemester] = useState("");
  const [examMonth, setExamMonth] = useState("");
  const [targetGrade, setTargetGrade] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const subjectOptions = subjects.map((s) => ({
    label: `${s.subject_code} — ${s.subject_name}`,
    value: s.subject_code,
  }));

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!subjectCode) e.subjectCode = "Please select a subject";
    if (!semester) e.semester = "Please select a semester";
    if (!examMonth) e.examMonth = "Please select an exam month";
    if (!targetGrade) e.targetGrade = "Please select a target grade";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function resetForm() {
    setSubjectCode("");
    setSemester("");
    setExamMonth("");
    setTargetGrade("");
    setNotes("");
    setErrors({});
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast({ type: "error", title: "Not authenticated", message: "Please log in again." });
        return;
      }

      const subject = subjects.find((s) => s.subject_code === subjectCode);
      const { error } = await supabase.from("arrears").insert({
        user_id: user.id,
        subject_code: subjectCode,
        subject_name: subject?.subject_name ?? "",
        semester: parseInt(semester, 10),
        exam_month: examMonth,
        target_grade: targetGrade,
        notes: notes.trim() || null,
        attempts: 1,
        status: "pending",
      });

      if (error) throw error;

      toast({ type: "success", title: "Arrear added", message: "The arrear has been tracked." });
      resetForm();
      setIsOpen(false);
      onAdded();
    } catch (err) {
      toast({
        type: "error",
        title: "Failed to add arrear",
        message: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        leftIcon={<Plus className="h-4 w-4" />}
      >
        Add Arrear
      </Button>
    );
  }

  return (
    <Card gradientBorder className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Add Arrear</h3>
        <button
          onClick={() => {
            setIsOpen(false);
            resetForm();
          }}
          className="rounded-lg p-1.5 text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
          aria-label="Close form"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Subject"
          placeholder="Select a subject"
          options={subjectOptions}
          value={subjectCode}
          onChange={(e) => setSubjectCode(e.target.value)}
          error={errors.subjectCode}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select
            label="Semester"
            placeholder="Select semester"
            options={SEMESTER_OPTIONS}
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            error={errors.semester}
          />

          <Select
            label="Exam Month"
            placeholder="Select exam month"
            options={EXAM_MONTHS}
            value={examMonth}
            onChange={(e) => setExamMonth(e.target.value)}
            error={errors.examMonth}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select
            label="Target Grade"
            placeholder="Select target grade"
            options={TARGET_GRADES}
            value={targetGrade}
            onChange={(e) => setTargetGrade(e.target.value)}
            error={errors.targetGrade}
          />

          <Input
            label="Notes (optional)"
            placeholder="e.g. Focus on derivations"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Button type="submit" isLoading={isSubmitting} leftIcon={<Plus className="h-4 w-4" />}>
            Add Arrear
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setIsOpen(false);
              resetForm();
            }}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}
