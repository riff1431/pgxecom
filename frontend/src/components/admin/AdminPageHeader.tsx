"use client";

import { Button } from "@/components/ui/button";
import { ReactNode } from "react";

interface AdminPageHeaderProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionDisabled?: boolean;
  actionIcon?: ReactNode;
  children?: ReactNode;
}

export function AdminPageHeader({
  title,
  description,
  actionLabel,
  onAction,
  actionDisabled,
  actionIcon,
  children,
}: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight font-mono uppercase">
          {title}
        </h1>
        <p className="text-muted-foreground font-medium text-xs mt-1">
          {description}
        </p>
      </div>

      <div className="flex items-center gap-2.5">
        {children}

        {actionLabel && onAction ? (
          <Button
            onClick={onAction}
            disabled={actionDisabled}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold font-mono text-xs uppercase px-5 h-10 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            {actionIcon}
            {actionLabel}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
