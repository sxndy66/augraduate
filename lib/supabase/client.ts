import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const AUTH_COOKIE = "sb-auth";

export function createClient() {
  const client = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: true,
        persistSession: true,
      },
    },
  );

  // Sync auth state to a cookie so the middleware can detect the session
  client.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
      if (session) {
        document.cookie = `${AUTH_COOKIE}=${session.access_token}; path=/; max-age=31536000; SameSite=Lax; Secure`;
      }
    } else if (event === "SIGNED_OUT") {
      document.cookie = `${AUTH_COOKIE}=; path=/; max-age=0`;
    }
  });

  return client;
}
