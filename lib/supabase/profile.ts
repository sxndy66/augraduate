import { createClient } from "./client";

export async function ensureProfile(): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (existing) return;

  await supabase.from("profiles").insert({
    id: user.id,
    full_name: user.email?.split("@")[0] ?? null,
  });
}
