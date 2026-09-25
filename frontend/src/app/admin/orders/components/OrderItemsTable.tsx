"use client";

import { CURRENCY } from "@/lib/constants";
import type { Order, OrderItem } from "@/types";
import { Package } from "lucide-react";

interface OrderItemsTableProps {
  order: Order;
}

export function OrderItemsTable({ order }: OrderItemsTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
      <div className="border-b border-border bg-muted/30 p-5">
        <h3 className="flex items-center gap-2 font-mono uppercase tracking-wider text-sm font-semibold text-foreground">
          <Package className="h-4 w-4 text-primary" /> Items Ordered
        </h3>
      </div>

      <div className="p-0 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/40">
            <tr>
              <th className="p-4 font-medium text-muted-foreground">Product</th>
              <th className="p-4 text-center font-medium text-muted-foreground">Qty</th>
              <th className="p-4 text-right font-medium text-muted-foreground">
                Price
              </th>
              <th className="p-4 text-right font-medium text-muted-foreground">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="divide-y border-b border-border">
            {order.items.map((item: OrderItem) => (
              <tr key={item.id} className="hover:bg-muted/30">
                <td className="p-4">
                  <p className="font-medium text-foreground">
                    {item.productName}
                  </p>
                  {item.variantName && (
                    <p className="text-xs text-muted-foreground">
                      Variant: {item.variantName}
                    </p>
                  )}
                </td>
                <td className="p-4 text-center font-medium text-foreground">{item.quantity}</td>
                <td className="p-4 text-right text-foreground">
                  {CURRENCY}
                  {item.unitPrice}
                </td>
                <td className="p-4 text-right font-medium text-foreground">
                  {CURRENCY}
                  {item.totalPrice}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-2 border-t border-border bg-muted/20 p-5">
        <div className="flex justify-end gap-10 text-sm">
          <span className="text-muted-foreground">Subtotal:</span>
          <span className="w-24 text-right font-medium text-foreground">
            {CURRENCY}
            {order.subtotal}
          </span>
        </div>

        {order.discount > 0 && (
          <div className="flex justify-end gap-10 text-sm">
            <span className="text-muted-foreground">
              Discount{order.coupon ? ` (${order.coupon.code})` : ""}:
            </span>
            <span className="w-24 text-right font-medium text-emerald-600 dark:text-emerald-400">
              -{CURRENCY}
              {order.discount}
            </span>
          </div>
        )}

        <div className="flex justify-end gap-10 text-sm">
          <span className="text-muted-foreground">Shipping:</span>
          <span className="w-24 text-right font-medium text-foreground">
            {CURRENCY}
            {order.shippingCost || 0}
          </span>
        </div>

        <div className="mt-3 flex justify-end gap-10 border-t border-border pt-3 text-base">
          <span className="font-bold text-foreground font-mono uppercase">Total:</span>
          <span className="w-24 text-right font-bold text-primary font-mono text-lg">
            {CURRENCY}
            {order.total}
          </span>
        </div>
      </div>
    </div>
  );
}
