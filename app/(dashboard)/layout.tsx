import { Sidebar } from "@/components/shared/Sidebar";
import { Navbar } from "@/components/shared/Navbar";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  let { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    await supabase.from("profiles").insert({
      id: user.id,
      full_name: user.email?.split("@")[0] ?? null,
    });
    profile = { id: user.id, full_name: user.email?.split("@")[0] ?? null } as typeof profile;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar user={user} profile={profile} />
        <main className="flex-1 px-4 md:px-6 lg:px-8 py-6 max-w-7xl mx-auto w-full pb-20 md:pb-6">
          {children}
        </main>
      </div>
    </div>
  );
}
