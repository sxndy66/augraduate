import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate required fields
    if (!body.plan || !body.plan.planTitle) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid plan data",
          message: "A valid study plan object is required.",
        },
        { status: 400 }
      );
    }

    // Save to target_plans table (reuse existing table for study plans)
    // Store the full plan as JSON in the plan_data column
    const { data, error } = await supabase
      .from("target_plans")
      .insert({
        user_id: user.id,
        plan_type: "study_plan",
        plan_data: body.plan,
        current_cgpa: body.currentCGPA ?? null,
        target_cgpa: body.targetCGPA ?? null,
        created_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (error) {
      // If plan_type column doesn't exist, try without it
      const { data: data2, error: error2 } = await supabase
        .from("target_plans")
        .insert({
          user_id: user.id,
          plan_data: body.plan,
          current_cgpa: body.currentCGPA ?? null,
          target_cgpa: body.targetCGPA ?? null,
          created_at: new Date().toISOString(),
        })
        .select("id")
        .single();

      if (error2) {
        return NextResponse.json(
          {
            success: false,
            error: "Database error",
            message: error2.message,
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        data: { id: data2?.id },
        message: "Study plan saved successfully.",
      });
    }

    return NextResponse.json({
      success: true,
      data: { id: data?.id },
      message: "Study plan saved successfully.",
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
