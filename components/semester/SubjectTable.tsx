"use client";

import { useState, useMemo, useCallback } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { GPAPreview } from "./GPAPreview";
import { calculateGPA, getGradePoint, VALID_GRADES } from "@/lib/validators/gpa";
import { Save, RotateCcw, Camera, CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface Subject {
  subject_code: string;
  subject_name: string;
  credits: number;
  category: string;
  is_elective: boolean;
  semester_number: number;
}

interface SavedGrade {
  subject_code: string;
  grade: string;
}

interface SubjectTableProps {
  semester: number;
  subjects: Subject[];
  savedGrades: SavedGrade[];
  onSave: (grades: { subject_code: string; grade: string }[]) => Promise<void>;
  isSaving?: boolean;
}

const GRADE_OPTIONS = [
  ...VALID_GRADES.map((g) => ({ label: g, value: g })),
  { label: "Absent", value: "Absent" },
  { label: "Withheld", value: "Withheld" },
];

export function SubjectTable({
  semester,
  subjects,
  savedGrades,
  onSave,
  isSaving = false,
}: SubjectTableProps) {
  const savedMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const g of savedGrades) {
      map.set(g.subject_code, g.grade);
    }
    return map;
  }, [savedGrades]);

  const [grades, setGrades] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const g of savedGrades) {
      initial[g.subject_code] = g.grade;
    }
    return initial;
  });

  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleGradeChange = useCallback(
    (subjectCode: string, grade: string) => {
      setGrades((prev) => ({ ...prev, [subjectCode]: grade }));
      setSaveSuccess(false);
    },
    []
  );

  const handleReset = useCallback(() => {
    setGrades({});
    setSaveSuccess(false);
  }, []);

  const handleSave = useCallback(async () => {
    const entries = Object.entries(grades)
      .filter(([, g]) => g && g !== "")
      .map(([subject_code, grade]) => ({ subject_code, grade }));
    await onSave(entries);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  }, [grades, onSave]);

  // Calculate GPA from current grades
  const gpaValue = useMemo(() => {
    const entries: { credits: number; gradePoint: number }[] = [];
    for (const subject of subjects) {
      const grade = grades[subject.subject_code];
      if (!grade) continue;
      const gp = getGradePoint(grade);
      if (gp >= 0) {
        entries.push({ credits: subject.credits, gradePoint: gp });
      }
    }
    return calculateGPA(entries);
  }, [grades, subjects]);

  const enteredCount = Object.values(grades).filter(
    (g) => g && g !== ""
  ).length;

  const totalCredits = subjects.reduce((sum, s) => sum + s.credits, 0);

  function getGradeBadgeColor(grade: string): "green" | "blue" | "amber" | "red" | "gray" {
    const gp = getGradePoint(grade);
    if (gp >= 8) return "green";
    if (gp >= 6) return "blue";
    if (gp >= 5) return "amber";
    if (gp === 0) return "red";
    return "gray";
  }

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-navy-600 bg-navy-800/50 text-left text-xs uppercase tracking-wide text-gray-400">
                <th className="px-4 py-3 font-medium">Code</th>
                <th className="px-4 py-3 font-medium">Subject Name</th>
                <th className="px-4 py-3 text-center font-medium">Credits</th>
                <th className="px-4 py-3 text-center font-medium">Grade</th>
                <th className="px-4 py-3 text-center font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((subject) => {
                const grade = grades[subject.subject_code] ?? "";
                const isSaved = savedMap.has(subject.subject_code);
                const status = grade
                  ? getGradeBadgeColor(grade)
                  : "gray";

                return (
                  <tr
                    key={subject.subject_code}
                    className="border-b border-navy-700/50 last:border-0 transition-colors hover:bg-navy-800/30"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-gray-300">
                      {subject.subject_code}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-200">
                          {subject.subject_name}
                        </span>
                        {subject.is_elective && (
                          <Badge color="indigo">Elective</Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-300">
                      {subject.credits}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center">
                        <select
                          value={grade}
                          onChange={(e) =>
                            handleGradeChange(
                              subject.subject_code,
                              e.target.value
                            )
                          }
                          className="w-28 rounded-lg border border-navy-600 bg-navy-800 px-2.5 py-1.5 text-center text-sm text-white focus:border-electric-blue/50 focus:outline-none focus:ring-2 focus:ring-electric-blue/30"
                        >
                          <option value="">—</option>
                          {GRADE_OPTIONS.map((opt) => (
                            <option
                              key={opt.value}
                              value={opt.value}
                              className="bg-navy-800"
                            >
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {grade ? (
                        <Badge color={status}>{grade}</Badge>
                      ) : isSaved ? (
                        <Badge color="gray">Saved</Badge>
                      ) : (
                        <span className="text-xs text-gray-500">Pending</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* GPA Preview */}
      <GPAPreview
        gpa={gpaValue}
        enteredCount={enteredCount}
        totalSubjects={subjects.length}
        totalCredits={totalCredits}
      />

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <Button
          onClick={handleSave}
          isLoading={isSaving}
          leftIcon={<Save className="h-4 w-4" />}
          disabled={enteredCount === 0}
        >
          Save Grades
        </Button>
        <Button
          variant="outline"
          onClick={handleReset}
          leftIcon={<RotateCcw className="h-4 w-4" />}
          disabled={enteredCount === 0}
        >
          Reset
        </Button>
        {saveSuccess && (
          <span className="flex items-center gap-1.5 text-sm text-success-green">
            <CheckCircle2 className="h-4 w-4" />
            Grades saved successfully!
          </span>
        )}
        <Link href="/ocr-upload" className="ml-auto">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Camera className="h-4 w-4" />}
          >
            Upload Screenshot
          </Button>
        </Link>
      </div>
    </div>
  );
}