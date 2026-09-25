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
        <TableRow className="hover:bg-transparent bg-muted/40 border-b border-border">
          <TableHead className="font-mono font-bold text-muted-foreground text-xs uppercase tracking-wider">Code</TableHead>
          <TableHead className="font-mono font-bold text-muted-foreground text-xs uppercase tracking-wider">Type</TableHead>
          <TableHead className="font-mono font-bold text-muted-foreground text-xs uppercase tracking-wider">Usage</TableHead>
          <TableHead className="font-mono font-bold text-muted-foreground text-xs uppercase tracking-wider">Valid Until</TableHead>
          <TableHead className="font-mono font-bold text-muted-foreground text-xs uppercase tracking-wider">Status</TableHead>
          <TableHead className="text-right font-mono font-bold text-muted-foreground text-xs uppercase tracking-wider">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {coupons.map((coupon) => (
          <TableRow
            key={coupon.id}
            className="group hover:bg-muted/30 border-b border-border transition-colors"
          >
            <TableCell>
              <p className="font-bold font-mono text-foreground tracking-wide">{coupon.code}</p>
              <p className="text-xs text-muted-foreground line-clamp-1">
                {coupon.description || "No description"}
              </p>
            </TableCell>
            <TableCell className="text-sm font-bold font-mono text-primary">
              {formatDiscount(coupon)}
            </TableCell>
            <TableCell className="text-sm font-mono text-foreground">
              {coupon.usedCount}
              {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ""}
            </TableCell>
            <TableCell className="text-sm font-mono text-muted-foreground">
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
                  className="border-border bg-background hover:bg-muted text-foreground h-8 w-8 rounded-lg"
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
