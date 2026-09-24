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
import { CURRENCY, ORDER_STATUSES } from "@/lib/constants";
import { Eye } from "lucide-react";
import Link from "next/link";

export function OrdersTable({ orders }: { orders: any[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent bg-[#080e18] border-slate-800/80">
          <TableHead className="font-mono font-bold text-slate-400 text-xs uppercase tracking-wider">Order</TableHead>
          <TableHead className="font-mono font-bold text-slate-400 text-xs uppercase tracking-wider">Date</TableHead>
          <TableHead className="font-mono font-bold text-slate-400 text-xs uppercase tracking-wider">Customer</TableHead>
          <TableHead className="font-mono font-bold text-slate-400 text-xs uppercase tracking-wider">Total</TableHead>
          <TableHead className="font-mono font-bold text-slate-400 text-xs uppercase tracking-wider">Payment</TableHead>
          <TableHead className="font-mono font-bold text-slate-400 text-xs uppercase tracking-wider">Status</TableHead>
          <TableHead className="text-right font-mono font-bold text-slate-400 text-xs uppercase tracking-wider">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order: any) => {
          const statusConfig = ORDER_STATUSES[order.status] || {
            label: order.status,
            color: "bg-slate-800 text-slate-300",
          };
          return (
            <TableRow
              key={order.id}
              className="group hover:bg-slate-800/40 border-slate-800/60 transition-colors"
            >
              <TableCell>
                <Link
                  href={`/admin/orders/${order.id}`}
                  className="font-mono font-bold text-sm text-white hover:text-[#00a3ff] transition-colors"
                >
                  #{order.orderNumber}
                </Link>
              </TableCell>
              <TableCell className="text-sm font-mono text-slate-400">
                {new Date(order.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <p className="text-sm font-semibold text-slate-200">
                  {order.guestName || order.user?.name}
                </p>
                <p className="text-xs text-slate-400 truncate max-w-37.5">
                  {order.guestEmail || order.user?.email || "No email"}
                </p>
              </TableCell>
              <TableCell className="text-sm font-bold font-mono text-white">
                {CURRENCY}
                {order.total}
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className="text-xs uppercase bg-slate-900 border-slate-700 text-slate-300 font-mono"
                >
                  {order.paymentMethod.replace(/_/g, " ")}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge className={`${statusConfig.color} font-mono font-bold text-[10px] uppercase tracking-wider border-0`}>
                  {statusConfig.label}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="outline"
                  size="icon"
                  className="border-slate-700 bg-slate-800/60 hover:bg-slate-700 text-slate-200 h-8 w-8 rounded-lg"
                  asChild
                >
                  <Link href={`/admin/orders/${order.id}`}>
                    <Eye className="h-4 w-4" />
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
