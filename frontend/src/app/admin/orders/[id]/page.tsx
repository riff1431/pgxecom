"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useGetAdminOrderDetails, useUpdateOrderStatus } from "@/lib/api/order";
import { useQueryClient } from "@tanstack/react-query";
import { use } from "react";
import { toast } from "sonner";
import { OrderCustomerCard } from "../components/OrderCustomerCard";
import { OrderDetailHeader } from "../components/OrderDetailHeader";
import { OrderItemsTable } from "../components/OrderItemsTable";
import { OrderNotesCard } from "../components/OrderNotesCard";
import { OrderShippingCard } from "../components/OrderShippingCard";

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const queryClient = useQueryClient();

  const { data: order, isLoading } = useGetAdminOrderDetails(id);

  const updateStatusMutation = useUpdateOrderStatus();

  const handleUpdateStatus = (val: string | null) => {
    if (!val) return;
    const toastId = toast.loading("Updating order status...");
    updateStatusMutation.mutate(
      { id, status: val },
      {
        onSuccess: () => {
          toast.success(`Order status updated to ${val.replace(/_/g, " ")}!`, {
            id: toastId,
          });
          queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
        },
        onError: () => toast.error("Failed to update status", { id: toastId }),
      },
    );
  };

  if (isLoading)
    return (
      <div className="p-8 space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-100 w-full" />
      </div>
    );
  if (!order)
    return (
      <div className="p-8 text-center text-gray-500 font-medium">
        Order not found
      </div>
    );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <OrderDetailHeader order={order} onUpdateStatus={handleUpdateStatus} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <OrderCustomerCard order={order} />
          <OrderShippingCard order={order} />
        </div>

        <div className="md:col-span-2 space-y-6">
          <OrderItemsTable order={order} />
          <OrderNotesCard notes={order.notes} />
        </div>
      </div>
    </div>
  );
}
