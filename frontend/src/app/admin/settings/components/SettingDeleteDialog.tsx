import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Setting } from "@/types";

interface SettingDeleteDialogProps {
  settingToDelete: Setting | null;
  onOpenChange: (open: boolean) => void;
  onConfirmDelete: () => void;
  isDeleting: boolean;
}

export function SettingDeleteDialog({
  settingToDelete,
  onOpenChange,
  onConfirmDelete,
  isDeleting,
}: SettingDeleteDialogProps) {
  return (
    <AlertDialog
      open={!!settingToDelete}
      onOpenChange={(open) => onOpenChange(open)}
    >
      <AlertDialogContent className="rounded-xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete setting?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. Setting
            {settingToDelete ? ` \"${settingToDelete.key}\"` : ""} will be
            deleted.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-600 hover:bg-red-700"
            onClick={onConfirmDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
