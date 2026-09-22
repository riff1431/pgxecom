"use client";

import { use } from "react";
import Link from "next/link";
import { CheckCircle2, Package, ShoppingBag, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { buttonVariants } from "@/components/ui/button";

export default function OrderConfirmationPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = use(params);
  
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4 bg-gray-50/30">
      <div className="max-w-xl w-full text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 12, stiffness: 200 }}
          className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner"
        >
          <CheckCircle2 className="w-12 h-12" />
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-4xl font-bold text-gray-900 mb-4"
        >
          Order Confirmed!
        </motion.h1>
        
        <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg text-gray-600 mb-8"
        >
          Thank you for your purchase. Your order <span className="font-bold text-emerald-700">#{orderNumber}</span> has been placed successfully and is being processed.
        </motion.p>

        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="group bg-white border border-emerald-100 rounded-2xl p-6 mb-10 text-left shadow-sm hover:shadow-md transition-shadow"
        >
            <div className="flex items-start gap-4">
                <div className="mt-1 bg-emerald-50 p-2 rounded-lg text-emerald-600 shadow-sm transition-transform group-hover:scale-110">
                    <Package className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="font-semibold text-emerald-900">What happens next?</h3>
                    <p className="text-sm text-emerald-700 mt-1">
                        We'll send you an email confirmation with your order details and tracking link shortly. You can also track your order status using the button below.
                    </p>
                </div>
            </div>
        </motion.div>

        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
        >
            <Link 
                href="/shop" 
                className={buttonVariants({ variant: "outline", size: "lg", className: "h-14 px-8 rounded-full border-gray-200 hover:bg-white hover:border-emerald-500 hover:text-emerald-700 transition-all shadow-sm" })}
            >
                <ShoppingBag className="mr-2 h-5 w-5" />
                Continue Shopping
            </Link>
            <Link 
                href={`/orders/track?orderNumber=${orderNumber}`} 
                className={buttonVariants({ size: "lg", className: "h-14 px-8 rounded-full bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200" })}
            >
                Track My Order
                <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
        </motion.div>
      </div>
    </div>
  );
}
