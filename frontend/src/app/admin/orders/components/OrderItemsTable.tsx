"use client";

import { CURRENCY } from "@/lib/constants";
import type { Order, OrderItem } from "@/types";
import { Package } from "lucide-react";

interface OrderItemsTableProps {
  order: Order;
}

export function OrderItemsTable({ order }: OrderItemsTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-800 bg-[#0b1322] shadow-sm">
      <div className="border-b border-slate-800 bg-[#080e18] p-5">
        <h3 className="flex items-center gap-2 font-mono uppercase tracking-wider text-sm font-semibold text-white">
          <Package className="h-4 w-4 text-[#00a3ff]" /> Items Ordered
        </h3>
      </div>

      <div className="p-0 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-800 bg-[#080e18]">
            <tr>
              <th className="p-4 font-medium text-slate-400">Product</th>
              <th className="p-4 text-center font-medium text-slate-400">Qty</th>
              <th className="p-4 text-right font-medium text-slate-400">
                Price
              </th>
              <th className="p-4 text-right font-medium text-slate-400">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {order.items.map((item: OrderItem) => (
              <tr key={item.id} className="hover:bg-[#070d18]/50">
                <td className="p-4">
                  <p className="font-medium text-white">
                    {item.productName}
                  </p>
                  {item.variantName && (
                    <p className="text-xs text-slate-400">
                      Variant: {item.variantName}
                    </p>
                  )}
                </td>
                <td className="p-4 text-center font-medium text-slate-300">{item.quantity}</td>
                <td className="p-4 text-right text-slate-300">
                  {CURRENCY}
                  {item.unitPrice}
                </td>
                <td className="p-4 text-right font-medium text-white">
                  {CURRENCY}
                  {item.totalPrice}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-2 border-t border-slate-800 bg-[#080e18] p-5">
        <div className="flex justify-end gap-10 text-sm">
          <span className="text-slate-400">Subtotal:</span>
          <span className="w-24 text-right font-medium text-white">
            {CURRENCY}
            {order.subtotal}
          </span>
        </div>

        {order.discount > 0 && (
          <div className="flex justify-end gap-10 text-sm">
            <span className="text-slate-400">
              Discount{order.coupon ? ` (${order.coupon.code})` : ""}:
            </span>
            <span className="w-24 text-right font-medium text-emerald-400">
              -{CURRENCY}
              {order.discount}
            </span>
          </div>
        )}

        <div className="flex justify-end gap-10 text-sm">
          <span className="text-slate-400">Shipping:</span>
          <span className="w-24 text-right font-medium text-white">
            {CURRENCY}
            {order.shippingCost || 0}
          </span>
        </div>

        <div className="mt-3 flex justify-end gap-10 border-t border-slate-800 pt-3 text-base">
          <span className="font-bold text-white font-mono uppercase">Total:</span>
          <span className="w-24 text-right font-bold text-[#00a3ff] font-mono text-lg">
            {CURRENCY}
            {order.total}
          </span>
        </div>
      </div>
    </div>
  );
}
