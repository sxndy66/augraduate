"use client"

export const dynamic = 'force-dynamic';;

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, ArrowLeft, CheckCircle2, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/lib/validators/auth";
import { AuthCard } from "@/components/auth/AuthCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function ForgotPasswordPage() {
  const supabase = createClient();

  const [authError, setAuthError] = useState<string | null>(null);
  const [isSent, setIsSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setAuthError(null);

    const { error } = await supabase.auth.resetPasswordForEmail(
      data.email,
      {
        redirectTo: `${window.location.origin}/auth/callback?redirect=/login`,
      }
    );

    if (error) {
      setAuthError(error.message);
      return;
    }

    setSentEmail(data.email);
    setIsSent(true);
  };

  if (isSent) {
    return (
      <AuthCard
        title="Check your email"
        subtitle="We've sent you a password reset link"
        footer={
          <>
            Remember your password?{" "}
            <Link
              href="/login"
              className="font-semibold text-electric-blue transition-colors hover:text-electric-blue/80"
            >
              Sign in
            </Link>
          </>
        }
      >
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success-green/15">
            <CheckCircle2 className="h-8 w-8 text-success-green" />
          </div>
          <p className="text-sm text-gray-400">
            We&apos;ve sent a password reset link to{" "}
            <span className="font-semibold text-white">{sentEmail}</span>.
            Click the link in the email to reset your password.
          </p>
          <p className="mt-3 text-xs text-gray-500">
            Didn&apos;t receive the email? Check your spam folder or try again
            in a few minutes.
          </p>
          <Button
            variant="outline"
            size="md"
            className="mt-6"
            onClick={() => {
              setIsSent(false);
              setSentEmail("");
            }}
          >
            Try a different email
          </Button>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Forgot password?"
      subtitle="Enter your email and we'll send you a reset link"
      footer={
        <>
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 font-semibold text-electric-blue transition-colors hover:text-electric-blue/80"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to sign in
          </Link>
        </>
      }
    >
      {authError && (
        <div className="mb-4 rounded-xl border border-error-red/40 bg-error-red/10 px-4 py-3 text-sm text-error-red">
          {authError}
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
        noValidate
      >
        <Input
          label="Email address"
          type="email"
          placeholder="you@example.com"
          leftIcon={<Mail className="h-4 w-4" />}
          error={errors.email?.message}
          hint="We'll send a password reset link to this email"
          {...register("email")}
        />

        <Button
          type="submit"
          fullWidth
          size="lg"
          isLoading={isSubmitting}
          rightIcon={<ArrowRight className="h-4 w-4" />}
        >
          Send reset link
        </Button>
      </form>
    </AuthCard>
  );
}