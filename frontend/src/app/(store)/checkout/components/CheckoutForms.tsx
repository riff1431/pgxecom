"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CURRENCY } from "@/lib/constants";
import { useWallet } from "@/providers/WalletProvider";
import { WalletPill } from "@/components/storefront/WalletPill";
import { GuestCheckoutInput } from "@/schemas/checkout.schema";
import type { Address, ShippingZone } from "@/types";
import { CheckCircle2, MapPin, Wallet, ShieldCheck, AlertCircle, Sparkles, Globe } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

const COUNTRIES = [
  "United States",
  "United Kingdom",
  "Germany",
  "France",
  "Canada",
  "Australia",
  "Netherlands",
  "Spain",
  "Italy",
  "Sweden",
  "Switzerland",
  "Norway",
  "Ireland",
  "Austria",
  "Belgium",
  "Denmark",
  "Finland",
  "Portugal",
  "Poland",
  "New Zealand",
  "Japan",
  "Singapore",
  "United Arab Emirates",
  "Saudi Arabia",
  "Brazil",
  "Mexico",
  "Other",
];

interface CheckoutFormsProps {
  form: UseFormReturn<GuestCheckoutInput>;
  shippingZones: ShippingZone[];
  addresses?: Address[];
  totalOrderAmount?: number;
}

