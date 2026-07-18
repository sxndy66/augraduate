"use client"

export const dynamic = 'force-dynamic';;

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, ShieldAlert, ArrowLeft } from "lucide-react";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";
import { useToast } from "@/components/ui/Toast";
import { NotificationList } from "@/components/notifications/NotificationList";
import {
  NotificationFilters,
  type NotificationFiltersState,
} from "@/components/notifications/NotificationFilters";
import type { NotificationItem } from "@/components/notifications/NotificationCard";
import { createClient } from "@/lib/supabase/client";

const CATEGORY_OPTIONS = [
  { label: "Exam Timetable", value: "exam_timetable" },
  { label: "Results", value: "results" },
  { label: "Revaluation", value: "revaluation" },
  { label: "Hall Ticket", value: "hall_ticket" },
  { label: "Practical Exam", value: "practical_exam" },
  { label: "Internal Assessment", value: "internal_assessment" },
  { label: "Academic Calendar", value: "academic_calendar" },
  { label: "Circulars", value: "circulars" },
];

const CATEGORY_LABELS: Record<string, string> = {
  exam_timetable: "Exam Timetable",
  results: "Results",
  revaluation: "Revaluation",
  hall_ticket: "Hall Ticket",
  practical_exam: "Practical Exam",
  internal_assessment: "Internal Assessment",
  academic_calendar: "Academic Calendar",
  circulars: "Circulars",
};

const DEGREE_OPTIONS = [
  { label: "B.E — Bachelor of Engineering", value: "be" },
  { label: "B.Tech — Bachelor of Technology", value: "btech" },
  { label: "M.E — Master of Engineering", value: "me" },
  { label: "M.Tech — Master of Technology", value: "mtech" },
];

const BRANCH_OPTIONS = [
  { label: "CSE — Computer Science", value: "cse" },
  { label: "IT — Information Technology", value: "it" },
  { label: "ECE — Electronics & Communication", value: "ece" },
  { label: "EEE — Electrical & Electronics", value: "eee" },
  { label: "MECH — Mechanical", value: "mech" },
  { label: "CIVIL — Civil", value: "civil" },
  { label: "AIDS — AI & Data Science", value: "aids" },
];

export default function NotificationsPage() {
  return (
    <ProtectedRoute requireOnboarding={false}>
      <NotificationsContent />
    </ProtectedRoute>
  );
}

