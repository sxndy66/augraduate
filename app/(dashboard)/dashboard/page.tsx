"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { ManualEntryForm } from "@/components/scanner/ManualEntryForm";
import { SubjectTable } from "@/components/scanner/SubjectTable";
import { GPAPreview } from "@/components/scanner/GPAPreview";
import { calculateGPA, getClassification } from "@/lib/cgpa/calculator";
import type { ParsedSubject } from "@/lib/ocr/parser";

interface Semester {
  id: string;
  semester_number: number;
  gpa: number;
  total_credits: number;
  is_complete: boolean;
  subjects: ParsedSubject[];
}

export default function DashboardPage() {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [pendingSubjects, setPendingSubjects] = useState<ParsedSubject[]>([]);
  const [saving, setSaving] = useState(false);
  const [newSemNumber, setNewSemNumber] = useState(1);
  const supabase = createClient();

  useEffect(() => { fetchSemesters(); }, []);

  async function fetchSemesters() {
    setLoading(true);
    const { data, error } = await supabase
      .from("semesters")
      .select("*, subjects(*)")
      .order("semester_number", { ascending: true });

    if (!error && data) {
      setSemesters(data as unknown as Semester[]);
      setNewSemNumber(data.length + 1);
    }
    setLoading(false);
  }

  const cgpa = useMemo(() => {
    const allSubjects = semesters.flatMap((s) => s.subjects || []);
    return calculateGPA(allSubjects);
  }, [semesters]);

  const totalCredits = useMemo(
    () =>
      semesters.reduce((sum, s) => sum + (s.total_credits || 0), 0),
    [semesters]
  );

  async function handleSaveSemester() {
    if (pendingSubjects.length === 0) return;
    setSaving(true);
    const gpa = calculateGPA(pendingSubjects);
    const credits = pendingSubjects
      .filter((s) => !["U", "AB", "SA", "RA"].includes(s.grade))
      .reduce((sum, s) => sum + s.credits, 0);

    const { data: sem, error } = await supabase
      .from("semesters")
      .insert({
        semester_number: newSemNumber,
        gpa,
        total_credits: credits,
        is_complete: true,
      })
      .select("id")
      .single();

    if (error || !sem) { setSaving(false); return; }

    const subjectRows = pendingSubjects.map((s) => ({
      semester_id: sem.id,
      subject_code: s.subject_code,
      subject_name: s.subject_name,
      credits: s.credits,
      grade: s.grade,
      grade_points: s.grade_points,
      is_arrear: s.is_arrear,
      arrear_cleared: false,
    }));

    await supabase.from("subjects").insert(subjectRows);
    setPendingSubjects([]);
    setShowAdd(false);
    await fetchSemesters();
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-[#6C63FF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#E8E8F0] font-[family-name:var(--font-display)]">
          CGPA Dashboard
        </h1>
        <button
          onClick={() => setShowAdd(true)}
          className="px-4 py-2 rounded-lg bg-[#6C63FF] hover:bg-[#5A52E0] text-white text-xs font-medium transition-colors"
        >
          + Add Semester
        </button>
      </div>

      {/* CGPA Card */}
      <div className="card bg-[#1A1A26] border-[#2A2A3D]">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <p className="text-[#6B6B80] text-xs uppercase tracking-wide mb-1">Overall CGPA</p>
            <p className="text-4xl font-bold font-mono text-[#6C63FF]">{cgpa.toFixed(2)}</p>
            <p className="text-[#6B6B80] text-xs mt-1">{getClassification(cgpa)}</p>
          </div>
          <div>
            <p className="text-[#6B6B80] text-xs uppercase tracking-wide mb-1">Semesters</p>
            <p className="text-2xl font-bold font-mono text-[#E8E8F0]">{semesters.length}</p>
          </div>
          <div>
            <p className="text-[#6B6B80] text-xs uppercase tracking-wide mb-1">Total Credits</p>
            <p className="text-2xl font-bold font-mono text-[#E8E8F0]">{totalCredits}</p>
          </div>
          <div>
            <p className="text-[#6B6B80] text-xs uppercase tracking-wide mb-1">Subjects</p>
            <p className="text-2xl font-bold font-mono text-[#E8E8F0]">
              {semesters.reduce((sum, s) => sum + ((s.subjects || []).length), 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Add Semester Panel */}
      {showAdd && (
        <div className="card border-[#6C63FF]/30 bg-[#6C63FF]/5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-semibold text-[#E8E8F0]">
                Semester {newSemNumber}
              </h3>
            </div>
            <button
              onClick={() => { setShowAdd(false); setPendingSubjects([]); }}
              className="text-[#6B6B80] hover:text-[#FF4757] transition-colors"
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {pendingSubjects.length > 0 ? (
            <>
              <SubjectTable subjects={pendingSubjects} onChange={setPendingSubjects} />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <GPAPreview subjects={pendingSubjects} />
                <div className="md:col-span-2">
                  <ManualEntryForm onAdd={(subs) => setPendingSubjects((prev) => [...prev, ...subs])} />
                </div>
              </div>
              <button
                onClick={handleSaveSemester}
                disabled={saving || pendingSubjects.length === 0}
                className="w-full py-3 rounded-lg bg-[#6C63FF] hover:bg-[#5A52E0] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
              >
                {saving ? "Saving..." : `Save Semester ${newSemNumber}`}
              </button>
            </>
          ) : (
            <ManualEntryForm onAdd={(subs) => setPendingSubjects(subs)} />
          )}
        </div>
      )}

      {/* Semester Cards */}
      {semesters.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#1A1A26] border border-[#2A2A3D] flex items-center justify-center mb-4">
            <svg width="24" height="24" fill="none" stroke="#6B6B80" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-[#E8E8F0] font-medium mb-1">No semesters yet</p>
          <p className="text-[#6B6B80] text-sm mb-4">Add your first semester to start tracking your CGPA.</p>
          <button
            onClick={() => setShowAdd(true)}
            className="px-4 py-2 rounded-lg bg-[#6C63FF] hover:bg-[#5A52E0] text-white text-xs font-medium transition-colors"
          >
            Get Started
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {semesters.map((sem) => {
            const gpaColor =
              sem.gpa >= 8.5 ? "text-[#00D4AA]" : sem.gpa >= 7 ? "text-[#A78BFA]" : sem.gpa >= 5 ? "text-[#FFB347]" : "text-[#FF4757]";
            return (
              <div key={sem.id} className="card hover:border-[#6C63FF]/30 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono text-[#6B6B80] bg-[#0A0A0F] px-2 py-1 rounded border border-[#2A2A3D]">
                    SEM {sem.semester_number}
                  </span>
                  <span className={`font-mono font-bold text-lg ${gpaColor}`}>
                    {sem.gpa.toFixed(2)}
                  </span>
                </div>
                <div className="h-1 rounded-full bg-[#0A0A0F] overflow-hidden mb-3">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${(sem.gpa / 10) * 100}%`,
                      background:
                        sem.gpa >= 8.5 ? "#00D4AA" : sem.gpa >= 7 ? "#A78BFA" : sem.gpa >= 5 ? "#FFB347" : "#FF4757",
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs text-[#6B6B80]">
                  <span>{(sem.subjects || []).length} subjects</span>
                  <span>{sem.total_credits || 0} credits</span>
                </div>
                {sem.subjects?.some((s) => s.is_arrear) && (
                  <div className="mt-2 flex items-center gap-1 text-[10px] text-[#FF4757]">
                    <svg width="10" height="10" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                    {sem.subjects.filter((s) => s.is_arrear).length} arrear{sem.subjects.filter((s) => s.is_arrear).length > 1 ? "s" : ""}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
