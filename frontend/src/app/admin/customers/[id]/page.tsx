"use client";

import { AppPagination } from "@/components/shared/AppPagination";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  useBanAdminCustomer,
  useGetAdminCustomerDetails,
  useGetAdminCustomerOrders,
  useMailAdminCustomer,
  useUnbanAdminCustomer,
} from "@/lib/api/user";
import { CURRENCY, ORDER_STATUSES } from "@/lib/constants";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Ban,
  Mail,
  Search,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { use, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useDebounceValue } from "usehooks-ts";

export default function AdminCustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const queryClient = useQueryClient();

  const [mailDialogOpen, setMailDialogOpen] = useState(false);
  const [mailSubject, setMailSubject] = useState("");
  const [mailMessage, setMailMessage] = useState("");

  const [orderParams, setOrderParams] = useQueryStates(
    {
      orderPage: parseAsInteger.withDefault(1),
      orderLimit: parseAsInteger.withDefault(10),
      orderSearch: parseAsString.withDefault(""),
      orderStatus: parseAsString.withDefault("all"),
    },
    {
      shallow: false,
      history: "push",
    },
  );

  const [debouncedOrderSearch] = useDebounceValue(orderParams.orderSearch, 600);

  const { data: customer, isLoading: isCustomerLoading } =
    useGetAdminCustomerDetails(id);

  const { data: customerOrdersData, isLoading: isOrdersLoading } =
    useGetAdminCustomerOrders(
      id,
      {
        page: orderParams.orderPage,
        limit: orderParams.orderLimit,
        search: debouncedOrderSearch,
        status: orderParams.orderStatus,
      },
      !!id,
    );

  const banMutation = useBanAdminCustomer();
  const unbanMutation = useUnbanAdminCustomer();
  const mailMutation = useMailAdminCustomer();

  const previousOrderFilterRef = useRef({
    search: debouncedOrderSearch,
    status: orderParams.orderStatus,
  });

  useEffect(() => {
    const filtersChanged =
      previousOrderFilterRef.current.search !== debouncedOrderSearch ||
      previousOrderFilterRef.current.status !== orderParams.orderStatus;

    if (filtersChanged && orderParams.orderPage !== 1) {
      setOrderParams({ orderPage: 1 });
    }

    previousOrderFilterRef.current = {
      search: debouncedOrderSearch,
      status: orderParams.orderStatus,
    };
  }, [
    debouncedOrderSearch,
    orderParams.orderStatus,
    orderParams.orderPage,
    setOrderParams,
  ]);

  const invalidateCustomerQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "customers"] });
    queryClient.invalidateQueries({ queryKey: ["admin", "customers", id] });
    queryClient.invalidateQueries({
      queryKey: ["admin", "customers", id, "orders"],
    });
  };

  const handleToggleBan = () => {
    if (!customer) return;

    if (customer.isBanned) {
      unbanMutation.mutate(customer.id, {
        onSuccess: () => {
          toast.success("Customer unbanned successfully");
          invalidateCustomerQueries();
        },
        onError: () => toast.error("Failed to unban customer"),
      });
      return;
    }

    banMutation.mutate(
      { id: customer.id },
      {
        onSuccess: () => {
          toast.success("Customer banned successfully");
          invalidateCustomerQueries();
        },
        onError: () => toast.error("Failed to ban customer"),
      },
    );
  };

  const handleSendMail = () => {
    if (!customer) return;

    const subject = mailSubject.trim();
    const message = mailMessage.trim();

    if (!subject || !message) {
      toast.error("Subject and message are required");
      return;
    }

    mailMutation.mutate(
      {
        id: customer.id,
        subject,
        message,
      },
      {
        onSuccess: () => {
          toast.success("Email sent successfully");
          setMailDialogOpen(false);
          setMailSubject("");
          setMailMessage("");
        },
        onError: () => {
          toast.error("Failed to send email");
        },
      },
    );
  };

  const orderStatusOptions = useMemo(
    () => [
      { value: "all", label: "All Status" },
      ...Object.keys(ORDER_STATUSES).map((status) => ({
        value: status,
        label: ORDER_STATUSES[status as keyof typeof ORDER_STATUSES].label,
      })),
    ],
    [],
  );

  if (isCustomerLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-35 w-full" />
        <Skeleton className="h-95 w-full" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="p-8 text-center text-gray-500 font-medium">
        Customer not found
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Button asChild>
            <Link href="/admin/customers">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {customer.name}
            </h1>
            <p className="text-sm text-gray-500">{customer.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Dialog open={mailDialogOpen} onOpenChange={setMailDialogOpen}>
            <DialogTrigger className={buttonVariants()}>
              <Mail className="h-4 w-4 mr-2" /> Mail Customer
            </DialogTrigger>
            <DialogContent className="sm:max-w-140 rounded-2xl">
              <DialogHeader>
                <DialogTitle>Send Email to {customer.name}</DialogTitle>
                <DialogDescription>
                  Send a direct message to this customer from the admin
                  dashboard.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="mail-subject">Subject</Label>
                  <Input
                    id="mail-subject"
                    value={mailSubject}
                    onChange={(e) => setMailSubject(e.target.value)}
                    placeholder="Order update regarding your account"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mail-message">Message</Label>
                  <Textarea
                    id="mail-message"
                    value={mailMessage}
                    onChange={(e) => setMailMessage(e.target.value)}
                    placeholder="Write your message here..."
                    rows={8}
                    className="rounded-xl"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button onClick={() => setMailDialogOpen(false)}>Cancel</Button>
                <Button
                  onClick={handleSendMail}
                  disabled={mailMutation.isPending}
                >
                  {mailMutation.isPending ? "Sending..." : "Send Email"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button
            onClick={handleToggleBan}
            disabled={banMutation.isPending || unbanMutation.isPending}
          >
            {customer.isBanned ? (
              <>
                <ShieldCheck className="h-4 w-4 mr-2" /> Unban Customer
              </>
            ) : (
              <>
                <Ban className="h-4 w-4 mr-2" /> Ban Customer
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="bg-white border rounded-xl shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <UserRound className="h-4 w-4 text-gray-500" />
          <h2 className="font-semibold text-gray-900">Customer Overview</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Phone</p>
            <p className="font-medium text-gray-900">
              {customer.phone || "No phone"}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Account Status</p>
            <Badge
              className={
                customer.isBanned
                  ? "bg-red-100 text-red-700 border-0"
                  : "bg-emerald-100 text-emerald-700 border-0"
              }
            >
              {customer.isBanned ? "Banned" : "Active"}
            </Badge>
          </div>
          <div>
            <p className="text-gray-500">Total Orders</p>
            <p className="font-medium text-gray-900">
              {customer._count.orders}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Joined</p>
            <p className="font-medium text-gray-900">
              {new Date(customer.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        {customer.isBanned && customer.banReason && (
          <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700">
            <span className="font-semibold">Ban reason:</span>{" "}
            {customer.banReason}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-4 border-b flex flex-wrap gap-4 items-center bg-gray-50/50">
          <div className="relative flex-1 min-w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search order number..."
              className="pl-10 h-11 rounded-xl"
              value={orderParams.orderSearch}
              onChange={(e) => setOrderParams({ orderSearch: e.target.value })}
            />
          </div>

          <Combobox
            options={orderStatusOptions}
            value={orderParams.orderStatus}
            onValueChange={(val) =>
              setOrderParams({ orderStatus: val || "all" })
            }
            placeholder="All Status"
            searchPlaceholder="Search status..."
            triggerClassName="w-[180px] h-11 rounded-xl"
          />
        </div>

        {isOrdersLoading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="w-full h-14" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50/60 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    Order
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    Date
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    Items
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    Total
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    Status
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {(customerOrdersData?.data || []).map((order) => {
                  const statusConfig = ORDER_STATUSES[order.status] || {
                    label: order.status,
                    color: "bg-gray-100 text-gray-800",
                  };

                  return (
                    <tr key={order.id} className="border-b last:border-b-0">
                      <td className="px-4 py-3 font-medium text-emerald-600">
                        #{order.orderNumber}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">{order.items?.length || 0}</td>
                      <td className="px-4 py-3 font-medium">
                        {CURRENCY}
                        {order.total}
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={`${statusConfig.color} border-0`}>
                          {statusConfig.label}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="text-sm text-emerald-600 hover:underline"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {customerOrdersData?.data?.length === 0 && (
              <div className="py-16 text-center text-gray-500">
                No orders found for this customer.
              </div>
            )}
          </div>
        )}

        {customerOrdersData?.meta && customerOrdersData.meta.totalPage > 1 && (
          <div className="p-4 border-t bg-gray-50/30">
            <AppPagination
              currentPage={orderParams.orderPage}
              totalPages={customerOrdersData.meta.totalPage}
              onPageChange={(page) => setOrderParams({ orderPage: page })}
            />
          </div>
        )}
      </div>
    </div>
  );
}
