"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
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

      <form onSubmit={handleSubmit} className="space-y-4">
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
