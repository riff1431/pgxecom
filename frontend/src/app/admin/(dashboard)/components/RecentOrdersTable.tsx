"use client";

import { AppPagination } from "@/components/shared/AppPagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CURRENCY, ORDER_STATUSES } from "@/lib/constants";
import { ArrowUpRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";

interface RecentOrdersTableProps {
  orders: any[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function RecentOrdersTable({
  orders,
  isLoading,
  currentPage,
  totalPages,
  onPageChange,
}: RecentOrdersTableProps) {
  return (
    <Card className="border-border bg-card shadow-xs flex flex-col h-full text-card-foreground">
      <CardHeader className="pb-3 px-6 border-b border-border">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-mono font-bold text-foreground uppercase tracking-wider">
            Recent Orders
          </CardTitle>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="border-border bg-background hover:bg-muted text-foreground text-xs font-mono uppercase"
          >
            <Link href="/admin/orders">
              View All <ArrowUpRight className="ml-1 h-3 w-3 text-primary" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-0 flex-1 flex flex-col">
        <div className="flex-1 overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="px-6 py-3 font-mono font-bold text-muted-foreground text-[11px] uppercase tracking-widest">
                  Order
                </TableHead>
                <TableHead className="py-3 font-mono font-bold text-muted-foreground text-[11px] uppercase tracking-widest">
                  Customer
                </TableHead>
                <TableHead className="py-3 font-mono font-bold text-muted-foreground text-[11px] uppercase tracking-widest">
                  Total
                </TableHead>
                <TableHead className="px-6 py-3 font-mono font-bold text-muted-foreground text-[11px] uppercase tracking-widest text-right">
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow className="border-border hover:bg-transparent">
                  <TableCell colSpan={4} className="h-64 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                    <p className="text-muted-foreground mt-2 font-mono text-xs">
                      Loading orders...
                    </p>
                  </TableCell>
                </TableRow>
              ) : orders.length === 0 ? (
                <TableRow className="border-border hover:bg-transparent">
                  <TableCell
                    colSpan={4}
                    className="p-0 border-none"
                  >
                    <AdminEmptyState
                      title="No recent orders"
                      description="When orders are placed, they will appear in this feed."
                    />
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => {
                  const statusConfig = ORDER_STATUSES[order.status] || {
                    label: order.status,
                    color: "bg-muted text-muted-foreground",
                  };
                  return (
                    <TableRow
                      key={order.id}
                      className="border-border/60 group hover:bg-muted/50 transition-colors"
                    >
                      <TableCell className="px-6 py-3.5">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="font-mono font-bold text-foreground hover:text-primary transition-colors block text-sm"
                        >
                          #{order.orderNumber}
                        </Link>
                        <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </TableCell>
                      <TableCell className="py-3.5">
                        <p className="font-semibold text-foreground text-sm">
                          {order.guestName || order.user?.name || "Guest"}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-mono">
                          {order.items.length} Items
                        </p>
                      </TableCell>
                      <TableCell className="py-3.5">
                        <p className="font-mono font-bold text-foreground text-sm">
                          {CURRENCY}
                          {order.total.toLocaleString()}
                        </p>
                      </TableCell>
                      <TableCell className="px-6 py-3.5 text-right">
                        <Badge
                          className={`font-mono font-bold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-md border-0 ${statusConfig.color}`}
                        >
                          {statusConfig.label}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        <div className="px-6 py-4 border-t border-border mt-auto">
          <AppPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      </CardContent>
    </Card>
  );
}
