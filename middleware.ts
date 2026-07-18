import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const PUBLIC_ROUTES = [
  "/",
  "/features",
  "/demo",
  "/privacy",
  "/terms",
  "/contact",
  "/login",
  "/signup",
  "/forgot-password",
  "/auth/callback",
];

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => {
    if (route === "/") return pathname === "/";
    return pathname === route || pathname.startsWith(route + "/");
  });
}

function isAuthRoute(pathname: string): boolean {
  return (
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/forgot-password"
  );
}

/**
 * Security headers applied to all responses.
 */
function addSecurityHeaders(response: NextResponse): NextResponse {
  // Prevent clickjacking
  response.headers.set("X-Frame-Options", "DENY");

  // Prevent MIME-type sniffing
  response.headers.set("X-Content-Type-Options", "nosniff");

  // Control referrer information
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Disable unnecessary browser features
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );

  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob: https:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");
  response.headers.set("Content-Security-Policy", csp);

  // Force HTTPS in production
  response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");

  return response;
}

export async function middleware(request: NextRequest) {
  const { supabase, response } = await updateSession(request);

  const pathname = request.nextUrl.pathname;

  // Skip static assets and API routes (but still add security headers to API)
  if (
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    return addSecurityHeaders(response);
  }

  // Add security headers to API routes too
  if (pathname.startsWith("/api")) {
    return addSecurityHeaders(response);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthenticated = !!user;

  // Check onboarding status via cookie
  const onboardingComplete = request.cookies.get("onboarding-complete")?.value === "true";

  // Redirect authenticated users away from auth pages
  if (isAuthRoute(pathname) && isAuthenticated) {
    if (!onboardingComplete) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/onboarding";
      return addSecurityHeaders(NextResponse.redirect(redirectUrl));
    }
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/dashboard";
    return addSecurityHeaders(NextResponse.redirect(redirectUrl));
  }

  // Allow public routes for unauthenticated users
  if (isPublicRoute(pathname)) {
    return addSecurityHeaders(response);
  }

  // Protect all other routes — redirect to login if not authenticated
  if (!isAuthenticated) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("redirect", pathname);
    return addSecurityHeaders(NextResponse.redirect(redirectUrl));
  }

  // Authenticated but onboarding not complete — redirect to /onboarding
  if (isAuthenticated && !onboardingComplete && pathname !== "/onboarding") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/onboarding";
    return addSecurityHeaders(NextResponse.redirect(redirectUrl));
  }

  // Authenticated and onboarding complete but on /onboarding — redirect to dashboard
  if (isAuthenticated && onboardingComplete && pathname === "/onboarding") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/dashboard";
    return addSecurityHeaders(NextResponse.redirect(redirectUrl));
  }

  return addSecurityHeaders(response);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
