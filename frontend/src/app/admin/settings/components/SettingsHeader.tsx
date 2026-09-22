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
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Configure storefront identity, contacts and social links.
        </p>
      </div>

      <div className="flex gap-2">
        <Button onClick={onAddSetting}>
          <Plus className="h-4 w-4 mr-2" /> Add Setting
        </Button>
        <Button onClick={onSaveSettings} disabled={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Saving..." : "Save Storefront Settings"}
        </Button>
      </div>
    </div>
  );
}
