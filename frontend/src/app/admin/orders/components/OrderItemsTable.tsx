"use client";

import { CURRENCY } from "@/lib/constants";
import type { Order, OrderItem } from "@/types";
import { Package } from "lucide-react";

interface OrderItemsTableProps {
  order: Order;
}

export function OrderItemsTable({ order }: OrderItemsTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
      <div className="border-b bg-gray-50 p-5">
        <h3 className="flex items-center gap-2 font-semibold text-gray-900">
          <Package className="h-4 w-4 text-gray-500" /> Items Ordered
        </h3>
      </div>

      <div className="p-0">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-gray-50/50">
            <tr>
              <th className="p-4 font-medium text-gray-500">Product</th>
              <th className="p-4 text-center font-medium text-gray-500">Qty</th>
              <th className="p-4 text-right font-medium text-gray-500">
                Price
              </th>
              <th className="p-4 text-right font-medium text-gray-500">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {order.items.map((item: OrderItem) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="p-4">
                  <p className="font-medium text-gray-900">
                    {item.productName}
                  </p>
                  {item.variantName && (
                    <p className="text-xs text-gray-500">
                      Variant: {item.variantName}
                    </p>
                  )}
                </td>
                <td className="p-4 text-center font-medium">{item.quantity}</td>
                <td className="p-4 text-right">
                  {CURRENCY}
                  {item.unitPrice}
                </td>
                <td className="p-4 text-right font-medium text-gray-900">
                  {CURRENCY}
                  {item.totalPrice}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-2 border-t bg-gray-50/30 p-5">
        <div className="flex justify-end gap-10 text-sm">
          <span className="text-gray-500">Subtotal:</span>
          <span className="w-24 text-right font-medium">
            {CURRENCY}
            {order.subtotal}
          </span>
        </div>

        {order.discount > 0 && (
          <div className="flex justify-end gap-10 text-sm">
            <span className="text-gray-500">
              Discount{order.coupon ? ` (${order.coupon.code})` : ""}:
            </span>
            <span className="w-24 text-right font-medium text-emerald-600">
              -{CURRENCY}
              {order.discount}
            </span>
          </div>
        )}

        <div className="flex justify-end gap-10 text-sm">
          <span className="text-gray-500">Shipping:</span>
          <span className="w-24 text-right font-medium">
            {CURRENCY}
            {order.shippingCost || 0}
          </span>
        </div>

        <div className="mt-3 flex justify-end gap-10 border-t pt-3 text-base">
          <span className="font-bold text-gray-900">Total:</span>
          <span className="w-24 text-right font-bold text-emerald-600">
            {CURRENCY}
            {order.total}
          </span>
        </div>
      </div>
    </div>
  );
}
