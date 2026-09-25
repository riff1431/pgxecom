"use client";

import { AppPagination } from "@/components/shared/AppPagination";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useBanAdminCustomer,
  useGetAdminCustomers,
  useUnbanAdminCustomer,
} from "@/lib/api/user";
import type { AdminCustomer } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { FilterX, Search } from "lucide-react";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useDebounceValue } from "usehooks-ts";
import { CustomersTable } from "./components/CustomersTable";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";

export default function AdminCustomersPage() {
  const queryClient = useQueryClient();
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

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

  const { data: customerData, isLoading } = useGetAdminCustomers({
    page: params.page,
    limit: params.limit,
    search: debouncedSearch,
    status: params.status as "all" | "active" | "banned",
  });

  const banMutation = useBanAdminCustomer();
  const unbanMutation = useUnbanAdminCustomer();

  const previousFilterRef = useRef({
    search: debouncedSearch,
    status: params.status,
  });

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

  const handleToggleBan = (customer: AdminCustomer) => {
    setActionLoadingId(customer.id);

    if (customer.isBanned) {
      unbanMutation.mutate(customer.id, {
        onSuccess: () => {
          toast.success("Customer unbanned successfully");
          queryClient.invalidateQueries({ queryKey: ["admin", "customers"] });
        },
        onError: () => {
          toast.error("Failed to unban customer");
        },
        onSettled: () => {
          setActionLoadingId(null);
        },
      });
      return;
    }

    banMutation.mutate(
      { id: customer.id },
      {
        onSuccess: () => {
          toast.success("Customer banned successfully");
          queryClient.invalidateQueries({ queryKey: ["admin", "customers"] });
        },
        onError: () => {
          toast.error("Failed to ban customer");
        },
        onSettled: () => {
          setActionLoadingId(null);
        },
      },
    );
  };

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "banned", label: "Banned" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight font-mono uppercase">
            Customers
          </h1>
          <p className="text-muted-foreground font-medium text-xs mt-1">
            Manage customer accounts, status, and communication.
          </p>
        </div>
      </div>

      <div className="bg-card rounded-xl shadow-xs border border-border mt-4 overflow-hidden text-card-foreground">
        <div className="p-4 border-b border-border flex flex-wrap gap-4 items-center bg-muted/30">
          <div className="relative flex-1 min-w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, phone..."
              className="pl-10 h-11 rounded-lg border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-primary"
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
            triggerClassName="w-[180px] h-11 rounded-lg bg-background border-border text-foreground"
          />

          {(params.search || params.status !== "all") && (
            <Button
              onClick={clearFilters}
              variant="outline"
              className="border-border bg-background text-foreground hover:bg-muted font-mono text-xs"
            >
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
            <CustomersTable
              customers={customerData?.data || []}
              onToggleBan={handleToggleBan}
              actionLoadingId={actionLoadingId}
            />
            {customerData?.data?.length === 0 && (
              <AdminEmptyState
                title="No customers found"
                description="Try adjusting your filters or search terms."
              />
            )}
          </>
        )}

        {customerData?.meta && customerData.meta.totalPage > 1 && (
          <div className="p-4 border-t border-border bg-muted/20">
            <AppPagination
              currentPage={params.page}
              totalPages={customerData.meta.totalPage}
              onPageChange={(page) => setParams({ page })}
            />
          </div>
        )}
      </div>
    </div>
  );
}
