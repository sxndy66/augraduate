import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import Link from "next/link";
import { StickyNote, ArrowRight } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface NoteItem {
  id: string;
  title: string;
  content: string;
  subject_code?: string;
  created_at: string;
  tags?: string[];
}

interface RecentNotesProps {
  notes: NoteItem[];
}

export function RecentNotes({ notes }: RecentNotesProps) {
  return (
    <Card className="p-6">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StickyNote className="h-5 w-5 text-amber" />
          <h2 className="text-lg font-semibold text-white">Recent Notes</h2>
        </div>
        <Link
          href="/notes"
          className="flex items-center gap-1 text-sm font-medium text-electric-blue hover:text-electric-blue/80"
        >
          View all <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {notes.length === 0 ? (
        <EmptyState
          icon={<StickyNote className="h-8 w-8" />}
          title="No notes yet"
          description="Create your first note to keep track of important information."
        />
      ) : (
        <div className="space-y-3">
          {notes.slice(0, 3).map((note) => (
            <Link
              key={note.id}
              href={`/notes/${note.id}`}
              className="block rounded-xl border border-navy-600 bg-navy-800/40 p-4 transition-all duration-200 hover:border-electric-blue/30 hover:bg-navy-800/60"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-semibold text-white">
                  {note.title}
                </h3>
                <span className="shrink-0 text-xs text-gray-500">
                  {formatDate(note.created_at)}
                </span>
              </div>
              <p className="mt-1 line-clamp-2 text-xs text-gray-400">
                {note.content}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {note.subject_code && (
                  <Badge color="blue">{note.subject_code}</Badge>
                )}
                {note.tags?.slice(0, 2).map((tag) => (
                  <Badge key={tag} color="gray">
                    {tag}
                  </Badge>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}
    </Card>
  );
}