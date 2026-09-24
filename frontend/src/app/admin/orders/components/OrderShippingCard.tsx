"use client";

import type { Order } from "@/types";
import { MapPin } from "lucide-react";

interface OrderShippingCardProps {
  order: Order;
}

export function OrderShippingCard({ order }: OrderShippingCardProps) {
  return (
    <div className="space-y-4 rounded-xl border border-slate-800 bg-[#0b1322] p-5 shadow-sm">
      <h3 className="flex items-center gap-2 border-b border-slate-800 pb-2 font-mono uppercase tracking-wider text-sm font-semibold text-white">
        <MapPin className="h-4 w-4 text-[#00a3ff]" /> Shipping Address
      </h3>

      {order.shippingAddress ? (
        <address className="not-italic space-y-1 text-sm text-slate-300">
          <p>{order.shippingAddress.street}</p>
          <p>{order.shippingAddress.area}</p>
          <p>{order.shippingAddress.city}</p>
          <p className="mt-2 border-t border-slate-800 pt-2 text-xs font-mono font-medium uppercase text-[#00a3ff]">
            Zone: {order.shippingAddress.zone?.replace("_", " ")}
          </p>
        </address>
      ) : (
        <p className="text-sm text-slate-500">No address provided</p>
      )}
    </div>
  );
}
