"use client";

import type { Order } from "@/types";
import { MapPin } from "lucide-react";

interface OrderShippingCardProps {
  order: Order;
}

export function OrderShippingCard({ order }: OrderShippingCardProps) {
  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-xs">
      <h3 className="flex items-center gap-2 border-b border-border pb-2 font-mono uppercase tracking-wider text-sm font-semibold text-foreground">
        <MapPin className="h-4 w-4 text-primary" /> Shipping Address
      </h3>

      {order.shippingAddress ? (
        <address className="not-italic space-y-1 text-sm text-foreground">
          <p>{order.shippingAddress.street}</p>
          <p>{order.shippingAddress.area}</p>
          <p>{order.shippingAddress.city}</p>
          <p className="mt-2 border-t border-border pt-2 text-xs font-mono font-medium uppercase text-primary">
            Zone: {order.shippingAddress.zone?.replace("_", " ")}
          </p>
        </address>
      ) : (
        <p className="text-sm text-muted-foreground">No address provided</p>
      )}
    </div>
  );
}
