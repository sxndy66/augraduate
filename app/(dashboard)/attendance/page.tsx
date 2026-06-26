"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface AttendanceRecord {
  id: string;
  subject_name: string;
  total_classes: number;
  attended_classes: number;
  updated_at: string;
}

export default function AttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Record<string, { total_classes: number; attended_classes: number }>>({});
  const [saving, setSaving] = useState(false);
  const supabase = useMemo(() => createClient(), []);

  const fetchAttendance = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("attendance")
      .select("*")
      .order("subject_name", { ascending: true });

    if (!error && data) {
      setRecords(data as unknown as AttendanceRecord[]);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => { void fetchAttendance(); }, [fetchAttendance]);

  function startEdit(r: AttendanceRecord) {
    setEditing((prev) => ({ ...prev, [r.id]: { total_classes: r.total_classes, attended_classes: r.attended_classes } }));
  }

  function updateEdit(id: string, field: "total_classes" | "attended_classes", value: number) {
    setEditing((prev) => {
      const current = prev[id];
      if (!current) return prev;
      return { ...prev, [id]: { ...current, [field]: value } };
    });
  }

  async function saveRecord(id: string) {
    const edit = editing[id];
    if (!edit) return;
    setSaving(true);
    await supabase
      .from("attendance")
      .update({ total_classes: edit.total_classes, attended_classes: edit.attended_classes })
      .eq("id", id);
    await fetchAttendance();
    setEditing((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setSaving(false);
  }

  async function addSubject() {
    const name = prompt("Enter subject name:");
    if (!name || !name.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const subjectId = crypto.randomUUID();
    await supabase.from("attendance").insert({
      id: subjectId,
      student_id: user.id,
      subject_id: subjectId,
      subject_name: name.trim(),
      total_classes: 0,
      attended_classes: 0,
    });
    await fetchAttendance();
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#E8E8F0] font-[family-name:var(--font-display)]">
          Attendance
        </h1>
        <button
          onClick={addSubject}
          className="px-4 py-2 rounded-lg bg-[#6C63FF] hover:bg-[#5A52E0] text-white text-xs font-medium transition-colors"
        >
          + Add Subject
        </button>
      </div>

      {records.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#1A1A26] border border-[#2A2A3D] flex items-center justify-center mb-4">
            <svg width="24" height="24" fill="none" stroke="#6B6B80" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-[#E8E8F0] font-medium mb-1">No attendance records</p>
          <p className="text-[#6B6B80] text-sm">Add subjects to start tracking attendance.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {records.map((r) => {
            const isEditing = editing[r.id];
            const total = isEditing ? isEditing.total_classes : r.total_classes;
            const attended = isEditing ? isEditing.attended_classes : r.attended_classes;
            const pct = total > 0 ? Math.round((attended / total) * 100) : 0;
            const isDanger = total > 0 && pct < 75;

            return (
              <div key={r.id} className={`card border ${isDanger ? "border-[#FF4757]/30" : "border-[#2A2A3D]"} transition-colors`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[#E8E8F0] truncate">{r.subject_name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs font-mono font-semibold ${isDanger ? "text-[#FF4757]" : "text-[#6B6B80]"}`}>
                        {pct}%
                      </span>
                      {isDanger && (
                        <span className="text-[10px] text-[#FF4757] bg-[#FF4757]/10 px-1.5 py-0.5 rounded">Below 75%</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm text-[#E8E8F0]">
                      {attended}/{total}
                    </p>
                    <p className="text-[10px] text-[#6B6B80]">classes</p>
                  </div>
                </div>

                <div className="h-1.5 rounded-full bg-[#0A0A0F] overflow-hidden mb-3">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${pct}%`,
                      background: isDanger ? "#FF4757" : pct >= 85 ? "#00D4AA" : "#A78BFA",
                    }}
                  />
                </div>

                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <label className="text-[10px] text-[#6B6B80]">Total</label>
                      <input
                        type="number"
                        min={0}
                        value={isEditing.total_classes}
                        onChange={(e) => updateEdit(r.id, "total_classes", parseInt(e.target.value) || 0)}
                        className="w-full bg-[#0A0A0F] border border-[#2A2A3D] rounded px-2 py-1 text-xs text-[#E8E8F0] focus:outline-none focus:border-[#6C63FF]/60"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] text-[#6B6B80]">Attended</label>
                      <input
                        type="number"
                        min={0}
                        value={isEditing.attended_classes}
                        onChange={(e) => updateEdit(r.id, "attended_classes", parseInt(e.target.value) || 0)}
                        className="w-full bg-[#0A0A0F] border border-[#2A2A3D] rounded px-2 py-1 text-xs text-[#E8E8F0] focus:outline-none focus:border-[#6C63FF]/60"
                      />
                    </div>
                    <button
                      onClick={() => saveRecord(r.id)}
                      disabled={saving}
                      className="shrink-0 self-end px-3 py-1.5 rounded-lg bg-[#6C63FF] text-white text-xs font-medium hover:bg-[#5A52E0] transition-colors disabled:opacity-50"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => startEdit(r)}
                    className="w-full text-xs text-[#6B6B80] hover:text-[#6C63FF] transition-colors py-1"
                  >
                    Update counts
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
