"use client";

import { AdminStatusToggle } from "@/components/admin/AdminStatusToggle";
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
import { useToggleProductActive } from "@/lib/api/product";
import { CURRENCY } from "@/lib/constants";
import type { Product } from "@/types";
import { Edit, Package, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";

interface ProductsTableProps {
  products: Product[];
  handleDelete: (id: string) => void;
}

export function ProductsTable({ products, handleDelete }: ProductsTableProps) {
  const toggleMutation = useToggleProductActive();

  const onToggle = async (id: string) => {
    try {
      await toggleMutation.mutateAsync(id);
      toast.success("Product status updated");
    } catch {
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="relative">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent bg-gray-50/50">
            <TableHead className="w-20 font-bold text-gray-700">
              Preview
            </TableHead>
            <TableHead className="font-bold text-gray-700">
              Product Details
            </TableHead>
            <TableHead className="font-bold text-gray-700">Category</TableHead>
            <TableHead className="font-bold text-gray-700">Pricing</TableHead>
            <TableHead className="font-bold text-gray-700">Inventory</TableHead>
            <TableHead className="font-bold text-gray-700">Status</TableHead>
            <TableHead className="text-right font-bold text-gray-700">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow
              key={product.id}
              className="group hover:bg-gray-50/50 transition-colors"
            >
              <TableCell>
                <div className="relative w-12 h-12 rounded-xl bg-gray-100 overflow-hidden border border-gray-100 group-hover:border-emerald-200 transition-colors">
                  {product.images?.[0]?.url ? (
                    <Image
                      src={
                        product.images[0].url.startsWith("http")
                          ? product.images[0].url
                          : `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${product.images[0].url}`
                      }
                      alt={product.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full text-gray-300">
                      <Package className="h-6 w-6" />
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-bold text-gray-900 leading-tight group-hover:text-emerald-700 transition-colors">
                    {product.name}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider font-extrabold text-gray-400 mt-0.5">
                    SKU: {product.sku || "NO-SKU"}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className="rounded-lg bg-gray-50 border-gray-200 text-gray-600 font-bold px-2 py-0"
                >
                  {product.category?.name || "Uncategorized"}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex flex-col font-bold">
                  <span className="text-gray-900">
                    {CURRENCY}
                    {product.price}
                  </span>
                  {product.comparePrice && (
                    <span className="text-xs text-red-500 line-through opacity-60">
                      {CURRENCY}
                      {product.comparePrice}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${product.stock > 0 ? "bg-emerald-500" : "bg-red-500"}`}
                  />
                  <span
                    className={`text-sm font-bold ${product.stock > 0 ? "text-gray-700" : "text-red-600"}`}
                  >
                    {product.stock} in stock
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <AdminStatusToggle
                  checked={product.isActive}
                  onCheckedChange={() => onToggle(product.id)}
                  activeLabel="Active"
                  inactiveLabel="Hidden"
                  disabled={toggleMutation.isPending}
                />
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button variant="outline" size="icon" asChild>
                    <Link href={`/admin/products/${product.id}/edit`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="text-red-600"
                    onClick={() => handleDelete(product.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {toggleMutation.isPending ? (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center backdrop-blur-[1px] z-10" />
      ) : null}
    </div>
  );
}
