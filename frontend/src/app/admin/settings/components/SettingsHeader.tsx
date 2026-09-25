import { Plus, Save } from "lucide-react";

import { Button } from "@/components/ui/button";

interface SettingsHeaderProps {
  onAddSetting: () => void;
  onSaveSettings: () => void;
  isSaving: boolean;
}

export function SettingsHeader({
  onAddSetting,
  onSaveSettings,
  isSaving,
}: SettingsHeaderProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight font-mono uppercase">Settings</h1>
        <p className="text-muted-foreground font-medium text-xs mt-1">
          Configure storefront identity, contacts and social links.
        </p>
      </div>

      <div className="flex gap-2">
        <Button
          onClick={onAddSetting}
          variant="outline"
          className="border-border bg-background text-foreground hover:bg-muted font-mono text-xs uppercase"
        >
          <Plus className="h-4 w-4 mr-2" /> Add Setting
        </Button>
        <Button
          onClick={onSaveSettings}
          disabled={isSaving}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold font-mono text-xs uppercase px-5 h-10 rounded-xl shadow-xs transition-all cursor-pointer"
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}
