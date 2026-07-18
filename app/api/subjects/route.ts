import { NextRequest, NextResponse } from "next/server";
import { getSubjects, getSubjectsBySemester, isSubjectDataAvailable } from "@/lib/subjects";

export const dynamic = "force-dynamic";

/**
 * GET /api/subjects
 *
 * Fetches subjects for a given branch and regulation.
 *
 * Query params:
 *   branch    — branch code (e.g. "cse", "ece", "aids")
 *   regulation — regulation code (e.g. "r2021", "r2017")
 *   semester  — optional semester number (1-8)
 *
 * Response (200):
 *   { subjects: Subject[], total: number, available: boolean }
 *
 * Response (400):
 *   { error: "branch and regulation are required" }
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const branch = searchParams.get("branch");
    const regulation = searchParams.get("regulation");
    const semesterParam = searchParams.get("semester");

    if (!branch || !regulation) {
      return NextResponse.json(
        { error: "branch and regulation are required" },
        { status: 400 }
      );
    }

    const available = isSubjectDataAvailable(branch, regulation);

    if (!available) {
      return NextResponse.json({
        subjects: [],
        total: 0,
        available: false,
        message: `No subject data available for ${branch.toUpperCase()} ${regulation.toUpperCase()}`,
      });
    }

    const semester = semesterParam ? parseInt(semesterParam, 10) : null;

    const subjects =
      semester !== null && !isNaN(semester)
        ? getSubjectsBySemester(branch, regulation, semester)
        : getSubjects(branch, regulation);

    return NextResponse.json({
      subjects,
      total: subjects.length,
      available: true,
    });
  } catch (error) {
    console.error("Subjects API error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}