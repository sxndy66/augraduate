import { NextRequest, NextResponse } from "next/server";
import {
  calculateGPA,
  semesterSchema,
  GRADE_POINTS,
} from "@/lib/validators/gpa";

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const result = semesterSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: result.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { grades } = result.data;

    const gradeEntries = grades.map((g) => ({
      credits: g.credits,
      gradePoint: GRADE_POINTS[g.grade.toUpperCase()] ?? 0,
    }));

    const gpa = calculateGPA(gradeEntries);

    const totalCredits = gradeEntries.reduce(
      (sum, g) => sum + g.credits,
      0
    );

    return NextResponse.json({
      success: true,
      data: {
        gpa: parseFloat(gpa.toFixed(4)),
        totalCredits,
        subjectCount: grades.length,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}