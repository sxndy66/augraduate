import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatGrid } from "@/components/dashboard/StatGrid";
import { SemesterProgress } from "@/components/dashboard/SemesterProgress";
import { GradeTablePreview } from "@/components/dashboard/GradeTablePreview";
import { ArrearPreview } from "@/components/dashboard/ArrearPreview";
import { NotificationFeed } from "@/components/dashboard/NotificationFeed";
import { TargetPlanSummary } from "@/components/dashboard/TargetPlanSummary";
import { RecentNotes } from "@/components/dashboard/RecentNotes";
import { StudyPlanPreview } from "@/components/dashboard/StudyPlanPreview";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";
import { calculateGPA, getGradePoint } from "@/lib/validators/gpa";
import { calculateCGPA } from "@/lib/validators/cgpa";
import { generatePlan } from "@/lib/validators/target-plan";
import subjectsData from "@/data/anna-university/subjects/sample-aids-r2021.json";

export const dynamic = "force-dynamic";

interface DbGrade {
  subject_code: string;
  subject_name: string;
  credits: number;
  grade: string;
  semester_number: number;
}

interface DbArrear {
  id: string;
  subject_code: string;
  subject_name: string;
  semester: number;
  attempts: number;
  status: string;
}

interface DbNotification {
  id: string;
  title: string;
  message: string;
  type: "exam" | "result" | "reminder" | "info" | "alert";
  date: string;
  is_read: boolean;
}

interface DbNote {
  id: string;
  title: string;
  content: string;
  subject_code?: string;
  created_at: string;
  tags?: string[];
}

interface DbProfile {
  full_name: string;
  current_semester: number;
  target_cgpa: number;
  total_credits: number;
}

