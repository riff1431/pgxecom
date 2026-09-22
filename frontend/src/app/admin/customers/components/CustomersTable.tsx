import { AdminStatusToggle } from "@/components/admin/AdminStatusToggle";
import { AdminTable } from "@/components/admin/AdminTable";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AdminCustomer } from "@/types";
import { Eye, MoreHorizontal } from "lucide-react";
import Link from "next/link";

interface CustomersTableProps {
  customers: AdminCustomer[];
  actionLoadingId?: string | null;
  onToggleBan: (customer: AdminCustomer) => void;
}

export function CustomersTable({
  customers,
  actionLoadingId,
  onToggleBan,
}: CustomersTableProps) {
  return (
    <AdminTable>
      <TableHeader>
        <TableRow>
          <TableHead>Customer</TableHead>
          <TableHead>Contact</TableHead>
          <TableHead>Orders</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Joined</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {customers.map((customer) => (
          <TableRow key={customer.id}>
            <TableCell>
              <p className="font-medium text-gray-900">{customer.name}</p>
              <p className="text-xs text-gray-500 truncate max-w-48">
                {customer.email}
              </p>
            </TableCell>
            <TableCell className="text-sm text-gray-600">
              {customer.phone || "No phone"}
            </TableCell>
            <TableCell className="text-sm font-medium">
              {customer._count.orders}
            </TableCell>
            <TableCell>
              <AdminStatusToggle
                checked={!customer.isBanned}
                onCheckedChange={() => onToggleBan(customer)}
                disabled={actionLoadingId === customer.id}
                activeLabel="Active"
                inactiveLabel="Banned"
              />
            </TableCell>
            <TableCell className="text-sm text-gray-600">
              {new Date(customer.createdAt).toLocaleDateString()}
            </TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Button variant="outline" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Link
                      href={`/admin/customers/${customer.id}`}
                      className="flex items-center w-full"
                    >
                      <Eye className="h-4 w-4 mr-2" /> View Details
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </AdminTable>
  );
}
