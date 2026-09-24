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
        className="space-y-6 text-center"
      >
        <div className="w-16 h-16 bg-slate-900 border border-slate-800 text-[#00a3ff] rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-lg">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black uppercase tracking-tight text-white font-mono">Check your email</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          We&apos;ve sent a password reset link to{" "}
          <span className="font-semibold text-white">{email}</span>. Please
          check your inbox and follow the instructions.
        </p>
        <div className="pt-2">
          <Link
            href="/login"
            className="text-xs font-bold uppercase tracking-wider text-[#00a3ff] hover:underline inline-flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Return to sign in
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h2 className="text-2xl font-black uppercase tracking-tight text-white font-mono">
          Forgot Password
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Enter your email and we&apos;ll send you reset instructions.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Email address
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input
              type="email"
              placeholder="athlete@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 pl-10 rounded-lg bg-slate-900 border-slate-700 text-white placeholder-slate-500 focus:border-[#00a3ff]"
              required
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={forgotPasswordMutation.isPending}
          className="w-full h-11 bg-[#00a3ff] hover:bg-[#0091e6] text-slate-950 font-black text-xs uppercase tracking-wider rounded-lg transition-all shadow-lg shadow-[#00a3ff]/20 mt-2"
        >
          {forgotPasswordMutation.isPending ? "Sending link..." : "Send Reset Link"}
        </Button>

        <div className="text-center pt-2">
          <Link
            href="/login"
            className="text-slate-400 font-bold hover:text-white inline-flex items-center gap-1.5 transition-colors text-xs uppercase tracking-wider"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to sign in
          </Link>
        </div>
      </form>
    </motion.div>
  );
}
