import { LucideIcon, Search } from "lucide-react";
import { ReactNode } from "react";

interface AdminEmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function AdminEmptyState({
  icon: Icon = Search,
  title,
  description,
  action,
  className = "",
}: AdminEmptyStateProps) {
  return (
    <div
      className={`py-16 md:py-20 px-4 text-center flex flex-col items-center justify-center ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-muted/60 border border-border/80 flex items-center justify-center mb-3.5 shadow-2xs">
        <Icon className="h-6 w-6 text-muted-foreground/80" />
      </div>
      <h3 className="text-base sm:text-lg font-bold text-foreground font-mono tracking-tight">
        {title}
      </h3>
      {description && (
        <p className="text-xs text-muted-foreground mt-1 max-w-sm leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
