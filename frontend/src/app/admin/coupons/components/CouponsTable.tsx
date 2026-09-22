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

  return `৳${coupon.discountValue}`;
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
        <TableRow>
          <TableHead>Code</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Usage</TableHead>
          <TableHead>Valid Until</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {coupons.map((coupon) => (
          <TableRow key={coupon.id}>
            <TableCell>
              <p className="font-semibold text-gray-900">{coupon.code}</p>
              <p className="text-xs text-gray-500 line-clamp-1">
                {coupon.description || "No description"}
              </p>
            </TableCell>
            <TableCell className="text-sm font-medium text-gray-700">
              {formatDiscount(coupon)}
            </TableCell>
            <TableCell className="text-sm text-gray-600">
              {coupon.usedCount}
              {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ""}
            </TableCell>
            <TableCell className="text-sm text-gray-600">
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
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(coupon)}
                  className="h-8 w-8"
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
