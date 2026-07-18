import { StatCard } from "@/components/ui/StatCard";
import {
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Bell,
  Target,
  StickyNote,
} from "lucide-react";

interface StatGridProps {
  currentSemGPA: number;
  completedCredits: number;
  totalCredits: number;
  pendingArrears: number;
  upcomingNotifications: number;
  targetRequiredGPA: number;
  notesCount: number;
  gpaTrend?: { value: string; direction: "up" | "down" } | null;
}

export function StatGrid({
  currentSemGPA,
  completedCredits,
  totalCredits,
  pendingArrears,
  upcomingNotifications,
  targetRequiredGPA,
  notesCount,
  gpaTrend,
}: StatGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <StatCard
        label="Current Semester GPA"
        value={currentSemGPA > 0 ? currentSemGPA.toFixed(2) : "—"}
        icon={<TrendingUp className="h-5 w-5" />}
        color="blue"
        trend={gpaTrend ?? undefined}
      />
      <StatCard
        label="Completed Credits"
        value={`${completedCredits}/${totalCredits}`}
        icon={<CheckCircle2 className="h-5 w-5" />}
        color="green"
      />
      <StatCard
        label="Pending Arrears"
        value={pendingArrears}
        icon={<AlertTriangle className="h-5 w-5" />}
        color={pendingArrears > 0 ? "red" : "green"}
      />
      <StatCard
        label="Upcoming Notifications"
        value={upcomingNotifications}
        icon={<Bell className="h-5 w-5" />}
        color="amber"
      />
      <StatCard
        label="Target Required GPA"
        value={targetRequiredGPA > 0 ? targetRequiredGPA.toFixed(2) : "—"}
        icon={<Target className="h-5 w-5" />}
        color="indigo"
      />
      <StatCard
        label="Notes Count"
        value={notesCount}
        icon={<StickyNote className="h-5 w-5" />}
        color="blue"
      />
    </div>
  );
}