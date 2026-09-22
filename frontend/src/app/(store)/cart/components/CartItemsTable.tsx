"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CURRENCY } from "@/lib/constants";

interface CartItemsTableProps {
  items: any[];
  updateQuantity: (productId: string, qty: number, variantId?: string) => void;
  removeItem: (productId: string, variantId?: string) => void;
  clearCart: () => void;
}

export function CartItemsTable({ items, updateQuantity, removeItem, clearCart }: CartItemsTableProps) {
  return (
    <div className="flex-1 space-y-4">
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="p-6">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b text-sm text-gray-500">
                <th className="pb-4 font-medium">Product</th>
                <th className="pb-4 font-medium text-center">Quantity</th>
                <th className="pb-4 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={`${item.productId}-${item.variantId}`} className="border-b last:border-0">
                  <td className="py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg shrink-0 overflow-hidden border border-gray-100 flex items-center justify-center">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-gray-400 text-xs">IMG</span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{item.name}</h3>
                        {item.variantName && <p className="text-sm text-gray-500">{item.variantName}</p>}
                        <p className="text-sm font-bold text-slate-900 mt-1">{CURRENCY}{item.price}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center justify-center">
                      <div className="flex items-center border rounded-lg">
                        <button onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variantId)} className="p-2 hover:bg-gray-50 text-gray-600">
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variantId)} className="p-2 hover:bg-gray-50 text-gray-600">
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <button onClick={() => removeItem(item.productId, item.variantId)} className="p-2 ml-2 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                          <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                  <td className="py-4 text-right font-semibold text-gray-900">
                    {CURRENCY}{item.price * item.quantity}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-gray-50 p-4 border-t flex justify-end">
          <Button variant="outline" onClick={clearCart} className="text-red-600 hover:text-red-700 hover:bg-red-50">Clear Cart</Button>
        </div>
      </div>
    </div>
  );
}
