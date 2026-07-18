import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SemesterTabs } from "@/components/semester/SemesterTabs";
import { SubjectTable } from "@/components/semester/SubjectTable";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ErrorState } from "@/components/ui/ErrorState";
import { BookOpen, GraduationCap } from "lucide-react";
import subjectsData from "@/data/anna-university/subjects/sample-aids-r2021.json";

export const dynamic = "force-dynamic";

interface Subject {
  subject_code: string;
  subject_name: string;
  credits: number;
  category: string;
  is_elective: boolean;
  semester_number: number;
}

interface DbGrade {
  subject_code: string;
  grade: string;
}

interface DbProfile {
  current_semester: number;
}

interface PageProps {
  params: { semester: string };
}

export default async function SemesterDetailPage({ params }: PageProps) {
  const semesterNum = parseInt(params.semester, 10);

  if (isNaN(semesterNum) || semesterNum < 1 || semesterNum > 8) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <ErrorState
          title="Invalid semester"
          message="Semester must be a number between 1 and 8."
        />
      </div>
    );
  }

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
      .select("current_semester")
      .eq("id", user.id)
      .single(),
    supabase
      .from("user_grades")
      .select("subject_code, grade")
      .eq("user_id", user.id)
      .eq("semester_number", semesterNum),
  ]);

  const profile: DbProfile = profileRes.data ?? { current_semester: 1 };
  const currentSem = profile.current_semester ?? 1;

  const savedGrades: DbGrade[] = gradesRes.data ?? [];

  // Load subjects from data file
  const allSubjects = subjectsData as Subject[];
  const semesterSubjects = allSubjects.filter(
    (s) => s.semester_number === semesterNum
  );

  // Build semester statuses for tabs
  const semesterStatuses: Record<number, "completed" | "in-progress" | "upcoming"> = {};
  for (let i = 1; i <= 8; i++) {
    if (i < currentSem) semesterStatuses[i] = "completed";
    else if (i === currentSem) semesterStatuses[i] = "in-progress";
    else semesterStatuses[i] = "upcoming";
  }

  const currentStatus = semesterStatuses[semesterNum];

  async function handleSave(grades: { subject_code: string; grade: string }[]) {
    "use server";
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // Delete existing grades for this semester, then insert new ones
    const subjectCodes = grades.map((g) => g.subject_code);
    const subjectsForCodes = (subjectsData as Subject[]).filter(
      (s) =>
        s.semester_number === semesterNum &&
        subjectCodes.includes(s.subject_code)
    );

    await supabase
      .from("user_grades")
      .delete()
      .eq("user_id", user.id)
      .eq("semester_number", semesterNum);

    if (grades.length === 0) return;

    const rows = grades.map((g) => {
      const subject = subjectsForCodes.find(
        (s) => s.subject_code === g.subject_code
      );
      return {
        user_id: user.id,
        subject_code: g.subject_code,
        subject_name: subject?.subject_name ?? "",
        credits: subject?.credits ?? 0,
        grade: g.grade,
        semester_number: semesterNum,
      };
    });

    await supabase.from("user_grades").insert(rows);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-electric-blue to-royal-indigo">
          <BookOpen className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">
            Semester {semesterNum}
          </h1>
          <p className="mt-0.5 text-sm text-gray-400">
            Enter your grades to calculate GPA automatically
          </p>
        </div>
        <div className="ml-auto">
          <Badge
            color={
              currentStatus === "completed"
                ? "green"
                : currentStatus === "in-progress"
                  ? "amber"
                  : "gray"
            }
          >
            {currentStatus === "completed"
              ? "Completed"
              : currentStatus === "in-progress"
                ? "In Progress"
                : "Upcoming"}
          </Badge>
        </div>
      </div>

      {/* Semester Tabs */}
      <div className="mb-6">
        <Card className="p-4">
          <SemesterTabs
            semesters={[1, 2, 3, 4, 5, 6, 7, 8]}
            activeSemester={semesterNum}
            semesterStatuses={semesterStatuses}
          />
        </Card>
      </div>

      {/* Subject Table */}
      {semesterSubjects.length === 0 ? (
        <Card className="p-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <BookOpen className="mb-3 h-10 w-10 text-gray-500" />
            <h3 className="text-lg font-semibold text-white">
              No subjects found
            </h3>
            <p className="mt-1 text-sm text-gray-400">
              No subjects are defined for Semester {semesterNum} in the AIDS
              R2021 curriculum.
            </p>
          </div>
        </Card>
      ) : (
        <SubjectTable
          semester={semesterNum}
          subjects={semesterSubjects}
          savedGrades={savedGrades}
          onSave={handleSave}
        />
      )}
    </div>
  );
}