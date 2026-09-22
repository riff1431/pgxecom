"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForgotPassword } from "@/lib/api/auth";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const forgotPasswordMutation = useForgotPassword();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await forgotPasswordMutation.mutateAsync({ email });
      setIsSubmitted(true);
      toast.success("Reset link sent if account exists");
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } } };
      toast.error(apiError.response?.data?.message || "Something went wrong");
    }
  };

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full space-y-8 bg-white p-10 "
      >
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900">Check your email</h2>
        <p className="text-gray-600">
          We've sent a password reset link to{" "}
          <span className="font-semibold text-gray-900">{email}</span>. Please
          check your inbox and follow the instructions.
        </p>
        <div className="pt-4">
          <Link
            href="/login"
            className="text-emerald-600 font-bold hover:text-emerald-700 inline-flex items-center gap-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to login
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md w-full space-y-8 bg-white p-10 "
    >
      <div className="text-center">
        <h2 className="text-4xl font-bold text-gray-900 tracking-tight">
          Forgot password?
        </h2>
        <p className="mt-4 text-gray-600">
          No worries, we&apos;ll send you reset instructions.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 ml-1">
            Email address
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-14 pl-12 rounded-2xl border-gray-200 focus:ring-emerald-500 bg-gray-50/50"
              required
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={forgotPasswordMutation.isPending}
          className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 rounded-2xl text-lg font-bold shadow-lg shadow-emerald-100 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          {forgotPasswordMutation.isPending ? "Sending..." : "Reset password"}
        </Button>

        <div className="text-center">
          <Link
            href="/login"
            className="text-gray-500 font-bold hover:text-gray-900 inline-flex items-center gap-2 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to login
          </Link>
        </div>
      </form>
    </motion.div>
  );
}
