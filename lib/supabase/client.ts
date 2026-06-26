import { createBrowserClient } from "@supabase/ssr";
import type { GetAllCookies, SetAllCookies } from "@supabase/ssr";

export function createClient() {
  const getAll: GetAllCookies = async () => {
    if (typeof document === "undefined") return [];
    return document.cookie.split("; ").map((c) => {
      const sep = c.indexOf("=");
      if (sep === -1) return { name: c.trim(), value: "" };
      return { name: c.slice(0, sep).trim(), value: c.slice(sep + 1) };
    }).filter((c) => c.name);
  };

  const setAll: SetAllCookies = async (cookiesToSet) => {
    cookiesToSet.forEach(({ name, value, options }) => {
      document.cookie = `${name}=${value}; path=/; max-age=${options?.maxAge ?? 31536000}; SameSite=Lax`;
    });
  };

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll, setAll } },
  );
}
