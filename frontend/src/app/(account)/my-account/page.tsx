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
      color: "bg-blue-50 text-blue-600",
      borderColor: "border-blue-100",
    },
    {
      label: "Pending",
      value:
        ordersData?.data?.filter((o) => o.status === "PENDING").length || 0,
      icon: Clock,
      color: "bg-amber-50 text-amber-600",
      borderColor: "border-amber-100",
    },
    {
      label: "Profile Info",
      value: "100%",
      icon: User,
      color: "bg-emerald-50 text-emerald-600",
      borderColor: "border-emerald-100",
    },
  ];

  if (!user) return null;

  return (
    <div className="space-y-10 text-left">
      <header className="flex flex-col md:flex-row md:items-center gap-6 p-8 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-[2.5rem] border border-emerald-50">
        <Avatar className="w-20 h-20 border-4 border-white shadow-lg rounded-2xl">
          <AvatarImage
            src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${user.avatar}`}
          />
          <AvatarFallback className="bg-emerald-100 text-emerald-600 text-2xl font-black">
            {user.name?.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            Welcome back, {user.name}!
          </h1>
          <p className="text-gray-500 font-medium mt-1">
            Manage your orders, addresses and account settings all in one place.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`p-6 bg-white border ${stat.borderColor}  shadow-sm hover:shadow-md transition-all`}
          >
            <div className={`p-4 rounded-2xl w-fit ${stat.color} mb-4`}>
              <stat.icon className="h-6 w-6" />
            </div>
            <p className="text-3xl font-black text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mt-1">
              {stat.label}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-50 flex items-center justify-between">
            <h3 className="font-black text-gray-900 text-xl flex items-center gap-2">
              <Package className="w-5 h-5 text-emerald-600" /> Recent Orders
            </h3>
            <Link
              href="/my-account/orders"
              className="text-emerald-600 font-bold text-sm hover:underline flex items-center gap-1"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="p-4">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-16 bg-gray-50 animate-pulse rounded-2xl"
                  ></div>
                ))}
              </div>
            ) : ordersData?.data?.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-gray-400 font-medium">
                  No orders found yet.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {ordersData?.data?.slice(0, 3).map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-colors group"
                  >
                    <div>
                      <p className="font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">
                        {order.orderNumber}
                      </p>
                      <p className="text-xs text-gray-400 font-medium mt-1 uppercase tracking-wider">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-gray-900">৳{order.total}</p>
                      <span
                        className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                          order.status === "DELIVERED"
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-amber-50 text-amber-600"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-50">
            <h3 className="font-black text-gray-900 text-xl">
              Quick Management
            </h3>
          </div>
          <div className="p-8 grid grid-cols-1 gap-4">
            {[
              {
                title: "Shipping Addresses",
                desc: "Manage your delivery locations",
                href: "/my-account/addresses",
                icon: MapPin,
              },
              {
                title: "Account Settings",
                desc: "Update password and privacy",
                href: "/my-account/settings",
                icon: Settings,
              },
              {
                title: "Profile Information",
                desc: "Change name, email or avatar",
                href: "/my-account/profile",
                icon: User,
              },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-4 p-4 rounded-2xl hover:bg-emerald-50/50 border border-transparent hover:border-emerald-100 transition-all group"
              >
                <div className="p-3 bg-gray-50 rounded-xl group-hover:bg-white transition-colors">
                  <link.icon className="w-5 h-5 text-gray-400 group-hover:text-emerald-600" />
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-gray-900">{link.title}</h4>
                  <p className="text-xs text-gray-500 font-medium">
                    {link.desc}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 ml-auto text-gray-300 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
