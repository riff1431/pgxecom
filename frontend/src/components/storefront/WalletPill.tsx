"use client";

import React, { useState } from "react";
import { Coins, Plus, Wallet, ArrowUpRight, ShieldCheck, Loader2, Sparkles } from "lucide-react";
import { useWallet } from "@/providers/WalletProvider";
import { createTopUpSession } from "@/services/wallet.service";
import { getCookie, COOKIE_KEYS } from "@/lib/cookie-client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface WalletPillProps {
  className?: string;
  compact?: boolean;
}

const PRESET_AMOUNTS = [25, 50, 100, 250, 500];

export function WalletPill({ className = "", compact = false }: WalletPillProps) {
  const { balance, currency, isLoading, token, user } = useWallet();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number>(50);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  // If user is not authenticated on Supabase, don't show or show prompt
  if (!user && !isLoading) {
    return null;
  }

  const effectiveAmount = customAmount ? parseFloat(customAmount) : selectedAmount;

  const handleTopUp = async () => {
    const activeToken = getCookie(COOKIE_KEYS.SUPABASE_TOKEN) || token || getCookie(COOKIE_KEYS.TOKEN);
    if (!activeToken) {
      toast.error("Please log in to top up your wallet");
      return;
    }

    if (isNaN(effectiveAmount) || effectiveAmount < 25) {
      toast.error("Minimum deposit amount is €25");
      return;
    }

    try {
      setSubmitting(true);
      toast.loading("Redirecting to Stripe Checkout...", { id: "stripe-redirect" });
      const { url } = await createTopUpSession(activeToken, effectiveAmount);
      if (url) {
        window.location.href = url;
      } else {
        throw new Error("Missing checkout session URL");
      }
    } catch (err: any) {
      toast.dismiss("stripe-redirect");
      toast.error(err.response?.data?.message || err.message || "Failed to create checkout session");
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className={`inline-flex items-center gap-1.5 rounded-full border border-slate-700/80 bg-slate-900/90 hover:bg-slate-800/90 hover:border-[#00a3ff]/50 transition-all duration-200 group shadow-sm ${
          compact ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-xs sm:text-sm"
        } ${className}`}
        title="Universal Wallet Balance - Click to top up"
      >
        <Coins size={compact ? 13 : 15} className="text-amber-400 group-hover:rotate-12 transition-transform" />
        <span className="font-bold text-white tracking-wide">
          {isLoading ? "..." : `€${balance.toFixed(2)}`}
        </span>
        <span className="flex items-center justify-center w-4 h-4 rounded-full bg-[#00a3ff]/20 text-[#00a3ff] group-hover:bg-[#00a3ff] group-hover:text-white transition-all ml-0.5">
          <Plus size={10} strokeWidth={3} />
        </span>
      </button>

      {/* Top-Up Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-[#0b1322] border-slate-800 text-white max-w-md sm:rounded-2xl p-6 shadow-2xl">
          <DialogHeader className="space-y-1">
            <div className="flex items-center gap-2 text-[#00a3ff] font-mono text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Universal Wallet Top-Up</span>
            </div>
            <DialogTitle className="text-xl font-bold tracking-tight text-white flex items-center justify-between">
              <span>Deposit Funds</span>
              <span className="text-sm font-normal text-slate-400 font-mono">
                Current: <strong className="text-white">€{balance.toFixed(2)}</strong>
              </span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Top up via Stripe to instantly credit your shared balance across all PGX services.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 my-2">
            {/* Preset Amount Grid */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Select Amount (EUR)</label>
              <div className="grid grid-cols-3 gap-2">
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
                      className={`py-2.5 px-3 rounded-xl border text-sm font-bold transition-all ${
                        isSelected
                          ? "border-[#00a3ff] bg-[#00a3ff]/15 text-[#00a3ff] shadow-sm shadow-[#00a3ff]/20"
                          : "border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700 hover:text-white"
                      }`}
                    >
                      €{amt}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedAmount(0);
                    if (!customAmount) setCustomAmount("300");
                  }}
                  className={`py-2.5 px-3 rounded-xl border text-sm font-bold transition-all ${
                    customAmount
                      ? "border-[#00a3ff] bg-[#00a3ff]/15 text-[#00a3ff] shadow-sm shadow-[#00a3ff]/20"
                      : "border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700 hover:text-white"
                  }`}
                >
                  Custom
                </button>
              </div>
            </div>

            {/* Custom Input if active */}
            {customAmount !== "" && (
              <div className="space-y-1.5 animate-in fade-in duration-200">
                <label className="text-xs font-semibold text-slate-300">Custom Amount (Min €25)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">€</span>
                  <input
                    type="number"
                    min="25"
                    step="5"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="w-full bg-slate-900/90 border border-slate-700 rounded-xl py-2 pl-8 pr-4 text-white font-mono font-bold focus:outline-none focus:border-[#00a3ff]"
                    placeholder="25"
                  />
                </div>
              </div>
            )}

            {/* Security Guarantee Notice */}
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-[11px] text-slate-400 space-y-0.5">
                <p className="font-semibold text-slate-200">Official Stripe Checkout</p>
                <p>256-bit encrypted card processing. Funds sync across the adult platform &amp; athlete hub instantly upon completion.</p>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleTopUp}
              disabled={submitting || (effectiveAmount < 25)}
              className="w-full py-3.5 px-4 rounded-xl bg-[#00a3ff] hover:bg-[#008fdf] text-white font-black uppercase tracking-wider text-xs shadow-lg shadow-[#00a3ff]/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Preparing Stripe Checkout...</span>
                </>
              ) : (
                <>
                  <span>Proceed to Pay €{effectiveAmount ? effectiveAmount.toFixed(2) : "0.00"}</span>
                  <ArrowUpRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
