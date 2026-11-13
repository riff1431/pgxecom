import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "gadgetbd.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "traqtwdfhxduijhqsuwg.supabase.co",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.alicdn.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.aliexpress-media.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "api.playgroundfitnex.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "api.pgxsports.shop",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "pgxsports.shop",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "4000",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
