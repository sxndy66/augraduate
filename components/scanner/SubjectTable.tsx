"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { getGradePoints } from "@/lib/cgpa/calculator";
import type { ParsedSubject } from "@/lib/ocr/parser";

const GRADES = ["O", "A+", "A", "B+", "B", "C", "U", "AB", "SA", "RA"] as const;
const GRADE_COLORS: Record<string, string> = {
  O: "text-[#00D4AA]",
  "A+": "text-[#7EE7D0]",
  A: "text-[#A78BFA]",
  "B+": "text-[#60A5FA]",
  B: "text-[#93C5FD]",
  C: "text-[#FFB347]",
  U: "text-[#FF4757]",
  AB: "text-[#FF4757]",
  SA: "text-[#FF4757]",
  RA: "text-[#FF4757]",
};

const BLANK_SUBJECT: ParsedSubject = {
  subject_code: "",
  subject_name: "",
  credits: 3,
  grade: "O",
  grade_points: 10,
  is_arrear: false,
  confidence: "high",
};

interface SubjectTableProps {
  subjects: ParsedSubject[];
  onChange: (subjects: ParsedSubject[]) => void;
}

export function SubjectTable({ subjects, onChange }: SubjectTableProps) {
  const [editingIdx, setEditingIdx] = useState<number | null>(null);

  function update(idx: number, field: keyof ParsedSubject, value: string | number | boolean) {
    const updated = subjects.map((s, i) => {
      if (i !== idx) return s;
      const next = { ...s, [field]: value };

      if (field === "grade") {
        const grade = value as string;
        next.grade_points = getGradePoints(grade);
        next.is_arrear = grade === "U" || grade === "RA" || grade === "AB";
      }
      if (field === "credits") {
        next.credits = Math.max(1, Math.min(6, Number(value)));
      }
      return next;
    });
    onChange(updated);
  }

  function remove(idx: number) {
    onChange(subjects.filter((_, i) => i !== idx));
  }

  function addRow() {
    onChange([...subjects, { ...BLANK_SUBJECT }]);
    setEditingIdx(subjects.length);
  }

  const lowConfidence = subjects.filter((s) => s.confidence === "low").length;

  return (
    <div className="space-y-3">
      {/* Low-confidence warning */}
      {lowConfidence > 0 && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-[#FFB347]/10 border border-[#FFB347]/30 text-[#FFB347] text-xs">
          <svg width="14" height="14" fill="currentColor" className="mt-0.5 shrink-0" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
          <span>
            <strong>{lowConfidence}</strong> row{lowConfidence > 1 ? "s were" : " was"} partially detected — please verify subject name and credits before saving.
          </span>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-[#2A2A3D]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#2A2A3D] bg-[#12121A]">
              {["Code", "Subject Name", "Cr", "Grade", "GP", ""].map((h) => (
                <th
                  key={h}
                  className="text-left text-[#6B6B80] font-medium py-2.5 px-3 first:pl-4 last:pr-3 whitespace-nowrap text-xs uppercase tracking-wide"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {subjects.map((s, idx) => {
              const isEditing = editingIdx === idx;
              return (
                <tr
                  key={idx}
                  onClick={() => setEditingIdx(idx)}
                  className={cn(
                    "border-b border-[#2A2A3D]/50 last:border-0 transition-colors cursor-pointer",
                    isEditing ? "bg-[#1A1A26]" : "hover:bg-[#12121A]",
                    s.is_arrear && "bg-[#FF4757]/5"
                  )}
                >
                  {/* Subject Code */}
                  <td className="py-2 px-3 pl-4">
                    {isEditing ? (
                      <input
                        autoFocus
                        value={s.subject_code}
                        onChange={(e) => update(idx, "subject_code", e.target.value.toUpperCase().slice(0, 7))}
                        className="w-24 bg-[#0A0A0F] border border-[#6C63FF]/40 rounded px-2 py-1 text-xs font-mono text-[#6C63FF] focus:outline-none focus:border-[#6C63FF]"
                      />
                    ) : (
                      <span className="font-mono text-xs text-[#6C63FF]">{s.subject_code || "—"}</span>
                    )}
                    {s.confidence === "low" && (
                      <span className="ml-1 text-[#FFB347]" title="Low confidence">⚠</span>
                    )}
                  </td>

                  {/* Subject Name */}
                  <td className="py-2 px-3 max-w-[200px]">
                    {isEditing ? (
                      <input
                        value={s.subject_name}
                        onChange={(e) => update(idx, "subject_name", e.target.value.slice(0, 80))}
                        className="w-full bg-[#0A0A0F] border border-[#2A2A3D] rounded px-2 py-1 text-xs text-[#E8E8F0] focus:outline-none focus:border-[#6C63FF]/60"
                      />
                    ) : (
                      <span className="text-[#E8E8F0] truncate block max-w-[180px]">{s.subject_name || "—"}</span>
                    )}
                  </td>

                  {/* Credits */}
                  <td className="py-2 px-3">
                    {isEditing ? (
                      <input
                        type="number"
                        min={1}
                        max={6}
                        value={s.credits}
                        onChange={(e) => update(idx, "credits", parseInt(e.target.value))}
                        className="w-12 bg-[#0A0A0F] border border-[#2A2A3D] rounded px-2 py-1 text-xs text-center text-[#E8E8F0] focus:outline-none focus:border-[#6C63FF]/60"
                      />
                    ) : (
                      <span className="text-[#E8E8F0]">{s.credits}</span>
                    )}
                  </td>

                  {/* Grade */}
                  <td className="py-2 px-3">
                    {isEditing ? (
                      <select
                        value={s.grade}
                        onChange={(e) => update(idx, "grade", e.target.value)}
                        className="bg-[#0A0A0F] border border-[#2A2A3D] rounded px-2 py-1 text-xs text-[#E8E8F0] focus:outline-none focus:border-[#6C63FF]/60"
                      >
                        {GRADES.map((g) => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    ) : (
                      <span className={cn("font-mono font-semibold text-sm", GRADE_COLORS[s.grade] ?? "text-[#E8E8F0]")}>
                        {s.grade}
                      </span>
                    )}
                  </td>

                  {/* Grade Points */}
                  <td className="py-2 px-3">
                    <span className="font-mono text-xs text-[#6B6B80]">{s.grade_points}</span>
                  </td>

                  {/* Delete */}
                  <td className="py-2 px-3 pr-3">
                    <button
                      onClick={(e) => { e.stopPropagation(); remove(idx); }}
                      className="text-[#6B6B80] hover:text-[#FF4757] transition-colors p-1 rounded"
                      title="Remove subject"
                    >
                      <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add row */}
      <button
        onClick={addRow}
        className="flex items-center gap-2 text-xs text-[#6C63FF] hover:text-[#8B84FF] transition-colors px-1"
      >
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Add subject manually
      </button>

      {/* Click to edit hint */}
      {subjects.length > 0 && editingIdx === null && (
        <p className="text-[#6B6B80] text-xs">Click any row to edit its values.</p>
      )}
    </div>
  );
}
