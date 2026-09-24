"use client";

import { use } from "react";
import Link from "next/link";
import { CheckCircle2, Package, ShoppingBag, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { buttonVariants } from "@/components/ui/button";

export default function OrderConfirmationPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = use(params);

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-16 px-4 bg-white">
      <div className="max-w-xl w-full text-center">
        <div className="flex justify-center mb-6">
          <Link href="/" className="inline-flex items-center">
            <img
              src="/logo.png"
              alt="PGX Logo"
              className="h-12 w-auto object-contain"
            />
          </Link>
        </div>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 12, stiffness: 200 }}
          className="w-20 h-20 bg-slate-900 border border-slate-800 text-[#00a3ff] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl"
        >
          <CheckCircle2 className="w-10 h-10" />
        </motion.div>

        <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#00a3ff]">
          Order Processed
        </span>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-slate-900 font-mono mt-1 mb-4"
        >
          Order Confirmed!
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-sm sm:text-base text-slate-600 mb-8 max-w-md mx-auto"
        >
          Thank you for choosing PGX. Your order <span className="font-bold font-mono text-slate-950">#{orderNumber}</span> has been confirmed and scheduled for dispatch.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="group bg-[#f8fafc] border border-slate-200/90 rounded-2xl p-6 mb-10 text-left shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-start gap-4">
            <div className="mt-0.5 bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-[#00a3ff] shrink-0">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-mono font-bold uppercase text-xs tracking-wider text-slate-900">What Happens Next?</h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                We are preparing your package for courier dispatch. You will receive real-time courier tracking details via email.
              </p>
            </div>
          </div>
        </motion.div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/shop"
            className="w-full sm:w-auto h-12 px-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs uppercase tracking-wider flex items-center justify-center transition-colors"
          >
            <ShoppingBag className="mr-2 h-4 w-4" />
            Continue Shopping
          </Link>
          <Link
            href={`/orders/track?orderNumber=${orderNumber}`}
            className="w-full sm:w-auto h-12 px-8 rounded-lg bg-[#060b13] hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-colors"
          >
            Track My Order
            <ArrowRight className="ml-2 h-4 w-4 text-[#00a3ff]" />
          </Link>
        </div>
      </div>
    </div>
  );
}
