"use client";

import { useState } from "react";
import { getGradePoints } from "@/lib/cgpa/calculator";
import type { ParsedSubject } from "@/lib/ocr/parser";
import { cn } from "@/lib/utils";

const GRADES = ["O", "A+", "A", "B+", "B", "C", "U", "AB", "SA", "RA"] as const;

interface ManualEntryFormProps {
  onAdd: (subjects: ParsedSubject[]) => void;
}

const DEFAULT_ROW = () => ({
  subject_code: "",
  subject_name: "",
  credits: 3,
  grade: "O" as string,
});

export function ManualEntryForm({ onAdd }: ManualEntryFormProps) {
  const [rows, setRows] = useState([DEFAULT_ROW()]);
  const [error, setError] = useState<string | null>(null);

  function updateRow(idx: number, field: string, value: string | number) {
    setRows((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, [field]: value } : r))
    );
  }

  function addRow() {
    setRows((prev) => [...prev, DEFAULT_ROW()]);
  }

  function removeRow(idx: number) {
    if (rows.length === 1) return;
    setRows((prev) => prev.filter((_, i) => i !== idx));
  }

  function validate(): string | null {
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      if (!r.subject_code.match(/^[A-Z]{2,3}\d{4}$/)) {
        return `Row ${i + 1}: Subject code must be like CS3401 or MA3391.`;
      }
      if (!r.subject_name.trim()) {
        return `Row ${i + 1}: Subject name is required.`;
      }
    }
    return null;
  }

  function handleSubmit() {
    const err = validate();
    if (err) { setError(err); return; }
    setError(null);

    const subjects: ParsedSubject[] = rows.map((r) => ({
      subject_code: r.subject_code.toUpperCase().trim(),
      subject_name: r.subject_name.trim(),
      credits: r.credits,
      grade: r.grade,
      grade_points: getGradePoints(r.grade),
      is_arrear: r.grade === "U" || r.grade === "RA" || r.grade === "AB",
      confidence: "high" as const,
    }));

    onAdd(subjects);
    setRows([DEFAULT_ROW()]);
  }

  return (
    <div className="space-y-4">
      {error && (
        <p className="text-[#FF4757] text-xs bg-[#FF4757]/10 border border-[#FF4757]/30 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="overflow-x-auto rounded-xl border border-[#2A2A3D]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#2A2A3D] bg-[#12121A]">
              {["Code *", "Subject Name *", "Credits", "Grade", ""].map((h) => (
                <th key={h} className="text-left text-[#6B6B80] text-xs font-medium uppercase tracking-wide py-2.5 px-3 first:pl-4 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={idx} className="border-b border-[#2A2A3D]/50 last:border-0 bg-[#12121A] hover:bg-[#1A1A26] transition-colors">
                <td className="py-2 px-3 pl-4">
                  <input
                    placeholder="CS3401"
                    value={row.subject_code}
                    onChange={(e) => updateRow(idx, "subject_code", e.target.value.toUpperCase().slice(0, 7))}
                    className="w-24 bg-[#0A0A0F] border border-[#2A2A3D] focus:border-[#6C63FF]/60 rounded px-2 py-1.5 text-xs font-mono text-[#6C63FF] placeholder-[#6B6B80]/40 focus:outline-none transition-colors"
                  />
                </td>
                <td className="py-2 px-3">
                  <input
                    placeholder="Algorithms"
                    value={row.subject_name}
                    onChange={(e) => updateRow(idx, "subject_name", e.target.value.slice(0, 80))}
                    className="w-full min-w-[140px] bg-[#0A0A0F] border border-[#2A2A3D] focus:border-[#6C63FF]/60 rounded px-2 py-1.5 text-xs text-[#E8E8F0] placeholder-[#6B6B80]/40 focus:outline-none transition-colors"
                  />
                </td>
                <td className="py-2 px-3">
                  <input
                    type="number"
                    min={1}
                    max={6}
                    value={row.credits}
                    onChange={(e) => updateRow(idx, "credits", parseInt(e.target.value) || 3)}
                    className="w-12 bg-[#0A0A0F] border border-[#2A2A3D] focus:border-[#6C63FF]/60 rounded px-2 py-1.5 text-xs text-center text-[#E8E8F0] focus:outline-none transition-colors"
                  />
                </td>
                <td className="py-2 px-3">
                  <select
                    value={row.grade}
                    onChange={(e) => updateRow(idx, "grade", e.target.value)}
                    className="bg-[#0A0A0F] border border-[#2A2A3D] focus:border-[#6C63FF]/60 rounded px-2 py-1.5 text-xs text-[#E8E8F0] focus:outline-none transition-colors"
                  >
                    {GRADES.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </td>
                <td className="py-2 px-3 pr-3">
                  <button
                    onClick={() => removeRow(idx)}
                    disabled={rows.length === 1}
                    className={cn(
                      "p-1 rounded transition-colors",
                      rows.length === 1
                        ? "text-[#2A2A3D] cursor-not-allowed"
                        : "text-[#6B6B80] hover:text-[#FF4757]"
                    )}
                  >
                    <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={addRow}
          className="flex items-center gap-1.5 text-xs text-[#6C63FF] hover:text-[#8B84FF] transition-colors"
        >
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add row
        </button>
        <button
          onClick={handleSubmit}
          className="px-4 py-2 rounded-lg bg-[#6C63FF] hover:bg-[#5A52E0] text-white text-xs font-medium transition-colors"
        >
          Add to review →
        </button>
      </div>
    </div>
  );
}
