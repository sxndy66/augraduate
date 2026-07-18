"use client";

import { useEffect, useState } from "react";
import { Plus, X, Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";
import { createClient } from "@/lib/supabase/client";

interface Subject {
  subject_code: string;
  subject_name: string;
  credits: number;
  category: string;
  is_elective: boolean;
  semester_number: number;
}

interface Note {
  id: string;
  title: string;
  content: string;
  subject_code: string | null;
  tags: string[] | null;
  is_pinned: boolean;
  created_at: string;
}

interface NoteFormProps {
  subjects: Subject[];
  editingNote: Note | null;
  onSaved: () => void;
  onCancel: () => void;
}

export function NoteForm({ subjects, editingNote, onSaved, onCancel }: NoteFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [subjectCode, setSubjectCode] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = !!editingNote;

  useEffect(() => {
    if (editingNote) {
      setTitle(editingNote.title);
      setContent(editingNote.content);
      setSubjectCode(editingNote.subject_code || "");
      setTagsInput(editingNote.tags?.join(", ") || "");
      setIsPinned(editingNote.is_pinned);
    } else {
      resetForm();
    }
  }, [editingNote]);

  const subjectOptions = [
    { label: "No subject", value: "" },
    ...subjects.map((s) => ({
      label: `${s.subject_code} — ${s.subject_name}`,
      value: s.subject_code,
    })),
  ];

  function resetForm() {
    setTitle("");
    setContent("");
    setSubjectCode("");
    setTagsInput("");
    setIsPinned(false);
    setErrors({});
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = "Title is required";
    if (!content.trim()) e.content = "Content is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast({ type: "error", title: "Not authenticated", message: "Please log in again." });
        return;
      }

      const tags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const payload = {
        title: title.trim(),
        content: content.trim(),
        subject_code: subjectCode || null,
        tags: tags.length > 0 ? tags : null,
        is_pinned: isPinned,
      };

      if (isEditing && editingNote) {
        const { error } = await supabase
          .from("notes")
          .update(payload)
          .eq("id", editingNote.id);

        if (error) throw error;
        toast({ type: "success", title: "Note updated" });
      } else {
        const { error } = await supabase.from("notes").insert({
          ...payload,
          user_id: user.id,
        });

        if (error) throw error;
        toast({ type: "success", title: "Note created" });
      }

      resetForm();
      onSaved();
    } catch (err) {
      toast({
        type: "error",
        title: "Failed to save note",
        message: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card gradientBorder className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">
          {isEditing ? "Edit Note" : "Create Note"}
        </h3>
        <button
          onClick={() => {
            onCancel();
            resetForm();
          }}
          className="rounded-lg p-1.5 text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
          aria-label="Close form"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Title"
          placeholder="e.g. Important formulas for Unit 3"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={errors.title}
        />

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-200">
            Content
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your note here..."
            rows={5}
            className="w-full rounded-xl border border-navy-600 bg-navy-800/50 px-4 py-2.5 text-white placeholder:text-gray-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-electric-blue/40 focus:border-electric-blue/50 resize-y"
          />
          {errors.content && (
            <p className="mt-1.5 text-sm text-error-red">{errors.content}</p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select
            label="Subject"
            options={subjectOptions}
            value={subjectCode}
            onChange={(e) => setSubjectCode(e.target.value)}
          />

          <Input
            label="Tags (comma-separated)"
            placeholder="e.g. exam, important, unit3"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            hint="Separate tags with commas"
          />
        </div>

        <label className="flex cursor-pointer items-center gap-2.5 select-none">
          <input
            type="checkbox"
            checked={isPinned}
            onChange={(e) => setIsPinned(e.target.checked)}
            className="h-4 w-4 rounded border-navy-600 bg-navy-800 text-electric-blue focus:ring-electric-blue/40"
          />
          <span className="text-sm text-gray-300">Pin this note to the top</span>
        </label>

        <div className="flex items-center gap-3 pt-2">
          <Button
            type="submit"
            isLoading={isSubmitting}
            leftIcon={isEditing ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          >
            {isEditing ? "Save Changes" : "Create Note"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              onCancel();
              resetForm();
            }}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}
