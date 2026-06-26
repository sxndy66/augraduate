"use client";

import { useMemo } from "react";
import { calculateGPA, detectArrears, getClassification } from "@/lib/cgpa/calculator";
import type { ParsedSubject } from "@/lib/ocr/parser";

interface GPAPreviewProps {
  subjects: ParsedSubject[];
}

export function GPAPreview({ subjects }: GPAPreviewProps) {
  const gpa = useMemo(() => calculateGPA(subjects), [subjects]);
  const arrears = useMemo(() => detectArrears(subjects), [subjects]);
  const totalCredits = useMemo(
    () =>
      subjects
        .filter((s) => !["U", "AB", "SA", "RA"].includes(s.grade))
        .reduce((sum, s) => sum + s.credits, 0),
    [subjects]
  );
  const classification = getClassification(gpa);

  const gpaColor =
    gpa >= 8.5
      ? "text-[#00D4AA]"
      : gpa >= 7
      ? "text-[#A78BFA]"
      : gpa >= 5
      ? "text-[#FFB347]"
      : "text-[#FF4757]";

  return (
    <div className="card bg-[#1A1A26] border-[#2A2A3D] space-y-4">
      <h3 className="text-xs text-[#6B6B80] font-medium uppercase tracking-wider">
        Live GPA Preview
      </h3>

      <div className="flex items-end gap-2">
        <span className={`text-5xl font-bold font-mono ${gpaColor}`}>
          {gpa.toFixed(2)}
        </span>
        <span className="text-[#6B6B80] text-sm mb-1">/ 10.0</span>
      </div>

      <p className="text-xs text-[#6B6B80]">{classification}</p>

      {/* GPA bar */}
      <div className="h-1.5 rounded-full bg-[#0A0A0F] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${(gpa / 10) * 100}%`,
            background:
              gpa >= 8.5
                ? "#00D4AA"
                : gpa >= 7
                ? "#A78BFA"
                : gpa >= 5
                ? "#FFB347"
                : "#FF4757",
          }}
        />
      </div>

      <div className="grid grid-cols-3 gap-3 pt-1">
        <div>
          <p className="text-[#6B6B80] text-[10px] uppercase tracking-wide">Subjects</p>
          <p className="text-[#E8E8F0] font-mono font-semibold text-lg">{subjects.length}</p>
        </div>
        <div>
          <p className="text-[#6B6B80] text-[10px] uppercase tracking-wide">Credits</p>
          <p className="text-[#E8E8F0] font-mono font-semibold text-lg">{totalCredits}</p>
        </div>
        <div>
          <p className="text-[#6B6B80] text-[10px] uppercase tracking-wide">Arrears</p>
          <p
            className={`font-mono font-semibold text-lg ${
              arrears.length > 0 ? "text-[#FF4757]" : "text-[#00D4AA]"
            }`}
          >
            {arrears.length}
          </p>
        </div>
      </div>

      {arrears.length > 0 && (
        <div className="pt-2 border-t border-[#2A2A3D] space-y-1">
          <p className="text-xs text-[#FF4757] font-medium">Arrear subjects:</p>
          {arrears.map((a) => (
            <div key={a.subject_code} className="flex items-center justify-between text-xs">
              <span className="font-mono text-[#6B6B80]">{a.subject_code}</span>
              <span className="text-[#FF4757] font-semibold">{a.grade}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
