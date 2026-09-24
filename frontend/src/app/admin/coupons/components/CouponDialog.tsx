"use client";

import axios from "axios";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useCreateAdminCoupon, useUpdateAdminCoupon } from "@/lib/api/coupon";
import type {
  AdminCoupon,
  CouponFormValues,
  CouponUpsertPayload,
} from "@/types";
import { useQueryClient } from "@tanstack/react-query";

interface CouponDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coupon: AdminCoupon | null;
}

const getDefaultValues = (coupon: AdminCoupon | null): CouponFormValues => ({
  code: coupon?.code || "",
  description: coupon?.description || "",
  discountType: coupon?.discountType || "PERCENTAGE",
  discountValue: coupon?.discountValue || 0,
  minOrderAmount: coupon?.minOrderAmount || undefined,
  maxDiscount: coupon?.maxDiscount || undefined,
  usageLimit: coupon?.usageLimit || undefined,
  startsAt: coupon?.startsAt ? coupon.startsAt.slice(0, 16) : "",
  expiresAt: coupon?.expiresAt ? coupon.expiresAt.slice(0, 16) : "",
  isActive: coupon?.isActive ?? true,
});

export function CouponDialog({
  open,
  onOpenChange,
  coupon,
}: CouponDialogProps) {
  const queryClient = useQueryClient();
  const createMutation = useCreateAdminCoupon();
  const updateMutation = useUpdateAdminCoupon();

  const form = useForm<CouponFormValues>({
    defaultValues: getDefaultValues(coupon),
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = form;
  const discountType = watch("discountType");
  const isActive = watch("isActive");

  useEffect(() => {
    reset(getDefaultValues(coupon));
  }, [coupon, reset, open]);

  const onSubmit = async (values: CouponFormValues) => {
    const payload: CouponUpsertPayload = {
      ...values,
      id: coupon?.id,
      code: values.code.trim().toUpperCase(),
      description: values.description?.trim() || undefined,
      discountValue: Number.isNaN(values.discountValue)
        ? 0
        : values.discountValue,
      minOrderAmount: Number.isNaN(values.minOrderAmount ?? Number.NaN)
        ? undefined
        : values.minOrderAmount,
      maxDiscount: Number.isNaN(values.maxDiscount ?? Number.NaN)
        ? undefined
        : values.maxDiscount,
      usageLimit: Number.isNaN(values.usageLimit ?? Number.NaN)
        ? undefined
        : values.usageLimit,
      startsAt: values.startsAt || undefined,
      expiresAt: values.expiresAt || undefined,
    };

    try {
      if (coupon) {
        await updateMutation.mutateAsync(payload);
        toast.success("Coupon updated successfully");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Coupon created successfully");
      }

      queryClient.invalidateQueries({ queryKey: ["admin", "coupons"] });
      onOpenChange(false);
      reset(getDefaultValues(null));
    } catch (error: unknown) {
      if (axios.isAxiosError<{ message?: string }>(error)) {
        toast.error(error.response?.data?.message || "Failed to save coupon");
        return;
      }

      toast.error("Failed to save coupon");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl rounded-2xl bg-[#0b1322] border-slate-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white font-mono uppercase tracking-wider">
            {coupon ? "Edit Coupon" : "Create Coupon"}
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Configure coupon rules, availability, and usage limits.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-300 font-mono text-xs uppercase tracking-wider">Coupon Code</Label>
              <Input
                placeholder="WELCOME10"
                {...register("code", {
                  required: "Coupon code is required",
                })}
                className="rounded-xl bg-[#080e18] border-slate-700 text-white placeholder:text-slate-500 font-mono"
              />
              {errors.code && (
                <p className="text-xs text-rose-400">{errors.code.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300 font-mono text-xs uppercase tracking-wider">Discount Type</Label>
              <Select
                value={discountType}
                onValueChange={(value) =>
                  setValue(
                    "discountType",
                    value as CouponFormValues["discountType"],
                  )
                }
              >
                <SelectTrigger className="rounded-xl w-full bg-[#080e18] border-slate-700 text-white font-mono text-xs">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-[#0b1322] border-slate-800 text-white">
                  <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                  <SelectItem value="FIXED_AMOUNT">Fixed Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300 font-mono text-xs uppercase tracking-wider">Description</Label>
            <Textarea
              placeholder="Coupon campaign description"
              {...register("description")}
              className="rounded-xl bg-[#080e18] border-slate-700 text-white placeholder:text-slate-500"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-300 font-mono text-xs uppercase tracking-wider">
                {discountType === "PERCENTAGE"
                  ? "Discount Value (%)"
                  : "Discount Value"}
              </Label>
              <Input
                type="number"
                step="0.01"
                placeholder="10"
                {...register("discountValue", {
                  required: "Discount value is required",
                  valueAsNumber: true,
                  min: { value: 0, message: "Must be positive" },
                })}
                className="rounded-xl bg-[#080e18] border-slate-700 text-white"
              />
              {errors.discountValue && (
                <p className="text-xs text-rose-400">
                  {errors.discountValue.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300 font-mono text-xs uppercase tracking-wider">Minimum Order Amount</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="500"
                {...register("minOrderAmount", { valueAsNumber: true })}
                className="rounded-xl bg-[#080e18] border-slate-700 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-300 font-mono text-xs uppercase tracking-wider">Maximum Discount</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="200"
                {...register("maxDiscount", { valueAsNumber: true })}
                className="rounded-xl bg-[#080e18] border-slate-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300 font-mono text-xs uppercase tracking-wider">Usage Limit</Label>
              <Input
                type="number"
                step="1"
                placeholder="100"
                {...register("usageLimit", { valueAsNumber: true })}
                className="rounded-xl bg-[#080e18] border-slate-700 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-300 font-mono text-xs uppercase tracking-wider">Starts At</Label>
              <Input
                type="datetime-local"
                {...register("startsAt")}
                className="rounded-xl bg-[#080e18] border-slate-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300 font-mono text-xs uppercase tracking-wider">Expires At</Label>
              <Input
                type="datetime-local"
                {...register("expiresAt")}
                className="rounded-xl bg-[#080e18] border-slate-700 text-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-[#080e18] p-4">
            <div>
              <p className="font-semibold text-white font-mono text-sm uppercase">Enable coupon</p>
              <p className="text-sm text-slate-400">
                Disabled coupons cannot be used at checkout.
              </p>
            </div>
            <Switch
              checked={isActive}
              onCheckedChange={(value) => setValue("isActive", value)}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl bg-[#080e18] border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="rounded-xl bg-[#00a3ff] hover:bg-[#008fe0] text-black font-semibold font-mono uppercase tracking-wider text-xs"
            >
              {createMutation.isPending || updateMutation.isPending
                ? "Saving..."
                : coupon
                  ? "Update Coupon"
                  : "Create Coupon"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
