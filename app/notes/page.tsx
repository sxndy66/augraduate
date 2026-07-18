"use client"

export const dynamic = 'force-dynamic';;

import { useCallback, useEffect, useState } from "react";
import { StickyNote, AlertCircle } from "lucide-react";
import { NoteList } from "@/components/notes/NoteList";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";
import { createClient } from "@/lib/supabase/client";
import subjectsData from "@/data/anna-university/subjects/sample-aids-r2021.json";

interface Note {
  id: string;
  title: string;
  content: string;
  subject_code: string | null;
  tags: string[] | null;
  is_pinned: boolean;
  created_at: string;
  updated_at?: string | null;
}

interface Subject {
  subject_code: string;
  subject_name: string;
  credits: number;
  category: string;
  is_elective: boolean;
  semester_number: number;
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const subjects = subjectsData as Subject[];

  const fetchNotes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError("Please log in to view your notes.");
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("notes")
        .select("id, title, content, subject_code, tags, is_pinned, created_at, updated_at")
        .eq("user_id", user.id)
        .order("is_pinned", { ascending: false })
        .order("updated_at", { ascending: false });

      if (fetchError) throw fetchError;

      // Enrich with subject names
      const enriched = (data as Note[])?.map((note) => {
        const subject = subjects.find((s) => s.subject_code === note.subject_code);
        return { ...note, subject_name: subject?.subject_name ?? null };
      }) ?? [];

      setNotes(enriched);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load notes.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">Notes</h1>
        <p className="mt-1 text-sm text-gray-400">
          Organize your study notes, pin important ones, and filter by subject or tag.
        </p>
      </div>

      {/* Content */}
      {loading ? (
        <Card className="flex items-center justify-center py-20">
          <Spinner size="lg" label="Loading notes..." />
        </Card>
      ) : error ? (
        <ErrorState
          icon={<AlertCircle className="h-8 w-8" />}
          title="Failed to load notes"
          message={error}
          onRetry={fetchNotes}
        />
      ) : notes.length === 0 ? (
        <NoteList notes={notes} subjects={subjects} onRefresh={fetchNotes} />
      ) : (
        <NoteList notes={notes} subjects={subjects} onRefresh={fetchNotes} />
      )}
    </div>
  );
}
