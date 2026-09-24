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
    <Card className="border-slate-800 bg-[#0b1322] shadow-sm flex flex-col h-full text-slate-100">
      <CardHeader className="pb-3 px-6 border-b border-slate-800/80">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-mono font-bold text-white uppercase tracking-wider">
            Recent Orders
          </CardTitle>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="border-slate-700 bg-slate-800/60 hover:bg-slate-700 text-slate-200 text-xs font-mono uppercase"
          >
            <Link href="/admin/orders">
              View All <ArrowUpRight className="ml-1 h-3 w-3 text-[#00a3ff]" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-0 flex-1 flex flex-col">
        <div className="flex-1 overflow-x-auto">
          <Table>
            <TableHeader className="bg-[#080e18]">
              <TableRow className="border-slate-800/80 hover:bg-transparent">
                <TableHead className="px-6 py-3 font-mono font-bold text-slate-400 text-[11px] uppercase tracking-widest">
                  Order
                </TableHead>
                <TableHead className="py-3 font-mono font-bold text-slate-400 text-[11px] uppercase tracking-widest">
                  Customer
                </TableHead>
                <TableHead className="py-3 font-mono font-bold text-slate-400 text-[11px] uppercase tracking-widest">
                  Total
                </TableHead>
                <TableHead className="px-6 py-3 font-mono font-bold text-slate-400 text-[11px] uppercase tracking-widest text-right">
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableCell colSpan={4} className="h-64 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-[#00a3ff] mx-auto" />
                    <p className="text-slate-400 mt-2 font-mono text-xs">
                      Loading orders...
                    </p>
                  </TableCell>
                </TableRow>
              ) : orders.length === 0 ? (
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableCell
                    colSpan={4}
                    className="h-64 text-center text-slate-500 font-mono text-xs"
                  >
                    No orders found.
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => {
                  const statusConfig = ORDER_STATUSES[order.status] || {
                    label: order.status,
                    color: "bg-slate-800 text-slate-300",
                  };
                  return (
                    <TableRow
                      key={order.id}
                      className="border-slate-800/60 group hover:bg-slate-800/40 transition-colors"
                    >
                      <TableCell className="px-6 py-3.5">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="font-mono font-bold text-white hover:text-[#00a3ff] transition-colors block text-sm"
                        >
                          #{order.orderNumber}
                        </Link>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </TableCell>
                      <TableCell className="py-3.5">
                        <p className="font-semibold text-slate-200 text-sm">
                          {order.guestName || order.user?.name || "Guest"}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {order.items.length} Items
                        </p>
                      </TableCell>
                      <TableCell className="py-3.5">
                        <p className="font-mono font-bold text-white text-sm">
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

        <div className="px-6 py-4 border-t border-slate-800/80 mt-auto">
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
