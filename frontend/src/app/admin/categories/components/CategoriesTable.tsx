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
            <TableRow className="hover:bg-transparent bg-gray-50/50">
              <TableHead className="w-20 font-bold text-gray-700">
                Preview
              </TableHead>
              <TableHead className="font-bold text-gray-700">
                Category Details
              </TableHead>
              <TableHead className="font-bold text-gray-700">Slug</TableHead>
              <TableHead className="font-bold text-gray-700">Parent</TableHead>
              <TableHead className="font-bold text-gray-700">
                Products
              </TableHead>
              <TableHead className="font-bold text-gray-700">Sort</TableHead>
              <TableHead className="text-right font-bold text-gray-700">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((cat) => (
              <TableRow
                key={cat.id}
                className="group hover:bg-gray-50/50 transition-colors"
              >
                <TableCell>
                  <div className="relative w-12 h-12 rounded-xl bg-gray-100 overflow-hidden border border-gray-100 group-hover:border-emerald-200 transition-colors flex items-center justify-center text-xs font-black text-emerald-600 uppercase">
                    {cat.name.substring(0, 2)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-900 leading-tight group-hover:text-emerald-700 transition-colors">
                      {cat.name}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-gray-400 mt-0.5">
                      {cat.namebn || "CATEGORY"}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className="rounded-lg bg-gray-50 border-gray-200 text-gray-600 font-bold px-2 py-0"
                  >
                    {cat.slug}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm font-bold text-gray-700">
                    {cat.parent?.name || "Root"}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-sm font-bold text-gray-700">
                      {cat._count?.products || 0} products
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm font-bold text-gray-700">
                    {cat.sortOrder}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => onEdit(cat)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-red-600"
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
