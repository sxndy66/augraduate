import { NextRequest, NextResponse } from "next/server";
import { calculateCGPA, cgpaInputSchema } from "@/lib/validators/cgpa";

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const result = cgpaInputSchema.safeParse(body);

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

    const { previousCGPA, previousCredits, currentGPA, currentCredits } =
      result.data;

    const cgpa = calculateCGPA(
      previousCGPA,
      previousCredits,
      currentGPA,
      currentCredits
    );

    const totalCredits = previousCredits + currentCredits;

    return NextResponse.json({
      success: true,
      data: {
        cgpa: parseFloat(cgpa.toFixed(4)),
        totalCredits,
        previousCGPA,
        previousCredits,
        currentGPA,
        currentCredits,
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