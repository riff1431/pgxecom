"use client";

import type { Order } from "@/types";
import { Mail, Phone, User } from "lucide-react";

interface OrderCustomerCardProps {
  order: Order;
}

export function OrderCustomerCard({ order }: OrderCustomerCardProps) {
  return (
    <div className="space-y-4 rounded-xl border border-slate-800 bg-[#0b1322] p-5 shadow-sm">
      <h3 className="flex items-center gap-2 border-b border-slate-800 pb-2 font-mono uppercase tracking-wider text-sm font-semibold text-white">
        <User className="h-4 w-4 text-[#00a3ff]" /> Customer
      </h3>

      <div>
        <p className="font-medium text-white">
          {order.guestName || order.user?.name}
        </p>
        <p className="mt-1 flex items-center gap-2 text-sm text-slate-400">
          <Mail className="h-3.5 w-3.5 text-slate-500" />
          {order.guestEmail || order.user?.email || "No email"}
        </p>
        <p className="mt-1 flex items-center gap-2 text-sm text-slate-400">
          <Phone className="h-3.5 w-3.5 text-slate-500" />
          {order.guestPhone || order.user?.phone || "No phone"}
        </p>
      </div>
    </div>
  );
}
