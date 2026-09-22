import { env } from "@/env";

export const siteConfig = {
  name: env.NEXT_PUBLIC_STORE_NAME,
  description:
    "Modern e-commerce platform built with Next.js, TypeScript, and Tailwind CSS. This project serves as a boilerplate for building scalable and maintainable web applications.",
  url: env.NEXT_PUBLIC_SITE_URL,
  author: "Shariar Sultan Fahim",
  locale: "en",
  themeColor: "#a6d3e9",
  keywords: ["e-commerce", "next.js", "typescript", "tailwind-css"],
  social: {
    twitter: "",
    github: "",
    linkedin: ""
  },
  ogImage: "/logo.png",
  favicon: "/logo.png"
} as const;
