"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useGetMyOrders } from "@/lib/api/order";
import { useAuth } from "@/providers/AuthProvider";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Clock,
  MapPin,
  Package,
  Settings,
  ShoppingBag,
  User,
} from "lucide-react";
import Link from "next/link";

export default function AccountDashboard() {
  const { user } = useAuth();
  const { data: ordersData, isLoading } = useGetMyOrders({ limit: 5 });

  const stats = [
    {
      label: "Total Orders",
      value: ordersData?.meta?.total || 0,
      icon: ShoppingBag,
      color: "bg-[#00a3ff]/10 text-[#00a3ff]",
      borderColor: "border-slate-800",
    },
    {
      label: "Active / Pending",
      value:
        ordersData?.data?.filter((o) => o.status === "PENDING" || o.status === "PROCESSING").length || 0,
      icon: Clock,
      color: "bg-amber-500/10 text-amber-400",
      borderColor: "border-slate-800",
    },
    {
      label: "Athlete Status",
      value: "Verified",
      icon: User,
      color: "bg-emerald-500/10 text-emerald-400",
      borderColor: "border-slate-800",
    },
  ];

  if (!user) return null;

  return (
    <div className="space-y-8 text-left">
      {/* Welcome Card */}
      <header className="flex flex-col sm:flex-row sm:items-center gap-6 p-6 sm:p-8 bg-linear-to-r from-card to-muted/60 rounded-2xl border border-border shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <Avatar className="w-16 h-16">
          <AvatarImage
            src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${user.avatar}`}
            className="object-cover"
          />
          <AvatarFallback className="bg-primary/10 text-primary text-xl font-black font-mono">
            {user.name?.charAt(0)?.toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold">
              Account Overview
            </span>
            <span className="text-[10px] font-mono bg-secondary text-secondary-foreground border border-border px-2 py-0.5 rounded-md uppercase font-semibold">
              {user.role || "MEMBER"}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-foreground font-heading">
            Welcome back, {user.name}!
          </h1>
          <p className="text-muted-foreground font-normal text-xs sm:text-sm mt-1">
            Manage your orders, saved addresses and gear preferences in real-time.
          </p>
        </div>
      </header>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-5 sm:p-6 bg-card rounded-2xl border border-border shadow-xs hover:border-primary/40 transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-muted-foreground font-mono font-bold uppercase tracking-wider">
                {stat.label}
              </span>
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
            <p className="text-3xl font-black font-mono text-foreground tracking-tight">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Recent Orders */}
        <div className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden flex flex-col">
          <div className="p-5 sm:p-6 border-b border-border flex items-center justify-between">
            <h3 className="font-heading font-black text-foreground text-base sm:text-lg uppercase tracking-wide flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" /> Recent Orders
            </h3>
            <Link
              href="/my-account/orders"
              className="text-primary font-bold text-xs uppercase tracking-wider hover:text-primary/80 flex items-center gap-1 transition-colors font-mono"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="p-5 sm:p-6 flex-1">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-16 bg-muted/60 animate-pulse rounded-xl"
                  />
                ))}
              </div>
            ) : ordersData?.data?.length === 0 ? (
              <div className="py-12 text-center">
                <Package className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-60" />
                <p className="text-muted-foreground text-sm font-medium">
                  No orders found yet.
                </p>
                <Link
                  href="/products"
                  className="inline-block mt-3 text-xs font-mono font-bold text-primary uppercase tracking-wider hover:underline"
                >
                  Explore Gear &rarr;
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {ordersData?.data?.slice(0, 3).map((order) => (
                  <Link
                    key={order.id}
                    href={`/my-account/orders/${order.id}`}
                    className="flex items-center justify-between p-4 bg-muted/40 hover:bg-muted/80 border border-border hover:border-primary/40 rounded-xl transition-all group"
                  >
                    <div>
                      <p className="font-mono font-bold text-foreground text-sm group-hover:text-primary transition-colors">
                        #{order.orderNumber}
                      </p>
                      <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-black text-foreground text-sm">€{Number(order.total).toLocaleString()}</p>
                      <span
                        className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          order.status === "DELIVERED"
                            ? "bg-emerald-500/10 text-emerald-500 dark:text-emerald-400"
                            : "bg-primary/10 text-primary"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Management */}
        <div className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-border">
            <h3 className="font-heading font-black text-foreground text-base sm:text-lg uppercase tracking-wide">
              Quick Management
            </h3>
          </div>
          <div className="p-5 sm:p-6 grid grid-cols-1 gap-3">
            {[
              {
                title: "Shipping Addresses",
                desc: "Manage delivery destinations and default shipping location",
                href: "/my-account/addresses",
                icon: MapPin,
              },
              {
                title: "Security & Passwords",
                desc: "Update account credentials and security settings",
                href: "/my-account/settings",
                icon: Settings,
              },
              {
                title: "Athlete Profile",
                desc: "Edit personal info, display name, and avatar",
                href: "/my-account/profile",
                icon: User,
              },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted border border-border hover:border-primary/40 transition-all group"
              >
                <div className="p-3 bg-secondary rounded-xl group-hover:bg-primary/15 transition-colors">
                  <link.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <div className="text-left flex-1 min-w-0">
                  <h4 className="font-bold text-foreground text-sm group-hover:text-primary transition-colors">
                    {link.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate font-normal">
                    {link.desc}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
