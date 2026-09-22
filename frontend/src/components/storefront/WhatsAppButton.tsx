"use client";

import { useStoreSettings } from "@/providers/StoreSettingsProvider";
import { MessageCircle } from "lucide-react";

export function WhatsAppButton() {
  const { whatsappNumber } = useStoreSettings();
  const normalizedNumber = whatsappNumber
    .replace(/\+/g, "")
    .replace(/\s+/g, "");
  const whatsappUrl = `https://wa.me/${normalizedNumber}?text=${encodeURIComponent("Hi! I'd like to place an order.")}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl transition-all hover:scale-110 group"
      aria-label="Order via WhatsApp"
    >
      <MessageCircle className="h-7 w-7 text-white" />
      <span className="absolute right-full mr-3 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        Order via WhatsApp
      </span>
    </a>
  );
}
