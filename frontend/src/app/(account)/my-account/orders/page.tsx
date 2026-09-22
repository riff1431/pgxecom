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
    <div className="space-y-6 text-left">
      <header className="pb-4 border-b border-slate-800">
        <span className="text-[10px] font-mono uppercase tracking-widest text-[#00a3ff] font-bold block mb-1">
          History & Invoices
        </span>
        <h1 className="text-2xl sm:text-3xl font-mono font-black text-white uppercase tracking-tight">
          Order History
        </h1>
        <p className="text-xs text-slate-400 mt-1 font-mono">
          Review past equipment orders, track shipments, and access invoices.
        </p>
      </header>

      {isLoading ? (
        <div className="space-y-3">
           {Array.from({length: 4}).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl bg-slate-900/80" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="py-16 text-center bg-[#080d16] rounded-2xl border border-dashed border-slate-800">
          <p className="text-slate-400 font-medium">You haven't placed any orders yet.</p>
          <Link
            href="/products"
            className="inline-block mt-3 text-xs font-mono font-bold text-[#00a3ff] uppercase tracking-wider hover:underline"
          >
            Explore Catalog &rarr;
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto border border-slate-800 rounded-xl bg-[#080d16] shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-slate-900/80 border-b border-slate-800">
              <tr>
                <th className="font-mono uppercase tracking-wider text-xs p-4 text-slate-400 font-bold">Order #</th>
                <th className="font-mono uppercase tracking-wider text-xs p-4 text-slate-400 font-bold">Date</th>
                <th className="font-mono uppercase tracking-wider text-xs p-4 text-slate-400 font-bold">Status</th>
                <th className="font-mono uppercase tracking-wider text-xs p-4 text-slate-400 font-bold text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {orders.map((order) => {
                 const statusConfig = ORDER_STATUSES[order.status] || { label: order.status, color: "bg-slate-800 text-slate-300" };
                 return (
                  <tr key={order.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="p-4 font-mono font-bold text-sm">
                      <Link href={`/my-account/orders/${order.id}`} className="text-[#00a3ff] hover:text-cyan-300 hover:underline">
                        #{order.orderNumber}
                      </Link>
                    </td>
                    <td className="p-4 text-sm text-slate-400 font-mono">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="p-4">
                       <Badge className={`${statusConfig.color} font-mono text-[10px] font-bold uppercase tracking-wider border-0`}>{statusConfig.label}</Badge>
                    </td>
                    <td className="p-4 text-sm font-mono font-bold text-white text-right">
                      {CURRENCY}{Number(order.total).toLocaleString()} 
                      <div className="text-[10px] text-slate-500 font-normal font-sans">{order.items?.length || 0} items</div>
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
