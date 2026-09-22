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
import { GuestCheckoutInput } from "@/schemas/checkout.schema";
import type { Address, ShippingZone } from "@/types";
import { CheckCircle2, MapPin } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

interface CheckoutFormsProps {
  form: UseFormReturn<GuestCheckoutInput>;
  shippingZones: ShippingZone[];
  addresses?: Address[];
}

export function CheckoutForms({
  form,
  shippingZones,
  addresses = [],
}: CheckoutFormsProps) {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = form;

  const selectedAddressId = watch("addressId");

  const handleSelectAddress = (addr: Address) => {
    setValue("addressId", addr.id);
    setValue("name", addr.name);
    setValue("phone", addr.phone);
    setValue("street", addr.street || addr.addressLine1 || "");
    setValue("area", addr.area || addr.addressLine2 || "");
    setValue("city", addr.city);
    if (addr.zone) setValue("zone", addr.zone as GuestCheckoutInput["zone"]);
  };

  return (
    <div className="flex-1 space-y-8">
      {/* Shipping Address */}
      <div className="bg-white p-6 rounded-2xl border shadow-sm">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <span className="bg-[#00a3ff]/20 text-[#0070cc] font-black w-8 h-8 rounded-full flex items-center justify-center text-sm">
            1
          </span>
          Shipping Information
        </h2>

        {/* Saved Addresses Selector */}
        {addresses.length > 0 && (
          <div className="mb-10 space-y-4">
            <Label className="text-sm font-bold text-gray-400 uppercase tracking-widest ml-1">
              Use Saved Address
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
                      : "border-gray-50 hover:border-gray-200"
                  }`}
                >
                  <div
                    className={`mt-1 p-2 rounded-xl ${selectedAddressId === addr.id ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-400 text-left"}`}
                  >
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 flex items-center gap-2">
                      {addr.label?.toUpperCase() || "ADDRESS"}
                      {selectedAddressId === addr.id && (
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      )}
                    </p>
                    <p className="text-xs text-gray-500 font-medium truncate">
                      {addr.street || addr.addressLine1}
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
                  setValue("area", "");
                  setValue("city", "");
                  setValue("zone", "" as GuestCheckoutInput["zone"]);
                }}
                className={`flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed transition-all ${
                  !selectedAddressId
                    ? "border-emerald-600 bg-emerald-50"
                    : "border-gray-200 text-gray-400"
                }`}
              >
                <div className="font-bold text-sm">New Address</div>
              </button>
            </div>
            <div className="border-b border-gray-100 pt-4"></div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>Full Name *</Label>
            <Input
              placeholder="John Doe"
              {...register("name")}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label>Phone Number *</Label>
            <Input
              placeholder="01XXXXXXXXX"
              {...register("phone")}
              className={errors.phone ? "border-red-500" : ""}
            />
            {errors.phone && (
              <p className="text-xs text-red-500">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-1 md:col-span-2">
            <Label>Email (Optional)</Label>
            <Input
              type="email"
              placeholder="john@example.com"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1 md:col-span-2">
            <Label>Street Address *</Label>
            <Input
              placeholder="House 12, Road 4, Block C"
              {...register("street")}
              className={errors.street ? "border-red-500" : ""}
            />
            {errors.street && (
              <p className="text-xs text-red-500">{errors.street.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label>Area/Thana *</Label>
            <Input
              placeholder="Mirpur"
              {...register("area")}
              className={errors.area ? "border-red-500" : ""}
            />
            {errors.area && (
              <p className="text-xs text-red-500">{errors.area.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label>City *</Label>
            <Input
              placeholder="Dhaka"
              {...register("city")}
              className={errors.city ? "border-red-500" : ""}
            />
            {errors.city && (
              <p className="text-xs text-red-500">{errors.city.message}</p>
            )}
          </div>

          {!selectedAddressId && addresses.length >= 0 && (
            <div className="flex items-center gap-2 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 md:col-span-2">
              <Checkbox
                id="save-address"
                checked={watch("saveAddress")}
                onCheckedChange={(val) => setValue("saveAddress", !!val)}
              />
              <label
                htmlFor="save-address"
                className="text-sm font-bold text-emerald-800 cursor-pointer"
              >
                Save this address for future use
              </label>
            </div>
          )}

          <div className="space-y-1 md:col-span-2">
            <Label>Shipping Zone *</Label>
            <Select
              value={watch("zone")}
              onValueChange={(val) =>
                setValue("zone", val as GuestCheckoutInput["zone"], {
                  shouldValidate: true,
                  shouldDirty: true,
                })
              }
            >
              <SelectTrigger className={errors.zone ? "border-red-500" : ""}>
                <SelectValue placeholder="Select delivery area...">
                  {shippingZones.find((z) => z.slug === watch("zone"))?.name}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {shippingZones.map((zone) => (
                  <SelectItem key={zone.slug} value={zone.slug}>
                    {zone.name} ({CURRENCY}
                    {zone.cost})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.zone && (
              <p className="text-xs text-red-500">{errors.zone.message}</p>
            )}
          </div>

          <div className="space-y-1 md:col-span-2">
            <Label>Order Notes (Optional)</Label>
            <Textarea
              placeholder="Any special instructions for delivery?"
              {...register("notes")}
            />
          </div>
        </div>
      </div>

      {/* Payment Method */}
      <div className="bg-white p-6 rounded-2xl border shadow-sm">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <span className="bg-[#00a3ff]/20 text-[#0070cc] font-black w-8 h-8 rounded-full flex items-center justify-center text-sm">
            2
          </span>
          Payment Method
        </h2>
        <div className="border border-slate-300 bg-slate-50/80 rounded-xl p-4 flex items-center gap-4">
          <input
            type="radio"
            checked
            readOnly
            className="w-4 h-4 text-[#00a3ff] focus:ring-[#00a3ff]"
          />
          <div>
            <h4 className="font-bold text-slate-900 text-sm">
              Credit / Debit Card & International Checkout
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Secure global payment processing powered by Stripe & PayPal.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
