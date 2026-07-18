import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = 'force-dynamic';

/**
 * GET /api/notifications
 *
 * Fetches verified notifications with optional filtering by category, degree, and branch.
 * Only notifications where is_verified = true are returned.
 *
 * Query params:
 *   category — notification category key (e.g. "results", "exam_timetable")
 *   degree   — degree id (e.g. "be", "btech")
 *   branch   — branch id (e.g. "cse", "it")
 *   limit    — max results (default 50, max 100)
 *   offset   — pagination offset (default 0)
 *
 * Response (200):
 *   { notifications: NotificationRow[], total: number }
 *
 * Response (401):
 *   { error: "Authentication required" }
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const degree = searchParams.get("degree");
    const branch = searchParams.get("branch");
    const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 100);
    const offset = Math.max(parseInt(searchParams.get("offset") || "0", 10), 0);

    // Build query — only verified notifications
    let query = supabase
      .from("notifications")
      .select(
        `
        id,
        title,
        body,
        summary,
        category,
        source_url,
        source_name,
        published_date,
        fetched_date,
        is_verified,
        degree_scope,
        branch_scope,
        created_at
      `,
        { count: "exact" }
      )
      .eq("is_verified", true)
      .order("published_date", { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply category filter
    if (category && category !== "all") {
      query = query.eq("category", category);
    }

    // Apply degree filter — notifications with null degree_scope apply to all degrees
    if (degree && degree !== "all") {
      query = query.or(`degree_scope.is.null,degree_scope.cs.{${degree}}`);
    }

    // Apply branch filter
    if (branch && branch !== "all") {
      query = query.or(`branch_scope.is.null,branch_scope.cs.{${branch}}`);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error("Notifications query error:", error);
      return NextResponse.json(
        { error: "Failed to fetch notifications" },
        { status: 500 }
      );
    }

    // Fetch user's read notification IDs for marking is_read
    const { data: readData } = await supabase
      .from("notification_reads")
      .select("notification_id")
      .eq("user_id", session.user.id);

    const readIds = new Set((readData || []).map((r) => r.notification_id));

    // Fetch user's saved notification IDs
    const { data: savedData } = await supabase
      .from("saved_notifications")
      .select("notification_id")
      .eq("user_id", session.user.id);

    const savedIds = new Set((savedData || []).map((r) => r.notification_id));

    // Transform results
    const notifications = (data || []).map((n) => ({
      id: n.id,
      title: n.title,
      body: n.body || n.summary || "",
      category: n.category,
      source_url: n.source_url,
      source_name: n.source_name,
      published_date: n.published_date,
      fetched_date: n.fetched_date,
      is_read: readIds.has(n.id),
      is_saved: savedIds.has(n.id),
    }));

    return NextResponse.json({
      notifications,
      total: count ?? notifications.length,
    });
  } catch (error) {
    console.error("Notifications API error:", error);
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