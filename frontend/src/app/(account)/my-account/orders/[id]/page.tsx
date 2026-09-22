"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGetMyOrderDetails } from "@/lib/api/order";
import { CURRENCY, ORDER_STATUSES } from "@/lib/constants";
import type { OrderItem, OrderStatusHistory } from "@/types";
import {
  Box,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  Clock,
  Package,
} from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";

export default function OrderDetailsPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const { data: order, isLoading, error } = useGetMyOrderDetails(id);

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse text-left">
        <div className="h-8 w-64 bg-gray-200 rounded"></div>
        <div className="space-y-4">
          <div className="h-64 bg-gray-100 "></div>
          <div className="h-96 bg-gray-100 "></div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-2xl font-bold">Order not found</h2>
        <p className="text-gray-500 mt-2">
          The order you&apos;re looking for doesn&apos;t exist or you don&apos;t
          have access.
        </p>
        <Button
          onClick={() => router.push("/my-account/orders")}
          className="mt-6 bg-emerald-600 rounded-xl"
        >
          Back to Orders
        </Button>
      </div>
    );
  }

  const statusConfig = ORDER_STATUSES[order.status] || {
    label: order.status,
    color: "bg-gray-100 text-gray-800",
  };

  const resolveImageUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    const base = process.env.NEXT_PUBLIC_IMAGE_BASE_URL || "";
    return `${base}${url}`;
  };

  const statusHistory: OrderStatusHistory[] = order.statusHistory ?? [];

  return (
    <div className="space-y-8 text-left">
      <header className="">
        <div>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-emerald-600 transition-colors mb-4"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Orders
          </button>
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">
              Order #{order.orderNumber}
            </h1>
            <Badge
              className={`${statusConfig.color} font-bold px-4 py-1 rounded-full border-0`}
            >
              {statusConfig.label}
            </Badge>
          </div>
          <p className="text-gray-500 mt-2 font-medium flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Placed on{" "}
            {new Date(order.createdAt).toLocaleDateString("en-US", {
              dateStyle: "long",
            })}{" "}
            at{" "}
            {new Date(order.createdAt).toLocaleTimeString("en-US", {
              timeStyle: "short",
            })}
          </p>
        </div>
      </header>

      <div className="space-y-8">
        {/* Order Items */}
        <section className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/20 overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Package className="w-6 h-6 text-emerald-600" />
              <h2 className="font-bold text-gray-900 text-xl">Order Items</h2>
            </div>
            <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">
              {order.items.length} Items
            </span>
          </div>
          <div className="divide-y divide-gray-50">
            {order.items.map((item: OrderItem) => (
              <div
                key={item.id}
                className="p-8 flex items-center gap-6 group hover:bg-gray-50/50 transition-colors"
              >
                <div className="relative w-20 h-20 shrink-0 overflow-hidden rounded-2xl bg-gray-100 shadow-inner">
                  {item.product?.images?.[0]?.url ? (
                    <Image
                      src={resolveImageUrl(item.product.images[0].url)}
                      alt={item.productName}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <Box className="w-8 h-8" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-900 truncate group-hover:text-emerald-600 transition-colors uppercase tracking-tight">
                    {item.productName}
                  </h4>
                  <p className="text-sm text-gray-500 font-medium mt-1">
                    {item.variantName
                      ? `Variant: ${item.variantName}`
                      : "Standard Unit"}
                  </p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-sm font-black text-emerald-600">
                      {CURRENCY}
                      {Number(item.unitPrice).toLocaleString()} ×{" "}
                      {item.quantity}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-gray-900 text-lg">
                    {CURRENCY}
                    {Number(item.totalPrice).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-gray-50/50 p-8 space-y-3">
            <div className="flex justify-between text-gray-500 font-medium text-sm">
              <span>Subtotal</span>
              <span>
                {CURRENCY}
                {Number(order.subtotal).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-gray-500 font-medium text-sm">
              <span>Shipping Fee</span>
              <span>
                {CURRENCY}
                {Number(order.shippingCost).toLocaleString()}
              </span>
            </div>
            {Number(order.discount) > 0 && (
              <div className="flex justify-between text-emerald-600 font-medium text-sm">
                <span>Discount</span>
                <span>
                  -{CURRENCY}
                  {Number(order.discount).toLocaleString()}
                </span>
              </div>
            )}
            <div className="pt-3 border-t border-gray-200 flex justify-between">
              <span className="text-xl font-black text-gray-900 tracking-tight">
                Total Payment
              </span>
              <span className="text-2xl font-black text-emerald-600 tracking-tight">
                {CURRENCY}
                {Number(order.total).toLocaleString()}
              </span>
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/20 p-8">
          <h2 className="font-bold text-gray-900 text-xl mb-8 flex items-center gap-3">
            <Clock className="w-6 h-6 text-emerald-600" /> Order Progress
          </h2>
          <div className="relative space-y-8">
            <div className="absolute left-3.25 top-2 bottom-2 w-0.5 bg-gray-100"></div>
            {statusHistory.map((history: OrderStatusHistory, idx: number) => (
              <div
                key={history.id}
                className="relative flex items-center gap-6"
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center z-10 ${
                    idx === statusHistory.length - 1
                      ? "bg-emerald-600 shadow-lg shadow-emerald-100"
                      : "bg-white border-2 border-gray-100"
                  }`}
                >
                  {idx === statusHistory.length - 1 ? (
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4
                      className={`font-black uppercase tracking-widest text-xs ${
                        idx === statusHistory.length - 1
                          ? "text-emerald-600"
                          : "text-gray-400"
                      }`}
                    >
                      {ORDER_STATUSES[history.status]?.label || history.status}
                    </h4>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                      {new Date(history.createdAt).toLocaleDateString()}{" "}
                      {new Date(history.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-gray-600 font-medium">
                    {history.note || "Order status updated"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
