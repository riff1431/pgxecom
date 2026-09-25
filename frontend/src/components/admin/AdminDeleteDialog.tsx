"use client";

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

interface AdminDeleteDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  isDeleting?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function AdminDeleteDialog({
  open,
  title,
  description,
  confirmLabel = "Delete",
  isDeleting,
  onOpenChange,
  onConfirm,
}: AdminDeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-2xl bg-card border border-border shadow-xl text-card-foreground max-w-md p-6">
        <AlertDialogHeader className="text-left space-y-2">
          <AlertDialogTitle className="text-lg font-bold text-foreground tracking-tight font-sans">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4 -mx-6 -mb-6 p-4 bg-muted/30 border-t border-border/80 flex items-center justify-end gap-2.5 rounded-b-2xl">
          <AlertDialogCancel className="h-9 px-4 rounded-lg bg-background hover:bg-muted text-foreground border border-border font-medium text-xs shadow-xs transition-colors">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
            className="h-9 px-4 rounded-lg bg-destructive hover:bg-destructive/90 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-xs"
          >
            {isDeleting ? "Deleting..." : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
