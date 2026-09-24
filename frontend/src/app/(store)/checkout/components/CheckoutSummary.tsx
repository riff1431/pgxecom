"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CURRENCY } from "@/lib/constants";
import type { CartItem } from "@/types";
import { ArrowRight, ShieldCheck, Tag } from "lucide-react";

interface CheckoutSummaryProps {
  items: CartItem[];
  currentSubtotal: number;
  total: number;
  shippingCost: number;
  selectedZoneSlug?: string;
  discount: { amount: number; code: string } | null;
  couponCode: string;
  canUseCoupon: boolean;
  setCouponCode: (val: string) => void;
  handleApplyCoupon: () => void;
  handleRemoveCoupon: () => void;
  isSubmitting: boolean;
  isValidatingCoupon: boolean;
}

export function CheckoutSummary(props: CheckoutSummaryProps) {
  const {
    items,
    currentSubtotal,
    total,
    shippingCost,
    selectedZoneSlug,
    discount,
    couponCode,
    canUseCoupon,
    setCouponCode,
    handleApplyCoupon,
    handleRemoveCoupon,
    isSubmitting,
    isValidatingCoupon,
  } = props;

  return (
    <div className="w-full lg:w-96 shrink-0">
      <div className="bg-white rounded-2xl border shadow-sm p-6 sticky top-24">
        <h2 className="text-xl font-bold mb-6 text-gray-900">Order Summary</h2>

        <div className="space-y-4 max-h-60 overflow-y-auto mb-6 pr-2">
          {items.map((item) => (
            <div
              key={`${item.productId}-${item.variantId}`}
              className="flex gap-3"
            >
              <div className="w-12 h-12 bg-gray-100 rounded text-xs flex items-center justify-center text-gray-400 overflow-hidden border border-gray-100">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  "IMG"
                )}
              </div>
              <div className="flex-1 text-sm">
                <p className="font-medium text-gray-900 line-clamp-1">
                  {item.name}
                </p>
                <p className="text-gray-500">Qty: {item.quantity}</p>
              </div>
              <div className="font-medium text-sm text-right">
                {CURRENCY}
                {item.price * item.quantity}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t py-6 space-y-4">
          {canUseCoupon ? (
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="uppercase"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleApplyCoupon}
                  disabled={isValidatingCoupon || !couponCode}
                >
                  Go
                </Button>
              </div>

              {discount && (
                <div className="flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm">
                  <div className="flex items-center gap-2 text-emerald-700">
                    <Tag className="h-4 w-4" />
                    <span className="font-semibold">
                      {discount.code} applied
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-8 px-2 text-emerald-700 hover:text-emerald-800"
                    onClick={handleRemoveCoupon}
                  >
                    Remove
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed bg-gray-50 px-4 py-3 text-sm text-gray-600">
              Log in to apply a coupon code at checkout.
            </div>
          )}

          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>
                {CURRENCY}
                {currentSubtotal}
              </span>
            </div>
            {discount && (
              <div className="flex justify-between text-emerald-600">
                <span className="flex items-center gap-1">
                  <Tag className="w-3 h-3" /> Discount ({discount.code})
                </span>
                <span>
                  -{CURRENCY}
                  {discount.amount}
                </span>
              </div>
            )}
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span>
                {selectedZoneSlug
                  ? `${CURRENCY}${shippingCost}`
                  : "Select Zone"}
              </span>
            </div>
            <div className="pt-4 border-t flex justify-between font-bold text-lg text-gray-900">
              <span>Total</span>
              <span>
                {CURRENCY}
                {total}
              </span>
            </div>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-12 bg-[#00a3ff] hover:bg-[#008fdf] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-[#00a3ff]/20 transition-all cursor-pointer"
        >
          {isSubmitting ? "Processing Wallet Payment..." : "Pay with Universal Wallet"}{" "}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>

        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-[#00a3ff]" />
          Secure encrypted 256-bit SSL checkout
        </div>
      </div>
    </div>
  );
}
