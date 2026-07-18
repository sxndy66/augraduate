import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { calculateGPA, getGradePoint } from "@/lib/validators/gpa";
import { formatGPA } from "@/lib/utils";
import {
  CheckCircle2,
  Clock,
  Lock,
  ArrowRight,
  BookOpen,
  GraduationCap,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface DbGrade {
  subject_code: string;
  subject_name: string;
  credits: number;
  grade: string;
  semester_number: number;
}

interface DbProfile {
  full_name: string;
  current_semester: number;
  total_credits: number;
}

const statusConfig = {
  completed: {
    icon: <CheckCircle2 className="h-5 w-5" />,
    color: "green" as const,
    label: "Completed",
    border: "border-success-green/20",
    bg: "bg-success-green/5",
  },
  "in-progress": {
    icon: <Clock className="h-5 w-5" />,
    color: "amber" as const,
    label: "In Progress",
    border: "border-amber/20",
    bg: "bg-amber/5",
  },
  upcoming: {
    icon: <Lock className="h-5 w-5" />,
    color: "gray" as const,
    label: "Upcoming",
    border: "border-navy-600",
    bg: "bg-navy-800/30",
  },
};

export default async function SemestersPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [profileRes, gradesRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, current_semester, total_credits")
      .eq("id", user.id)
      .single(),
    supabase
      .from("user_grades")
      .select("subject_code, subject_name, credits, grade, semester_number")
      .eq("user_id", user.id),
  ]);

  if (gradesRes.error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <ErrorState
          title="Failed to load semesters"
          message="We couldn't load your semester data. Please try again later."
        />
      </div>
    );
  }

  const profile: DbProfile = profileRes.data ?? {
    full_name: user.email?.split("@")[0] ?? "Student",
    current_semester: 1,
    total_credits: 160,
  };

  const grades: DbGrade[] = gradesRes.data ?? [];
  const currentSem = profile.current_semester ?? 1;

  // Build semester map
  const semesterMap = new Map<number, DbGrade[]>();
  for (const g of grades) {
    const arr = semesterMap.get(g.semester_number) ?? [];
    arr.push(g);
    semesterMap.set(g.semester_number, arr);
  }

  const totalSemesters = 8;
  const semesters = Array.from({ length: totalSemesters }, (_, i) => {
    const sem = i + 1;
    const semGrades = semesterMap.get(sem) ?? [];
    const credits = semGrades.reduce((sum, g) => sum + g.credits, 0);
    const entries = semGrades
      .filter((g) => getGradePoint(g.grade) >= 0)
      .map((g) => ({ credits: g.credits, gradePoint: getGradePoint(g.grade) }));
    const gpa = entries.length > 0 ? calculateGPA(entries) : null;
    let status: "completed" | "in-progress" | "upcoming" = "upcoming";
    if (sem < currentSem) status = "completed";
    else if (sem === currentSem) status = "in-progress";
    return { semester: sem, gpa, credits, status, subjectCount: semGrades.length };
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-electric-blue to-royal-indigo">
          <GraduationCap className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">
            Semesters
          </h1>
          <p className="mt-0.5 text-sm text-gray-400">
            Track your progress across all 8 semesters
          </p>
        </div>
      </div>

      {semesters.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="h-8 w-8" />}
          title="No semester data"
          description="Start by entering grades for your first semester."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {semesters.map((sem) => {
            const config = statusConfig[sem.status];
            return (
              <Link key={sem.semester} href={`/semesters/${sem.semester}`}>
                <Card
                  hover
                  className={`group h-full border ${config.border} ${config.bg} p-5`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                        Semester
                      </p>
                      <p className="mt-1 text-3xl font-bold text-white">
                        {sem.semester}
                      </p>
                    </div>
                    <div
                      className={`text-${config.color === "green" ? "success-green" : config.color === "amber" ? "amber" : "gray-400"}`}
                    >
                      {config.icon}
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">GPA</span>
                      <span
                        className={`font-bold ${
                          sem.gpa !== null
                            ? sem.gpa >= 8
                              ? "text-success-green"
                              : sem.gpa >= 6
                                ? "text-electric-blue"
                                : "text-amber"
                            : "text-gray-500"
                        }`}
                      >
                        {sem.gpa !== null ? formatGPA(sem.gpa) : "—"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Credits</span>
                      <span className="font-medium text-white">
                        {sem.credits}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Subjects</span>
                      <span className="font-medium text-white">
                        {sem.subjectCount}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <Badge color={config.color}>{config.label}</Badge>
                    <span className="flex items-center gap-1 text-xs font-medium text-electric-blue opacity-0 transition-opacity group-hover:opacity-100">
                      Open <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}