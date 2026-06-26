"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface Note {
  id: string;
  title: string;
  content: string | null;
  subject_code: string;
  type: string;
  created_at: string;
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [subjectCode, setSubjectCode] = useState("");
  const [type, setType] = useState<"note" | "pyq" | "lab" | "syllabus">("note");
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  useEffect(() => { fetchNotes(); }, []);

  async function fetchNotes() {
    setLoading(true);
    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) setNotes(data as Note[]);
    setLoading(false);
  }

  async function handleSave() {
    if (!title.trim() || !content.trim()) return;
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("notes").insert({
      student_id: user.id,
      subject_code: subjectCode.trim() || "GEN",
      title: title.trim(),
      content: content.trim(),
      type,
    });
    setTitle(""); setContent(""); setSubjectCode(""); setType("note");
    setShowAdd(false);
    await fetchNotes();
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#E8E8F0] font-[family-name:var(--font-display)]">
          Notes & PYQ
        </h1>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="px-4 py-2 rounded-lg bg-[#6C63FF] hover:bg-[#5A52E0] text-white text-xs font-medium transition-colors"
        >
          {showAdd ? "Cancel" : "+ Add Note"}
        </button>
      </div>

      {showAdd && (
        <div className="card border-[#6C63FF]/30 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              placeholder="Title *"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-[#0A0A0F] border border-[#2A2A3D] focus:border-[#6C63FF]/60 rounded-lg px-3 py-2 text-sm text-[#E8E8F0] placeholder-[#6B6B80]/40 focus:outline-none transition-colors"
            />
            <input
              placeholder="Subject code (e.g. CS3401)"
              value={subjectCode}
              onChange={(e) => setSubjectCode(e.target.value.toUpperCase().slice(0, 7))}
              className="bg-[#0A0A0F] border border-[#2A2A3D] focus:border-[#6C63FF]/60 rounded-lg px-3 py-2 text-sm font-mono text-[#6C63FF] placeholder-[#6B6B80]/40 focus:outline-none transition-colors"
            />
            <select
              value={type}
              onChange={(e) => setType(e.target.value as "note" | "pyq" | "lab" | "syllabus")}
              className="bg-[#0A0A0F] border border-[#2A2A3D] focus:border-[#6C63FF]/60 rounded-lg px-3 py-2 text-sm text-[#E8E8F0] focus:outline-none transition-colors"
            >
              <option value="note">Note</option>
              <option value="pyq">PYQ</option>
              <option value="lab">Lab Record</option>
              <option value="syllabus">Syllabus</option>
            </select>
          </div>
          <textarea
            placeholder="Write your notes here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            className="w-full bg-[#0A0A0F] border border-[#2A2A3D] focus:border-[#6C63FF]/60 rounded-lg px-3 py-2 text-sm text-[#E8E8F0] placeholder-[#6B6B80]/40 focus:outline-none transition-colors resize-none"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#6B6B80]">{type === "pyq" ? "Previous Year Question" : type === "lab" ? "Lab Record" : type === "syllabus" ? "Syllabus" : "Study Note"}</span>
            <button
              onClick={handleSave}
              disabled={saving || !title.trim() || !content.trim()}
              className="px-4 py-2 rounded-lg bg-[#6C63FF] hover:bg-[#5A52E0] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-medium transition-colors"
            >
              {saving ? "Saving..." : "Save Note"}
            </button>
          </div>
        </div>
      )}

      {notes.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#1A1A26] border border-[#2A2A3D] flex items-center justify-center mb-4">
            <svg width="24" height="24" fill="none" stroke="#6B6B80" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
          </div>
          <p className="text-[#E8E8F0] font-medium mb-1">No notes yet</p>
          <p className="text-[#6B6B80] text-sm">Add your study notes or PYQ collections.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((n) => (
            <div key={n.id} className="card hover:border-[#6C63FF]/30 transition-colors group">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="text-sm font-medium text-[#E8E8F0] truncate">{n.title}</h3>
                {n.type === "pyq" && (
                  <span className="shrink-0 text-[10px] px-2 py-0.5 rounded bg-[#FFB347]/10 border border-[#FFB347]/30 text-[#FFB347]">
                    PYQ
                  </span>
                )}
                {n.type === "lab" && (
                  <span className="shrink-0 text-[10px] px-2 py-0.5 rounded bg-[#A78BFA]/10 border border-[#A78BFA]/30 text-[#A78BFA]">
                    LAB
                  </span>
                )}
                {n.type === "syllabus" && (
                  <span className="shrink-0 text-[10px] px-2 py-0.5 rounded bg-[#00D4AA]/10 border border-[#00D4AA]/30 text-[#00D4AA]">
                    SYL
                  </span>
                )}
              </div>
              {n.subject_code && (
                <span className="text-[10px] font-mono text-[#6C63FF] bg-[#6C63FF]/10 px-1.5 py-0.5 rounded">
                  {n.subject_code}
                </span>
              )}
              <p className="text-xs text-[#6B6B80] mt-2 line-clamp-3">{n.content}</p>
              <p className="text-[10px] text-[#6B6B80] mt-2">
                {new Date(n.created_at).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "2-digit",
                })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
