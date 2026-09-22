"use client";

import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

interface AdminStatusToggleProps {
  checked: boolean;
  activeLabel?: string;
  inactiveLabel?: string;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function AdminStatusToggle({
  checked,
  activeLabel = "Active",
  inactiveLabel = "Inactive",
  onCheckedChange,
  disabled,
}: AdminStatusToggleProps) {
  return (
    <div className="inline-flex items-center gap-3">
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
      />
      <Badge
        className={
          checked
            ? "bg-emerald-100 text-emerald-700 border-0"
            : "bg-gray-100 text-gray-700 border-0"
        }
      >
        {checked ? activeLabel : inactiveLabel}
      </Badge>
    </div>
  );
}
