"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { CURRENCY } from "@/lib/constants";

interface CartSummaryProps {
  subtotal: number;
}

export function CartSummary({ subtotal }: CartSummaryProps) {
  return (
    <div className="w-full lg:w-96 shrink-0">
      <div className="bg-white rounded-2xl border shadow-sm p-6 sticky top-24">
        <h2 className="text-xl font-bold mb-6 text-gray-900">Order Summary</h2>
        <div className="space-y-4 mb-6">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>{CURRENCY}{subtotal}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Estimated Shipping</span>
            <span className="text-sm text-gray-400 italic">Calculated at checkout</span>
          </div>
          <div className="pt-4 border-t flex justify-between font-bold text-lg text-gray-900">
            <span>Total</span>
            <span>{CURRENCY}{subtotal}</span>
          </div>
        </div>
        <Link href="/checkout" className={buttonVariants({ className: "w-full h-12 bg-[#060b13] hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-lg" })}>
          Proceed to Checkout <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
