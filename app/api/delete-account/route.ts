import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createBrowserClient } from "@/lib/supabase/client";
import { rateLimitCheck } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function DELETE(request: NextRequest) {
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

    // Rate limit: 3 attempts per 10 minutes (prevent brute force)
    const rateLimitKey = `delete-account:${user.id}`;
    const rateLimit = rateLimitCheck(rateLimitKey, 3, 10 * 60 * 1000);

    if (!rateLimit.allowed) {
      const retryAfter = Math.ceil((rateLimit.resetAt - Date.now()) / 1000);
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          message: "Too many deletion attempts. Please try again later.",
          retryAfter,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(retryAfter),
          },
        }
      );
    }

    // Parse request body for password confirmation
    let body: { password?: string } = {};
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { error: "Password confirmation required" },
        { status: 400 }
      );
    }

    // Verify password by attempting to sign in
    const verifyClient = createBrowserClient();

    const { error: signInError } = await verifyClient.auth.signInWithPassword({
      email: user.email!,
      password,
    });

    if (signInError) {
      return NextResponse.json(
        { error: "Password verification failed", message: "Incorrect password" },
        { status: 403 }
      );
    }

    const userId = user.id;

    // ── Cascade delete all user data ──

    const userTables = [
      "user_grades",
      "arrears",
      "notes",
      "target_plans",
      "screenshot_uploads",
      "notification_preferences",
    ];

    const deleteResults = await Promise.all(
      userTables.map((table) =>
        supabase.from(table).delete().eq("user_id", userId)
      )
    );

    const deleteErrors = deleteResults.filter((r) => r.error);
    if (deleteErrors.length > 0) {
      console.error(
        "[delete-account] Failed to delete from some tables:",
        deleteErrors.map((e) => e.error?.message)
      );
      // Continue anyway — we still want to delete the auth user
    }

    // Delete profile
    const { error: profileDeleteError } = await supabase
      .from("profiles")
      .delete()
      .eq("id", userId);

    if (profileDeleteError) {
      console.error("[delete-account] Profile delete error:", profileDeleteError);
    }

    // Delete from auth.users via service role key
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (serviceRoleKey && supabaseUrl) {
      // Use the service role client to delete the auth user
      const { createClient: createSupabaseClient } = await import("@supabase/supabase-js");
      const adminClient = createSupabaseClient(
        supabaseUrl,
        serviceRoleKey,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        }
      );

      const { error: authDeleteError } = await adminClient.auth.admin.deleteUser(userId);

      if (authDeleteError) {
        console.error("[delete-account] Auth user delete error:", authDeleteError);
        return NextResponse.json(
          {
            error: "Failed to delete account",
            message: "Your data was removed, but the account could not be fully deleted. Please contact support.",
          },
          { status: 500 }
        );
      }
    } else {
      // No service role key — sign out and instruct user
      await supabase.auth.signOut();
      return NextResponse.json(
        {
          success: true,
          message: "Your data has been deleted. Please contact support to fully remove your auth account.",
          signedOut: true,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Account and all associated data have been permanently deleted.",
        deletedTables: userTables,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[delete-account] Unexpected error:", error);
    return NextResponse.json(
      {
        error: "Account deletion failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
