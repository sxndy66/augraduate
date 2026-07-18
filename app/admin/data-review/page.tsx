"use client"

export const dynamic = 'force-dynamic';;

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  BookOpen,
  Bell,
  Loader2,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";
import { useToast } from "@/components/ui/Toast";
import { createClient } from "@/lib/supabase/client";
import { cn, formatDate } from "@/lib/utils";

type AdminStatus = "loading" | "authorized" | "unauthorized";

interface SubjectRow {
  id: string;
  subject_code: string;
  subject_name: string;
  credits: number;
  semester: number;
  regulation: string;
  branch: string;
  is_verified: boolean;
  submitted_by: string | null;
  created_at: string;
}

interface NotificationRow {
  id: string;
  title: string;
  category: string;
  source_name: string | null;
  published_date: string;
  is_verified: boolean;
  created_at: string;
}

type Tab = "subjects" | "notifications";

export default function AdminDataReviewPage() {
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();

  const [status, setStatus] = useState<AdminStatus>("loading");
  const [tab, setTab] = useState<Tab>("subjects");
  const [subjects, setSubjects] = useState<SubjectRow[]>([]);
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  // Admin access check
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          setStatus("unauthorized");
          router.replace("/login");
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();

        if (profileError || !profile) {
          setStatus("unauthorized");
          return;
        }

        if (profile.role !== "admin") {
          setStatus("unauthorized");
          return;
        }

        setStatus("authorized");
      } catch {
        setStatus("unauthorized");
      }
    };
    checkAdmin();
  }, [supabase, router]);

  const fetchData = useCallback(async () => {
    setIsLoadingData(true);
    setError(null);
    try {
      if (tab === "subjects") {
        const { data, error: queryError } = await supabase
          .from("subjects")
          .select(
            "id, subject_code, subject_name, credits, semester, regulation, branch, is_verified, submitted_by, created_at"
          )
          .order("is_verified", { ascending: true })
          .order("created_at", { ascending: false })
          .limit(100);

        if (queryError) throw queryError;
        setSubjects((data || []) as SubjectRow[]);
      } else {
        const { data, error: queryError } = await supabase
          .from("notifications")
          .select(
            "id, title, category, source_name, published_date, is_verified, created_at"
          )
          .order("is_verified", { ascending: true })
          .order("created_at", { ascending: false })
          .limit(100);

        if (queryError) throw queryError;
        setNotifications((data || []) as NotificationRow[]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setIsLoadingData(false);
    }
  }, [supabase, tab]);

  useEffect(() => {
    if (status === "authorized") fetchData();
  }, [status, fetchData]);

  const handleVerifySubject = useCallback(
    async (id: string) => {
      setVerifyingId(id);
      try {
        const { error: updateError } = await supabase
          .from("subjects")
          .update({ is_verified: true, verified_at: new Date().toISOString() })
          .eq("id", id);

        if (updateError) throw updateError;

        setSubjects((prev) =>
          prev.map((s) => (s.id === id ? { ...s, is_verified: true } : s))
        );
        toast({ type: "success", title: "Verified", message: "Subject marked as verified." });
      } catch (err) {
        toast({
          type: "error",
          title: "Verification Failed",
          message: err instanceof Error ? err.message : "Could not verify subject.",
        });
      } finally {
        setVerifyingId(null);
      }
    },
    [supabase, toast]
  );

  const handleVerifyNotification = useCallback(
    async (id: string) => {
      setVerifyingId(id);
      try {
        const { error: updateError } = await supabase
          .from("notifications")
          .update({ is_verified: true })
          .eq("id", id);

        if (updateError) throw updateError;

        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, is_verified: true } : n))
        );
        toast({ type: "success", title: "Verified", message: "Notification marked as verified." });
      } catch (err) {
        toast({
          type: "error",
          title: "Verification Failed",
          message: err instanceof Error ? err.message : "Could not verify notification.",
        });
      } finally {
        setVerifyingId(null);
      }
    },
    [supabase, toast]
  );

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="xl" label="Checking admin access..." />
      </div>
    );
  }

  if (status === "unauthorized") {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-4">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-error-red/10 text-error-red">
          <ShieldCheck className="h-8 w-8" />
        </div>
        <h1 className="text-xl font-bold text-white">Access Denied</h1>
        <p className="mt-2 text-center text-sm text-gray-400">
          You need administrator privileges to access this page.
        </p>
        <Button
          variant="outline"
          className="mt-6"
          onClick={() => router.push("/dashboard")}
          leftIcon={<ArrowLeft className="h-4 w-4" />}
        >
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const unverifiedSubjects = subjects.filter((s) => !s.is_verified).length;
  const unverifiedNotifications = notifications.filter((n) => !n.is_verified).length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-error-red to-royal-indigo text-white">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white sm:text-2xl">Data Review</h1>
            <p className="text-sm text-gray-400">
              Review and verify user-submitted subjects and scraped notifications
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

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-400">Unverified Subjects</p>
              <p className="mt-1 text-2xl font-bold text-amber">{unverifiedSubjects}</p>
            </div>
            <BookOpen className="h-8 w-8 text-amber/50" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-400">Unverified Notifications</p>
              <p className="mt-1 text-2xl font-bold text-amber">{unverifiedNotifications}</p>
            </div>
            <Bell className="h-8 w-8 text-amber/50" />
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setTab("subjects")}
          className={cn(
            "flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all",
            tab === "subjects"
              ? "bg-electric-blue/15 text-electric-blue border border-electric-blue/30"
              : "border border-navy-600 text-gray-400 hover:text-white"
          )}
        >
          <BookOpen className="h-4 w-4" />
          Subjects ({subjects.length})
        </button>
        <button
          onClick={() => setTab("notifications")}
          className={cn(
            "flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all",
            tab === "notifications"
              ? "bg-electric-blue/15 text-electric-blue border border-electric-blue/30"
              : "border border-navy-600 text-gray-400 hover:text-white"
          )}
        >
          <Bell className="h-4 w-4" />
          Notifications ({notifications.length})
        </button>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchData}
          leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
          className="ml-auto"
        >
          Refresh
        </Button>
      </div>

      {/* Content */}
      {isLoadingData ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" label="Loading data..." />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchData} />
      ) : tab === "subjects" ? (
        <SubjectReviewTable
          subjects={subjects}
          onVerify={handleVerifySubject}
          verifyingId={verifyingId}
        />
      ) : (
        <NotificationReviewTable
          notifications={notifications}
          onVerify={handleVerifyNotification}
          verifyingId={verifyingId}
        />
      )}
    </div>
  );
}

