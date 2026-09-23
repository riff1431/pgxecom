import axios from "axios";
import { env } from "@/env";
import { getCookie, removeCookie, COOKIE_KEYS } from "./cookie-client";

// Determine API base URL: prioritize env, but if running in browser on production domain and localhost is detected, use production api
const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    // If running in browser on nowripple.com or any non-localhost domain, don't allow localhost:4000
    if (!window.location.hostname.includes("localhost") && env.NEXT_PUBLIC_API_URL.includes("localhost")) {
      return "https://api.nowripple.com/api";
    }
  }
  return env.NEXT_PUBLIC_API_URL;
};

export const api = axios.create({
  baseURL: getBaseUrl(),
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