function NotificationsContent() {
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<NotificationFiltersState>({
    category: "all",
    degree: "all",
    branch: "all",
  });

  const [mutedCategories, setMutedCategories] = useState<string[]>([]);
  const [muteAll, setMuteAll] = useState(false);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.category !== "all") params.set("category", filters.category);
      if (filters.degree !== "all") params.set("degree", filters.degree);
      if (filters.branch !== "all") params.set("branch", filters.branch);

      const res = await fetch(`/api/notifications?${params.toString()}`);
      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
      const data = await res.json();

      const items: NotificationItem[] = (data.notifications || []).map((n: Record<string, unknown>) => ({
        id: String(n.id),
        title: String(n.title ?? ""),
        body: String(n.body ?? n.summary ?? ""),
        category: String(n.category ?? "circulars"),
        category_label: CATEGORY_LABELS[String(n.category ?? "circulars")] ?? "Circulars",
        category_color: "gray",
        source_url: (n.source_url as string) ?? null,
        source_name: (n.source_name as string) ?? null,
        published_date: String(n.published_date ?? n.created_at ?? new Date().toISOString()),
        fetched_date: String(n.fetched_date ?? n.created_at ?? new Date().toISOString()),
        is_read: Boolean(n.is_read ?? false),
        is_saved: Boolean(n.is_saved ?? false),
        is_muted: mutedCategories.includes(String(n.category ?? "")),
      }));

      setNotifications(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load notifications");
    } finally {
      setIsLoading(false);
    }
  }, [filters, mutedCategories]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Load mute preferences from localStorage
  useEffect(() => {
    const savedMuted = localStorage.getItem("au_muted_categories");
    if (savedMuted) {
      try {
        setMutedCategories(JSON.parse(savedMuted));
      } catch {
        // ignore
      }
    }
    const savedMuteAll = localStorage.getItem("au_mute_all");
    if (savedMuteAll === "true") setMuteAll(true);
  }, []);

  // Persist mute preferences
  useEffect(() => {
    localStorage.setItem("au_muted_categories", JSON.stringify(mutedCategories));
  }, [mutedCategories]);

  useEffect(() => {
    localStorage.setItem("au_mute_all", String(muteAll));
  }, [muteAll]);

  const handleMarkRead = useCallback(
    async (id: string) => {
      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) return;
        await supabase
          .from("notification_reads")
          .upsert({ user_id: session.user.id, notification_id: id });
      } catch {
        // non-critical
      }
    },
    [supabase]
  );

  const handleSave = useCallback(
    async (id: string) => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_saved: !n.is_saved } : n))
      );
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) return;
        const existing = notifications.find((n) => n.id === id);
        if (existing?.is_saved) {
          await supabase
            .from("saved_notifications")
            .delete()
            .eq("user_id", session.user.id)
            .eq("notification_id", id);
          toast({ type: "info", title: "Removed", message: "Notification unsaved." });
        } else {
          await supabase
            .from("saved_notifications")
            .insert({ user_id: session.user.id, notification_id: id });
          toast({ type: "success", title: "Saved", message: "Notification saved for later." });
        }
      } catch {
        toast({ type: "error", title: "Error", message: "Could not update saved status." });
      }
    },
    [supabase, notifications, toast]
  );

  const handleMuteCategory = useCallback(
    (category: string) => {
      setMutedCategories((prev) =>
        prev.includes(category)
          ? prev.filter((c) => c !== category)
          : [...prev, category]
      );
      // Update is_muted on notifications
      setNotifications((prev) =>
        prev.map((n) =>
          n.category === category
            ? { ...n, is_muted: !mutedCategories.includes(category) }
            : n
        )
      );
    },
    [mutedCategories]
  );

  const handleToggleMuteAll = useCallback(() => {
    setMuteAll((prev) => !prev);
    if (!muteAll) {
      setMutedCategories(CATEGORY_OPTIONS.map((c) => c.value));
    } else {
      setMutedCategories([]);
    }
  }, [muteAll]);

  // Filter out muted notifications (unless showing all)
  const visibleNotifications = useMemo(() => {
    if (muteAll) return [];
    return notifications.filter((n) => !n.is_muted);
  }, [notifications, muteAll]);

  return (
    <ProtectedRoute requireOnboarding={false}>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-electric-blue to-royal-indigo text-white">
              <Bell className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white sm:text-2xl">Notifications</h1>
              <p className="text-sm text-gray-400">
                Latest updates from Anna University — exam timetables, results, and more
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard")}
            leftIcon={<ArrowLeft className="h-4 w-4" />}
          >
            Dashboard
          </Button>
        </div>

        {/* Non-affiliation disclaimer */}
        <Card className="mb-6 border-amber/20 bg-amber/5 p-3">
          <div className="flex items-start gap-2">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber" />
            <p className="text-xs text-gray-300">
              <strong className="text-amber">Disclaimer:</strong> AU Track is an independent
              platform and is not affiliated with, endorsed by, or officially connected to Anna
              University. Notifications are sourced from publicly available university channels
              for convenience. Always verify with official sources before making decisions.
            </p>
          </div>
        </Card>

        {/* Filters */}
        <NotificationFilters
          filters={filters}
          onChange={setFilters}
          categoryOptions={CATEGORY_OPTIONS}
          degreeOptions={DEGREE_OPTIONS}
          branchOptions={BRANCH_OPTIONS}
          mutedCategories={mutedCategories}
          onToggleMuteCategory={handleMuteCategory}
          muteAll={muteAll}
          onToggleMuteAll={handleToggleMuteAll}
          resultCount={visibleNotifications.length}
          className="mb-6"
        />

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner size="lg" label="Loading notifications…" />
          </div>
        ) : error ? (
          <ErrorState
            title="Failed to Load"
            message={error}
            onRetry={fetchNotifications}
          />
        ) : muteAll ? (
          <Card className="p-8 text-center">
            <Bell className="mx-auto mb-3 h-8 w-8 text-gray-500" />
            <p className="text-sm text-gray-400">
              All notifications are muted. Unmute to see updates.
            </p>
          </Card>
        ) : (
          <NotificationList
            notifications={visibleNotifications}
            onMarkRead={handleMarkRead}
            onSave={handleSave}
            onMuteCategory={handleMuteCategory}
            isLoading={isLoading}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}