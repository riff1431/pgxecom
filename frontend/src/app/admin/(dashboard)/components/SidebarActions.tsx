"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LowStockProduct } from "@/lib/api/admin";
import {
  AlertTriangle,
  FileText,
  PlusCircle,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

interface SidebarActionsProps {
  lowStockProducts?: LowStockProduct[];
}

export function SidebarActions({ lowStockProducts }: SidebarActionsProps) {
  return (
    <div className="space-y-6">
      {/* Low Stock Alerts */}
      <Card className="border-border bg-card shadow-xs overflow-hidden text-card-foreground">
        <CardHeader className="pb-3 px-6 pt-6 border-b border-border">
          <CardTitle className="text-xs font-mono font-bold uppercase tracking-widest flex items-center gap-2 text-muted-foreground">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Stock Alerts
          </CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-6 pt-4 space-y-3">
          {!lowStockProducts || lowStockProducts.length === 0 ? (
            <p className="text-xs text-muted-foreground font-mono bg-muted/40 p-4 rounded-xl text-center border border-border">
              All products in stock
            </p>
          ) : (
            lowStockProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border group hover:border-primary/40 transition-colors"
              >
                <Link
                  href={`/admin/products/${product.id}`}
                  className="text-xs font-semibold text-foreground truncate flex-1 mr-2 hover:text-primary transition-colors"
                >
                  {product.name}
                </Link>
                <Badge
                  variant="destructive"
                  className="text-[10px] font-mono font-bold uppercase px-2 h-5 shrink-0 bg-red-500/10 text-destructive border border-destructive/20 rounded-md"
                >
                  {product.stock} left
                </Badge>
              </div>
            ))
          )}
          <Button
            asChild
            variant="outline"
            className="w-full border-border bg-background hover:bg-muted text-foreground text-xs font-mono uppercase mt-2"
          >
            <Link href="/admin/products">View Inventory</Link>
          </Button>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="border-border bg-card shadow-xs overflow-hidden relative text-card-foreground">
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 blur-2xl pointer-events-none"></div>
        <CardHeader className="pb-3 px-6 pt-6 relative border-b border-border">
          <CardTitle className="text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground">
            Quick Hub
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-6 pt-4 relative">
          <div className="grid grid-cols-2 gap-2">
            <Button
              asChild
              variant="outline"
              className="border-border bg-background hover:bg-muted hover:border-primary/40 text-foreground flex flex-col items-center justify-center h-20 p-2 group shadow-2xs"
            >
              <Link href="/admin/products/new">
                <PlusCircle className="h-5 w-5 text-primary mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-mono font-semibold uppercase tracking-wider">
                  New Product
                </span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-border bg-background hover:bg-muted hover:border-primary/40 text-foreground flex flex-col items-center justify-center h-20 p-2 group shadow-2xs"
            >
              <Link href="/admin/orders">
                <ShoppingCart className="h-5 w-5 text-primary mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-mono font-semibold uppercase tracking-wider">
                  View Orders
                </span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-border bg-background hover:bg-muted hover:border-primary/40 text-foreground flex flex-col items-center justify-center h-20 p-2 group shadow-2xs"
            >
              <Link href="/admin/coupons">
                <TrendingUp className="h-5 w-5 text-primary mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-mono font-semibold uppercase tracking-wider">
                  Coupons
                </span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-border bg-background hover:bg-muted hover:border-primary/40 text-foreground flex flex-col items-center justify-center h-20 p-2 group shadow-2xs"
            >
              <Link href="/admin/blog/new">
                <FileText className="h-5 w-5 text-primary mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-mono font-semibold uppercase tracking-wider">
                  New Article
                </span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
