import React, { forwardRef } from "react";
import { format } from "date-fns";
import { useGetPublicSettings } from "@/lib/api/settings";
import { resolveImageUrl } from "@/lib/utils";

interface InvoicePrintTemplateProps {
  data: any; // Combined payload containing order and invoice entity
}

export const InvoicePrintTemplate = forwardRef<HTMLDivElement, InvoicePrintTemplateProps>(
  ({ data }, ref) => {
    const { data: settings } = useGetPublicSettings();

    if (!data) return null;

    const invoice = data.invoice;
    const invoiceNumber = invoice?.invoiceNumber || data.orderNumber;
    const date = invoice?.createdAt ? new Date(invoice.createdAt) : new Date(data.createdAt);

    // Dynamic settings extraction
    const getSetting = (key: string, fallback: string) => settings?.find((s: any) => s.key === key)?.value || fallback;
    const storeName = getSetting("store_name", "Brand Name");
    const storeLogo = settings?.find((s: any) => s.key === "store_logo")?.value;
    const storeTagline = getSetting("store_description", "Tagline Space Here");
    const storeEmail = getSetting("store_email", "info@brandname.com");
    const storePhone = getSetting("store_phone", "+880 1234-567890");
    const storeAddress = getSetting("store_address", "Dhaka, Bangladesh");

    // Fallback info just in case
    const addr = typeof data.shippingAddress === 'string' ? JSON.parse(data.shippingAddress) : data.shippingAddress;
    const addressString = addr?.street ? `${addr.street}, ${addr.area}, ${addr.city}` : "Address not provided";

    return (
      <div className="hidden">
        <div ref={ref} className="w-full bg-white p-12 font-sans text-gray-800" style={{ minHeight: '297mm', boxSizing: 'border-box' }}>
          {/* Header branding and logic to force colored backgrounds in print */}
          <style type="text/css" dangerouslySetInnerHTML={{
            __html: `
            @media print {
              body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            }
          `}} />

          {/* TOP LOGO AND INVOICE TITLE */}
          <div className="flex justify-between items-start mb-8 border-b-4 border-orange-400 pb-6">
            <div className="flex items-center gap-3">
              {storeLogo ? (
                <img src={resolveImageUrl(storeLogo)} alt="Store Logo" className="h-12 w-auto object-contain" />
              ) : (
                <div className="w-12 h-12 bg-orange-400 flex items-center justify-center rounded-lg text-white font-bold text-2xl mb-1">
                  {storeName.charAt(0)}
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">{storeName}</h1>
                {/* <p className="text-xs text-gray-500 tracking-widest font-medium uppercase mt-0.5">{storeTagline}</p> */}
              </div>
            </div>
            <div className="text-right">
              <h1 className="text-5xl font-bold tracking-widest text-[#2A313C]">INVOICE</h1>
            </div>
          </div>

          {/* CUSTOMER AND INVOICE DETAILS */}
          <div className="flex justify-between items-start mb-10">
            <div className="w-1/2">
              <h3 className="font-bold text-gray-800 mb-2">Invoice to:</h3>
              <h2 className="text-lg font-bold text-gray-900">{data.guestName || data.user?.name || "Customer"}</h2>
              <p className="text-sm text-gray-600 leading-tight mt-1 max-w-xs">
                {addressString}
              </p>
              <p className="text-sm text-gray-600 leading-tight mt-1">
                {data.guestPhone || data.user?.phone}
              </p>
            </div>

            <div className="w-1/3">
              <table className="w-full text-sm">
                <tbody>
                  <tr>
                    <td className="font-bold text-gray-800 pb-2">Invoice #</td>
                    <td className="text-right font-medium pb-2 text-gray-700">{invoiceNumber}</td>
                  </tr>
                  <tr>
                    <td className="font-bold text-gray-800 pb-2">Date</td>
                    <td className="text-right font-medium pb-2 text-gray-700">{format(date, "dd / MM / yyyy")}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* TABLE */}
          <div className="mb-8">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#2A313C] text-white text-sm">
                  <th className="py-2 px-3 text-left w-12 border border-[#2A313C]">No</th>
                  <th className="py-2 px-3 text-left border border-[#2A313C]">Item Description</th>
                  <th className="py-2 px-3 text-center border border-[#2A313C] w-16">Qty</th>
                  <th className="py-2 px-3 text-right border border-[#2A313C] w-28">Price</th>
                  <th className="py-2 px-3 text-right border border-[#2A313C] w-28">Total</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {data.items.map((item: any, idx: number) => (
                  <tr key={item.id} className="border-b border-gray-300">
                    <td className="py-3 px-3 border-x border-gray-300 text-center">{idx + 1}</td>
                    <td className="py-3 px-3 border-x border-gray-300">
                      <p className="font-semibold text-gray-900">{item.productName}</p>
                      {item.variantName && <p className="text-xs text-gray-500 mt-0.5">{item.variantName}</p>}
                    </td>
                    <td className="py-3 px-3 border-x border-gray-300 text-center">{item.quantity}</td>
                    <td className="py-3 px-3 border-x border-gray-300 text-right">৳{Number(item.unitPrice).toFixed(2)}</td>
                    <td className="py-3 px-3 border-x border-gray-300 text-right">৳{Number(item.totalPrice).toFixed(2)}</td>
                  </tr>
                ))}

                {/* Empty rows filler if there's very few items to maintain design height */}
                {Array.from({ length: Math.max(0, 8 - data.items.length) }).map((_, i) => (
                  <tr key={`empty-${i}`} className="border-b border-gray-300 h-10">
                    <td className="border-x border-gray-300"></td>
                    <td className="border-x border-gray-300"></td>
                    <td className="border-x border-gray-300"></td>
                    <td className="border-x border-gray-300"></td>
                    <td className="border-x border-gray-300"></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* TOTALS & PAYMENT INFO BLOCK */}
          <div className="flex justify-between items-start mb-16">
            <div className="w-1/2 pt-2">
              <h3 className="font-bold text-gray-800 mb-1">Payment Info:</h3>
              <p className="text-sm text-gray-600 leading-snug">
                Payment Method: <span className="font-semibold">{data.paymentMethod.replace(/_/g, " ")}</span><br />
                Payment Status: <span className="font-semibold">{data.paymentStatus}</span><br />
              </p>
            </div>
            <div className="w-64">
              <div className="flex justify-between py-2 px-3 border border-gray-300 border-b-0 bg-[#FD965D]/20">
                <span className="font-bold text-gray-800 text-sm">Sub Total</span>
                <span className="font-semibold text-sm">৳{Number(data.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 px-3 border border-gray-300 border-b-0 bg-[#FD965D]/25">
                <span className="font-bold text-gray-800 text-sm">Shipping</span>
                <span className="font-semibold text-sm">৳{Number(data.shippingCost).toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 px-3 border border-gray-300 border-b-0 bg-[#FD965D]/30">
                <span className="font-bold text-gray-800 text-sm">Discount</span>
                <span className="font-semibold text-sm">৳{Number(data.discount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 px-3 border border-gray-300 bg-[#FD965D] text-gray-900 border-[#FD965D]">
                <span className="font-bold text-sm">TOTAL</span>
                <span className="font-bold text-sm">৳{Number(data.total).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* FOOTER & TERMS */}
          <div className="flex justify-between items-end mb-8 mt-auto">
            <div className="w-1/2">
              <h3 className="font-bold text-gray-800 mb-1">Term & Condition</h3>
              <p className="text-xs text-gray-500 leading-tight mb-4 pr-6">
                No returns after 7 days of delivery. All physical goods must be returned in their original packaging and condition to be eligible for a refund.
              </p>
              <p className="text-sm font-bold text-gray-800">
                Thanks for your business.
              </p>
            </div>
            <div className="w-64 flex flex-col items-center">
              <div className="w-full border-t border-gray-400 mb-2"></div>
              <p className="text-sm font-semibold text-gray-800">Authorised Sign</p>
            </div>
          </div>

          {/* CONTACT STRIP */}
          <div className="border-t-4 border-orange-400 pt-3 flex justify-between tracking-tight text-xs text-gray-600 font-medium px-4">
            <span>Phone: {storePhone}</span>
            <span>Address: {storeAddress}</span>
            <span>Mail: {storeEmail}</span>
          </div>

        </div>
      </div>
    );
  }
);

InvoicePrintTemplate.displayName = "InvoicePrintTemplate";
