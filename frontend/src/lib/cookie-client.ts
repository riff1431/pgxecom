import Cookies from "js-cookie";

export const COOKIE_KEYS = {
  TOKEN: "token",
  USER: "user",
  SUPABASE_TOKEN: "sb_token",
};

export const setCookie = (key: string, value: string, options?: Cookies.CookieAttributes) => {
  Cookies.set(key, value, {
    expires: 7, // 7 days default
    path: "/",
    ...options,
  });
};

export const getCookie = (key: string) => {
  return Cookies.get(key);
};

export const removeCookie = (key: string) => {
  Cookies.remove(key);
};
