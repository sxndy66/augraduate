"use client";

import Image from "next/image";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";

type Profile = {
  full_name: string | null;
  avatar_url: string | null;
  regulation: string | null;
  current_semester: number | null;
} | null;

export function Navbar({ user, profile }: { user: User; profile: Profile }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const router = useRouter();

  async function handleSignOut() {
    setSigningOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    } catch {
      setSigningOut(false);
    }
  }

  const displayName = profile?.full_name ?? user.email?.split("@")[0] ?? "Student";
  const avatarUrl = profile?.avatar_url;
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-40 bg-[#0A0A0F]/80 backdrop-blur-md border-b border-[#2A2A3D]">
      <div className="flex items-center justify-between px-4 md:px-6 lg:px-8 h-14 max-w-7xl mx-auto">
        {/* Mobile logo */}
        <div className="md:hidden flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#6C63FF]/20 border border-[#6C63FF]/30 flex items-center justify-center">
            <span className="text-xs font-bold text-[#6C63FF]">A</span>
          </div>
          <span className="font-semibold text-sm text-[#E8E8F0] font-[family-name:var(--font-display)]">
            AuGraduate
          </span>
        </div>

        {/* Semester badge */}
        {profile?.current_semester && (
          <div className="hidden md:flex items-center gap-2">
            <span className="text-xs font-mono text-[#6B6B80] bg-[#1A1A26] border border-[#2A2A3D] px-2.5 py-1 rounded-md">
              SEM {profile.current_semester} · REG {profile.regulation}
            </span>
          </div>
        )}

        {/* Right side */}
        <div className="flex items-center gap-3 ml-auto">
          {/* Notification dot placeholder */}
          <button className="relative w-8 h-8 rounded-lg bg-[#1A1A26] border border-[#2A2A3D] flex items-center justify-center text-[#6B6B80] hover:text-[#E8E8F0] hover:border-[#6C63FF]/40 transition-colors">
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
          </button>

          {/* Avatar dropdown */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-[#1A1A26] transition-colors"
            >
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={displayName}
                  width={28}
                  height={28}
                  unoptimized
                  className="w-7 h-7 rounded-full border border-[#2A2A3D]"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-[#6C63FF]/20 border border-[#6C63FF]/30 flex items-center justify-center">
                  <span className="text-xs font-semibold text-[#6C63FF]">{initials}</span>
                </div>
              )}
              <span className="hidden sm:block text-sm text-[#E8E8F0] font-medium">
                {displayName.split(" ")[0]}
              </span>
              <svg
                width="12"
                height="12"
                fill="none"
                stroke="#6B6B80"
                strokeWidth="2"
                viewBox="0 0 24 24"
                className={`transition-transform ${menuOpen ? "rotate-180" : ""}`}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 top-10 z-50 w-48 bg-[#12121A] border border-[#2A2A3D] rounded-xl shadow-2xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-[#2A2A3D]">
                    <p className="text-sm font-medium text-[#E8E8F0] truncate">{displayName}</p>
                    <p className="text-xs text-[#6B6B80] truncate">{user.email}</p>
                  </div>
                  <div className="p-1">
                    <button
                      onClick={handleSignOut}
                      disabled={signingOut}
                      className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[#FF4757] hover:bg-[#FF4757]/10 transition-colors disabled:opacity-50"
                    >
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      {signingOut ? "Signing out..." : "Sign out"}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
