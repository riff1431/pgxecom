"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Package, ArrowRight, Loader2, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import { resolveCheckoutReturnTarget } from "@/services/wallet.service";

function CompleteConfirmationContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id") || "";
  const orderParam = searchParams.get("order") || "";
  const rawRet = searchParams.get("ret") || "";
  const [resolvedReturnBase, setResolvedReturnBase] = useState<string>(() => {
    if (!orderParam && rawRet) {
      try {
        return decodeURIComponent(rawRet);
      } catch {
        return rawRet;
      }
    }
    return "";
  });
  const [resolvingReturn, setResolvingReturn] = useState<boolean>(Boolean(orderParam));

  const cleanSessionRef = sessionId.slice(-8).toUpperCase();
  const orderNumber =
    orderParam ||
    (cleanSessionRef ? `FNX-${cleanSessionRef}` : `FNX-${Date.now().toString(36).toUpperCase()}`);

  useEffect(() => {
    if (!orderParam) return;
    let cancelled = false;

    resolveCheckoutReturnTarget(orderParam)
      .then((target) => {
        if (cancelled) return;
        if (target) {
          setResolvedReturnBase(target);
        } else if (rawRet) {
          try {
            setResolvedReturnBase(decodeURIComponent(rawRet));
          } catch {
            setResolvedReturnBase(rawRet);
          }
        }
      })
      .finally(() => {
        if (!cancelled) {
          setResolvingReturn(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [orderParam, rawRet]);

  // Build target return URL if resolved
  let destinationUrl = "";
  if (resolvedReturnBase) {
    const separator = resolvedReturnBase.includes("?") ? "&" : "?";
    destinationUrl = `${resolvedReturnBase}${separator}status=success&method=stripe_ecom&session_id=${encodeURIComponent(sessionId)}`;
  }

  useEffect(() => {
    if (!destinationUrl) return;
    window.location.replace(destinationUrl);
  }, [destinationUrl]);

  if (resolvingReturn || destinationUrl) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center py-16 px-4 bg-background">
        <div className="max-w-md w-full text-center space-y-5">
          <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-emerald-400">
              Payment Verified
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">
              Returning to your dashboard...
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Please wait a moment while we redirect you back.
            </p>
          </div>
          {destinationUrl && (
            <a
              href={destinationUrl}
              className="inline-flex h-11 px-6 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs uppercase tracking-wider items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <span>Return Now</span>
              <ArrowRight className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-16 px-4 bg-background">
      <div className="max-w-xl w-full text-center">
        <div className="flex justify-center mb-6">
          <Link href="/" className="inline-flex items-center">
            <img
              src="/logo.png"
              alt="PlaygroundFitnex Logo"
              className="h-12 w-auto object-contain"
            />
          </Link>
        </div>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 12, stiffness: 200 }}
          className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xs"
        >
          <CheckCircle2 className="w-10 h-10" />
        </motion.div>

        <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-emerald-400">
          Payment Verified
        </span>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-foreground font-mono mt-1 mb-4"
        >
          Order Confirmed!
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="text-sm sm:text-base text-muted-foreground mb-8 max-w-md mx-auto"
        >
          Thank you for choosing PlaygroundFitnex. Your order <span className="font-bold font-mono text-foreground">#{orderNumber}</span> has been confirmed and scheduled for courier dispatch.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="group bg-card border border-border rounded-2xl p-6 mb-8 text-left shadow-xs hover:shadow-sm transition-shadow"
        >
          <div className="flex items-start gap-4">
            <div className="mt-0.5 bg-primary/10 border border-primary/20 p-2.5 rounded-xl text-primary shrink-0">
              <Package className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-mono font-bold uppercase text-xs tracking-wider text-foreground">
                Item: Fitnex Athletic Training & Equipment Package
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
                Courier dispatch notification and parcel tracking invoice dispatched to your billing email.
              </p>
            </div>
          </div>
        </motion.div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/shop"
            className="w-full sm:w-auto h-12 px-8 rounded-lg bg-secondary hover:bg-secondary/80 text-secondary-foreground font-bold text-xs uppercase tracking-wider flex items-center justify-center transition-colors"
          >
            <ShoppingBag className="mr-2 h-4 w-4" />
            Continue Shopping
          </Link>
          <Link
            href="/my-account/orders"
            className="w-full sm:w-auto h-12 px-8 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs transition-colors"
          >
            View My Orders
            <ArrowRight className="ml-2 h-4 w-4 text-primary-foreground" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CompleteConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <CompleteConfirmationContent />
    </Suspense>
  );
}
