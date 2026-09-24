import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/providers/AuthProvider";
import { QueryProvider } from "@/providers/QueryProvider";
import { WalletProvider } from "@/providers/WalletProvider";
import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "PGX — Lifestyle, Fitness, Gear, Everyday",
  description:
    "Premium fitness equipment, apparel and everyday essentials for a healthier, happier you.",
  keywords: [
    "fitness equipment",
    "gym gear",
    "dumbbells",
    "treadmill",
    "exercise bike",
    "athletic apparel",
    "PGX",
    "power rack",
  ],
  icons: {
    icon: [
      { url: "/logo.png" },
      { url: "/icon.png" },
    ],
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "PGX — Lifestyle, Fitness, Gear, Everyday",
    description: "Premium fitness equipment, apparel and everyday essentials.",
    images: [{ url: "/logo.png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${outfit.variable} font-sans antialiased text-slate-900 bg-white`}
      >
        <NuqsAdapter>
          <QueryProvider>
            <AuthProvider>
              <WalletProvider>
                {children}
                {/* <GlobalApiLoader /> */}
                <Toaster position="top-right" richColors />
              </WalletProvider>
            </AuthProvider>
          </QueryProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
