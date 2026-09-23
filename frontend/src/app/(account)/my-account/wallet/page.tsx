"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Wallet,
  Coins,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Sparkles,
  Loader2,
  CreditCard,
  Lock,
  Wallet2Icon,
} from "lucide-react";
import { useWallet } from "@/providers/WalletProvider";
import { createTopUpSession } from "@/services/wallet.service";
import { getCookie, COOKIE_KEYS } from "@/lib/cookie-client";
import { toast } from "sonner";

const PRESET_AMOUNTS = [25, 50, 100, 250, 500];

function WalletPageContent() {
  const searchParams = useSearchParams();
  const statusParam = searchParams.get("status");
  const sessionIdParam = searchParams.get("session_id");

  const { balance, isLoading, token, refresh } = useWallet();
  const [selectedAmount, setSelectedAmount] = useState<number>(50);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (statusParam === "success") {
      toast.success("Payment completed! Syncing wallet balance via webhook...");

      // Clean query parameters from URL so refreshing the page won't re-trigger banners or alerts
      if (typeof window !== "undefined") {
        window.history.replaceState({}, "", "/my-account/wallet");
      }

      // Refresh balance immediately, and once more after a brief delay for webhook processing
      refresh();
      const timer = setTimeout(() => {
        refresh();
      }, 3000);
      return () => clearTimeout(timer);
    } else if (statusParam === "cancelled") {
      toast.info("Deposit cancelled");
      if (typeof window !== "undefined") {
        window.history.replaceState({}, "", "/my-account/wallet");
      }
    }
  }, [statusParam, refresh]);

  const effectiveAmount = customAmount ? parseFloat(customAmount) : selectedAmount;

  const handleTopUp = async () => {
    const activeToken = getCookie(COOKIE_KEYS.SUPABASE_TOKEN) || token || getCookie(COOKIE_KEYS.TOKEN);
    if (!activeToken) {
      toast.error("Please ensure you are authenticated");
      return;
    }

    if (isNaN(effectiveAmount) || effectiveAmount < 25) {
      toast.error("Minimum deposit amount is €25");
      return;
    }

    try {
      setSubmitting(true);
      toast.loading("Generating Stripe Checkout session...", { id: "wallet-checkout" });
      const returnUrl = `${window.location.origin}/my-account/wallet`;
      const { url } = await createTopUpSession(activeToken, effectiveAmount, returnUrl);
      if (url) {
        window.location.href = url;
      } else {
        throw new Error("Missing checkout URL");
      }
    } catch (err: any) {
      toast.dismiss("wallet-checkout");
      toast.error(err.response?.data?.message || err.message || "Failed to initiate top-up");
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 text-[#00a3ff] font-mono text-xs font-bold uppercase tracking-widest mb-1.5">
          <Wallet2Icon />
          <span>PGX Wallet</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white font-mono">
          Wallet &amp; Deposits
        </h1>
      </div>

      {/* Status Banners */}
      {statusParam === "success" && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <div className="text-xs sm:text-sm">
            <p className="font-bold">Payment Succeeded!</p>
            <p className="text-emerald-300/80">
              Your Stripe payment {sessionIdParam ? `(ID: ${sessionIdParam.slice(0, 14)}...)` : ""} was confirmed. Your updated balance is reflected below.
            </p>
          </div>
        </div>
      )}

      {statusParam === "cancelled" && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center gap-3">
          <XCircle className="w-5 h-5 shrink-0" />
          <div className="text-xs sm:text-sm">
            <p className="font-bold">Checkout Cancelled</p>
            <p className="text-amber-300/80">You can try topping up again whenever you are ready.</p>
          </div>
        </div>
      )}

      {/* Balance Card */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-[#0c1626] to-[#080d17] p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#00a3ff]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-slate-400 font-bold block mb-1">
              Available Credits
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight">
                {isLoading ? "..." : `€${balance.toFixed(2)}`}
              </span>
              <span className="text-xs font-bold text-[#00a3ff] uppercase tracking-wider font-mono">
                EUR
              </span>
            </div>
          </div>

          <button
            onClick={() => refresh()}
            className="self-start sm:self-center px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-xs font-bold text-slate-200 border border-slate-700 transition-all flex items-center gap-2"
          >
            <Coins className="w-4 h-4 text-amber-400" />
            Refresh Balance
          </button>
        </div>
      </div>

      {/* Deposit Section */}
      <div className="rounded-2xl border border-slate-800 bg-[#0b1322] p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800/80">
          <div className="w-10 h-10 rounded-xl bg-[#00a3ff]/15 border border-[#00a3ff]/20 flex items-center justify-center text-[#00a3ff]">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-wide">Instant Stripe Deposit</h2>
            <p className="text-xs text-slate-400">All transactions processed in Euros (€). Minimum top-up is €25.</p>
          </div>
        </div>

        {/* Quick Amount Buttons */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            1. Select Top-Up Amount
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {PRESET_AMOUNTS.map((amt) => {
              const isSelected = selectedAmount === amt && !customAmount;
              return (
                <button
                  key={amt}
                  type="button"
                  onClick={() => {
                    setSelectedAmount(amt);
                    setCustomAmount("");
                  }}
                  className={`py-3 px-4 rounded-xl border text-base font-mono font-bold transition-all ${isSelected
                    ? "border-[#00a3ff] bg-[#00a3ff]/15 text-[#00a3ff] shadow-md shadow-[#00a3ff]/20"
                    : "border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700 hover:text-white"
                    }`}
                >
                  €{amt}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Amount Field */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Or Enter Custom Amount (€)
          </label>
          <div className="relative max-w-xs">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">€</span>
            <input
              type="number"
              min="25"
              step="5"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-700 rounded-xl py-2.5 pl-8 pr-4 text-white font-mono font-bold focus:outline-none focus:border-[#00a3ff]"
              placeholder="e.g. 75"
            />
          </div>
        </div>

        {/* Features & Security */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-400 space-y-0.5">
              <p className="font-bold text-slate-200">Strictly Compliant &amp; Secure</p>
              <p>Stripe checkout is hosted directly on Stripe's PCI-compliant servers. We never store or touch your card details.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 flex items-start gap-3">
            <Wallet className="w-5 h-5 text-[#00a3ff] shrink-0 mt-0.5" />
            <div className="text-xs text-slate-400 space-y-0.5">
              <p className="font-bold text-slate-200">Universal Ecosystem Access</p>
              <p>Wallet balance is shared with your account profile across all PGX apps and services seamlessly.</p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleTopUp}
          disabled={submitting || effectiveAmount < 25}
          className="w-full sm:w-auto min-w-[260px] py-4 px-6 rounded-xl bg-[#00a3ff] hover:bg-[#008fdf] text-white font-black uppercase tracking-wider text-xs shadow-lg shadow-[#00a3ff]/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Redirecting to Stripe...</span>
            </>
          ) : (
            <>
              <span>Top Up €{effectiveAmount ? effectiveAmount.toFixed(2) : "0.00"} via Stripe</span>
              <ArrowUpRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default function WalletPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading wallet...</div>}>
      <WalletPageContent />
    </Suspense>
  );
}
