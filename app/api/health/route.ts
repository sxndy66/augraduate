import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const APP_VERSION = "1.1.0";

export async function GET() {
  const timestamp = new Date().toISOString();

  try {
    // Check Supabase connection
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .select("id")
      .limit(1);

    if (error) {
      return NextResponse.json(
        {
          status: "unhealthy",
          timestamp,
          version: APP_VERSION,
          error: "Database connection failed",
          details: error.message,
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        status: "healthy",
        timestamp,
        version: APP_VERSION,
        services: {
          database: "operational",
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp,
        version: APP_VERSION,
        error: "Health check failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 503 }
    );
  }
}
