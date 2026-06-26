"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { OCRUploader } from "@/components/scanner/OCRUploader";
import { SubjectTable } from "@/components/scanner/SubjectTable";
import { ManualEntryForm } from "@/components/scanner/ManualEntryForm";
import { GPAPreview } from "@/components/scanner/GPAPreview";
import { calculateGPA } from "@/lib/cgpa/calculator";
import type { ParsedSubject } from "@/lib/ocr/parser";

type Tab = "scan" | "manual";

export default function ScannerPage() {
  const [tab, setTab] = useState<Tab>("scan");
  const [subjects, setSubjects] = useState<ParsedSubject[]>([]);
  const [semesterNumber, setSemesterNumber] = useState(1);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const supabase = createClient();

  async function handleSave() {
    if (subjects.length === 0) return;
    setSaving(true);
    setSaved(false);
    const gpa = calculateGPA(subjects);
    const credits = subjects
      .filter((s) => !["U", "AB", "SA", "RA"].includes(s.grade))
      .reduce((sum, s) => sum + s.credits, 0);

    const { data: sem, error } = await supabase
      .from("semesters")
      .insert({
        semester_number: semesterNumber,
        gpa,
        total_credits: credits,
        is_complete: true,
      })
      .select("id")
      .single();

    if (error || !sem) { setSaving(false); return; }

    const subjectRows = subjects.map((s) => ({
      semester_id: sem.id,
      subject_code: s.subject_code,
      subject_name: s.subject_name,
      credits: s.credits,
      grade: s.grade,
      grade_points: s.grade_points,
      is_arrear: s.is_arrear,
      arrear_cleared: false,
    }));

    const { error: subError } = await supabase
      .from("subjects")
      .insert(subjectRows);

    if (!subError) {
      setSaved(true);
      setSubjects([]);
      setSemesterNumber((n) => n + 1);
    }
    setSaving(false);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#E8E8F0] font-[family-name:var(--font-display)]">
        OCR Scanner
      </h1>

      {/* Tab selector */}
      <div className="flex gap-1 p-1 rounded-xl bg-[#1A1A26] border border-[#2A2A3D] w-fit">
        {(["scan", "manual"] as const).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setSubjects([]); setSaved(false); }}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
              tab === t
                ? "bg-[#6C63FF] text-white"
                : "text-[#6B6B80] hover:text-[#E8E8F0]"
            }`}
          >
            {t === "scan" ? "📸 Scan Screenshot" : "✏️ Manual Entry"}
          </button>
        ))}
      </div>

      {/* Semester number */}
      <div className="flex items-center gap-3">
        <label className="text-xs text-[#6B6B80] font-medium">Semester:</label>
        <select
          value={semesterNumber}
          onChange={(e) => setSemesterNumber(parseInt(e.target.value))}
          className="bg-[#0A0A0F] border border-[#2A2A3D] rounded-lg px-3 py-2 text-xs text-[#E8E8F0] focus:outline-none focus:border-[#6C63FF]/60"
        >
          {Array.from({ length: 8 }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              Semester {i + 1}
            </option>
          ))}
        </select>
      </div>

      {/* OCR Upload */}
      {tab === "scan" && (
        <OCRUploader onParsed={(parsed) => { setSubjects(parsed); setSaved(false); }} />
      )}

      {/* Manual Entry */}
      {tab === "manual" && (
        <div className="card border-[#2A2A3D]">
          <ManualEntryForm onAdd={(subs) => { setSubjects((prev) => [...prev, ...subs]); setSaved(false); }} />
        </div>
      )}

      {/* Subject Table */}
      {subjects.length > 0 && (
        <>
          <SubjectTable subjects={subjects} onChange={setSubjects} />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <GPAPreview subjects={subjects} />
            </div>

            <div className="md:col-span-2 space-y-4">
              {tab === "scan" && (
                <div className="card border-[#2A2A3D]">
                  <h3 className="text-xs text-[#6B6B80] font-medium uppercase tracking-wider mb-3">
                    Manual Additions
                  </h3>
                  <ManualEntryForm onAdd={(subs) => { setSubjects((prev) => [...prev, ...subs]); setSaved(false); }} />
                </div>
              )}

              <button
                onClick={handleSave}
                disabled={saving || subjects.length === 0}
                className="w-full py-3 rounded-lg bg-[#6C63FF] hover:bg-[#5A52E0] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
              >
                {saving ? "Saving..." : `Save to Semester ${semesterNumber}`}
              </button>

              {saved && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-[#00D4AA]/10 border border-[#00D4AA]/30 text-[#00D4AA] text-sm">
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Saved successfully! You can add another semester or review the dashboard.
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
