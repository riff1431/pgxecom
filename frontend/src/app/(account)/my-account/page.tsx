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
      <header className="flex flex-col sm:flex-row sm:items-center gap-6 p-6 sm:p-8 bg-gradient-to-r from-[#0d1726] to-[#080d16] rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-48 h-48 bg-[#00a3ff]/10 rounded-full blur-3xl pointer-events-none" />
        <Avatar className="w-16 h-16 border-2 border-[#00a3ff] shadow-lg rounded-xl shrink-0">
          <AvatarImage
            src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${user.avatar}`}
          />
          <AvatarFallback className="bg-slate-900 text-[#00a3ff] text-xl font-black font-mono">
            {user.name?.charAt(0) || "U"}
          </AvatarFallback>
        </Avatar>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#00a3ff] font-bold">
              Account Overview
            </span>
            <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded uppercase">
              {user.role || "MEMBER"}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white font-mono">
            Welcome back, {user.name}!
          </h1>
          <p className="text-slate-400 font-medium text-xs sm:text-sm mt-1">
            Manage your orders, saved addresses and gear preferences in real-time.
          </p>
        </div>
      </header>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 bg-[#080d16] rounded-2xl border border-slate-800 shadow-md hover:border-slate-700 transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-slate-400 font-mono font-bold uppercase tracking-wider">
                {stat.label}
              </span>
              <div className={`p-2.5 rounded-xl ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
            <p className="text-3xl font-black font-mono text-white tracking-tight">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-[#080d16] rounded-2xl border border-slate-800 shadow-md overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
            <h3 className="font-mono font-black text-white text-lg uppercase tracking-wide flex items-center gap-2">
              <Package className="w-5 h-5 text-[#00a3ff]" /> Recent Orders
            </h3>
            <Link
              href="/my-account/orders"
              className="text-[#00a3ff] font-bold text-xs uppercase tracking-wider hover:text-cyan-300 flex items-center gap-1 transition-colors font-mono"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="p-6 flex-1">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-16 bg-slate-900/80 animate-pulse rounded-xl"
                  />
                ))}
              </div>
            ) : ordersData?.data?.length === 0 ? (
              <div className="py-12 text-center">
                <Package className="w-10 h-10 text-slate-600 mx-auto mb-3 opacity-60" />
                <p className="text-slate-400 text-sm font-medium">
                  No orders found yet.
                </p>
                <Link
                  href="/products"
                  className="inline-block mt-3 text-xs font-mono font-bold text-[#00a3ff] uppercase tracking-wider hover:underline"
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
                    className="flex items-center justify-between p-4 bg-slate-900/60 hover:bg-slate-900 border border-slate-800/60 hover:border-slate-700 rounded-xl transition-all group"
                  >
                    <div>
                      <p className="font-mono font-bold text-white text-sm group-hover:text-[#00a3ff] transition-colors">
                        #{order.orderNumber}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-black text-white text-sm">€{Number(order.total).toLocaleString()}</p>
                      <span
                        className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          order.status === "DELIVERED"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-[#00a3ff]/10 text-[#00a3ff]"
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
        <div className="bg-[#080d16] rounded-2xl border border-slate-800 shadow-md overflow-hidden">
          <div className="p-6 border-b border-slate-800/80">
            <h3 className="font-mono font-black text-white text-lg uppercase tracking-wide">
              Quick Management
            </h3>
          </div>
          <div className="p-6 grid grid-cols-1 gap-3">
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
                className="flex items-center gap-4 p-4 rounded-xl bg-slate-900/50 hover:bg-slate-900 border border-slate-800/60 hover:border-slate-700 transition-all group"
              >
                <div className="p-3 bg-slate-800/80 rounded-xl group-hover:bg-[#00a3ff]/10 transition-colors">
                  <link.icon className="w-5 h-5 text-slate-400 group-hover:text-[#00a3ff] transition-colors" />
                </div>
                <div className="text-left flex-1 min-w-0">
                  <h4 className="font-bold text-white text-sm group-hover:text-[#00a3ff] transition-colors">
                    {link.title}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5 truncate font-normal">
                    {link.desc}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-[#00a3ff] group-hover:translate-x-1 transition-all shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
