"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Clock, BookOpen, Hash, Target, StickyNote, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface Arrear {
  id: string;
  subject_code: string;
  subject_name: string;
  semester: number;
  status: string;
  attempts: number;
  exam_month: string | null;
  target_grade: string | null;
  notes: string | null;
}

type FilterTab = "all" | "pending" | "cleared";

interface ArrearListProps {
  arrears: Arrear[];
  onCleared: () => void;
  onDeleted: () => void;
}

export function ArrearList({ arrears, onCleared, onDeleted }: ArrearListProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [clearingId, setClearingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = arrears.filter((a) => {
    if (activeTab === "pending") return a.status === "pending";
    if (activeTab === "cleared") return a.status === "cleared";
    return true;
  });

  const tabs: { label: string; value: FilterTab; count: number }[] = [
    { label: "All", value: "all", count: arrears.length },
    { label: "Pending", value: "pending", count: arrears.filter((a) => a.status === "pending").length },
    { label: "Cleared", value: "cleared", count: arrears.filter((a) => a.status === "cleared").length },
  ];

  async function handleClear(id: string) {
    setClearingId(id);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("arrears")
        .update({ status: "cleared" })
        .eq("id", id);

      if (error) throw error;

      toast({ type: "success", title: "Arrear cleared!", message: "Great job — keep it up!" });
      onCleared();
    } catch (err) {
      toast({
        type: "error",
        title: "Failed to clear arrear",
        message: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setClearingId(null);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("arrears").delete().eq("id", id);

      if (error) throw error;

      toast({ type: "info", title: "Arrear removed" });
      onDeleted();
    } catch (err) {
      toast({
        type: "error",
        title: "Failed to delete arrear",
        message: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      {/* Filter Tabs */}
      <div className="mb-4 flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200",
              activeTab === tab.value
                ? "bg-electric-blue/20 text-electric-blue border border-electric-blue/40"
                : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
            )}
          >
            {tab.label}
            <span className="ml-2 rounded-full bg-white/10 px-2 py-0.5 text-xs">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="h-8 w-8" />}
          title={activeTab === "cleared" ? "No cleared arrears" : "No arrears found"}
          description={
            activeTab === "pending"
              ? "You have no pending arrears. Stay on top of your studies!"
              : activeTab === "cleared"
                ? "Once you clear an arrear, it will show up here."
                : "Add an arrear to start tracking your backlog."
          }
        />
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((arrear) => (
              <motion.div
                key={arrear.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Card hover className="p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    {/* Left: Info */}
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge color="indigo" icon={<Hash className="h-3 w-3" />}>
                          {arrear.subject_code}
                        </Badge>
                        <Badge
                          color={arrear.status === "cleared" ? "green" : "amber"}
                          icon={
                            arrear.status === "cleared" ? (
                              <CheckCircle2 className="h-3 w-3" />
                            ) : (
                              <Clock className="h-3 w-3" />
                            )
                          }
                        >
                          {arrear.status === "cleared" ? "Cleared" : "Pending"}
                        </Badge>
                        <Badge color="gray">Sem {arrear.semester}</Badge>
                        <Badge color="gray">Attempt {arrear.attempts}</Badge>
                      </div>

                      <h4 className="text-base font-semibold text-white">
                        {arrear.subject_name}
                      </h4>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-400">
                        {arrear.exam_month && (
                          <span className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" />
                            {arrear.exam_month}
                          </span>
                        )}
                        {arrear.target_grade && (
                          <span className="flex items-center gap-1.5">
                            <Target className="h-3.5 w-3.5" />
                            Target: {arrear.target_grade}
                          </span>
                        )}
                      </div>

                      {arrear.notes && (
                        <p className="flex items-start gap-1.5 text-sm text-gray-500">
                          <StickyNote className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                          {arrear.notes}
                        </p>
                      )}
                    </div>

                    {/* Right: Actions */}
                    <div className="flex shrink-0 gap-2">
                      {arrear.status === "pending" && (
                        <Button
                          size="sm"
                          variant="outline"
                          leftIcon={<CheckCircle2 className="h-4 w-4" />}
                          isLoading={clearingId === arrear.id}
                          onClick={() => handleClear(arrear.id)}
                        >
                          Mark Cleared
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-error-red hover:bg-error-red/10"
                        isLoading={deletingId === arrear.id}
                        onClick={() => handleDelete(arrear.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
