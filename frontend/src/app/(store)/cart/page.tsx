"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useCartStore } from "@/store/cart.store";
import { buttonVariants } from "@/components/ui/button";
import { resolveCheckoutReturnTarget } from "@/services/wallet.service";
import { CartItemsTable } from "./components/CartItemsTable";
import { CartSummary } from "./components/CartSummary";

function CartPageContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status") || "";
  const orderParam = searchParams.get("order") || "";
  const rawRet = searchParams.get("ret") || "";
  const isCancelledBridge = status === "cancelled" && Boolean(orderParam || rawRet);

  const [redirectUrl, setRedirectUrl] = useState<string>("");
  const [checkingRedirect, setCheckingRedirect] = useState<boolean>(isCancelledBridge);
  const { items, updateQuantity, removeItem, clearCart, subtotal } = useCartStore();

  useEffect(() => {
    if (!isCancelledBridge) return;
    let cancelled = false;

    const buildCancelUrl = (base: string) => {
      const separator = base.includes("?") ? "&" : "?";
      return `${base}${separator}status=cancelled&method=stripe_ecom`;
    };

    const resolveAndRedirect = async () => {
      let targetBase = "";
      if (orderParam) {
        targetBase = (await resolveCheckoutReturnTarget(orderParam)) || "";
      }
      if (!targetBase && rawRet) {
        try {
          targetBase = decodeURIComponent(rawRet);
        } catch {
          targetBase = rawRet;
        }
      }

      if (cancelled) return;

      if (targetBase) {
        const dest = buildCancelUrl(targetBase);
        setRedirectUrl(dest);
        window.location.href = dest;
      } else {
        setCheckingRedirect(false);
      }
    };

    void resolveAndRedirect();

    return () => {
      cancelled = true;
    };
  }, [isCancelledBridge, orderParam, rawRet]);

  if (checkingRedirect || redirectUrl) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-md">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Checkout Cancelled</h1>
        <p className="text-gray-600 mb-6">Returning you to your previous page...</p>
        {redirectUrl && (
          <a
            href={redirectUrl}
            className={buttonVariants({ className: "w-full bg-emerald-600 hover:bg-emerald-700 h-12" })}
          >
            Return Now
          </a>
        )}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-md">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Cart is Empty</h1>
        <p className="text-gray-600 mb-8">It looks like you haven't added any products to your cart yet.</p>
        <Link href="/shop" className={buttonVariants({ className: "w-full bg-emerald-600 hover:bg-emerald-700 h-12" })}>
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

      <div className="flex flex-col lg:flex-row gap-10">
        <CartItemsTable 
          items={items} 
          updateQuantity={updateQuantity} 
          removeItem={removeItem} 
          clearCart={clearCart} 
        />
        
        <CartSummary subtotal={subtotal()} />
      </div>
    </div>
  );
}

export default function CartPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
      }
    >
      <CartPageContent />
    </Suspense>
  );
}
