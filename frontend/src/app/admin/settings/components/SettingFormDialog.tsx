import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Setting } from "@/types";

interface SettingFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingSetting: Setting | null;
  keyInput: string;
  valueInput: string;
  groupInput: string;
  onKeyChange: (value: string) => void;
  onValueChange: (value: string) => void;
  onGroupChange: (value: string) => void;
  onSave: () => void;
  isSaving: boolean;
}

export function SettingFormDialog({
  open,
  onOpenChange,
  editingSetting,
  keyInput,
  valueInput,
  groupInput,
  onKeyChange,
  onValueChange,
  onGroupChange,
  onSave,
  isSaving,
}: SettingFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-xl">
        <DialogHeader>
          <DialogTitle>
            {editingSetting ? "Edit Setting" : "Create Setting"}
          </DialogTitle>
          <DialogDescription>
            {editingSetting
              ? "Update value and group for selected setting."
              : "Create custom key-value setting for storefront."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="setting-key">Setting key</Label>
            <Input
              id="setting-key"
              value={keyInput}
              onChange={(event) => onKeyChange(event.target.value)}
              placeholder="example_key"
              disabled={!!editingSetting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="setting-value">Setting value</Label>
            <Input
              id="setting-value"
              value={valueInput}
              onChange={(event) => onValueChange(event.target.value)}
              placeholder="Value"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="setting-group">Group</Label>
            <Input
              id="setting-group"
              value={groupInput}
              onChange={(event) => onGroupChange(event.target.value)}
              placeholder="general"
            />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={onSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
