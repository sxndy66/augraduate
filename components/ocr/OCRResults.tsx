"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Table,
  Pencil,
  Check,
  X,
  AlertTriangle,
  Trash2,
  Plus,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { VALID_GRADES, isValidGrade } from "@/lib/validators/gpa";
import type { OCRGradeEntry } from "@/lib/validators/ocr";

export interface OCRResultsProps {
  entries: OCRGradeEntry[];
  onChange: (entries: OCRGradeEntry[]) => void;
  className?: string;
}

const GRADE_OPTIONS = VALID_GRADES.map((g) => ({ label: g, value: g }));

const GRADE_BADGE_COLOR: Record<string, "green" | "amber" | "red" | "gray"> = {
  O: "green",
  "A+": "green",
  A: "green",
  "B+": "amber",
  B: "amber",
  C: "amber",
  U: "red",
  RA: "red",
};

export function OCRResults({ entries, onChange, className }: OCRResultsProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [draft, setDraft] = useState<OCRGradeEntry | null>(null);

  const startEdit = useCallback((index: number) => {
    setEditingIndex(index);
    setDraft({ ...entries[index] });
  }, [entries]);

  const cancelEdit = useCallback(() => {
    setEditingIndex(null);
    setDraft(null);
  }, []);

  const saveEdit = useCallback(() => {
    if (editingIndex === null || !draft) return;
    const updated = [...entries];
    updated[editingIndex] = draft;
    onChange(updated);
    setEditingIndex(null);
    setDraft(null);
  }, [editingIndex, draft, entries, onChange]);

  const deleteEntry = useCallback((index: number) => {
    const updated = entries.filter((_, i) => i !== index);
    onChange(updated);
  }, [entries, onChange]);

  const addEntry = useCallback(() => {
    const newEntry: OCRGradeEntry = {
      subject_code: "",
      subject_name: "",
      credits: 3,
      grade: "O",
      confidence: 1,
    };
    onChange([...entries, newEntry]);
    setEditingIndex(entries.length);
    setDraft(newEntry);
  }, [entries, onChange]);

  const isDraftValid = draft
    ? draft.subject_code.trim().length > 0 &&
      draft.subject_name.trim().length > 0 &&
      draft.credits > 0 &&
      draft.credits <= 10 &&
      isValidGrade(draft.grade)
    : false;

  return (
    <Card className={cn("p-5", className)}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Table className="h-5 w-5 text-electric-blue" />
          <h3 className="text-base font-semibold text-white">
            Extracted Grades ({entries.length})
          </h3>
        </div>
        <Button size="sm" variant="outline" onClick={addEntry} leftIcon={<Plus className="h-4 w-4" />}>
          Add Row
        </Button>
      </div>

      <p className="mb-4 text-sm text-gray-400">
        Review each extracted grade below. Click the pencil icon to correct any misread values
        before confirming.
      </p>

      <div className="overflow-x-auto rounded-xl border border-navy-600">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-navy-600 bg-navy-800/50 text-left">
              <th className="px-3 py-2.5 font-medium text-gray-400">Subject Code</th>
              <th className="px-3 py-2.5 font-medium text-gray-400">Subject Name</th>
              <th className="px-3 py-2.5 text-center font-medium text-gray-400">Credits</th>
              <th className="px-3 py-2.5 text-center font-medium text-gray-400">Grade</th>
              <th className="px-3 py-2.5 text-center font-medium text-gray-400">Status</th>
              <th className="px-3 py-2.5 text-right font-medium text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {entries.map((entry, index) => {
                const isEditing = editingIndex === index;
                const gradeValid = isValidGrade(entry.grade);
                const codeValid = entry.subject_code.trim().length > 0;

                return (
                  <motion.tr
                    key={index}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="border-b border-navy-700/50 last:border-0"
                  >
                    {isEditing && draft ? (
                      <>
                        <td className="px-3 py-2">
                          <Input
                            value={draft.subject_code}
                            onChange={(e) =>
                              setDraft({ ...draft, subject_code: e.target.value })
                            }
                            placeholder="e.g. CS8492"
                            className="!py-1.5"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <Input
                            value={draft.subject_name}
                            onChange={(e) =>
                              setDraft({ ...draft, subject_name: e.target.value })
                            }
                            placeholder="Subject name"
                            className="!py-1.5"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <Input
                            type="number"
                            min={1}
                            max={10}
                            value={draft.credits}
                            onChange={(e) =>
                              setDraft({
                                ...draft,
                                credits: parseInt(e.target.value, 10) || 0,
                              })
                            }
                            className="!py-1.5 w-20 text-center"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <Select
                            options={GRADE_OPTIONS}
                            value={draft.grade}
                            onChange={(e) =>
                              setDraft({ ...draft, grade: e.target.value })
                            }
                            className="!py-1.5 w-24"
                          />
                        </td>
                        <td className="px-3 py-2 text-center">
                          {isDraftValid ? (
                            <Badge color="green">Valid</Badge>
                          ) : (
                            <Badge color="red">Invalid</Badge>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex justify-end gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={saveEdit}
                              disabled={!isDraftValid}
                              className="!px-2"
                            >
                              <Check className="h-4 w-4 text-success-green" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={cancelEdit}
                              className="!px-2"
                            >
                              <X className="h-4 w-4 text-error-red" />
                            </Button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-3 py-2.5 font-mono text-white">
                          {entry.subject_code || (
                            <span className="text-error-red">—</span>
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-gray-300">
                          {entry.subject_name || (
                            <span className="text-error-red">—</span>
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-center text-gray-300">
                          {entry.credits}
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <Badge color={GRADE_BADGE_COLOR[entry.grade?.toUpperCase()] ?? "gray"}>
                            {entry.grade?.toUpperCase() || "—"}
                          </Badge>
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          {gradeValid && codeValid ? (
                            <Badge color="green">Verified</Badge>
                          ) : (
                            <Badge color="amber" icon={<AlertTriangle className="h-3 w-3" />}>
                              Needs Review
                            </Badge>
                          )}
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex justify-end gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => startEdit(index)}
                              className="!px-2"
                            >
                              <Pencil className="h-4 w-4 text-electric-blue" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteEntry(index)}
                              className="!px-2"
                            >
                              <Trash2 className="h-4 w-4 text-error-red" />
                            </Button>
                          </div>
                        </td>
                      </>
                    )}
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {entries.length === 0 && (
        <div className="mt-4 rounded-xl border border-dashed border-navy-600 bg-navy-800/30 px-4 py-8 text-center">
          <p className="text-sm text-gray-400">
            No grades extracted. Try running OCR again or add rows manually.
          </p>
        </div>
      )}
    </Card>
  );
}