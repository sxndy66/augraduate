"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Spinner } from "@/components/ui/Spinner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireOnboarding?: boolean;
}

export function ProtectedRoute({
  children,
  requireOnboarding = true,
}: ProtectedRouteProps) {
  const router = useRouter();
  const supabase = createClient();
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading");

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!mounted) return;

        if (!session) {
          setStatus("unauthenticated");
          router.replace("/login");
          return;
        }

        if (requireOnboarding) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("onboarding_completed")
            .eq("id", session.user.id)
            .single();

          if (!mounted) return;

          if (!profile?.onboarding_completed) {
            router.replace("/onboarding");
            return;
          }
        }

        setStatus("authenticated");
      } catch {
        if (mounted) {
          setStatus("unauthenticated");
          router.replace("/login");
        }
      }
    };

    checkAuth();

    return () => {
      mounted = false;
    };
  }, [router, supabase, requireOnboarding]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="xl" label="Verifying your session..." />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="xl" label="Redirecting to login..." />
      </div>
    );
  }

  return <>{children}</>;
}
