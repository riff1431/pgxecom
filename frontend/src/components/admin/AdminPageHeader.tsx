"use client";

import { Button } from "@/components/ui/button";

interface AdminPageHeaderProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionDisabled?: boolean;
}

export function AdminPageHeader({
  title,
  description,
  actionLabel,
  onAction,
  actionDisabled,
}: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-mono uppercase">
          {title}
        </h1>
        <p className="text-slate-400 font-medium text-xs mt-1">
          {description}
        </p>
      </div>

      {actionLabel && onAction ? (
        <Button
          onClick={onAction}
          disabled={actionDisabled}
          className="bg-[#00a3ff] hover:bg-[#0091e6] text-slate-950 font-bold font-mono text-xs uppercase px-5 h-10 rounded-xl shadow-lg shadow-[#00a3ff]/20 transition-all cursor-pointer"
        >
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
