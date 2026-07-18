"use client"

export const dynamic = 'force-dynamic';;

import { useCallback, useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import { ArrearStats } from "@/components/arrears/ArrearStats";
import { ArrearForm } from "@/components/arrears/ArrearForm";
import { ArrearList } from "@/components/arrears/ArrearList";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";
import { createClient } from "@/lib/supabase/client";
import subjectsData from "@/data/anna-university/subjects/sample-aids-r2021.json";

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

interface Subject {
  subject_code: string;
  subject_name: string;
  credits: number;
  category: string;
  is_elective: boolean;
  semester_number: number;
}

export default function ArrearsPage() {
  const [arrears, setArrears] = useState<Arrear[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const subjects = subjectsData as Subject[];

  const fetchArrears = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError("Please log in to view your arrears.");
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("arrears")
        .select(
          "id, subject_code, subject_name, semester, status, attempts, exam_month, target_grade, notes"
        )
        .eq("user_id", user.id)
        .order("semester", { ascending: true })
        .order("status", { ascending: true });

      if (fetchError) throw fetchError;
      setArrears((data as Arrear[]) ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load arrears.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArrears();
  }, [fetchArrears]);

  const pendingCount = arrears.filter((a) => a.status === "pending").length;
  const clearedCount = arrears.filter((a) => a.status === "cleared").length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">Arrear Tracker</h1>
          <p className="mt-1 text-sm text-gray-400">
            Track and manage your arrears to stay on top of your academic progress.
          </p>
        </div>
        <ArrearForm subjects={subjects} onAdded={fetchArrears} />
      </div>

      {/* Stats */}
      <div className="mb-6">
        <ArrearStats total={arrears.length} pending={pendingCount} cleared={clearedCount} />
      </div>

      {/* Content */}
      {loading ? (
        <Card className="flex items-center justify-center py-20">
          <Spinner size="lg" label="Loading arrears..." />
        </Card>
      ) : error ? (
        <ErrorState
          icon={<AlertCircle className="h-8 w-8" />}
          title="Failed to load arrears"
          message={error}
          onRetry={fetchArrears}
        />
      ) : (
        <ArrearList
          arrears={arrears}
          onCleared={fetchArrears}
          onDeleted={fetchArrears}
        />
      )}
    </div>
  );
}
