"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Pin, Filter as FilterIcon, X, Plus } from "lucide-react";
import { NoteCard } from "./NoteCard";
import { NoteForm } from "./NoteForm";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface Note {
  id: string;
  title: string;
  content: string;
  subject_code: string | null;
  subject_name?: string | null;
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

interface NoteListProps {
  notes: Note[];
  subjects: Subject[];
  onRefresh: () => void;
}

export function NoteList({ notes, subjects, onRefresh }: NoteListProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSubject, setFilterSubject] = useState("");
  const [filterTag, setFilterTag] = useState("");
  const [filterPinned, setFilterPinned] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pinningId, setPinningId] = useState<string | null>(null);

  // Collect all unique tags
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    notes.forEach((n) => n.tags?.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }, [notes]);

  const subjectOptions = [
    { label: "All subjects", value: "" },
    ...subjects.map((s) => ({
      label: `${s.subject_code} — ${s.subject_name}`,
      value: s.subject_code,
    })),
  ];

  const tagOptions = [
    { label: "All tags", value: "" },
    ...allTags.map((t) => ({ label: t, value: t })),
  ];

  // Filtered + sorted notes (pinned first)
  const filtered = useMemo(() => {
    let result = notes;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q)
      );
    }

    if (filterSubject) {
      result = result.filter((n) => n.subject_code === filterSubject);
    }

    if (filterTag) {
      result = result.filter((n) => n.tags?.includes(filterTag));
    }

    if (filterPinned) {
      result = result.filter((n) => n.is_pinned);
    }

    // Sort: pinned first, then by updated_at desc
    return [...result].sort((a, b) => {
      if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
      const aDate = new Date(a.updated_at || a.created_at).getTime();
      const bDate = new Date(b.updated_at || b.created_at).getTime();
      return bDate - aDate;
    });
  }, [notes, searchQuery, filterSubject, filterTag, filterPinned]);

  const hasActiveFilters = searchQuery || filterSubject || filterTag || filterPinned;

  function clearFilters() {
    setSearchQuery("");
    setFilterSubject("");
    setFilterTag("");
    setFilterPinned(false);
  }

  function handleEdit(note: Note) {
    setEditingNote(note);
    setShowForm(true);
  }

  function handleFormSaved() {
    setShowForm(false);
    setEditingNote(null);
    onRefresh();
  }

  function handleFormCancel() {
    setShowForm(false);
    setEditingNote(null);
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("notes").delete().eq("id", id);
      if (error) throw error;
      toast({ type: "info", title: "Note deleted" });
      onRefresh();
    } catch (err) {
      toast({
        type: "error",
        title: "Failed to delete note",
        message: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setDeletingId(null);
    }
  }

  async function handleTogglePin(id: string) {
    setPinningId(id);
    try {
      const note = notes.find((n) => n.id === id);
      if (!note) return;
      const supabase = createClient();
      const { error } = await supabase
        .from("notes")
        .update({ is_pinned: !note.is_pinned })
        .eq("id", id);
      if (error) throw error;
      onRefresh();
    } catch (err) {
      toast({
        type: "error",
        title: "Failed to update pin",
        message: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setPinningId(null);
    }
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="mb-4 space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
            className="flex-1"
          />
          <Button
            onClick={() => {
              setEditingNote(null);
              setShowForm(true);
            }}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            New Note
          </Button>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Select
            options={subjectOptions}
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="sm:w-56"
            placeholder="All subjects"
          />
          <Select
            options={tagOptions}
            value={filterTag}
            onChange={(e) => setFilterTag(e.target.value)}
            className="sm:w-44"
            placeholder="All tags"
          />
          <button
            onClick={() => setFilterPinned((p) => !p)}
            className={cn(
              "flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all duration-200",
              filterPinned
                ? "border-electric-blue/40 bg-electric-blue/10 text-electric-blue"
                : "border-navy-600 text-gray-400 hover:text-white hover:bg-white/5"
            )}
          >
            <Pin className="h-4 w-4" />
            Pinned Only
          </button>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} leftIcon={<X className="h-4 w-4" />}>
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden"
          >
            <NoteForm
              subjects={subjects}
              editingNote={editingNote}
              onSaved={handleFormSaved}
              onCancel={handleFormCancel}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notes Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<FilterIcon className="h-8 w-8" />}
          title={hasActiveFilters ? "No notes match your filters" : "No notes yet"}
          description={
            hasActiveFilters
              ? "Try adjusting your search or filters."
              : "Create your first note to start organizing your study materials."
          }
          actionLabel={hasActiveFilters ? undefined : "Create Note"}
          onAction={hasActiveFilters ? undefined : () => setShowForm(true)}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {filtered.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onTogglePin={handleTogglePin}
                isDeleting={deletingId === note.id}
                isPinning={pinningId === note.id}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
