import { AdminStatusToggle } from "@/components/admin/AdminStatusToggle";
import { AdminTable } from "@/components/admin/AdminTable";
import { Button } from "@/components/ui/button";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AdminCoupon } from "@/types";
import { Pencil } from "lucide-react";

interface CouponsTableProps {
  coupons: AdminCoupon[];
  togglingId?: string | null;
  onEdit: (coupon: AdminCoupon) => void;
  onToggle: (coupon: AdminCoupon) => void;
}

const formatDiscount = (coupon: AdminCoupon) => {
  if (coupon.discountType === "PERCENTAGE") {
    return `${coupon.discountValue}%`;
  }

  return `€${coupon.discountValue}`;
};

export function CouponsTable({
  coupons,
  togglingId,
  onEdit,
  onToggle,
}: CouponsTableProps) {
  return (
    <AdminTable>
      <TableHeader>
        <TableRow className="hover:bg-transparent bg-[#080e18] border-slate-800/80">
          <TableHead className="font-mono font-bold text-slate-400 text-xs uppercase tracking-wider">Code</TableHead>
          <TableHead className="font-mono font-bold text-slate-400 text-xs uppercase tracking-wider">Type</TableHead>
          <TableHead className="font-mono font-bold text-slate-400 text-xs uppercase tracking-wider">Usage</TableHead>
          <TableHead className="font-mono font-bold text-slate-400 text-xs uppercase tracking-wider">Valid Until</TableHead>
          <TableHead className="font-mono font-bold text-slate-400 text-xs uppercase tracking-wider">Status</TableHead>
          <TableHead className="text-right font-mono font-bold text-slate-400 text-xs uppercase tracking-wider">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {coupons.map((coupon) => (
          <TableRow
            key={coupon.id}
            className="group hover:bg-slate-800/40 border-slate-800/60 transition-colors"
          >
            <TableCell>
              <p className="font-bold font-mono text-white tracking-wide">{coupon.code}</p>
              <p className="text-xs text-slate-400 line-clamp-1">
                {coupon.description || "No description"}
              </p>
            </TableCell>
            <TableCell className="text-sm font-bold font-mono text-[#00a3ff]">
              {formatDiscount(coupon)}
            </TableCell>
            <TableCell className="text-sm font-mono text-slate-300">
              {coupon.usedCount}
              {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ""}
            </TableCell>
            <TableCell className="text-sm font-mono text-slate-400">
              {coupon.expiresAt
                ? new Date(coupon.expiresAt).toLocaleDateString()
                : "No expiry"}
            </TableCell>
            <TableCell>
              <AdminStatusToggle
                checked={coupon.isActive}
                onCheckedChange={() => onToggle(coupon)}
                disabled={togglingId === coupon.id}
                activeLabel="Enabled"
                inactiveLabel="Disabled"
              />
            </TableCell>
            <TableCell className="text-right">
              <div className="flex items-center justify-end gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onEdit(coupon)}
                  className="border-slate-700 bg-slate-800/60 hover:bg-slate-700 text-slate-200 h-8 w-8 rounded-lg"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </AdminTable>
  );
}
