"use client";

import { useIsFetching, useIsMutating } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

export function GlobalApiLoader() {
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const isBusy = isFetching > 0 || isMutating > 0;

    if (isBusy) {
      setVisible(true);
      return;
    }

    const timeout = window.setTimeout(() => {
      setVisible(false);
    }, 180);

    return () => window.clearTimeout(timeout);
  }, [isFetching, isMutating]);

  if (!visible) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-[100] bg-white/55 backdrop-blur-[1px]">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="rounded-2xl border border-emerald-100 bg-white/90 px-5 py-3 shadow-lg">
          <div className="flex items-center gap-3 text-emerald-700">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm font-semibold">Loading...</span>
          </div>
        </div>
      </div>
    </div>
  );
}
