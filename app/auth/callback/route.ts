import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const redirectParam = requestUrl.searchParams.get("redirect");

  const origin = requestUrl.origin;

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      // Redirect to login with error message
      return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent("Authentication failed. Please try again.")}`
      );
    }

    // Successfully exchanged code for session — check onboarding status
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_completed")
        .eq("id", user.id)
        .single();

      const onboardingCompleted = profile?.onboarding_completed ?? false;

      // If a specific redirect is requested and onboarding is done, honor it
      if (redirectParam && onboardingCompleted) {
        return NextResponse.redirect(`${origin}${redirectParam}`);
      }

      // Otherwise route based on onboarding status
      if (!onboardingCompleted) {
        return NextResponse.redirect(`${origin}/onboarding`);
      }

      return NextResponse.redirect(`${origin}/dashboard`);
    }
  }

  // No code present — redirect to login
  return NextResponse.redirect(`${origin}/login`);
}