import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimitCheck } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Rate limit: 1 request per minute per user
    const rateLimitKey = `export-data:${user.id}`;
    const rateLimit = rateLimitCheck(rateLimitKey, 1, 60 * 1000);

    if (!rateLimit.allowed) {
      const retryAfter = Math.ceil((rateLimit.resetAt - Date.now()) / 1000);
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          message: "You can export your data once per minute. Please try again later.",
          retryAfter,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(retryAfter),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(rateLimit.resetAt),
          },
        }
      );
    }

    const userId = user.id;

    // Fetch all user data in parallel
    const [
      profileRes,
      gradesRes,
      arrearsRes,
      notesRes,
      plansRes,
      notifPrefsRes,
      screenshotRes,
    ] = await Promise.all([
      supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single(),
      supabase
        .from("user_grades")
        .select("*")
        .eq("user_id", userId),
      supabase
        .from("arrears")
        .select("*")
        .eq("user_id", userId),
      supabase
        .from("notes")
        .select("*")
        .eq("user_id", userId),
      supabase
        .from("target_plans")
        .select("*")
        .eq("user_id", userId),
      supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", userId)
        .single(),
      supabase
        .from("screenshot_uploads")
        .select("*")
        .eq("user_id", userId),
    ]);

    const exportData = {
      meta: {
        exported_at: new Date().toISOString(),
        app_version: "1.1.0",
        user_id: userId,
        user_email: user.email,
      },
      profile: profileRes.data ?? null,
      grades: gradesRes.data ?? [],
      arrears: arrearsRes.data ?? [],
      notes: notesRes.data ?? [],
      target_plans: plansRes.data ?? [],
      notification_preferences: notifPrefsRes.data ?? null,
      screenshot_uploads: (screenshotRes.data ?? []).map((s: Record<string, unknown>) => ({
        ...s,
        // Exclude actual file data/blobs from export
        file_data: undefined,
      })),
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    const filename = `au-track-export-${new Date().toISOString().split("T")[0]}.json`;

    return new NextResponse(jsonString, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "X-RateLimit-Remaining": String(rateLimit.remaining),
      },
    });
  } catch (error) {
    console.error("[export-data] Error:", error);
    return NextResponse.json(
      {
        error: "Export failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
