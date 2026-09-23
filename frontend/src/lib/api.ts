import axios from "axios";
import { env } from "@/env";
import { getCookie, removeCookie, COOKIE_KEYS } from "./cookie-client";

// Determine API base URL: prioritize env, but ensure reliable production fallback both in browser and SSR
export const getBaseApiUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL || env.NEXT_PUBLIC_API_URL;
  if (typeof window !== "undefined") {
    // If running in browser on playgroundfitnex.com or any non-localhost domain, don't allow localhost:4000
    if (!window.location.hostname.includes("localhost") && (!envUrl || envUrl.includes("localhost"))) {
      return "https://api.playgroundfitnex.com/api";
    }
  } else {
    // Server-side (SSR / RSC): If NODE_ENV is production or envUrl is missing/localhost, default to production API
    if (process.env.NODE_ENV === "production" && (!envUrl || envUrl.includes("localhost"))) {
      return "https://api.playgroundfitnex.com/api";
    }
  }
  return envUrl || "https://api.playgroundfitnex.com/api";
};

export const api = axios.create({
  baseURL: getBaseApiUrl(),
});

// Attach JWT token from cookies
api.interceptors.request.use((config) => {
  const token = getCookie(COOKIE_KEYS.TOKEN);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only log out the user if /auth/me or a critical user endpoint specifically reports an unauthorized session
    const requestUrl = error.config?.url || "";
    if (error.response?.status === 401 && requestUrl.includes("/auth/me")) {
      if (typeof window !== "undefined") {
        removeCookie(COOKIE_KEYS.TOKEN);
        removeCookie(COOKIE_KEYS.USER);
        removeCookie(COOKIE_KEYS.SUPABASE_TOKEN);
      }
    }
    return Promise.reject(error);
  }
);
