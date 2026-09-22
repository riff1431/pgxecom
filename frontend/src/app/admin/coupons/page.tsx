"use client";

import { AppPagination } from "@/components/shared/AppPagination";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGetAdminCoupons,
  useToggleAdminCouponStatus,
} from "@/lib/api/coupon";
import type { AdminCoupon } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { FilterX, Plus, Search } from "lucide-react";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useDebounceValue } from "usehooks-ts";

import { CouponDialog } from "./components/CouponDialog";
import { CouponsTable } from "./components/CouponsTable";

export default function AdminCouponsPage() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<AdminCoupon | null>(
    null,
  );
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const [params, setParams] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      limit: parseAsInteger.withDefault(10),
      search: parseAsString.withDefault(""),
      status: parseAsString.withDefault("all"),
    },
    {
      shallow: false,
      history: "push",
    },
  );

  const [debouncedSearch] = useDebounceValue(params.search, 600);

  const previousFilterRef = useRef({
    search: debouncedSearch,
    status: params.status,
  });

  const { data: couponsData, isLoading } = useGetAdminCoupons({
    page: params.page,
    limit: params.limit,
    search: debouncedSearch,
    status: params.status as "all" | "active" | "inactive",
  });

  const toggleMutation = useToggleAdminCouponStatus();

  useEffect(() => {
    const filtersChanged =
      previousFilterRef.current.search !== debouncedSearch ||
      previousFilterRef.current.status !== params.status;

    if (filtersChanged && params.page !== 1) {
      setParams({ page: 1 });
    }

    previousFilterRef.current = {
      search: debouncedSearch,
      status: params.status,
    };
  }, [debouncedSearch, params.page, params.status, setParams]);

  const clearFilters = () => {
    setParams({
      page: 1,
      search: "",
      status: "all",
    });
  };

  const handleCreate = () => {
    setSelectedCoupon(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (coupon: AdminCoupon) => {
    setSelectedCoupon(coupon);
    setIsDialogOpen(true);
  };

  const handleToggle = async (coupon: AdminCoupon) => {
    try {
      setTogglingId(coupon.id);
      await toggleMutation.mutateAsync({
        id: coupon.id,
        isActive: !coupon.isActive,
      });
      toast.success(
        `Coupon ${coupon.isActive ? "disabled" : "enabled"} successfully`,
      );
      queryClient.invalidateQueries({ queryKey: ["admin", "coupons"] });
    } catch {
      toast.error("Failed to update coupon status");
    } finally {
      setTogglingId(null);
    }
  };

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Disabled" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>
          <p className="text-sm text-gray-500 mt-1">
            Create, manage, and control coupon campaigns.
          </p>
        </div>

        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" /> New Coupon
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border mt-4">
        <div className="p-4 border-b flex flex-wrap gap-4 items-center bg-gray-50/50">
          <div className="relative flex-1 min-w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search coupon code or description..."
              className="pl-10 h-11 rounded-xl"
              value={params.search}
              onChange={(e) => setParams({ search: e.target.value })}
            />
          </div>

          <Combobox
            options={statusOptions}
            value={params.status}
            onValueChange={(val) => setParams({ status: val || "all" })}
            placeholder="All Status"
            searchPlaceholder="Search status..."
            triggerClassName="w-[180px] h-11 rounded-xl"
          />

          {(params.search || params.status !== "all") && (
            <Button onClick={clearFilters}>
              <FilterX className="h-4 w-4 mr-2" /> Clear
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="w-full h-14" />
            ))}
          </div>
        ) : (
          <>
            <CouponsTable
              coupons={couponsData?.data || []}
              onEdit={handleEdit}
              onToggle={handleToggle}
              togglingId={togglingId}
            />

            {couponsData?.data?.length === 0 && (
              <div className="py-20 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-4">
                  <Search className="h-8 w-8 text-gray-300" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  No coupons found
                </h3>
                <p className="text-gray-500">
                  Try adjusting your filters or create a new coupon.
                </p>
              </div>
            )}
          </>
        )}

        {couponsData?.meta && couponsData.meta.totalPage > 1 && (
          <div className="p-4 border-t bg-gray-50/30">
            <AppPagination
              currentPage={params.page}
              totalPages={couponsData.meta.totalPage}
              onPageChange={(page) => setParams({ page })}
            />
          </div>
        )}
      </div>

      <CouponDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        coupon={selectedCoupon}
      />
    </div>
  );
}
