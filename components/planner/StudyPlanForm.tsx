"use client";

import { useState } from "react";
import { Brain, RotateCcw, Plus, X, Clock, Sun, Moon, Sunrise } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";

export interface SubjectSelection {
  subjectCode: string;
  subjectName: string;
  currentGrade: string;
}

export interface StudyPlanFormValues {
  currentCGPA: number;
  targetCGPA: number;
  remainingSemesters: number;
  completedCredits: number;
  totalCredits: number;
  weakSubjects: SubjectSelection[];
  strongSubjects: SubjectSelection[];
  studyHoursPerDay: number;
  examDaysLeft: number;
  preferredStudyTime: "morning" | "evening" | "night";
}

interface StudyPlanFormProps {
  onGenerate: (values: StudyPlanFormValues) => void;
  isLoading: boolean;
  defaultValues?: Partial<StudyPlanFormValues>;
}

const gradeOptions = [
  { label: "O (10)", value: "O" },
  { label: "A+ (9)", value: "A+" },
  { label: "A (8)", value: "A" },
  { label: "B+ (7)", value: "B+" },
  { label: "B (6)", value: "B" },
  { label: "C (5)", value: "C" },
  { label: "U (Reappear)", value: "U" },
  { label: "RA (Arrear)", value: "RA" },
];

const studyTimeOptions = [
  { label: "Morning (6 AM - 12 PM)", value: "morning" },
  { label: "Evening (12 PM - 6 PM)", value: "evening" },
  { label: "Night (6 PM - 12 AM)", value: "night" },
];

const studyTimeIcons: Record<string, React.ReactNode> = {
  morning: <Sunrise className="h-4 w-4" />,
  evening: <Sun className="h-4 w-4" />,
  night: <Moon className="h-4 w-4" />,
};

