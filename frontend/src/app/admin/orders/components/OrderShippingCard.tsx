"use client";

import type { Order } from "@/types";
import { MapPin } from "lucide-react";

interface OrderShippingCardProps {
  order: Order;
}

export function OrderShippingCard({ order }: OrderShippingCardProps) {
  return (
    <div className="space-y-4 rounded-xl border bg-white p-5 shadow-sm">
      <h3 className="flex items-center gap-2 border-b pb-2 font-semibold text-gray-900">
        <MapPin className="h-4 w-4 text-gray-500" /> Shipping Address
      </h3>

      {order.shippingAddress ? (
        <address className="not-italic space-y-1 text-sm text-gray-600">
          <p>{order.shippingAddress.street}</p>
          <p>{order.shippingAddress.area}</p>
          <p>{order.shippingAddress.city}</p>
          <p className="mt-2 border-t pt-2 text-xs font-medium capitalize text-emerald-600">
            Zone: {order.shippingAddress.zone?.replace("_", " ")}
          </p>
        </address>
      ) : (
        <p className="text-sm text-gray-400">No address provided</p>
      )}
    </div>
  );
}
