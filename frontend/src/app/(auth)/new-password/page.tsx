"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useResetPassword } from "@/lib/api/auth";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { toast } from "sonner";

function NewPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const resetPasswordMutation = useResetPassword();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (!token) {
      toast.error("Invalid or missing token");
      return;
    }

    try {
      await resetPasswordMutation.mutateAsync({ token, newPassword });
      toast.success("Password reset successfully! Please login.");
      router.push("/login");
    } catch (error: unknown) {
      const message =
        typeof error === "object" &&
          error !== null &&
          "response" in error &&
          typeof (error as { response?: { data?: { message?: string } } })
            .response?.data?.message === "string"
          ? (error as { response?: { data?: { message?: string } } }).response
            ?.data?.message
          : "Invalid or expired token";

      toast.error(message);
    }
  };

  if (!token) {
    return (
      <div className="space-y-4 text-center">
        <h2 className="text-2xl font-black uppercase tracking-tight text-red-400 font-mono">Invalid Link</h2>
        <p className="text-xs text-slate-400">
          The password reset link is invalid or missing a token. Please request
          a new one.
        </p>
        <div className="pt-2">
          <Link
            href="/forgot-password"
            className="text-xs font-bold uppercase tracking-wider text-[#00a3ff] hover:underline"
          >
            Request new reset link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-6"
    >
      <div className="text-center">
        <div className="w-16 h-16 bg-slate-900 border border-slate-800 text-[#00a3ff] rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black uppercase tracking-tight text-white font-mono">
          Set New Password
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Secure your athlete account with a new password.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="h-11 pl-10 pr-10 rounded-lg bg-slate-900 border-slate-700 text-white placeholder-slate-500 focus:border-[#00a3ff]"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-11 pl-10 rounded-lg bg-slate-900 border-slate-700 text-white placeholder-slate-500 focus:border-[#00a3ff]"
                required
                minLength={6}
              />
            </div>
          </div>
        </div>

        <Button
          type="submit"
          disabled={resetPasswordMutation.isPending}
          className="w-full h-11 bg-[#00a3ff] hover:bg-[#0091e6] text-slate-950 font-black text-xs uppercase tracking-wider rounded-lg transition-all shadow-lg shadow-[#00a3ff]/20 mt-2"
        >
          {resetPasswordMutation.isPending ? "Resetting..." : "Update Password"}
        </Button>
      </form>
    </motion.div>
  );
}

export default function NewPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewPasswordContent />
    </Suspense>
  );
}