export function StudyPlanForm({ onGenerate, isLoading, defaultValues }: StudyPlanFormProps) {
  const { toast } = useToast();

  const [values, setValues] = useState<StudyPlanFormValues>({
    currentCGPA: defaultValues?.currentCGPA ?? 7.5,
    targetCGPA: defaultValues?.targetCGPA ?? 8.5,
    remainingSemesters: defaultValues?.remainingSemesters ?? 4,
    completedCredits: defaultValues?.completedCredits ?? 80,
    totalCredits: defaultValues?.totalCredits ?? 160,
    weakSubjects: defaultValues?.weakSubjects ?? [],
    strongSubjects: defaultValues?.strongSubjects ?? [],
    studyHoursPerDay: defaultValues?.studyHoursPerDay ?? 4,
    examDaysLeft: defaultValues?.examDaysLeft ?? 45,
    preferredStudyTime: defaultValues?.preferredStudyTime ?? "evening",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Weak subject form state
  const [weakSubject, setWeakSubject] = useState({ subjectCode: "", subjectName: "", currentGrade: "C" });
  // Strong subject form state
  const [strongSubject, setStrongSubject] = useState({ subjectCode: "", subjectName: "", currentGrade: "A" });

  function update<K extends keyof StudyPlanFormValues>(key: K, val: string) {
    const num = parseFloat(val);
    setValues((prev) => ({ ...prev, [key]: isNaN(num) ? 0 : num }));
  }

  function addWeakSubject() {
    if (!weakSubject.subjectCode.trim() || !weakSubject.subjectName.trim()) {
      toast({ type: "error", title: "Missing fields", message: "Subject code and name are required." });
      return;
    }
    setValues((prev) => ({
      ...prev,
      weakSubjects: [...prev.weakSubjects, { ...weakSubject }],
    }));
    setWeakSubject({ subjectCode: "", subjectName: "", currentGrade: "C" });
  }

  function removeWeakSubject(index: number) {
    setValues((prev) => ({
      ...prev,
      weakSubjects: prev.weakSubjects.filter((_, i) => i !== index),
    }));
  }

  function addStrongSubject() {
    if (!strongSubject.subjectCode.trim() || !strongSubject.subjectName.trim()) {
      toast({ type: "error", title: "Missing fields", message: "Subject code and name are required." });
      return;
    }
    setValues((prev) => ({
      ...prev,
      strongSubjects: [...prev.strongSubjects, { ...strongSubject }],
    }));
    setStrongSubject({ subjectCode: "", subjectName: "", currentGrade: "A" });
  }

  function removeStrongSubject(index: number) {
    setValues((prev) => ({
      ...prev,
      strongSubjects: prev.strongSubjects.filter((_, i) => i !== index),
    }));
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (values.currentCGPA < 0 || values.currentCGPA > 10)
      e.currentCGPA = "CGPA must be between 0 and 10";
    if (values.targetCGPA < 0 || values.targetCGPA > 10)
      e.targetCGPA = "Target CGPA must be between 0 and 10";
    if (values.remainingSemesters < 1 || values.remainingSemesters > 8)
      e.remainingSemesters = "Must be between 1 and 8";
    if (values.completedCredits < 0) e.completedCredits = "Cannot be negative";
    if (values.totalCredits < 1) e.totalCredits = "Must be at least 1";
    if (values.completedCredits > values.totalCredits)
      e.completedCredits = "Cannot exceed total credits";
    if (values.studyHoursPerDay < 0.5 || values.studyHoursPerDay > 16)
      e.studyHoursPerDay = "Must be between 0.5 and 16 hours";
    if (values.examDaysLeft < 1) e.examDaysLeft = "At least 1 day";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) {
      toast({ type: "error", title: "Please fix the errors", message: "Some fields need attention." });
      return;
    }
    onGenerate(values);
  }

  function handleReset() {
    setValues({
      currentCGPA: 7.5,
      targetCGPA: 8.5,
      remainingSemesters: 4,
      completedCredits: 80,
      totalCredits: 160,
      weakSubjects: [],
      strongSubjects: [],
      studyHoursPerDay: 4,
      examDaysLeft: 45,
      preferredStudyTime: "evening",
    });
    setErrors({});
  }

  return (
    <Card gradientBorder className="p-6">
      <div className="mb-5 flex items-center gap-2">
        <Brain className="h-5 w-5 text-electric-blue" />
        <h3 className="text-lg font-semibold text-white">Generate Your AI Study Plan</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* CGPA & Credits Section */}
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
            label="Remaining Semesters"
            type="number"
            min="1"
            max="8"
            placeholder="e.g. 4"
            value={values.remainingSemesters || ""}
            onChange={(e) => update("remainingSemesters", e.target.value)}
            error={errors.remainingSemesters}
          />
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
        </div>

        {/* Study preferences */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Input
            label="Study Hours / Day"
            type="number"
            step="0.5"
            min="0.5"
            max="16"
            placeholder="e.g. 4"
            value={values.studyHoursPerDay || ""}
            onChange={(e) => update("studyHoursPerDay", e.target.value)}
            error={errors.studyHoursPerDay}
            leftIcon={<Clock className="h-4 w-4" />}
          />
          <Input
            label="Exam Days Left"
            type="number"
            min="1"
            max="365"
            placeholder="e.g. 45"
            value={values.examDaysLeft || ""}
            onChange={(e) => update("examDaysLeft", e.target.value)}
            error={errors.examDaysLeft}
          />
          <Select
            label="Preferred Study Time"
            options={studyTimeOptions}
            value={values.preferredStudyTime}
            onChange={(e) =>
              setValues((prev) => ({
                ...prev,
                preferredStudyTime: e.target.value as "morning" | "evening" | "night",
              }))
            }
          />
        </div>

        {/* Weak Subjects */}
        <div className="rounded-xl border border-error-red/20 bg-error-red/5 p-4">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-sm font-semibold text-white">Weak Subjects</span>
            <Badge color="red">{values.weakSubjects.length}</Badge>
            <span className="text-xs text-gray-400">(grades C, U, RA, or absent)</span>
          </div>

          {values.weakSubjects.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {values.weakSubjects.map((s, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 rounded-lg border border-error-red/30 bg-navy-800/50 px-3 py-1.5"
                >
                  <span className="text-xs text-gray-300">
                    {s.subjectCode} — {s.subjectName} ({s.currentGrade})
                  </span>
                  <button
                    type="button"
                    onClick={() => removeWeakSubject(i)}
                    className="text-gray-500 hover:text-error-red"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-4">
            <Input
              placeholder="Code (e.g. MA3251)"
              value={weakSubject.subjectCode}
              onChange={(e) => setWeakSubject((prev) => ({ ...prev, subjectCode: e.target.value }))}
              className="text-sm"
            />
            <Input
              placeholder="Subject name"
              value={weakSubject.subjectName}
              onChange={(e) => setWeakSubject((prev) => ({ ...prev, subjectName: e.target.value }))}
              className="text-sm"
            />
            <Select
              options={gradeOptions}
              value={weakSubject.currentGrade}
              onChange={(e) => setWeakSubject((prev) => ({ ...prev, currentGrade: e.target.value }))}
              className="text-sm"
            />
            <Button type="button" variant="outline" size="sm" onClick={addWeakSubject} leftIcon={<Plus className="h-4 w-4" />}>
              Add
            </Button>
          </div>
        </div>

        {/* Strong Subjects */}
        <div className="rounded-xl border border-success-green/20 bg-success-green/5 p-4">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-sm font-semibold text-white">Strong Subjects</span>
            <Badge color="green">{values.strongSubjects.length}</Badge>
            <span className="text-xs text-gray-400">(grades O, A+, A)</span>
          </div>

          {values.strongSubjects.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {values.strongSubjects.map((s, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 rounded-lg border border-success-green/30 bg-navy-800/50 px-3 py-1.5"
                >
                  <span className="text-xs text-gray-300">
                    {s.subjectCode} — {s.subjectName} ({s.currentGrade})
                  </span>
                  <button
                    type="button"
                    onClick={() => removeStrongSubject(i)}
                    className="text-gray-500 hover:text-error-red"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-4">
            <Input
              placeholder="Code (e.g. CS3351)"
              value={strongSubject.subjectCode}
              onChange={(e) => setStrongSubject((prev) => ({ ...prev, subjectCode: e.target.value }))}
              className="text-sm"
            />
            <Input
              placeholder="Subject name"
              value={strongSubject.subjectName}
              onChange={(e) => setStrongSubject((prev) => ({ ...prev, subjectName: e.target.value }))}
              className="text-sm"
            />
            <Select
              options={gradeOptions}
              value={strongSubject.currentGrade}
              onChange={(e) => setStrongSubject((prev) => ({ ...prev, currentGrade: e.target.value }))}
              className="text-sm"
            />
            <Button type="button" variant="outline" size="sm" onClick={addStrongSubject} leftIcon={<Plus className="h-4 w-4" />}>
              Add
            </Button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <Button type="submit" isLoading={isLoading} leftIcon={<Brain className="h-4 w-4" />}>
            Generate Study Plan
          </Button>
          <Button type="button" variant="ghost" onClick={handleReset} leftIcon={<RotateCcw className="h-4 w-4" />}>
            Reset
          </Button>
        </div>
      </form>
    </Card>
  );
}
