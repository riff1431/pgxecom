"use client";

import type { Order } from "@/types";
import { Mail, Phone, User } from "lucide-react";

interface OrderCustomerCardProps {
  order: Order;
}

export function OrderCustomerCard({ order }: OrderCustomerCardProps) {
  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-xs">
      <h3 className="flex items-center gap-2 border-b border-border pb-2 font-mono uppercase tracking-wider text-sm font-semibold text-foreground">
        <User className="h-4 w-4 text-primary" /> Customer
      </h3>

      <div>
        <p className="font-medium text-foreground">
          {order.guestName || order.user?.name}
        </p>
        <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
          <Mail className="h-3.5 w-3.5 text-muted-foreground" />
          {order.guestEmail || order.user?.email || "No email"}
        </p>
        <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
          <Phone className="h-3.5 w-3.5 text-muted-foreground" />
          {order.guestPhone || order.user?.phone || "No phone"}
        </p>
      </div>
    </div>
  );
}
