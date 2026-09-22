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
        <TableRow>
          <TableHead>Order</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Total</TableHead>
          <TableHead>Payment</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order: any) => {
          const statusConfig = ORDER_STATUSES[order.status] || {
            label: order.status,
            color: "bg-gray-100 text-gray-800",
          };
          return (
            <TableRow key={order.id}>
              <TableCell>
                <Link
                  href={`/admin/orders/${order.id}`}
                  className="font-medium text-sm text-emerald-600 hover:underline"
                >
                  #{order.orderNumber}
                </Link>
              </TableCell>
              <TableCell className="text-sm text-gray-600">
                {new Date(order.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <p className="text-sm font-medium text-gray-900">
                  {order.guestName || order.user?.name}
                </p>
                <p className="text-xs text-gray-500 truncate max-w-37.5">
                  {order.guestEmail || order.user?.email || "No email"}
                </p>
              </TableCell>
              <TableCell className="text-sm font-medium">
                {CURRENCY}
                {order.total}
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className="text-xs uppercase bg-gray-50"
                >
                  {order.paymentMethod.replace(/_/g, " ")}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge className={`${statusConfig.color} font-normal border-0`}>
                  {statusConfig.label}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="outline" size="icon" asChild>
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
