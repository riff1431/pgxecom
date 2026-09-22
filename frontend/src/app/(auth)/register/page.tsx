"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { withPublicRoute } from "@/helpers/with-route-guard";
import { useAuth } from "@/providers/AuthProvider";
import { RegisterInput, registerSchema } from "@/schemas/auth.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

function RegisterPage() {
  const router = useRouter();
  const { register: signup } = useAuth();
  const {
    register: formRegister,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    try {
      await signup(data);
      router.push("/my-account");
    } catch (error) {
      // AuthProvider handles error toast
    }
  };

  return (
    <>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-black uppercase tracking-tight text-white font-mono">
          Create Account
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Join the PGX international fitness community
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Full Name
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="John Doe"
            {...formRegister("name")}
            className={`h-11 rounded-lg bg-slate-900 border-slate-700 text-white placeholder-slate-500 focus:border-[#00a3ff] ${
              errors.name ? "border-red-500" : ""
            }`}
          />
          {errors.name && (
            <p className="text-xs text-red-400 font-medium">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Email address
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="athlete@domain.com"
            {...formRegister("email")}
            className={`h-11 rounded-lg bg-slate-900 border-slate-700 text-white placeholder-slate-500 focus:border-[#00a3ff] ${
              errors.email ? "border-red-500" : ""
            }`}
          />
          {errors.email && (
            <p className="text-xs text-red-400 font-medium">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Phone Number (Optional)
          </Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+1 (555) 000-0000"
            {...formRegister("phone")}
            className={`h-11 rounded-lg bg-slate-900 border-slate-700 text-white placeholder-slate-500 focus:border-[#00a3ff] ${
              errors.phone ? "border-red-500" : ""
            }`}
          />
          {errors.phone && (
            <p className="text-xs text-red-400 font-medium">{errors.phone.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Password
          </Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            {...formRegister("password")}
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
          {isSubmitting ? "Creating account..." : "Join PGX"}
        </Button>
      </form>

      <div className="mt-6 text-center text-xs text-slate-400 border-t border-slate-800 pt-5">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-bold text-[#00a3ff] hover:underline uppercase tracking-wider ml-1"
        >
          Sign in
        </Link>
      </div>
    </>
  );
}

export default withPublicRoute(RegisterPage);
