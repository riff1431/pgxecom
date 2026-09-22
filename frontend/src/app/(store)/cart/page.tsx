"use client";

import Link from "next/link";
import { useCartStore } from "@/store/cart.store";
import { Button, buttonVariants } from "@/components/ui/button";
import { CartItemsTable } from "./components/CartItemsTable";
import { CartSummary } from "./components/CartSummary";

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, subtotal } = useCartStore();

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