// --- Subject Review Table ---

function SubjectReviewTable({
  subjects,
  onVerify,
  verifyingId,
}: {
  subjects: SubjectRow[];
  onVerify: (id: string) => void;
  verifyingId: string | null;
}) {
  if (subjects.length === 0) {
    return (
      <Card className="p-8 text-center">
        <BookOpen className="mx-auto mb-3 h-8 w-8 text-gray-500" />
        <p className="text-sm text-gray-400">No subjects to review.</p>
      </Card>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-navy-600">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-navy-600 bg-navy-800/50 text-left">
            <th className="px-3 py-2.5 font-medium text-gray-400">Code</th>
            <th className="px-3 py-2.5 font-medium text-gray-400">Name</th>
            <th className="px-3 py-2.5 text-center font-medium text-gray-400">Credits</th>
            <th className="px-3 py-2.5 text-center font-medium text-gray-400">Sem</th>
            <th className="px-3 py-2.5 font-medium text-gray-400">Regulation</th>
            <th className="px-3 py-2.5 text-center font-medium text-gray-400">Status</th>
            <th className="px-3 py-2.5 text-right font-medium text-gray-400">Action</th>
          </tr>
        </thead>
        <tbody>
          {subjects.map((subject) => (
            <tr
              key={subject.id}
              className="border-b border-navy-700/50 last:border-0 hover:bg-navy-800/30"
            >
              <td className="px-3 py-2.5 font-mono text-white">{subject.subject_code}</td>
              <td className="px-3 py-2.5 text-gray-300">{subject.subject_name}</td>
              <td className="px-3 py-2.5 text-center text-gray-300">{subject.credits}</td>
              <td className="px-3 py-2.5 text-center text-gray-300">{subject.semester}</td>
              <td className="px-3 py-2.5 text-gray-300">{subject.regulation}</td>
              <td className="px-3 py-2.5 text-center">
                {subject.is_verified ? (
                  <Badge color="green" icon={<CheckCircle2 className="h-3 w-3" />}>
                    Verified
                  </Badge>
                ) : (
                  <Badge color="amber" icon={<Clock className="h-3 w-3" />}>
                    Pending
                  </Badge>
                )}
              </td>
              <td className="px-3 py-2.5 text-right">
                {!subject.is_verified && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onVerify(subject.id)}
                    disabled={verifyingId === subject.id}
                    isLoading={verifyingId === subject.id}
                    className="!text-xs"
                  >
                    {verifyingId === subject.id ? "Verifying…" : "Verify"}
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// --- Notification Review Table ---

function NotificationReviewTable({
  notifications,
  onVerify,
  verifyingId,
}: {
  notifications: NotificationRow[];
  onVerify: (id: string) => void;
  verifyingId: string | null;
}) {
  if (notifications.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Bell className="mx-auto mb-3 h-8 w-8 text-gray-500" />
        <p className="text-sm text-gray-400">No notifications to review.</p>
      </Card>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-navy-600">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-navy-600 bg-navy-800/50 text-left">
            <th className="px-3 py-2.5 font-medium text-gray-400">Title</th>
            <th className="px-3 py-2.5 font-medium text-gray-400">Category</th>
            <th className="px-3 py-2.5 font-medium text-gray-400">Source</th>
            <th className="px-3 py-2.5 font-medium text-gray-400">Published</th>
            <th className="px-3 py-2.5 text-center font-medium text-gray-400">Status</th>
            <th className="px-3 py-2.5 text-right font-medium text-gray-400">Action</th>
          </tr>
        </thead>
        <tbody>
          {notifications.map((notification) => (
            <tr
              key={notification.id}
              className="border-b border-navy-700/50 last:border-0 hover:bg-navy-800/30"
            >
              <td className="px-3 py-2.5 text-white">{notification.title}</td>
              <td className="px-3 py-2.5">
                <Badge color="gray">{notification.category}</Badge>
              </td>
              <td className="px-3 py-2.5 text-gray-300">
                {notification.source_name || "—"}
              </td>
              <td className="px-3 py-2.5 text-gray-400">
                {formatDate(notification.published_date)}
              </td>
              <td className="px-3 py-2.5 text-center">
                {notification.is_verified ? (
                  <Badge color="green" icon={<CheckCircle2 className="h-3 w-3" />}>
                    Verified
                  </Badge>
                ) : (
                  <Badge color="amber" icon={<Clock className="h-3 w-3" />}>
                    Pending
                  </Badge>
                )}
              </td>
              <td className="px-3 py-2.5 text-right">
                {!notification.is_verified && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onVerify(notification.id)}
                    disabled={verifyingId === notification.id}
                    isLoading={verifyingId === notification.id}
                    className="!text-xs"
                  >
                    {verifyingId === notification.id ? "Verifying…" : "Verify"}
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}