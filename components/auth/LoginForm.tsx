"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const [mode, setMode] = useState<"email" | "google">("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const supabase = createClient();
      const authFn = isSignUp ? supabase.auth.signUp : supabase.auth.signInWithPassword;
      const { error } = await authFn({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });

      if (error) throw error;

      if (isSignUp) {
        setMessage("Check your email to confirm your account.");
      } else {
        window.location.href = "/dashboard";
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      setError(message);
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: { access_type: "offline", prompt: "consent" },
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
          {isSignUp ? "Create an account" : "Sign in to continue"}
        </h2>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-[#FF4757]/10 border border-[#FF4757]/30 text-[#FF4757] text-sm">
          {error}
        </div>
      )}

      {message && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-[#00D4AA]/10 border border-[#00D4AA]/30 text-[#00D4AA] text-sm">
          {message}
        </div>
      )}

      {mode === "email" ? (
        <form onSubmit={handleEmailAuth} className="space-y-4">
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border border-[#2A2A3D] bg-[#1A1A26] text-[#E8E8F0] placeholder-[#6B6B80] outline-none focus:border-[#6C63FF] transition-colors"
          />
          <input
            type="password"
            placeholder="Password (min. 6 chars)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-4 py-3 rounded-xl border border-[#2A2A3D] bg-[#1A1A26] text-[#E8E8F0] placeholder-[#6B6B80] outline-none focus:border-[#6C63FF] transition-colors"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#6C63FF] hover:bg-[#5A52D5] text-white font-medium transition-all duration-200 disabled:opacity-50"
          >
            {loading ? "Please wait..." : isSignUp ? "Create Account" : "Sign In"}
          </button>
        </form>
      ) : (
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-[#2A2A3D] bg-[#1A1A26] hover:bg-[#22223A] hover:border-[#6C63FF] text-[#E8E8F0] font-medium transition-all duration-200 disabled:opacity-50"
        >
          {loading ? (
            <svg className="animate-spin w-5 h-5 text-[#6C63FF]" fill="none" viewBox="0 0 24 24">
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
      )}

      <div className="flex items-center justify-center gap-2 text-xs text-[#6B6B80]">
        <button
          type="button"
          onClick={() => setMode(mode === "email" ? "google" : "email")}
          className="hover:text-[#6C63FF] transition-colors underline underline-offset-2"
        >
          {mode === "email" ? "Sign in with Google instead" : "Sign in with email instead"}
        </button>
      </div>

      <div className="pt-2 border-t border-[#2A2A3D]">
        <p className="text-center text-[#6B6B80] text-xs">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            type="button"
            onClick={() => { setIsSignUp(!isSignUp); setError(null); setMessage(null); }}
            className="text-[#6C63FF] hover:underline underline-offset-2"
          >
            {isSignUp ? "Sign in" : "Sign up"}
          </button>
        </p>
      </div>
    </div>
  );
}
