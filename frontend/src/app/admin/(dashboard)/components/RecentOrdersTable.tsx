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
    <Card className="border-gray-100 shadow-sm flex flex-col h-full">
      <CardHeader className="pb-3 px-6">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-gray-900 uppercase tracking-tight">
            Recent Orders
          </CardTitle>
          <Button asChild>
            <Link href="/admin/orders">
              View All <ArrowUpRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-0 flex-1 flex flex-col">
        <div className="flex-1 overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow className="border-gray-100">
                <TableHead className="px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-widest">
                  Order
                </TableHead>
                <TableHead className="py-4 font-bold text-gray-500 text-xs uppercase tracking-widest">
                  Customer
                </TableHead>
                <TableHead className="py-4 font-bold text-gray-500 text-xs uppercase tracking-widest">
                  Total
                </TableHead>
                <TableHead className="px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-widest text-right">
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-64 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto" />
                    <p className="text-gray-400 mt-2 font-medium">
                      Loading orders...
                    </p>
                  </TableCell>
                </TableRow>
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="h-64 text-center text-gray-500 font-medium"
                  >
                    No orders found.
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => {
                  const statusConfig = ORDER_STATUSES[order.status] || {
                    label: order.status,
                    color: "bg-gray-100 text-gray-800",
                  };
                  return (
                    <TableRow
                      key={order.id}
                      className="border-gray-50 group hover:bg-emerald-50/30 transition-colors"
                    >
                      <TableCell className="px-6 py-4">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="font-bold text-gray-900 hover:text-emerald-600 transition-colors block"
                        >
                          #{order.orderNumber}
                        </Link>
                        <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </TableCell>
                      <TableCell className="py-4">
                        <p className="font-semibold text-gray-700">
                          {order.guestName || order.user?.name || "Guest"}
                        </p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">
                          {order.items.length} Items
                        </p>
                      </TableCell>
                      <TableCell className="py-4">
                        <p className="font-black text-gray-900">
                          {CURRENCY}
                          {order.total.toLocaleString()}
                        </p>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right">
                        <Badge
                          className={`font-black text-[10px] uppercase tracking-tighter px-3 py-0.5 rounded-lg border-0 ${statusConfig.color}`}
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

        <div className="px-6 py-4 border-t border-gray-50 mt-auto">
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
