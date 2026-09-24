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
        <TableRow className="hover:bg-transparent bg-[#080e18] border-slate-800/80">
          <TableHead className="font-mono font-bold text-slate-400 text-xs uppercase tracking-wider">Customer</TableHead>
          <TableHead className="font-mono font-bold text-slate-400 text-xs uppercase tracking-wider">Contact</TableHead>
          <TableHead className="font-mono font-bold text-slate-400 text-xs uppercase tracking-wider">Orders</TableHead>
          <TableHead className="font-mono font-bold text-slate-400 text-xs uppercase tracking-wider">Status</TableHead>
          <TableHead className="font-mono font-bold text-slate-400 text-xs uppercase tracking-wider">Joined</TableHead>
          <TableHead className="text-right font-mono font-bold text-slate-400 text-xs uppercase tracking-wider">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {customers.map((customer) => (
          <TableRow
            key={customer.id}
            className="group hover:bg-slate-800/40 border-slate-800/60 transition-colors"
          >
            <TableCell>
              <p className="font-bold text-white leading-tight">{customer.name}</p>
              <p className="text-xs text-slate-400 truncate max-w-48">
                {customer.email}
              </p>
            </TableCell>
            <TableCell className="text-sm font-mono text-slate-300">
              {customer.phone || "No phone"}
            </TableCell>
            <TableCell className="text-sm font-bold font-mono text-white">
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
            <TableCell className="text-sm font-mono text-slate-400">
              {new Date(customer.createdAt).toLocaleDateString()}
            </TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger
                  className="inline-flex items-center justify-center border border-slate-700 bg-slate-800/60 hover:bg-slate-700 text-slate-200 h-8 w-8 rounded-lg cursor-pointer transition-colors"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-[#0b1322] border-slate-800 text-slate-200">
                  <DropdownMenuItem className="p-0 focus:bg-slate-800">
                    <Link
                      href={`/admin/customers/${customer.id}`}
                      className="flex items-center w-full px-2 py-1.5 text-xs font-medium text-slate-200 hover:text-white"
                    >
                      <Eye className="h-4 w-4 mr-2 text-[#00a3ff]" /> View Details
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
