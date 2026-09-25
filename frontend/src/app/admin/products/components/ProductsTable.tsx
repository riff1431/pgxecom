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
import { useState } from "react";
import { toast } from "sonner";

interface ProductsTableProps {
  products: Product[];
  handleDelete: (id: string) => void;
}

export function ProductsTable({ products, handleDelete }: ProductsTableProps) {
  const toggleMutation = useToggleProductActive();
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const onToggle = async (id: string) => {
    try {
      setTogglingId(id);
      await toggleMutation.mutateAsync(id);
      toast.success("Product status updated");
    } catch {
      toast.error("Failed to update status");
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="relative">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent bg-muted/40 border-b border-border">
            <TableHead className="w-20 font-mono font-bold text-muted-foreground text-xs uppercase tracking-wider">
              Preview
            </TableHead>
            <TableHead className="font-mono font-bold text-muted-foreground text-xs uppercase tracking-wider">
              Product Details
            </TableHead>
            <TableHead className="font-mono font-bold text-muted-foreground text-xs uppercase tracking-wider">Category</TableHead>
            <TableHead className="font-mono font-bold text-muted-foreground text-xs uppercase tracking-wider">Pricing</TableHead>
            <TableHead className="font-mono font-bold text-muted-foreground text-xs uppercase tracking-wider">Inventory</TableHead>
            <TableHead className="font-mono font-bold text-muted-foreground text-xs uppercase tracking-wider">Status</TableHead>
            <TableHead className="text-right font-mono font-bold text-muted-foreground text-xs uppercase tracking-wider">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow
              key={product.id}
              className="group hover:bg-muted/40 border-b border-border transition-colors"
            >
              <TableCell>
                <div className="relative w-12 h-12 rounded-xl bg-muted overflow-hidden border border-border group-hover:border-primary/40 transition-colors">
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
                    <div className="flex items-center justify-center w-full h-full text-muted-foreground">
                      <Package className="h-6 w-6" />
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-bold text-foreground leading-tight group-hover:text-primary transition-colors">
                    {product.name}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider font-mono font-semibold text-muted-foreground mt-0.5">
                    SKU: {product.sku || "NO-SKU"}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className="rounded-lg bg-background border-border text-foreground font-mono text-[11px] px-2 py-0.5"
                >
                  {product.category?.name || "Uncategorized"}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex flex-col font-bold">
                  <span className="text-foreground font-mono">
                    {CURRENCY}
                    {product.price}
                  </span>
                  {product.comparePrice && (
                    <span className="text-xs text-red-500 line-through opacity-70 font-mono">
                      {CURRENCY}
                      {product.comparePrice}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${product.stock > 0 ? "bg-primary" : "bg-red-500"}`}
                  />
                  <span
                    className={`text-sm font-semibold font-mono ${product.stock > 0 ? "text-foreground" : "text-red-500"}`}
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
                  disabled={togglingId === product.id}
                />
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="border-border bg-background hover:bg-muted text-foreground h-8 w-8 rounded-lg"
                    asChild
                  >
                    <Link href={`/admin/products/${product.id}/edit`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="border-red-500/30 bg-red-500/10 text-red-600 hover:bg-red-500/20 hover:text-red-700 h-8 w-8 rounded-lg"
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
    </div>
  );
}
