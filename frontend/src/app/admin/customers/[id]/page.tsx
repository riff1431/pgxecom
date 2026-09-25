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
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";

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
      <div className="p-8 text-center text-muted-foreground font-medium">
        Customer not found
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" className="border-border text-foreground hover:bg-muted">
            <Link href="/admin/customers">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground font-mono uppercase tracking-wider">
              {customer.name}
            </h1>
            <p className="text-sm text-muted-foreground">{customer.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Dialog open={mailDialogOpen} onOpenChange={setMailDialogOpen}>
            <DialogTrigger className="inline-flex items-center justify-center font-mono uppercase tracking-wider text-xs px-4 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-xs transition-all">
              <Mail className="h-4 w-4 mr-2" /> Mail Customer
            </DialogTrigger>
            <DialogContent className="sm:max-w-140 rounded-xl bg-card border-border text-card-foreground">
              <DialogHeader>
                <DialogTitle className="text-foreground font-mono uppercase">Send Email to {customer.name}</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Send a direct message to this customer from the admin dashboard.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="mail-subject" className="text-foreground">Subject</Label>
                  <Input
                    id="mail-subject"
                    value={mailSubject}
                    onChange={(e) => setMailSubject(e.target.value)}
                    placeholder="Order update regarding your account"
                    className="rounded-lg bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mail-message" className="text-foreground">Message</Label>
                  <Textarea
                    id="mail-message"
                    value={mailMessage}
                    onChange={(e) => setMailMessage(e.target.value)}
                    placeholder="Write your message here..."
                    rows={8}
                    className="rounded-lg bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" className="border-border text-foreground hover:bg-muted" onClick={() => setMailDialogOpen(false)}>Cancel</Button>
                <Button
                  onClick={handleSendMail}
                  disabled={mailMutation.isPending}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold font-mono uppercase tracking-wider text-xs shadow-xs"
                >
                  {mailMutation.isPending ? "Sending..." : "Send Email"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button
            onClick={handleToggleBan}
            disabled={banMutation.isPending || unbanMutation.isPending}
            variant="outline"
            className="border-border bg-card text-foreground hover:bg-muted"
          >
            {customer.isBanned ? (
              <>
                <ShieldCheck className="h-4 w-4 mr-2 text-emerald-500" /> Unban Customer
              </>
            ) : (
              <>
                <Ban className="h-4 w-4 mr-2 text-destructive" /> Ban Customer
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-xs p-5">
        <div className="flex items-center gap-2 mb-4">
          <UserRound className="h-4 w-4 text-primary" />
          <h2 className="font-semibold text-foreground font-mono uppercase tracking-wider">Customer Overview</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Phone</p>
            <p className="font-medium text-foreground">
              {customer.phone || "No phone"}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Account Status</p>
            <Badge
              className={
                customer.isBanned
                  ? "bg-destructive/10 text-destructive border border-destructive/20"
                  : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
              }
            >
              {customer.isBanned ? "Banned" : "Active"}
            </Badge>
          </div>
          <div>
            <p className="text-muted-foreground">Total Orders</p>
            <p className="font-medium text-foreground">
              {customer._count.orders}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Joined</p>
            <p className="font-medium text-foreground">
              {new Date(customer.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        {customer.isBanned && customer.banReason && (
          <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
            <span className="font-semibold">Ban reason:</span>{" "}
            {customer.banReason}
          </div>
        )}
      </div>

      <div className="bg-card rounded-xl shadow-xs border border-border">
        <div className="p-4 border-b border-border flex flex-wrap gap-4 items-center bg-muted/30">
          <div className="relative flex-1 min-w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search order number..."
              className="pl-10 h-11 rounded-lg bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary"
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
            triggerClassName="w-[180px] h-11 rounded-lg bg-background border-border text-foreground"
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
              <thead className="bg-muted/40 border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                    Order
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                    Date
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                    Items
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                    Total
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(customerOrdersData?.data || []).map((order) => {
                  const statusConfig = ORDER_STATUSES[order.status] || {
                    label: order.status,
                    color: "bg-muted text-muted-foreground",
                  };

                  return (
                    <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-mono font-medium text-primary">
                        #{order.orderNumber}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-foreground">{order.items?.length || 0}</td>
                      <td className="px-4 py-3 font-medium text-foreground">
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
                          className="text-sm text-primary hover:underline font-mono"
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
              <AdminEmptyState
                title="No orders found for this customer"
                description="When this customer places an order, it will appear here."
              />
            )}
          </div>
        )}

        {customerOrdersData?.meta && customerOrdersData.meta.totalPage > 1 && (
          <div className="p-4 border-t border-border bg-muted/20">
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
