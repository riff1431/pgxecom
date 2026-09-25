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
      <div className="bg-card rounded-2xl border border-border shadow-xs p-6 sticky top-24">
        <h2 className="text-xl font-bold mb-6 text-foreground font-mono">Order Summary</h2>
        <div className="space-y-4 mb-6">
          <div className="flex justify-between text-muted-foreground text-sm">
            <span>Subtotal</span>
            <span className="font-semibold text-foreground">{CURRENCY}{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground text-sm">
            <span>Estimated Shipping</span>
            <span className="text-xs text-muted-foreground italic">Calculated at checkout</span>
          </div>
          <div className="pt-4 border-t border-border flex justify-between font-bold text-lg text-foreground">
            <span>Total</span>
            <span className="text-primary font-black font-mono">{CURRENCY}{subtotal.toFixed(2)}</span>
          </div>
        </div>
        <Link href="/checkout" className={buttonVariants({ variant: "default", className: "w-full h-12 text-primary-foreground font-bold text-xs uppercase tracking-wider rounded-lg shadow-xs" })}>
          Proceed to Checkout <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
