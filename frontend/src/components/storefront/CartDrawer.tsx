"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { CURRENCY } from "@/lib/constants";
import { useCartStore } from "@/store/cart.store";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import Link from "next/link";

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, clearCart } =
    useCartStore();

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col pb-2">
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-emerald-600" />
              Cart ({totalItems})
            </span>
            {items.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearCart}
                className="text-red-500 hover:text-red-600 hover:bg-red-50 text-xs"
              >
                Clear All
              </Button>
            )}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <ShoppingBag className="h-16 w-16 text-gray-200 mb-4" />
            <h3 className="font-medium text-gray-700 mb-1">Your cart is empty</h3>
            <p className="text-sm text-gray-500 mb-6">
              Add some products to get started
            </p>
            <Link
              href="/shop"
              className={buttonVariants({ className: "bg-emerald-600 hover:bg-emerald-700" })}
              onClick={closeCart}
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={`${item.productId}-${item.variantId || ""}`}
                    className="flex gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100"
                  >
                    <div className="w-16 h-16 bg-gray-100 border border-gray-100 rounded-lg shrink-0 flex items-center justify-center text-gray-400 text-xs overflow-hidden">
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

                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-gray-800 truncate">
                        {item.name}
                      </h4>
                      {item.variantName && (
                        <p className="text-xs text-gray-500">{item.variantName}</p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        {/* Quantity */}
                        <div className="flex items-center gap-1 border rounded-lg">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.productId,
                                item.quantity - 1,
                                item.variantId
                              )
                            }
                            disabled={item.quantity <= 1}
                            className="p-1 hover:bg-gray-100 rounded-l-lg disabled:opacity-30"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-sm font-medium w-8 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.productId,
                                item.quantity + 1,
                                item.variantId
                              )
                            }
                            className="p-1 hover:bg-gray-100 rounded-r-lg"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        {/* Price */}
                        <span className="font-semibold text-sm text-emerald-700">
                          {CURRENCY}{item.price * item.quantity}
                        </span>
                      </div>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => removeItem(item.productId, item.variantId)}
                      className="p-1 h-fit text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="pt-4 px-6 border-t space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">
                  {CURRENCY}{subtotal.toFixed(0)}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Shipping calculated at checkout
              </p>

              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/cart"
                  className={buttonVariants({ variant: "outline", className: "w-full" })}
                  onClick={closeCart}
                >
                  View Cart
                </Link>
                <Link
                  href="/checkout"
                  className={buttonVariants({ className: "w-full bg-emerald-600 hover:bg-emerald-700" })}
                  onClick={closeCart}
                >
                  Checkout
                </Link>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
