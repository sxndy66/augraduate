"use client"

export const dynamic = 'force-dynamic';;

import { useState, useCallback, useMemo } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatGPA } from "@/lib/utils";
import { calculateGPA, VALID_GRADES, getGradePoint } from "@/lib/validators/gpa";
import { calculateCGPA } from "@/lib/validators/cgpa";
import {
  Calculator,
  Plus,
  Trash2,
  TrendingUp,
  Save,
  GraduationCap,
  Sparkles,
} from "lucide-react";

interface ManualSubject {
  id: string;
  code: string;
  name: string;
  credits: string;
  grade: string;
}

const GRADE_SELECT_OPTIONS = [
  { label: "Select grade", value: "" },
  ...VALID_GRADES.map((g) => ({ label: g, value: g })),
  { label: "Absent", value: "Absent" },
  { label: "Withheld", value: "Withheld" },
];

type TabType = "gpa" | "cgpa";

export default function CalculatorPage() {
  const [activeTab, setActiveTab] = useState<TabType>("gpa");

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-electric-blue to-royal-indigo">
          <Calculator className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">
            GPA / CGPA Calculator
          </h1>
          <p className="mt-0.5 text-sm text-gray-400">
            Calculate your GPA and CGPA instantly
          </p>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setActiveTab("gpa")}
          className={`rounded-xl border px-5 py-2.5 text-sm font-semibold transition-all ${
            activeTab === "gpa"
              ? "border-electric-blue bg-electric-blue/10 text-electric-blue"
              : "border-navy-600 bg-navy-800/40 text-gray-300 hover:text-white"
          }`}
        >
          GPA Calculator
        </button>
        <button
          onClick={() => setActiveTab("cgpa")}
          className={`rounded-xl border px-5 py-2.5 text-sm font-semibold transition-all ${
            activeTab === "cgpa"
              ? "border-electric-blue bg-electric-blue/10 text-electric-blue"
              : "border-navy-600 bg-navy-800/40 text-gray-300 hover:text-white"
          }`}
        >
          CGPA Calculator
        </button>
      </div>

      {activeTab === "gpa" ? <GPACalculator /> : <CGPACalculator />}
    </div>
  );
}

