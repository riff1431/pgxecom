import axios from "axios";
import { env } from "@/env";
import { getCookie, removeCookie, COOKIE_KEYS } from "./cookie-client";

export const api = axios.create({
  baseURL: env.NEXT_PUBLIC_API_URL,
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
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        removeCookie(COOKIE_KEYS.TOKEN);
        removeCookie(COOKIE_KEYS.USER);
        
        // Log out or redirect logic can be handled here or in specific components
      }
    }
    return Promise.reject(error);
  }
);
