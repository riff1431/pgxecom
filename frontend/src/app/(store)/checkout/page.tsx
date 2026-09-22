"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { buttonVariants } from "@/components/ui/button";
import { useValidateCoupon } from "@/lib/api/coupon";
import { useCreateOrder } from "@/lib/api/order";
import { useGetActiveShippingZones } from "@/lib/api/shipping";
import { useCreateAddress, useGetAddresses } from "@/lib/api/user";
import { useAuth } from "@/providers/AuthProvider";
import {
  GuestCheckoutInput,
  guestCheckoutSchema,
} from "@/schemas/checkout.schema";
import { useCartStore } from "@/store/cart.store";

import { CheckoutForms } from "./components/CheckoutForms";
import { CheckoutSummary } from "./components/CheckoutSummary";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCartStore();
  const { user, isAuthenticated } = useAuth();

  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState<{
    amount: number;
    code: string;
  } | null>(null);

  const { data: shippingZones } = useGetActiveShippingZones();
  const { data: addresses } = useGetAddresses(isAuthenticated);

  const validateCouponMutation = useValidateCoupon();
  const createOrderMutation = useCreateOrder();
  const createAddressMutation = useCreateAddress();

  const form = useForm<GuestCheckoutInput>({
    resolver: zodResolver(guestCheckoutSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      paymentMethod: "CASH_ON_DELIVERY",
      saveAddress: false,
    },
  });

  const {
    handleSubmit,
    watch,
    setValue,
    formState: { isSubmitting },
  } = form;

  // Auto-fill default address
  useEffect(() => {
    if (addresses && addresses.length > 0) {
      const defaultAddr =
        addresses.find((address) => address.isDefault) || addresses[0];
      if (defaultAddr) {
        setValue("addressId", defaultAddr.id);
        setValue("name", defaultAddr.name);
        setValue("phone", defaultAddr.phone);
        setValue(
          "street",
          defaultAddr.street || defaultAddr.addressLine1 || "",
        );
        setValue("area", defaultAddr.area || defaultAddr.addressLine2 || "");
        setValue("city", defaultAddr.city);
        if (defaultAddr.zone) {
          setValue("zone", defaultAddr.zone as GuestCheckoutInput["zone"]);
        }
      }
    }
  }, [addresses, setValue]);

  useEffect(() => {
    if (!isAuthenticated) {
      setCouponCode("");
      setDiscount(null);
    }
  }, [isAuthenticated]);

  const selectedZoneSlug = watch("zone");
  const selectedZone = shippingZones?.find((z) => z.slug === selectedZoneSlug);
  const shippingCost = Number(selectedZone?.cost || 0);
  const currentSubtotal = subtotal();
  const total = currentSubtotal + shippingCost - Number(discount?.amount || 0);

  const handleApplyCoupon = async () => {
    if (!isAuthenticated) {
      toast.error("Please log in to use coupons");
      return;
    }

    if (!couponCode.trim()) return;

    try {
      const result = await validateCouponMutation.mutateAsync({
        code: couponCode.trim(),
        subtotal: currentSubtotal,
      });
      setDiscount({ amount: result.discountAmount, code: result.coupon.code });
      toast.success("Coupon applied successfully!");
    } catch (error: unknown) {
      if (axios.isAxiosError<{ message?: string }>(error)) {
        toast.error(
          error.response?.data?.message || "Invalid or expired coupon",
        );
        setDiscount(null);
        return;
      }

      toast.error("Invalid or expired coupon");
      setDiscount(null);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode("");
    setDiscount(null);
  };

  const onSubmit = async (data: GuestCheckoutInput) => {
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    try {
      let finalAddressId = data.addressId;

      // Save address if requested
      if (data.saveAddress && !data.addressId && isAuthenticated) {
        const newAddr = await createAddressMutation.mutateAsync({
          name: data.name,
          phone: data.phone,
          addressLine1: data.street,
          addressLine2: data.area,
          city: data.city,
          zone: data.zone,
          label: "HOME",
          isDefault: addresses?.length === 0,
        });
        finalAddressId = newAddr.id;
      }

      const orderData = {
        userId: user?.id,
        addressId: finalAddressId,
        guestName: data.name,
        guestPhone: data.phone,
        guestEmail: data.email,
        shippingAddress: {
          name: data.name,
          phone: data.phone,
          street: data.street,
          area: data.area || "",
          city: data.city,
          zone: data.zone,
        },
        zone: data.zone,
        notes: data.notes,
        paymentMethod: data.paymentMethod ?? "CASH_ON_DELIVERY",
        items: items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          price: item.price,
        })),
        couponCode: isAuthenticated ? discount?.code : undefined,
      };

      const result = await createOrderMutation.mutateAsync(orderData);
      clearCart();
      toast.success("Order placed successfully!");
      router.push(`/order-confirmation/${result.orderNumber}`);
    } catch (error: unknown) {
      if (axios.isAxiosError<{ message?: string }>(error)) {
        toast.error(error.response?.data?.message || "Failed to place order");
        return;
      }

      toast.error("Failed to place order");
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold mb-4">Checkout</h1>
        <p className="text-gray-600 mb-8">
          You need items in your cart to checkout.
        </p>
        <Link
          href="/shop"
          className={buttonVariants({ className: "bg-emerald-600" })}
        >
          Back to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col lg:flex-row gap-10"
      >
        <CheckoutForms
          form={form}
          shippingZones={shippingZones || []}
          addresses={addresses}
        />

        <CheckoutSummary
          items={items}
          currentSubtotal={currentSubtotal}
          total={total}
          shippingCost={shippingCost}
          selectedZoneSlug={selectedZoneSlug}
          discount={discount}
          couponCode={couponCode}
          canUseCoupon={isAuthenticated}
          setCouponCode={setCouponCode}
          handleApplyCoupon={handleApplyCoupon}
          handleRemoveCoupon={handleRemoveCoupon}
          isSubmitting={isSubmitting}
          isValidatingCoupon={validateCouponMutation.isPending}
        />
      </form>
    </div>
  );
}
