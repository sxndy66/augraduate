import { LoginForm } from "@/components/auth/LoginForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login — AuGraduate",
};

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#6C63FF 1px, transparent 1px), linear-gradient(90deg, #6C63FF 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Glow orbs */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-[#6C63FF] opacity-10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-[#00D4AA] opacity-8 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl border border-[#2A2A3D] bg-[#12121A] mb-4 glow-primary">
            <span className="text-2xl font-bold text-[#6C63FF] font-[family-name:var(--font-display)]">A</span>
          </div>
          <h1 className="text-3xl font-bold text-[#E8E8F0] font-[family-name:var(--font-display)] tracking-tight">
            AuGraduate
          </h1>
          <p className="text-[#6B6B80] text-sm mt-2">
            Anna University Performance &amp; Alert Hub
          </p>
        </div>

        <LoginForm />

        <p className="text-center text-[#6B6B80] text-xs mt-8">
          Built for Anna University students · Reg 2019 &amp; 2021
        </p>
      </div>
    </main>
  );
}
