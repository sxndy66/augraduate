"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGoogleLogin() {
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) throw error;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Login failed. Please try again.";
      setError(message);
      setLoading(false);
    }
  }

  return (
    <div className="card space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-[#E8E8F0] font-[family-name:var(--font-display)]">
          Sign in to continue
        </h2>
        <p className="text-[#6B6B80] text-sm mt-1">
          Use your college or personal Google account
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-[#FF4757]/10 border border-[#FF4757]/30 text-[#FF4757] text-sm">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm-.75 3.75a.75.75 0 0 1 1.5 0v3.5a.75.75 0 0 1-1.5 0v-3.5zm.75 7a.875.875 0 1 1 0-1.75.875.875 0 0 1 0 1.75z" />
          </svg>
          {error}
        </div>
      )}

      <button
        onClick={handleGoogleLogin}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-[#2A2A3D] bg-[#1A1A26] hover:bg-[#22223A] hover:border-[#6C63FF] text-[#E8E8F0] font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
      >
        {loading ? (
          <svg
            className="animate-spin w-5 h-5 text-[#6C63FF]"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        )}
        {loading ? "Connecting..." : "Continue with Google"}
      </button>

      <div className="pt-2 border-t border-[#2A2A3D]">
        <ul className="space-y-2">
          {[
            "No password required",
            "Your data is private and encrypted",
            "Works on mobile & desktop",
          ].map((item) => (
            <li key={item} className="flex items-center gap-2 text-[#6B6B80] text-xs">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="#00D4AA">
                <path d="M10.28 2.28L4.5 8.06 1.72 5.28a1 1 0 0 0-1.44 1.44l3.5 3.5a1 1 0 0 0 1.44 0l6.5-6.5a1 1 0 0 0-1.44-1.44z"/>
              </svg>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
