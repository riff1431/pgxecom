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
        <div className="h-8 w-64 bg-muted rounded-xl"></div>
        <div className="space-y-4">
          <div className="h-64 bg-muted/60 rounded-2xl"></div>
          <div className="h-96 bg-muted/60 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-2xl font-heading font-bold text-foreground uppercase">Order not found</h2>
        <p className="text-muted-foreground mt-2 text-sm">
          The order you&apos;re looking for doesn&apos;t exist or you don&apos;t
          have access.
        </p>
        <Button
          onClick={() => router.push("/my-account/orders")}
          className="mt-6 bg-primary hover:bg-primary/90 font-bold rounded-xl text-primary-foreground font-mono"
        >
          Back to Orders
        </Button>
      </div>
    );
  }

  const statusConfig = ORDER_STATUSES[order.status] || {
    label: order.status,
    color: "bg-secondary text-secondary-foreground",
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
      <header className="pb-4 border-b border-border">
        <div>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-xs font-mono font-bold text-muted-foreground hover:text-primary transition-colors mb-3 uppercase tracking-wider cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Orders
          </button>
          <div className="flex flex-wrap items-center gap-4">
            <h1 className="text-2xl sm:text-3xl font-heading font-black text-foreground tracking-tight uppercase">
              Order #{order.orderNumber}
            </h1>
            <Badge
              className={`${statusConfig.color} font-mono text-xs font-bold px-3 py-1 rounded-full border-0 uppercase tracking-wider`}
            >
              {statusConfig.label}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-2 font-mono text-xs flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-primary" /> Placed on{" "}
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
        <section className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden">
          <div className="px-6 py-5 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Package className="w-5 h-5 text-primary" />
              <h2 className="font-heading font-bold text-foreground text-lg uppercase tracking-wide">Order Items</h2>
            </div>
            <span className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest">
              {order.items.length} Items
            </span>
          </div>
          <div className="divide-y divide-border">
            {order.items.map((item: OrderItem) => (
              <div
                key={item.id}
                className="p-6 flex items-center gap-5 group hover:bg-muted/40 transition-colors"
              >
                <div className="relative w-16 h-16 shrink-0 overflow-hidden rounded-xl bg-muted border border-border">
                  {item.product?.images?.[0]?.url ? (
                    <Image
                      src={resolveImageUrl(item.product.images[0].url)}
                      alt={item.productName}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <Box className="w-6 h-6" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-heading font-bold text-foreground text-sm truncate group-hover:text-primary transition-colors uppercase tracking-tight">
                    {item.productName}
                  </h4>
                  <p className="text-xs text-muted-foreground font-medium mt-0.5">
                    {item.variantName
                      ? `Variant: ${item.variantName}`
                      : "Standard Unit"}
                  </p>
                  <div className="flex items-center gap-4 mt-1.5">
                    <span className="text-xs font-mono font-bold text-primary">
                      {CURRENCY}
                      {Number(item.unitPrice).toLocaleString()} ×{" "}
                      {item.quantity}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono font-black text-foreground text-base">
                    {CURRENCY}
                    {Number(item.totalPrice).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-muted/30 p-6 space-y-3 border-t border-border">
            <div className="flex justify-between text-muted-foreground font-mono text-xs">
              <span>Subtotal</span>
              <span className="text-foreground">
                {CURRENCY}
                {Number(order.subtotal).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-muted-foreground font-mono text-xs">
              <span>Shipping Fee</span>
              <span className="text-foreground">
                {CURRENCY}
                {Number(order.shippingCost).toLocaleString()}
              </span>
            </div>
            {Number(order.discount) > 0 && (
              <div className="flex justify-between text-emerald-500 font-mono text-xs">
                <span>Discount</span>
                <span>
                  -{CURRENCY}
                  {Number(order.discount).toLocaleString()}
                </span>
              </div>
            )}
            <div className="pt-3 border-t border-border flex justify-between items-center">
              <span className="text-base font-heading font-black text-foreground uppercase tracking-wider">
                Total Payment
              </span>
              <span className="text-2xl font-mono font-black text-primary tracking-tight">
                {CURRENCY}
                {Number(order.total).toLocaleString()}
              </span>
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="bg-card rounded-2xl border border-border shadow-xs p-6 sm:p-8">
          <h2 className="font-heading font-bold text-foreground text-lg mb-8 flex items-center gap-3 uppercase tracking-wide">
            <Clock className="w-5 h-5 text-primary" /> Order Progress
          </h2>
          <div className="relative space-y-8">
            <div className="absolute left-3.25 top-2 bottom-2 w-0.5 bg-border"></div>
            {statusHistory.map((history: OrderStatusHistory, idx: number) => (
              <div
                key={history.id}
                className="relative flex items-center gap-6"
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center z-10 ${
                    idx === statusHistory.length - 1
                      ? "bg-primary shadow-sm ring-4 ring-primary/20"
                      : "bg-card border-2 border-border"
                  }`}
                >
                  {idx === statusHistory.length - 1 ? (
                    <CheckCircle2 className="w-4 h-4 text-primary-foreground" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-muted-foreground"></div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4
                      className={`font-mono font-black uppercase tracking-widest text-xs ${
                        idx === statusHistory.length - 1
                          ? "text-primary"
                          : "text-muted-foreground"
                      }`}
                    >
                      {ORDER_STATUSES[history.status]?.label || history.status}
                    </h4>
                    <span className="text-[10px] text-muted-foreground font-mono font-bold uppercase tracking-wider">
                      {new Date(history.createdAt).toLocaleDateString()}{" "}
                      {new Date(history.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-foreground text-sm font-medium">
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
