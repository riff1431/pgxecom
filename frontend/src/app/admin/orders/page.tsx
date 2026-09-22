"use client";

import { AppPagination } from "@/components/shared/AppPagination";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetAdminOrders } from "@/lib/api/order";
import { ORDER_STATUSES } from "@/lib/constants";
import { FilterX, Search } from "lucide-react";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { useEffect, useRef } from "react";
import { useDebounceValue } from "usehooks-ts";
import { OrdersTable } from "./components/OrdersTable";

export default function AdminOrdersPage() {
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

  const { data: adminOrdersData, isLoading } = useGetAdminOrders({
    page: params.page,
    limit: params.limit,
    search: debouncedSearch,
    status: params.status === "all" ? undefined : params.status,
  });

  // Reset page when filters change
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
  }, [debouncedSearch, params.status, params.page, setParams]);

  const clearFilters = () => {
    setParams({
      search: "",
      status: "all",
      page: 1,
    });
  };

  const statusOptions = [
    { value: "all", label: "All Status" },
    ...Object.keys(ORDER_STATUSES).map((status) => ({
      value: status,
      label: ORDER_STATUSES[status as keyof typeof ORDER_STATUSES].label,
    })),
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage and track customer orders.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border mt-4">
        <div className="p-4 border-b flex flex-wrap gap-4 items-center bg-gray-50/50">
          <div className="relative flex-1 min-w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search order ID, phone, customer..."
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
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="w-full h-14" />
            ))}
          </div>
        ) : (
          <>
            <OrdersTable orders={adminOrdersData?.data || []} />
            {adminOrdersData?.data?.length === 0 && (
              <div className="py-20 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-4">
                  <Search className="h-8 w-8 text-gray-300" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  No orders found
                </h3>
                <p className="text-gray-500">
                  Try adjusting your filters or search terms.
                </p>
              </div>
            )}
          </>
        )}

        {adminOrdersData?.meta && adminOrdersData.meta.totalPage > 1 && (
          <div className="p-4 border-t bg-gray-50/30">
            <AppPagination
              currentPage={params.page}
              totalPages={adminOrdersData.meta.totalPage}
              onPageChange={(page) => setParams({ page })}
            />
          </div>
        )}
      </div>
    </div>
  );
}
