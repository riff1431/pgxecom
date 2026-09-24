"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ORDER_STATUSES } from "@/lib/constants";
import type { Order } from "@/types";
import { ArrowLeft, Calendar, Printer } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { InvoicePrintTemplate } from "./InvoicePrintTemplate";
import { useGetInvoiceDetails } from "@/lib/api/order";

interface OrderDetailHeaderProps {
  order: Order;
  onUpdateStatus: (value: string | null) => void;
}

const CAN_PRINT_INVOICE_STATUSES = new Set([
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "RETURNED",
]);

export function OrderDetailHeader({
  order,
  onUpdateStatus,
}: OrderDetailHeaderProps) {
  const statusConfig = ORDER_STATUSES[order.status] || {
    label: order.status,
    color: "bg-gray-100 text-gray-800",
  };

  const canPrintInvoice = CAN_PRINT_INVOICE_STATUSES.has(order.status);
  
  const { data: invoiceData, isLoading } = useGetInvoiceDetails(order.id, canPrintInvoice);

  const printRef = useRef<HTMLDivElement>(null);
  
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Invoice_${order.orderNumber}`
  });

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:gap-2">
      <div className="flex items-center gap-4">
        <Button asChild className="print:hidden bg-[#0b1322] border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800" variant="outline">
          <Link href="/admin/orders">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>

        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white font-mono uppercase tracking-wider">
              Order #{order.orderNumber}
            </h1>
            <Badge className={`${statusConfig.color} border-0`}>
              {statusConfig.label}
            </Badge>
          </div>
          <p className="mt-1 flex items-center gap-1 text-sm text-slate-400">
            <Calendar className="h-3.5 w-3.5 text-[#00a3ff]" />
            {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 print:hidden">
        {canPrintInvoice && (
          <>
            <Button variant="outline" className="bg-[#0b1322] border-slate-800 text-slate-200 hover:bg-slate-800 hover:text-white font-mono uppercase text-xs" onClick={() => handlePrint()} disabled={isLoading || !invoiceData}>
              <Printer className="mr-2 h-4 w-4 text-[#00a3ff]" />
              {isLoading ? "Loading..." : "Print Invoice"}
            </Button>
            {invoiceData && <InvoicePrintTemplate ref={printRef} data={invoiceData} />}
          </>
        )}

        <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
          Status:
        </span>
        <Select defaultValue={order.status} onValueChange={onUpdateStatus}>
          <SelectTrigger className="w-45 bg-[#0b1322] border-slate-800 text-white font-mono text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#0b1322] border-slate-800 text-white">
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="CONFIRMED">Confirmed</SelectItem>
            <SelectItem value="PROCESSING">Processing</SelectItem>
            <SelectItem value="SHIPPED">Shipped</SelectItem>
            <SelectItem value="DELIVERED">Delivered</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
            <SelectItem value="RETURNED">Returned</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
