import { NextRequest, NextResponse } from "next/server";
import {
  generatePlan,
  targetPlanSchema,
} from "@/lib/validators/target-plan";

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const result = targetPlanSchema.safeParse(body);

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

    const {
      currentCGPA,
      targetCGPA,
      completedCredits,
      totalCredits,
      remainingCredits,
    } = result.data;

    // Additional validation: completed + remaining should not exceed total
    if (completedCredits + remainingCredits > totalCredits) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid credits",
          message:
            "Completed credits + remaining credits cannot exceed total credits.",
        },
        { status: 400 }
      );
    }

    // Validate target is higher than current (otherwise no plan needed)
    if (targetCGPA <= currentCGPA) {
      return NextResponse.json({
        success: true,
        data: {
          plan: {
            safe: {
              requiredGPA: 0,
              isAchievable: true,
              message: `Your current CGPA of ${currentCGPA.toFixed(2)} already meets or exceeds your target of ${targetCGPA.toFixed(2)}. No additional effort needed — just maintain your grades!`,
            },
            aggressive: {
              requiredGPA: 0,
              isAchievable: true,
              message: `You've already reached your target. Consider setting a higher goal to push yourself further.`,
            },
            remainingCredits,
            totalCredits,
          },
          maxAchievableCGPA:
            totalCredits > 0
              ? parseFloat(
                  (
                    (currentCGPA * completedCredits + 10 * remainingCredits) /
                    totalCredits
                  ).toFixed(4)
                )
              : 0,
        },
      });
    }

    const plan = generatePlan(
      currentCGPA,
      targetCGPA,
      completedCredits,
      totalCredits,
      remainingCredits
    );

    const maxAchievableCGPA =
      totalCredits > 0
        ? parseFloat(
            (
              (currentCGPA * completedCredits + 10 * remainingCredits) /
              totalCredits
            ).toFixed(4)
          )
        : 0;

    return NextResponse.json({
      success: true,
      data: {
        plan,
        maxAchievableCGPA,
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
