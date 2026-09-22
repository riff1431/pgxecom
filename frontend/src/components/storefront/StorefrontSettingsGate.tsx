"use client";

import { Loader2 } from "lucide-react";

import { useStoreSettings } from "@/providers/StoreSettingsProvider";

export function StorefrontSettingsGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading } = useStoreSettings();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-emerald-50 via-white to-emerald-100">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 text-emerald-700 font-semibold">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading...</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse [animation-delay:120ms]" />
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse [animation-delay:240ms]" />
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
