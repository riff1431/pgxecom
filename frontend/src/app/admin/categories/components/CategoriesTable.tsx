"use client";

import { AdminDeleteDialog } from "@/components/admin/AdminDeleteDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDeleteCategory } from "@/lib/api/category";
import type { Category } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface CategoriesTableProps {
  categories: Category[];
  onEdit: (category: Category) => void;
}

export function CategoriesTable({ categories, onEdit }: CategoriesTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const deleteMutation = useDeleteCategory();
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const response = await deleteMutation.mutateAsync(deleteId);
      if (response.success) {
        toast.success("Category deleted successfully");
        queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      } else {
        toast.error(response.message || "Failed to delete category");
      }
    } catch {
      toast.error("Cannot delete category. It might have active products.");
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <>
      <div className="relative">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent bg-[#080e18] border-slate-800/80">
              <TableHead className="w-20 font-mono font-bold text-slate-400 text-xs uppercase tracking-wider">
                Preview
              </TableHead>
              <TableHead className="font-mono font-bold text-slate-400 text-xs uppercase tracking-wider">
                Category Details
              </TableHead>
              <TableHead className="font-mono font-bold text-slate-400 text-xs uppercase tracking-wider">Slug</TableHead>
              <TableHead className="font-mono font-bold text-slate-400 text-xs uppercase tracking-wider">Parent</TableHead>
              <TableHead className="font-mono font-bold text-slate-400 text-xs uppercase tracking-wider">
                Products
              </TableHead>
              <TableHead className="font-mono font-bold text-slate-400 text-xs uppercase tracking-wider">Sort</TableHead>
              <TableHead className="text-right font-mono font-bold text-slate-400 text-xs uppercase tracking-wider">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((cat) => (
              <TableRow
                key={cat.id}
                className="group hover:bg-slate-800/40 border-slate-800/60 transition-colors"
              >
                <TableCell>
                  <div className="relative w-12 h-12 rounded-xl bg-slate-900 overflow-hidden border border-slate-800 group-hover:border-[#00a3ff]/40 transition-colors flex items-center justify-center text-xs font-black text-[#00a3ff] uppercase font-mono">
                    {cat.name.substring(0, 2)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-bold text-white leading-tight">
                      {cat.name}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className="rounded-lg bg-slate-900 border-slate-700 text-slate-300 font-mono text-[11px] px-2 py-0.5"
                  >
                    {cat.slug}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm font-semibold text-slate-300">
                    {cat.parent?.name || "Root"}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#00a3ff]" />
                    <span className="text-sm font-semibold text-slate-300">
                      {cat._count?.products || 0} products
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm font-mono text-slate-400">
                    {cat.sortOrder}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="border-slate-700 bg-slate-800/60 hover:bg-slate-700 text-slate-200 h-8 w-8 rounded-lg"
                      onClick={() => onEdit(cat)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 h-8 w-8 rounded-lg"
                      onClick={() => setDeleteId(cat.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AdminDeleteDialog
        open={!!deleteId}
        title="Delete Category?"
        description="This action cannot be undone. You can only delete categories that have no active products."
        confirmLabel="Confirm Delete"
        isDeleting={deleteMutation.isPending}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
      />
    </>
  );
}
