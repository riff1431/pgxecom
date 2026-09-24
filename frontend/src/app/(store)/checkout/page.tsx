"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { LogIn, ShoppingBag } from "lucide-react";

import { useValidateCoupon } from "@/lib/api/coupon";
import { useCreateOrder } from "@/lib/api/order";
import { useGetActiveShippingZones } from "@/lib/api/shipping";
import { useCreateAddress, useGetAddresses } from "@/lib/api/user";
import { useAuth } from "@/providers/AuthProvider";
import { useWallet } from "@/providers/WalletProvider";
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
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { balance, refresh: refreshWallet } = useWallet();

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
      country: "United States",
      paymentMethod: "WALLET",
      saveAddress: false,
    },
  });

  const {
    handleSubmit,
    watch,
    setValue,
    formState: { isSubmitting },
  } = form;

  // Auto-fill user profile info if available
  useEffect(() => {
    if (user) {
      if (user.name) setValue("name", user.name);
      if (user.email) setValue("email", user.email);
      if (user.phone) setValue("phone", user.phone);
    }
  }, [user, setValue]);

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
        setValue("addressLine2", defaultAddr.addressLine2 || "");
        setValue("area", defaultAddr.area || "");
        setValue("city", defaultAddr.city);
        setValue("state", defaultAddr.state || "");
        setValue("postalCode", defaultAddr.zipCode || "");
        setValue("country", defaultAddr.country || "United States");
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
  const total = Math.max(0, currentSubtotal + shippingCost - Number(discount?.amount || 0));

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

    if (!isAuthenticated || !user) {
      toast.error("Please log in or sign up to complete order payment with your PGX Universal Wallet.");
      router.push(`/login?redirect=/checkout`);
      return;
    }

    if (balance < total) {
      toast.error(
        `Insufficient PGX Wallet balance (€${balance.toFixed(2)} available, €${total.toFixed(2)} required). Please top up your wallet.`,
      );
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
          addressLine2: data.addressLine2 || data.area || "",
          city: data.city,
          state: data.state,
          zipCode: data.postalCode,
          country: data.country,
          zone: data.zone,
          label: "HOME",
          isDefault: addresses?.length === 0,
        });
        finalAddressId = newAddr.id;
      }

      const orderData = {
        userId: user.id,
        addressId: finalAddressId,
        guestName: data.name,
        guestPhone: data.phone,
        guestEmail: data.email || user.email,
        shippingAddress: {
          name: data.name,
          phone: data.phone,
          street: data.street,
          addressLine2: data.addressLine2 || "",
          area: data.area || "",
          city: data.city,
          state: data.state || "",
          postalCode: data.postalCode || "",
          country: data.country || "United States",
          zone: data.zone,
        },
        zone: data.zone,
        notes: data.notes,
        paymentMethod: "WALLET",
        items: items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
        })),
        couponCode: isAuthenticated ? discount?.code : undefined,
      };

      const result = await createOrderMutation.mutateAsync(orderData);
      clearCart();
      await refreshWallet();
      toast.success("Order placed and paid successfully via PGX Universal Wallet!");
      router.push(`/order-confirmation/${result.orderNumber}`);
    } catch (error: unknown) {
      if (axios.isAxiosError<{ message?: string }>(error)) {
        toast.error(error.response?.data?.message || "Failed to place order");
        return;
      }

      toast.error("Failed to place order");
    }
  };

  if (!isAuthLoading && !isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-xl text-center">
        <div className="w-16 h-16 bg-[#00a3ff]/10 text-[#0070cc] rounded-full flex items-center justify-center mx-auto mb-6">
          <LogIn className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-black text-gray-900 mb-3">Login Required for Checkout</h1>
        <p className="text-gray-600 mb-8 leading-relaxed">
          Orders on the PGX store are processed securely through your <strong>Universal PGX Wallet</strong>. Please log in or create an account to proceed with your order.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/login?redirect=/checkout"
            className="px-6 py-3.5 rounded-xl bg-[#00a3ff] hover:bg-[#008fdf] text-white font-bold text-sm shadow-lg shadow-[#00a3ff]/20 transition-all"
          >
            Sign In to Account
          </Link>
          <Link
            href="/register?redirect=/checkout"
            className="px-6 py-3.5 rounded-xl border border-slate-300 hover:bg-slate-50 font-bold text-sm text-gray-700 transition-all"
          >
            Create New Account
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-md">
        <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold mb-3 text-gray-900">Your Cart is Empty</h1>
        <p className="text-gray-600 mb-8 text-sm">
          Explore our premium catalog of high-performance gear, apparel, and equipment.
        </p>
        <Link
          href="/shop"
          className="inline-block px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
        >
          Explore Store
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="mb-8 space-y-1">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Express International Checkout</h1>
        <p className="text-sm text-slate-500">
          Fast worldwide fulfillment with seamless Universal PGX Wallet debit payment.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col lg:flex-row gap-10"
      >
        <CheckoutForms
          form={form}
          shippingZones={shippingZones || []}
          addresses={addresses}
          totalOrderAmount={total}
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

