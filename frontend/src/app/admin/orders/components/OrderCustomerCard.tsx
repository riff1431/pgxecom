"use client";

import type { Order } from "@/types";
import { Mail, Phone, User } from "lucide-react";

interface OrderCustomerCardProps {
  order: Order;
}

export function OrderCustomerCard({ order }: OrderCustomerCardProps) {
  return (
    <div className="space-y-4 rounded-xl border bg-white p-5 shadow-sm">
      <h3 className="flex items-center gap-2 border-b pb-2 font-semibold text-gray-900">
        <User className="h-4 w-4 text-gray-500" /> Customer
      </h3>

      <div>
        <p className="font-medium text-gray-900">
          {order.guestName || order.user?.name}
        </p>
        <p className="mt-1 flex items-center gap-2 text-sm text-gray-500">
          <Mail className="h-3.5 w-3.5" />
          {order.guestEmail || order.user?.email || "No email"}
        </p>
        <p className="mt-1 flex items-center gap-2 text-sm text-gray-500">
          <Phone className="h-3.5 w-3.5" />
          {order.guestPhone || order.user?.phone || "No phone"}
        </p>
      </div>
    </div>
  );
}
