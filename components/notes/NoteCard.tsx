"use client";

import { motion } from "framer-motion";
import { Pin, PinOff, Pencil, Trash2, BookOpen, Hash } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";

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

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onTogglePin: (id: string) => void;
  isDeleting?: boolean;
  isPinning?: boolean;
}

export function NoteCard({
  note,
  onEdit,
  onDelete,
  onTogglePin,
  isDeleting = false,
  isPinning = false,
}: NoteCardProps) {
  const preview = note.content.length > 150
    ? note.content.slice(0, 150) + "..."
    : note.content;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        hover
        className={note.is_pinned ? "p-5 border-electric-blue/30" : "p-5"}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            {note.is_pinned && (
              <Pin className="h-4 w-4 shrink-0 text-electric-blue fill-electric-blue" />
            )}
            <h4 className="truncate text-base font-semibold text-white">
              {note.title}
            </h4>
          </div>
          <button
            onClick={() => onTogglePin(note.id)}
            disabled={isPinning}
            className="shrink-0 rounded-lg p-1.5 text-gray-400 hover:bg-white/5 hover:text-electric-blue transition-colors disabled:opacity-50"
            aria-label={note.is_pinned ? "Unpin note" : "Pin note"}
            title={note.is_pinned ? "Unpin" : "Pin to top"}
          >
            {note.is_pinned ? (
              <PinOff className="h-4 w-4" />
            ) : (
              <Pin className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Subject */}
        {note.subject_code && (
          <div className="mt-2">
            <Badge color="indigo" icon={<BookOpen className="h-3 w-3" />}>
              {note.subject_name
                ? `${note.subject_code} — ${note.subject_name}`
                : note.subject_code}
            </Badge>
          </div>
        )}

        {/* Preview */}
        <p className="mt-3 text-sm text-gray-400 whitespace-pre-wrap">{preview}</p>

        {/* Tags */}
        {note.tags && note.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {note.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-md bg-navy-700/50 px-2 py-0.5 text-xs text-gray-400"
              >
                <Hash className="h-2.5 w-2.5" />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between border-t border-navy-700/50 pt-3">
          <span className="text-xs text-gray-500">
            {formatDate(note.updated_at || note.created_at)}
          </span>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              leftIcon={<Pencil className="h-3.5 w-3.5" />}
              onClick={() => onEdit(note)}
            >
              Edit
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-error-red hover:bg-error-red/10"
              isLoading={isDeleting}
              onClick={() => onDelete(note.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
