"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useLogin, useRegister } from "@/lib/api/auth";
import { 
  getCookie, 
  setCookie, 
  removeCookie, 
  COOKIE_KEYS 
} from "@/lib/cookie-client";
import type { User } from "@/types";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (data: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loginMutation = useLogin();
  const registerMutation = useRegister();

  useEffect(() => {
    const initAuth = () => {
      try {
        const savedUser = getCookie(COOKIE_KEYS.USER);
        const savedToken = getCookie(COOKIE_KEYS.TOKEN);

        if (savedUser && savedToken) {
          setUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.error("Failed to parse user cookie", error);
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (data: any) => {
    try {
      const result = await loginMutation.mutateAsync(data);
      setUser(result.user);
      setCookie(COOKIE_KEYS.TOKEN, result.token);
      setCookie(COOKIE_KEYS.USER, JSON.stringify(result.user));
      toast.success("Login successful!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Login failed");
      throw error;
    }
  };

  const register = async (data: any) => {
    try {
      const result = await registerMutation.mutateAsync(data);
      setUser(result.user);
      setCookie(COOKIE_KEYS.TOKEN, result.token);
      setCookie(COOKIE_KEYS.USER, JSON.stringify(result.user));
      toast.success("Account created successfully!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Registration failed");
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    removeCookie(COOKIE_KEYS.TOKEN);
    removeCookie(COOKIE_KEYS.USER);
    // Optional: window.location.href = "/login";
  };

  const updateUser = (newUser: User) => {
    setUser(newUser);
    setCookie(COOKIE_KEYS.USER, JSON.stringify(newUser));
  };

  const refreshUser = () => {
     // Re-fetch from cookies if needed
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        isAdmin: user?.role === "ADMIN",
        login,
        register,
        logout,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
