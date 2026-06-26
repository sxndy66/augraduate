"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface ArrearSubject {
  id: string;
  subject_code: string;
  subject_name: string;
  credits: number;
  grade: string | null;
  arrear_cleared: boolean;
  semester: { semester_number: number };
}

export default function ArrearsPage() {
  const [arrears, setArrears] = useState<ArrearSubject[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => { fetchArrears(); }, []);

  async function fetchArrears() {
    setLoading(true);
    const { data, error } = await supabase
      .from("subjects")
      .select("*, semester:semester_id(semester_number)")
      .eq("is_arrear", true)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setArrears(data as unknown as ArrearSubject[]);
    }
    setLoading(false);
  }

  async function markCleared(id: string) {
    setUpdating(id);
    await supabase
      .from("subjects")
      .update({ arrear_cleared: true })
      .eq("id", id);
    await fetchArrears();
    setUpdating(null);
  }

  async function revertCleared(id: string) {
    setUpdating(id);
    await supabase
      .from("subjects")
      .update({ arrear_cleared: false })
      .eq("id", id);
    await fetchArrears();
    setUpdating(null);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-[#6C63FF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const pending = arrears.filter((a) => !a.arrear_cleared);
  const cleared = arrears.filter((a) => a.arrear_cleared);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#E8E8F0] font-[family-name:var(--font-display)]">
          Arrear Board
        </h1>
        <div className="flex gap-4 text-sm">
          <span className="text-[#FF4757]">
            {pending.length} pending
          </span>
          <span className="text-[#00D4AA]">
            {cleared.length} cleared
          </span>
        </div>
      </div>

      {arrears.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#00D4AA]/10 border border-[#00D4AA]/30 flex items-center justify-center mb-4">
            <svg width="24" height="24" fill="none" stroke="#00D4AA" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-[#E8E8F0] font-medium mb-1">No arrears detected</p>
          <p className="text-[#6B6B80] text-sm">Great work! Keep it up.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Arrears */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-[#FF4757] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#FF4757]" />
              Pending ({pending.length})
            </h3>
            {pending.map((a) => (
              <div key={a.id} className="card border-[#FF4757]/20 hover:border-[#FF4757]/40 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs text-[#6C63FF]">{a.subject_code}</span>
                      <span className="text-[10px] text-[#6B6B80] bg-[#0A0A0F] px-1.5 py-0.5 rounded">
                        SEM {a.semester.semester_number}
                      </span>
                    </div>
                    <p className="text-sm text-[#E8E8F0] truncate">{a.subject_name}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-xs text-[#6B6B80]">{a.credits} credits</span>
                      <span className="text-xs font-mono text-[#FF4757] font-semibold">{a.grade}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => markCleared(a.id)}
                    disabled={updating === a.id}
                    className="shrink-0 px-3 py-1.5 rounded-lg bg-[#00D4AA]/10 border border-[#00D4AA]/30 text-[#00D4AA] text-xs font-medium hover:bg-[#00D4AA]/20 transition-colors disabled:opacity-50"
                  >
                    {updating === a.id ? "..." : "Mark Cleared"}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Cleared Arrears */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-[#00D4AA] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00D4AA]" />
              Cleared ({cleared.length})
            </h3>
            {cleared.length === 0 ? (
              <p className="text-xs text-[#6B6B80] py-4">No cleared arrears yet.</p>
            ) : (
              cleared.map((a) => (
                <div key={a.id} className="card border-[#00D4AA]/10 opacity-70">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs text-[#6C63FF] line-through">{a.subject_code}</span>
                        <span className="text-[10px] text-[#6B6B80] bg-[#0A0A0F] px-1.5 py-0.5 rounded">
                          SEM {a.semester.semester_number}
                        </span>
                      </div>
                      <p className="text-sm text-[#E8E8F0] truncate line-through">{a.subject_name}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-xs text-[#6B6B80]">{a.credits} credits</span>
                        <span className="text-xs font-mono text-[#00D4AA]">{a.grade}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => revertCleared(a.id)}
                      disabled={updating === a.id}
                      className="shrink-0 px-3 py-1.5 rounded-lg bg-[#FFB347]/10 border border-[#FFB347]/30 text-[#FFB347] text-xs font-medium hover:bg-[#FFB347]/20 transition-colors disabled:opacity-50"
                    >
                      {updating === a.id ? "..." : "Revert"}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
