"use client"

export const dynamic = 'force-dynamic';;

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, Eye, EyeOff, User, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { signupSchema, type SignupInput } from "@/lib/validators/auth";
import { AuthCard } from "@/components/auth/AuthCard";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      registerNumber: "",
      terms: false,
    },
  });

  const onSubmit = async (data: SignupInput) => {
    setAuthError(null);

    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.name,
          register_number: data.registerNumber,
        },
      },
    });

    if (error) {
      setAuthError(error.message);
      return;
    }

    if (authData.user) {
      // If email confirmation is required, user won't have a session
      if (!authData.session) {
        setAuthError(null);
        router.push(
          `/login?message=Check your email to confirm your account before signing in.`
        );
        return;
      }
      router.push("/onboarding");
      router.refresh();
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    setGoogleLoading(true);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirect=/onboarding`,
      },
    });

    if (error) {
      setAuthError(error.message);
      setGoogleLoading(false);
    }
  };

  return (
    <AuthCard
      title="Create your account"
      subtitle="Join AU Track to monitor your CGPA and academic journey"
      footer={
        <>
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-electric-blue transition-colors hover:text-electric-blue/80"
          >
            Sign in
          </Link>
        </>
      }
    >
      {/* Auth error banner */}
      {authError && (
        <div className="mb-4 rounded-xl border border-error-red/40 bg-error-red/10 px-4 py-3 text-sm text-error-red">
          {authError}
        </div>
      )}

      {/* Google OAuth */}
      <GoogleButton
        onClick={handleGoogleSignIn}
        isLoading={googleLoading}
        label="Sign up with Google"
      />

      {/* Divider */}
      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-xs font-medium text-gray-500">OR</span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      {/* Signup form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input
          label="Full name"
          type="text"
          placeholder="John Doe"
          leftIcon={<User className="h-4 w-4" />}
          error={errors.name?.message}
          {...register("name")}
        />

        <Input
          label="Email address"
          type="email"
          placeholder="you@example.com"
          leftIcon={<Mail className="h-4 w-4" />}
          error={errors.email?.message}
          {...register("email")}
        />

        <Input
          label="Register number"
          type="text"
          placeholder="e.g. 717821L050"
          hint="Your Anna University register number"
          error={errors.registerNumber?.message}
          {...register("registerNumber")}
        />

        <Input
          label="Password"
          type={showPassword ? "text" : "password"}
          placeholder="Create a strong password"
          leftIcon={<Lock className="h-4 w-4" />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 transition-colors hover:text-white"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          }
          error={errors.password?.message}
          hint="Min 8 chars, 1 uppercase, 1 lowercase, 1 number"
          {...register("password")}
        />

        <Input
          label="Confirm password"
          type={showConfirmPassword ? "text" : "password"}
          placeholder="Re-enter your password"
          leftIcon={<Lock className="h-4 w-4" />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="text-gray-400 transition-colors hover:text-white"
              aria-label={
                showConfirmPassword ? "Hide password" : "Show password"
              }
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          }
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        {/* Terms checkbox */}
        <label className="flex cursor-pointer items-start gap-2.5 text-sm text-gray-400">
          <input
            type="checkbox"
            {...register("terms")}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-navy-600 bg-navy-800 text-electric-blue focus:ring-electric-blue/40 focus:ring-offset-0"
          />
          <span>
            I agree to the{" "}
            <Link
              href="/terms"
              className="text-electric-blue transition-colors hover:text-electric-blue/80"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="text-electric-blue transition-colors hover:text-electric-blue/80"
            >
              Privacy Policy
            </Link>
          </span>
        </label>
        {errors.terms?.message && (
          <p className="-mt-2 text-sm text-error-red">
            {errors.terms.message}
          </p>
        )}

        <Button
          type="submit"
          fullWidth
          size="lg"
          isLoading={isSubmitting}
          rightIcon={<ArrowRight className="h-4 w-4" />}
        >
          Create account
        </Button>
      </form>
    </AuthCard>
  );
}