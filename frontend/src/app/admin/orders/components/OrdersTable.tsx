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
        <TableRow className="hover:bg-transparent bg-muted/40 border-b border-border">
          <TableHead className="font-mono font-bold text-muted-foreground text-xs uppercase tracking-wider">Order</TableHead>
          <TableHead className="font-mono font-bold text-muted-foreground text-xs uppercase tracking-wider">Date</TableHead>
          <TableHead className="font-mono font-bold text-muted-foreground text-xs uppercase tracking-wider">Customer</TableHead>
          <TableHead className="font-mono font-bold text-muted-foreground text-xs uppercase tracking-wider">Total</TableHead>
          <TableHead className="font-mono font-bold text-muted-foreground text-xs uppercase tracking-wider">Payment</TableHead>
          <TableHead className="font-mono font-bold text-muted-foreground text-xs uppercase tracking-wider">Status</TableHead>
          <TableHead className="text-right font-mono font-bold text-muted-foreground text-xs uppercase tracking-wider">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order: any) => {
          const statusConfig = ORDER_STATUSES[order.status] || {
            label: order.status,
            color: "bg-muted text-muted-foreground",
          };
          return (
            <TableRow
              key={order.id}
              className="group hover:bg-muted/30 border-b border-border transition-colors"
            >
              <TableCell>
                <Link
                  href={`/admin/orders/${order.id}`}
                  className="font-mono font-bold text-sm text-primary hover:underline transition-colors"
                >
                  #{order.orderNumber}
                </Link>
              </TableCell>
              <TableCell className="text-sm font-mono text-muted-foreground">
                {new Date(order.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <p className="text-sm font-semibold text-foreground">
                  {order.guestName || order.user?.name}
                </p>
                <p className="text-xs text-muted-foreground truncate max-w-37.5">
                  {order.guestEmail || order.user?.email || "No email"}
                </p>
              </TableCell>
              <TableCell className="text-sm font-bold font-mono text-foreground">
                {CURRENCY}
                {order.total}
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className="text-xs uppercase bg-muted/50 border-border text-foreground font-mono"
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
                  className="border-border bg-background hover:bg-muted text-foreground h-8 w-8 rounded-lg"
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
