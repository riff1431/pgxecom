"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { withPublicRoute } from "@/helpers/with-route-guard";
import { useAuth } from "@/providers/AuthProvider";
import { LoginInput, loginSchema } from "@/schemas/auth.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";

function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const redirectUrl = searchParams.get("redirect") || "/";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      await login(data);
      router.push(redirectUrl);
    } catch (error) {
      // login handles the error toast
    }
  };

  return (
    <>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-black uppercase tracking-tight text-white font-mono">
          Sign In
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Access your PGX fitness profile & orders
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Email address
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="athlete@domain.com"
            {...register("email")}
            className={`h-11 rounded-lg bg-slate-900 border-slate-700 text-white placeholder-slate-500 focus:border-[#00a3ff] ${
              errors.email ? "border-red-500" : ""
            }`}
          />
          {errors.email && (
            <p className="text-xs text-red-400 font-medium">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="password"
              className="text-xs font-bold uppercase tracking-wider text-slate-300"
            >
              Password
            </Label>
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-[#00a3ff] hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            {...register("password")}
            className={`h-11 rounded-lg bg-slate-900 border-slate-700 text-white placeholder-slate-500 focus:border-[#00a3ff] ${
              errors.password ? "border-red-500" : ""
            }`}
          />
          {errors.password && (
            <p className="text-xs text-red-400 font-medium">{errors.password.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full h-11 bg-[#00a3ff] hover:bg-[#0091e6] text-slate-950 font-black text-xs uppercase tracking-wider rounded-lg transition-all shadow-lg shadow-[#00a3ff]/20 mt-2"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Signing in..." : "Sign in to PGX"}
        </Button>
      </form>

      <div className="mt-6 text-center text-xs text-slate-400 border-t border-slate-800 pt-5">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-bold text-[#00a3ff] hover:underline uppercase tracking-wider ml-1"
        >
          Sign up
        </Link>
      </div>
    </>
  );
}

export default withPublicRoute(LoginPage);
