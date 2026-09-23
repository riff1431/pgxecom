"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTrackOrder } from "@/lib/api/order";
import { CURRENCY } from "@/lib/constants";
import { format } from "date-fns";
import { CheckCircle, Clock, Package, Search, Truck } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(
    searchParams.get("orderNumber") || "",
  );
  const [phone, setPhone] = useState("");
  const [isSearched, setIsSearched] = useState(false);

  // Auto-search if coming from order confirmation (if phone was available, but it's usually not in URL)
  // For now, let user enter phone.

  const { data: order, isLoading, error } = useTrackOrder(orderNumber, phone);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearched(true);
  };

  const steps = [
    { status: "PENDING", label: "Order Placed", icon: Clock },
    { status: "PROCESSING", label: "Processing", icon: Package },
    { status: "SHIPPED", label: "Shipped", icon: Truck },
    { status: "DELIVERED", label: "Delivered", icon: CheckCircle },
  ];

  const currentStatusIndex = steps.findIndex(
    (step) => step.status === order?.status,
  );

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl min-h-screen">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">
          Track Your Order
        </h1>
        <p className="text-gray-600 max-w-md mx-auto">
          See exactly where your package is and get real-time status updates.
        </p>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 p-8 mb-10 transition-all">
        <form onSubmit={handleSearch} className="grid md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 ml-1">
              Order Number
            </label>
            <Input
              placeholder="e.g. ORD-2026..."
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              className="h-14 rounded-2xl border-gray-200 focus:ring-emerald-500 focus:border-emerald-500 bg-gray-50/50"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 ml-1">
              Phone Number
            </label>
            <Input
              placeholder="Enter your phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-14 rounded-2xl border-gray-200 focus:ring-emerald-500 focus:border-emerald-500 bg-gray-50/50"
              required
            />
          </div>
          <div className="flex items-end">
            <Button
              type="submit"
              className="w-full h-14 bg-[#060b13] hover:bg-slate-800 text-white rounded-2xl shadow-lg text-sm font-bold uppercase tracking-wider transition-all"
            >
              <Search className="w-4 h-4 mr-2 text-[#00a3ff]" />
              Track Package
            </Button>
          </div>
        </form>
      </div>

      {isLoading && isSearched && (
        <div className="text-center py-20 animate-pulse">
          <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="h-8 w-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-500 font-medium">Locating your package...</p>
        </div>
      )}

      {error && isSearched && !isLoading && (
        <div className="bg-red-50 border-2 border-red-100 text-red-700 p-8  text-center animate-in zoom-in-95 duration-300">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
            <Search className="w-8 h-8" />
          </div>
          <p className="text-xl font-bold">No Order Found</p>
          <p className="text-sm mt-2 max-w-xs mx-auto text-red-600/80">
            We couldn't find an order with that number and phone combination.
            Please double-check your inputs.
          </p>
        </div>
      )}

      {order && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          {/* Status Tracker */}
          <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 md:p-12 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-emerald-600 mb-1">
                  Status Overview
                </p>
                <h2 className="text-3xl font-bold text-gray-900">
                  {order.status === "DELIVERED"
                    ? "Successfully Delivered"
                    : "In Progress"}
                </h2>
              </div>
              <div className="bg-gray-50 px-6 py-3 rounded-2xl border border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                  Order Date
                </p>
                <p className="font-bold text-gray-900">
                  {format(new Date(order.createdAt), "PPP")}
                </p>
              </div>
            </div>

            <div className="relative pb-4">
              {/* Progress Line */}
              <div className="absolute top-[24px] left-6 md:left-0 w-[calc(100%-48px)] md:w-full h-1.5 bg-gray-100 rounded-full hidden md:block" />
              <div className="absolute top-[24px] left-0 h-1.5 bg-[#00a3ff] transition-all duration-1000 ease-out rounded-full hidden md:block"
                style={{
                  width: `${(Math.max(0, currentStatusIndex) / (steps.length - 1)) * 100}%`,
                }}
              />

              <div className="relative flex flex-col md:flex-row justify-between gap-10 md:gap-0">
                {steps.map((step, idx) => {
                  const Icon = step.icon;
                  const isCompleted = idx <= currentStatusIndex;
                  const isCurrent = idx === currentStatusIndex;

                  return (
                    <div
                      key={step.status}
                      className="flex flex-row md:flex-col items-center gap-6 md:gap-0"
                    >
                      <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center z-10 transition-all duration-700 shadow-lg ${isCompleted
                          ? "bg-[#060b13] text-[#00a3ff] border border-slate-800 shadow-md"
                          : "bg-white border-2 border-slate-200 text-slate-300"
                          } ${isCurrent ? "scale-125 ring-[8px] ring-[#00a3ff]/20 border-[#00a3ff]" : ""}`}
                      >
                        <Icon className="w-7 h-7" />
                      </div>
                      <div className="md:mt-6 text-left md:text-center">
                        <p
                          className={`text-sm sm:text-base font-black uppercase font-mono tracking-tight ${isCompleted ? "text-slate-900" : "text-slate-400"}`}
                        >
                          {step.label}
                        </p>
                        {isCurrent && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#00a3ff]/10 text-[#00a3ff] uppercase tracking-wider mt-1 font-mono border border-[#00a3ff]/20">
                            Current Stage
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
              <h3 className="font-bold text-xl mb-6 flex items-center gap-3 text-slate-900 font-mono uppercase">
                <div className="p-2 bg-slate-900 rounded-lg text-[#00a3ff]">
                  <Truck className="w-5 h-5" />
                </div>
                Delivery Information
              </h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-1 h-auto bg-[#00a3ff] rounded-full" />
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest font-mono">
                      Recipient
                    </p>
                    <p className="font-bold text-slate-900 text-lg">
                      {order.guestName}
                    </p>
                    <p className="text-sm text-slate-500">{order.guestPhone}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-1 h-auto bg-slate-300 rounded-full" />
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest font-mono">
                      Address
                    </p>
                    <p className="mt-1 font-semibold text-slate-800 leading-relaxed text-sm">
                      {order.shippingAddress.street}
                      <br />
                      {order.shippingAddress.area}, {order.shippingAddress.city}
                      <br />
                      {order.shippingAddress.zone.replace("_", " ")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
              <h3 className="font-bold text-xl mb-6 flex items-center gap-3 text-slate-900 font-mono uppercase">
                <div className="p-2 bg-slate-900 rounded-lg text-[#00a3ff]">
                  <Package className="w-5 h-5" />
                </div>
                Order Summary
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Subtotal</span>
                  <span className="font-mono font-bold text-slate-900">
                    {CURRENCY}
                    {order.subtotal}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">
                    Shipping Fee
                  </span>
                  <span className="font-mono font-bold text-slate-900">
                    {CURRENCY}
                    {order.shippingCost}
                  </span>
                </div>
                {Number(order.discount) > 0 && (
                  <div className="flex justify-between items-center py-2 border-b border-slate-100 text-[#00a3ff]">
                    <span className="font-medium">Coupon Discount</span>
                    <span className="font-mono font-bold">
                      -{CURRENCY}
                      {order.discount}
                    </span>
                  </div>
                )}
                <div className="pt-4 flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-400">
                    Total Price
                  </span>
                  <div className="text-right">
                    <span className="text-3xl font-black text-gray-900 tracking-tighter">
                      {CURRENCY}
                      {order.total}
                    </span>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                      Paid via {order.paymentMethod.replace(/_/g, " ")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TrackOrderContent />
    </Suspense>
  );
}
