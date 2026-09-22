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
      <h2 className="mt-2 text-center text-2xl font-bold text-gray-900 mb-8">
        Create a new account
      </h2>

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" type="text" {...formRegister("name")} className={errors.name ? "border-red-500" : ""} />
          {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <Input id="email" type="email" autoComplete="email" {...formRegister("email")} className={errors.email ? "border-red-500" : ""} />
          {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number (Optional)</Label>
          <Input id="phone" type="tel" {...formRegister("phone")} className={errors.phone ? "border-red-500" : ""} />
          {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" autoComplete="new-password" {...formRegister("password")} className={errors.password ? "border-red-500" : ""} />
          {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
        </div>

 

        <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 h-10 mt-6" disabled={isSubmitting}>
          {isSubmitting ? "Creating account..." : "Sign up"}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-emerald-600 hover:text-emerald-500">
          Sign in
        </Link>
      </div>
    </>
  );
}

export default withPublicRoute(RegisterPage);
