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
      <SheetContent className="w-full sm:max-w-lg flex flex-col pb-2 bg-background border-border">
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-foreground font-bold">
              <ShoppingBag className="h-5 w-5 text-primary" />
              Cart ({totalItems})
            </span>
            {items.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearCart}
                className="text-destructive hover:text-destructive hover:bg-destructive/10 text-xs"
              >
                Clear All
              </Button>
            )}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <ShoppingBag className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <h3 className="font-semibold text-foreground mb-1">Your cart is empty</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Add some products to get started
            </p>
            <Link
              href="/shop"
              className={buttonVariants({ variant: "default" })}
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
                    className="flex gap-3 p-3 rounded-xl bg-muted/40 border border-border"
                  >
                    <div className="w-16 h-16 bg-muted border border-border rounded-lg shrink-0 flex items-center justify-center text-muted-foreground text-xs overflow-hidden">
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
                      <h4 className="font-semibold text-sm text-foreground truncate">
                        {item.name}
                      </h4>
                      {item.variantName && (
                        <p className="text-xs text-muted-foreground">{item.variantName}</p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        {/* Quantity */}
                        <div className="flex items-center gap-1 border border-border rounded-lg bg-background">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.productId,
                                item.quantity - 1,
                                item.variantId
                              )
                            }
                            disabled={item.quantity <= 1}
                            className="p-1 hover:bg-muted rounded-l-lg disabled:opacity-30 transition-colors"
                          >
                            <Minus className="h-3 w-3 text-muted-foreground" />
                          </button>
                          <span className="text-sm font-semibold w-8 text-center text-foreground">
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
                            className="p-1 hover:bg-muted rounded-r-lg transition-colors"
                          >
                            <Plus className="h-3 w-3 text-muted-foreground" />
                          </button>
                        </div>

                        {/* Price */}
                        <span className="font-bold text-sm text-primary">
                          {CURRENCY}{item.price * item.quantity}
                        </span>
                      </div>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => removeItem(item.productId, item.variantId)}
                      className="p-1 h-fit text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="pt-4 px-6 border-t border-border space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-bold text-foreground">
                  {CURRENCY}{subtotal.toFixed(0)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
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
                  className={buttonVariants({ variant: "default", className: "w-full font-bold" })}
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
