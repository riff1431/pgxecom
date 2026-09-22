"use client";

import { useGetMyOrders } from "@/lib/api/order";
import { CURRENCY, ORDER_STATUSES } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

export default function OrdersListPage() {
  const { data, isLoading } = useGetMyOrders({ limit: 20 });
  const orders = data?.data || [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Order History</h1>

      {isLoading ? (
        <div className="space-y-4">
           {Array.from({length: 4}).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded" />)}
        </div>
      ) : orders.length === 0 ? (
        <p className="text-gray-500">You haven't placed any orders yet.</p>
      ) : (
        <div className="overflow-x-auto border rounded-xl rounded-b-none border-b-none shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="font-semibold text-sm p-4 text-gray-600">Order #</th>
                <th className="font-semibold text-sm p-4 text-gray-600">Date</th>
                <th className="font-semibold text-sm p-4 text-gray-600">Status</th>
                <th className="font-semibold text-sm p-4 text-gray-600 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.map((order) => {
                 const statusConfig = ORDER_STATUSES[order.status] || { label: order.status, color: "bg-gray-100 text-gray-800" };
                 return (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-medium">
                      <Link href={`/my-account/orders/${order.id}`} className="text-emerald-600 hover:text-emerald-700 hover:underline">
                        #{order.orderNumber}
                      </Link>
                    </td>
                    <td className="p-4 text-sm text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="p-4">
                       <Badge className={`${statusConfig.color} font-normal border-0`}>{statusConfig.label}</Badge>
                    </td>
                    <td className="p-4 text-sm font-medium text-right">
                      {CURRENCY}{order.total.toLocaleString()} 
                      <div className="text-[10px] text-gray-400 font-normal">{order.items.length} items</div>
                    </td>
                  </tr>
                 );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
