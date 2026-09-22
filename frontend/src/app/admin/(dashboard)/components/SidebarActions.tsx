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
      <Card className="border-gray-100 shadow-sm overflow-hidden  border-0 bg-white/50 backdrop-blur-sm">
        <CardHeader className="pb-3 px-6 pt-6">
          <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-gray-500">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            Stock Alerts
          </CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-6 space-y-3">
          {!lowStockProducts || lowStockProducts.length === 0 ? (
            <p className="text-xs text-gray-400 font-bold bg-gray-50 p-4 rounded-2xl text-center border border-gray-100">
              All products in stock
            </p>
          ) : (
            lowStockProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-orange-50/50 border border-orange-100 group hover:bg-orange-100/50 transition-colors"
              >
                <Link
                  href={`/admin/products/${product.id}`}
                  className="text-xs font-bold text-gray-700 truncate flex-1 mr-2 hover:text-orange-600 transition-colors"
                >
                  {product.name}
                </Link>
                <Badge
                  variant="destructive"
                  className="text-[10px] font-black uppercase tracking-tighter px-2 h-5 shrink-0 bg-red-500 rounded-lg"
                >
                  {product.stock} left
                </Badge>
              </div>
            ))
          )}
          <Button asChild>
            <Link href="/admin/products">View Inventory</Link>
          </Button>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="border-gray-100 shadow-sm  border-0 bg-gray-900 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-600/20 rounded-full -mr-12 -mt-12 blur-2xl"></div>
        <CardHeader className="pb-3 px-6 pt-6 relative">
          <CardTitle className="text-sm font-black uppercase tracking-widest text-white">
            Quick Hub
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-6 relative">
          <div className="grid grid-cols-2 gap-2">
            <Button asChild variant="outline">
              <Link href="/admin/products/new">
                <PlusCircle className="h-5 w-5 text-emerald-400 group-hover:text-white" />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  New Product
                </span>
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/orders">
                <ShoppingCart className="h-5 w-5 text-emerald-400 group-hover:text-white" />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  View Orders
                </span>
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/coupons">
                <TrendingUp className="h-5 w-5 text-emerald-400 group-hover:text-white" />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  Coupons
                </span>
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/blog/new">
                <FileText className="h-5 w-5 text-emerald-400 group-hover:text-white" />
                <span className="text-[10px] font-black uppercase tracking-widest">
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