export default async function DashboardPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch all data in parallel
  const [profileRes, gradesRes, arrearsRes, notificationsRes, notesRes] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("full_name, current_semester, target_cgpa, total_credits")
        .eq("id", user.id)
        .single(),
      supabase
        .from("user_grades")
        .select(
          "subject_code, subject_name, credits, grade, semester_number"
        )
        .eq("user_id", user.id),
      supabase
        .from("arrears")
        .select("id, subject_code, subject_name, semester, attempts, status")
        .eq("user_id", user.id)
        .eq("status", "pending")
        .order("semester", { ascending: true }),
      supabase
        .from("notifications")
        .select("id, title, message, type, date, is_read")
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .limit(5),
      supabase
        .from("notes")
        .select("id, title, content, subject_code, created_at, tags")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(3),
    ]);

  // Handle profile error gracefully — fall back to defaults
  const profile: DbProfile = profileRes.data ?? {
    full_name: user.email?.split("@")[0] ?? "Student",
    current_semester: 1,
    target_cgpa: 8.5,
    total_credits: 160,
  };

  const grades: DbGrade[] = gradesRes.data ?? [];
  const arrears: DbArrear[] = arrearsRes.data ?? [];
  const notifications: DbNotification[] = notificationsRes.data ?? [];
  const notes: DbNote[] = notesRes.data ?? [];

  // Fetch latest study plan from target_plans table
  const studyPlanRes = await supabase
    .from("target_plans")
    .select("plan_data, current_cgpa, target_cgpa, created_at")
    .eq("user_id", user.id)
    .or("plan_type.eq.study_plan,plan_data->>planTitle.neq.null")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const studyPlan = studyPlanRes.data?.plan_data ?? null;
  const studyPlanCurrentCGPA = studyPlanRes.data?.current_cgpa ?? 0;
  const studyPlanTargetCGPA = studyPlanRes.data?.target_cgpa ?? 8.5;

  // Calculate per-semester GPAs
  const semesterMap = new Map<number, DbGrade[]>();
  for (const g of grades) {
    const arr = semesterMap.get(g.semester_number) ?? [];
    arr.push(g);
    semesterMap.set(g.semester_number, arr);
  }

  const semesterGpas = new Map<number, number>();
  semesterMap.forEach((semGrades: DbGrade[], sem: number) => {
    const entries = semGrades
      .filter((g: DbGrade) => getGradePoint(g.grade) >= 0)
      .map((g: DbGrade) => ({
        credits: g.credits,
        gradePoint: getGradePoint(g.grade),
      }));
    semesterGpas.set(sem, calculateGPA(entries));
  });

  // Current semester data
  const currentSem = profile.current_semester ?? 1;
  const currentSemGrades = semesterMap.get(currentSem) ?? [];
  const currentSemGPA = semesterGpas.get(currentSem) ?? 0;

  // CGPA calculation
  const allValidGrades = grades
    .filter((g) => getGradePoint(g.grade) >= 0)
    .map((g) => ({
      credits: g.credits,
      gradePoint: getGradePoint(g.grade),
    }));
  const completedCredits = allValidGrades.reduce(
    (sum, g) => sum + g.credits,
    0
  );
  const currentCGPA =
    completedCredits > 0 ? calculateGPA(allValidGrades) : 0;

  // GPA trend (compare last two completed semesters)
  const completedSemesters = Array.from(semesterGpas.entries())
    .filter(([sem]) => sem < currentSem)
    .sort((a, b) => a[0] - b[0]);
  const gpaTrend =
    completedSemesters.length >= 2
      ? (() => {
          const prev = completedSemesters[completedSemesters.length - 2][1];
          const latest = completedSemesters[completedSemesters.length - 1][1];
          const diff = latest - prev;
          return {
            value: `${diff >= 0 ? "+" : ""}${diff.toFixed(2)} vs last sem`,
            direction: diff >= 0 ? ("up" as const) : ("down" as const),
          };
        })()
      : null;

  // Build semester progress list (8 semesters)
  const totalSemesters = 8;
  const semesters = Array.from({ length: totalSemesters }, (_, i) => {
    const sem = i + 1;
    const semGrades = semesterMap.get(sem) ?? [];
    const semCredits = semGrades.reduce((sum, g) => sum + g.credits, 0);
    let status: "completed" | "in-progress" | "upcoming" = "upcoming";
    if (sem < currentSem) status = "completed";
    else if (sem === currentSem) status = "in-progress";
    return {
      semester: sem,
      gpa: semesterGpas.has(sem) ? semesterGpas.get(sem)! : null,
      credits: semCredits,
      status,
    };
  });

  // Target plan
  const targetCGPA = profile.target_cgpa ?? 8.5;
  const totalCredits = profile.total_credits ?? 160;
  const remainingCredits = Math.max(0, totalCredits - completedCredits);
  const plan =
    completedCredits > 0
      ? generatePlan(
          currentCGPA,
          targetCGPA,
          completedCredits,
          totalCredits,
          remainingCredits
        )
      : null;
  const targetRequiredGPA = plan?.safe.requiredGPA ?? 0;

  // Upcoming notifications count
  const upcomingNotifications = notifications.filter((n) => !n.is_read).length;

  // Check for errors
  const hasError = gradesRes.error && arrearsRes.error;

  if (hasError) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <ErrorState
          title="Failed to load dashboard"
          message="We couldn't load your dashboard data. Please try again later."
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <DashboardHeader
        userName={profile.full_name}
        currentSemester={currentSem}
        currentCGPA={currentCGPA}
        targetCGPA={targetCGPA}
      />

      {/* Stat Grid */}
      <div className="mt-6">
        <StatGrid
          currentSemGPA={currentSemGPA}
          completedCredits={completedCredits}
          totalCredits={totalCredits}
          pendingArrears={arrears.length}
          upcomingNotifications={upcomingNotifications}
          targetRequiredGPA={targetRequiredGPA}
          notesCount={notes.length}
          gpaTrend={gpaTrend}
        />
      </div>

      {/* Semester Progress */}
      <div className="mt-6">
        <SemesterProgress semesters={semesters} currentSemester={currentSem} />
      </div>

      {/* Grade Table + Arrear Preview */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <GradeTablePreview semester={currentSem} grades={currentSemGrades} />
        <ArrearPreview arrears={arrears} />
      </div>

      {/* Notifications + Target Plan */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <NotificationFeed notifications={notifications} />
        <TargetPlanSummary
          currentCGPA={currentCGPA}
          targetCGPA={targetCGPA}
          completedCredits={completedCredits}
          totalCredits={totalCredits}
          plan={plan}
        />
      </div>

      {/* Study Plan Preview */}
      <div className="mt-6">
        <StudyPlanPreview
          plan={studyPlan}
          currentCGPA={studyPlanCurrentCGPA}
          targetCGPA={studyPlanTargetCGPA}
        />
      </div>

      {/* Recent Notes */}
      <div className="mt-6">
        <RecentNotes notes={notes} />
      </div>
    </div>
  );
}