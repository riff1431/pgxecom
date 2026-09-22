"use client";

import { useAuth } from "@/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, type ComponentType } from "react";

/**
 * HOC for private routes (requires login)
 */
export function withPrivateRoute<T extends object>(Component: ComponentType<T>) {
  return function PrivateComponent(props: T) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        router.push("/login?redirect=" + window.location.pathname);
      }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) return <div>Loading...</div>; // TODO: Replace with skeleton or full page loader

    return isAuthenticated ? <Component {...props} /> : null;
  };
}

/**
 * HOC for public routes that should NOT be accessible when logged in (e.g., /login, /register)
 */
export function withPublicRoute<T extends object>(Component: ComponentType<T>) {
  return function PublicComponent(props: T) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading && isAuthenticated) {
        router.push("/");
      }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) return null;

    return !isAuthenticated ? <Component {...props} /> : null;
  };
}

/**
 * HOC for admin routes
 */
export function withAdminRoute<T extends object>(Component: ComponentType<T>) {
  return function AdminComponent(props: T) {
    const { user, isAdmin, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading) {
        if (!user) {
          router.push("/login?redirect=" + window.location.pathname);
        } else if (!isAdmin) {
          router.push("/");
        }
      }
    }, [user, isAdmin, isLoading, router]);

    if (isLoading) return <div>Loading...</div>;

    return isAdmin ? <Component {...props} /> : null;
  };
}