function GPACalculator() {
  const [subjects, setSubjects] = useState<ManualSubject[]>([
    { id: "1", code: "", name: "", credits: "", grade: "" },
  ]);

  const addSubject = useCallback(() => {
    setSubjects((prev) => [
      ...prev,
      {
        id: `${Date.now()}`,
        code: "",
        name: "",
        credits: "",
        grade: "",
      },
    ]);
  }, []);

  const removeSubject = useCallback((id: string) => {
    setSubjects((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const updateSubject = useCallback(
    (id: string, field: keyof Omit<ManualSubject, "id">, value: string) => {
      setSubjects((prev) =>
        prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
      );
    },
    []
  );

  const { gpa, validCount, totalCredits } = useMemo(() => {
    const entries: { credits: number; gradePoint: number }[] = [];
    let credits = 0;
    for (const s of subjects) {
      const c = parseFloat(s.credits);
      const gp = getGradePoint(s.grade);
      if (!isNaN(c) && c > 0 && gp >= 0) {
        entries.push({ credits: c, gradePoint: gp });
        credits += c;
      }
    }
    return {
      gpa: calculateGPA(entries),
      validCount: entries.length,
      totalCredits: credits,
    };
  }, [subjects]);

  const gpaColor =
    gpa >= 8
      ? "text-success-green"
      : gpa >= 6
        ? "text-electric-blue"
        : gpa >= 5
          ? "text-amber"
          : gpa > 0
            ? "text-error-red"
            : "text-gray-400";

  const progressBarColor =
    gpa >= 8 ? "green" : gpa >= 6 ? "blue" : gpa >= 5 ? "amber" : "red";

  return (
    <div className="space-y-4">
      {/* Subjects List */}
      <Card className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Subjects</h2>
          <Button
            size="sm"
            variant="outline"
            onClick={addSubject}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Add Subject
          </Button>
        </div>

        <div className="space-y-3">
          {subjects.map((subject, idx) => (
            <div
              key={subject.id}
              className="grid grid-cols-1 gap-3 rounded-xl border border-navy-600 bg-navy-800/40 p-4 sm:grid-cols-[120px_1fr_80px_100px_40px]"
            >
              <Input
                placeholder="Code"
                value={subject.code}
                onChange={(e) =>
                  updateSubject(subject.id, "code", e.target.value)
                }
                className="text-sm"
              />
              <Input
                placeholder="Subject name"
                value={subject.name}
                onChange={(e) =>
                  updateSubject(subject.id, "name", e.target.value)
                }
                className="text-sm"
              />
              <Input
                type="number"
                placeholder="Credits"
                value={subject.credits}
                onChange={(e) =>
                  updateSubject(subject.id, "credits", e.target.value)
                }
                className="text-sm"
                min="0"
              />
              <Select
                options={GRADE_SELECT_OPTIONS.filter(
                  (o) => o.value !== ""
                )}
                placeholder="Grade"
                value={subject.grade}
                onChange={(e) =>
                  updateSubject(subject.id, "grade", e.target.value)
                }
                className="text-sm"
              />
              <button
                onClick={() => removeSubject(subject.id)}
                disabled={subjects.length === 1}
                className="flex items-center justify-center rounded-lg border border-navy-600 text-gray-400 transition-colors hover:border-error-red/40 hover:text-error-red disabled:cursor-not-allowed disabled:opacity-30"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* Result */}
      <Card gradientBorder className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-electric-blue/10">
              <TrendingUp className="h-6 w-6 text-electric-blue" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400">
                Calculated GPA
              </p>
              <p className={`text-4xl font-bold ${gpaColor}`}>
                {validCount > 0 ? formatGPA(gpa) : "—.——"}
              </p>
            </div>
          </div>
          <div className="text-right">
            <Badge color="blue">{validCount} subjects</Badge>
            <p className="mt-2 text-sm text-gray-400">
              {totalCredits} credits
            </p>
          </div>
        </div>

        {validCount > 0 && (
          <div className="mt-4">
            <ProgressBar
              value={gpa}
              max={10}
              label="GPA Scale"
              showValue
              color={progressBarColor as "blue" | "green" | "amber" | "red"}
            />
          </div>
        )}
      </Card>
    </div>
  );
}

function CGPACalculator() {
  const [previousCGPA, setPreviousCGPA] = useState("");
  const [previousCredits, setPreviousCredits] = useState("");
  const [currentGPA, setCurrentGPA] = useState("");
  const [currentCredits, setCurrentCredits] = useState("");

  const result = useMemo(() => {
    const prevCGPA = parseFloat(previousCGPA);
    const prevCredits = parseFloat(previousCredits);
    const currGPA = parseFloat(currentGPA);
    const currCredits = parseFloat(currentCredits);

    if (
      isNaN(prevCGPA) ||
      isNaN(prevCredits) ||
      isNaN(currGPA) ||
      isNaN(currCredits)
    ) {
      return null;
    }

    return {
      cgpa: calculateCGPA(prevCGPA, prevCredits, currGPA, currCredits),
      totalCredits: prevCredits + currCredits,
    };
  }, [previousCGPA, previousCredits, currentGPA, currentCredits]);

  const cgpaColor =
    result && result.cgpa >= 8
      ? "text-success-green"
      : result && result.cgpa >= 6
        ? "text-electric-blue"
        : result && result.cgpa >= 5
          ? "text-amber"
          : result && result.cgpa > 0
            ? "text-error-red"
            : "text-gray-400";

  const progressBarColor =
    result && result.cgpa >= 8
      ? "green"
      : result && result.cgpa >= 6
        ? "blue"
        : result && result.cgpa >= 5
          ? "amber"
          : "red";

  return (
    <div className="space-y-4">
      {/* Previous Semester */}
      <Card className="p-5">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-300">
          <GraduationCap className="h-4 w-4 text-electric-blue" />
          Previous Semester Data
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Previous CGPA"
            type="number"
            placeholder="e.g. 8.25"
            value={previousCGPA}
            onChange={(e) => setPreviousCGPA(e.target.value)}
            min="0"
            max="10"
            step="0.01"
            hint="Your CGPA before this semester"
          />
          <Input
            label="Previous Credits"
            type="number"
            placeholder="e.g. 80"
            value={previousCredits}
            onChange={(e) => setPreviousCredits(e.target.value)}
            min="0"
            hint="Total credits completed before this semester"
          />
        </div>
      </Card>

      {/* Current Semester */}
      <Card className="p-5">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-300">
          <Sparkles className="h-4 w-4 text-amber" />
          Current Semester Data
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Current Semester GPA"
            type="number"
            placeholder="e.g. 9.10"
            value={currentGPA}
            onChange={(e) => setCurrentGPA(e.target.value)}
            min="0"
            max="10"
            step="0.01"
            hint="GPA for the current semester"
          />
          <Input
            label="Current Semester Credits"
            type="number"
            placeholder="e.g. 24"
            value={currentCredits}
            onChange={(e) => setCurrentCredits(e.target.value)}
            min="0"
            hint="Credits earned this semester"
          />
        </div>
      </Card>

      {/* Result */}
      {result ? (
        <Card gradientBorder className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-royal-indigo/10">
                <GraduationCap className="h-6 w-6 text-royal-indigo" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-400">
                  New CGPA
                </p>
                <p className={`text-4xl font-bold ${cgpaColor}`}>
                  {formatGPA(result.cgpa)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <Badge color="indigo">
                {result.totalCredits} total credits
              </Badge>
            </div>
          </div>

          <div className="mt-4">
            <ProgressBar
              value={result.cgpa}
              max={10}
              label="CGPA Scale"
              showValue
              color={progressBarColor as "blue" | "green" | "amber" | "red"}
            />
          </div>

          <div className="mt-4 flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Save className="h-4 w-4" />}
            >
              Save Result
            </Button>
          </div>
        </Card>
      ) : (
        <EmptyState
          icon={<Calculator className="h-8 w-8" />}
          title="Enter all values"
          description="Fill in your previous and current semester data to calculate your new CGPA."
        />
      )}
    </div>
  );
}