export function CheckoutForms({
  form,
  shippingZones,
  addresses = [],
  totalOrderAmount = 0,
}: CheckoutFormsProps) {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = form;

  const { balance, isLoading: isWalletLoading } = useWallet();
  const selectedAddressId = watch("addressId");
  const selectedCountry = watch("country") || "United States";
  const hasInsufficientBalance = !isWalletLoading && balance < totalOrderAmount;

  const handleSelectAddress = (addr: Address) => {
    setValue("addressId", addr.id);
    setValue("name", addr.name);
    setValue("phone", addr.phone);
    setValue("street", addr.street || addr.addressLine1 || "");
    setValue("addressLine2", addr.addressLine2 || "");
    setValue("area", addr.area || "");
    setValue("city", addr.city);
    setValue("state", addr.state || "");
    setValue("postalCode", addr.zipCode || "");
    setValue("country", addr.country || "United States");
    if (addr.zone) setValue("zone", addr.zone as GuestCheckoutInput["zone"]);
  };

  return (
    <div className="flex-1 space-y-8">
      {/* 1. International Shipping Address */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900">
            <span className="bg-[#00a3ff]/20 text-[#0070cc] font-black w-8 h-8 rounded-full flex items-center justify-center text-sm">
              1
            </span>
            International Shipping Destination
          </h2>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium bg-slate-100 px-3 py-1 rounded-full">
            <Globe className="w-3.5 h-3.5 text-[#00a3ff]" />
            <span>Worldwide Delivery</span>
          </div>
        </div>

        {/* Saved Addresses Selector */}
        {addresses.length > 0 && (
          <div className="mb-8 space-y-3">
            <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
              Select Saved Address
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {addresses.map((addr) => (
                <button
                  key={addr.id}
                  type="button"
                  onClick={() => handleSelectAddress(addr)}
                  className={`flex items-start gap-3 p-4 rounded-2xl border-2 transition-all text-left ${
                    selectedAddressId === addr.id
                      ? "border-emerald-600 bg-emerald-50 ring-4 ring-emerald-50"
                      : "border-gray-100 hover:border-gray-200 bg-slate-50/50"
                  }`}
                >
                  <div
                    className={`mt-1 p-2 rounded-xl ${
                      selectedAddressId === addr.id
                        ? "bg-emerald-600 text-white"
                        : "bg-gray-200/80 text-gray-500"
                    }`}
                  >
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                      {addr.label?.toUpperCase() || "ADDRESS"}
                      {selectedAddressId === addr.id && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline" />
                      )}
                    </p>
                    <p className="text-xs text-gray-600 font-medium truncate mt-0.5">
                      {addr.street || addr.addressLine1}
                    </p>
                    <p className="text-[11px] text-gray-400">
                      {[addr.city, addr.state, addr.country].filter(Boolean).join(", ")}
                    </p>
                  </div>
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setValue("addressId", undefined);
                  setValue("name", "");
                  setValue("phone", "");
                  setValue("street", "");
                  setValue("addressLine2", "");
                  setValue("area", "");
                  setValue("city", "");
                  setValue("state", "");
                  setValue("postalCode", "");
                  setValue("country", "United States");
                  setValue("zone", "" as GuestCheckoutInput["zone"]);
                }}
                className={`flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed transition-all ${
                  !selectedAddressId
                    ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                    : "border-gray-200 text-gray-500 hover:border-gray-300"
                }`}
              >
                <div className="font-bold text-sm">+ Enter Custom Address</div>
              </button>
            </div>
            <div className="border-b border-gray-100 pt-3"></div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Full Name */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-gray-700">Full Name *</Label>
            <Input
              placeholder="e.g. Alexander Vance"
              {...register("name")}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-gray-700">Email Address (for order tracking) *</Label>
            <Input
              type="email"
              placeholder="e.g. alexander@company.com"
              {...register("email")}
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-gray-700">
              International Phone Number (with country code) *
            </Label>
            <Input
              placeholder="e.g. +1 555 234 5678 or +44 20 7946 0991"
              {...register("phone")}
              className={errors.phone ? "border-red-500" : ""}
            />
            {errors.phone && (
              <p className="text-xs text-red-500">{errors.phone.message}</p>
            )}
          </div>

          {/* Country */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-gray-700">Country / Region *</Label>
            <Select
              value={selectedCountry}
              onValueChange={(val) => {
                if (val) {
                  setValue("country", val, {
                    shouldValidate: true,
                    shouldDirty: true,
                  });
                }
              }}
            >
              <SelectTrigger className={errors.country ? "border-red-500" : ""}>
                <SelectValue placeholder="Select Country" />
              </SelectTrigger>
              <SelectContent className="max-h-64">
                {COUNTRIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.country && (
              <p className="text-xs text-red-500">{errors.country.message}</p>
            )}
          </div>

          {/* Street Address Line 1 */}
          <div className="space-y-1.5 md:col-span-2">
            <Label className="text-xs font-bold text-gray-700">Street Address *</Label>
            <Input
              placeholder="e.g. 742 Evergreen Terrace, Apt / Suite 4B"
              {...register("street")}
              className={errors.street ? "border-red-500" : ""}
            />
            {errors.street && (
              <p className="text-xs text-red-500">{errors.street.message}</p>
            )}
          </div>

          {/* Apartment / Building / Suite */}
          <div className="space-y-1.5 md:col-span-2">
            <Label className="text-xs font-bold text-gray-700">
              Apartment, Suite, Unit, Building, Floor (Optional)
            </Label>
            <Input
              placeholder="e.g. Building 2, Floor 4, Suite 402"
              {...register("addressLine2")}
            />
          </div>

          {/* City */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-gray-700">City / Municipality *</Label>
            <Input
              placeholder="e.g. Los Angeles, London, Munich"
              {...register("city")}
              className={errors.city ? "border-red-500" : ""}
            />
            {errors.city && (
              <p className="text-xs text-red-500">{errors.city.message}</p>
            )}
          </div>

          {/* State / Province */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-gray-700">State / Province / County *</Label>
            <Input
              placeholder="e.g. California, Bavaria, Greater London"
              {...register("state")}
              className={errors.state ? "border-red-500" : ""}
            />
            {errors.state && (
              <p className="text-xs text-red-500">{errors.state.message}</p>
            )}
          </div>

          {/* Postal / ZIP Code */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-gray-700">Postal / ZIP Code *</Label>
            <Input
              placeholder="e.g. 90210 or SW1A 1AA or 80331"
              {...register("postalCode")}
              className={errors.postalCode ? "border-red-500" : ""}
            />
            {errors.postalCode && (
              <p className="text-xs text-red-500">{errors.postalCode.message}</p>
            )}
          </div>

          {/* Shipping Zone Selection */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-gray-700">Shipping Service *</Label>
            <Select
              value={watch("zone")}
              onValueChange={(val) => {
                if (val) {
                  setValue("zone", val as GuestCheckoutInput["zone"], {
                    shouldValidate: true,
                    shouldDirty: true,
                  });
                }
              }}
            >
              <SelectTrigger className={errors.zone ? "border-red-500" : ""}>
                <SelectValue placeholder="Select shipping courier...">
                  {shippingZones.find((z) => z.slug === watch("zone"))?.name}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {shippingZones.map((zone) => (
                  <SelectItem key={zone.slug} value={zone.slug}>
                    {zone.name} ({CURRENCY}
                    {Number(zone.cost).toFixed(2)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.zone && (
              <p className="text-xs text-red-500">{errors.zone.message}</p>
            )}
          </div>

          {!selectedAddressId && (
            <div className="flex items-center gap-2 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 md:col-span-2">
              <Checkbox
                id="save-address"
                checked={watch("saveAddress")}
                onCheckedChange={(val) => setValue("saveAddress", !!val)}
              />
              <label
                htmlFor="save-address"
                className="text-xs font-bold text-emerald-800 cursor-pointer"
              >
                Save this international address to my account for faster checkout
              </label>
            </div>
          )}

          {/* Delivery Notes */}
          <div className="space-y-1.5 md:col-span-2">
            <Label className="text-xs font-bold text-gray-700">Order & Delivery Instructions (Optional)</Label>
            <Textarea
              placeholder="e.g. Leave package at front concierge desk, gate access code #4392"
              {...register("notes")}
              className="min-h-[70px]"
            />
          </div>
        </div>
      </div>

      {/* 2. Payment Method: PGX Universal Wallet */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900">
            <span className="bg-[#00a3ff]/20 text-[#0070cc] font-black w-8 h-8 rounded-full flex items-center justify-center text-sm">
              2
            </span>
            Payment Method
          </h2>
          <div className="flex items-center gap-1.5 text-xs text-[#0070cc] bg-[#00a3ff]/10 px-3 py-1 rounded-full font-bold">
            <Sparkles className="w-3.5 h-3.5 text-[#00a3ff]" />
            <span>Universal PGX Wallet</span>
          </div>
        </div>

        {/* Universal Wallet Card Box */}
        <div className="border-2 border-[#00a3ff]/40 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
          {/* Subtle glow background */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#00a3ff]/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-[#00a3ff]" />
                <span className="text-xs font-mono font-bold tracking-wider uppercase text-slate-400">
                  Shared PGX Network Balance
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black tracking-tight text-white">
                  {isWalletLoading ? "..." : `€${balance.toFixed(2)}`}
                </span>
                <span className="text-xs text-slate-400 font-mono">EUR Available</span>
              </div>
            </div>

            {/* Quick Top-Up Trigger */}
            <div className="flex items-center gap-3">
              <WalletPill compact={false} />
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 gap-2">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Instant 1-Click Payment • Automatically deducted upon order placement</span>
            </div>
            <span className="text-[11px] text-slate-400">
              Shared across Store & Platform
            </span>
          </div>
        </div>

        {/* Insufficient balance warning if balance is below total */}
        {hasInsufficientBalance && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-amber-900">
                Insufficient Wallet Balance (€{balance.toFixed(2)} / €{totalOrderAmount.toFixed(2)})
              </h4>
              <p className="text-xs text-amber-700">
                Your order total exceeds your available PGX Universal Wallet balance. Please click the <strong>Deposit Funds</strong> button above to top up your balance via Stripe before completing the order.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

