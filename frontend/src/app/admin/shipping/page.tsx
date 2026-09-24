"use client";

import { useQueryClient } from "@tanstack/react-query";
import { PencilLine, Save, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { AdminDeleteDialog } from "@/components/admin/AdminDeleteDialog";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatusToggle } from "@/components/admin/AdminStatusToggle";
import { AdminTable } from "@/components/admin/AdminTable";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useCreateAdminShippingZone,
  useDeleteAdminShippingZone,
  useGetAdminShippingZones,
  useToggleAdminShippingZone,
  useUpdateAdminShippingZone,
} from "@/lib/api/shipping";
import type { ShippingZone } from "@/types";

interface ShippingFormState {
  name: string;
  slug: string;
  cost: string;
  isActive: boolean;
}

const emptyForm: ShippingFormState = {
  name: "",
  slug: "",
  cost: "",
  isActive: true,
};

export default function AdminShippingPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<ShippingZone | null>(null);
  const [deleteZone, setDeleteZone] = useState<ShippingZone | null>(null);
  const [form, setForm] = useState<ShippingFormState>(emptyForm);

  const { data: zones = [], isLoading } = useGetAdminShippingZones();
  const createMutation = useCreateAdminShippingZone();
  const updateMutation = useUpdateAdminShippingZone();
  const toggleMutation = useToggleAdminShippingZone();
  const deleteMutation = useDeleteAdminShippingZone();

  const filteredZones = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return zones;

    return zones.filter((zone) =>
      [zone.name, zone.slug].some((value) =>
        value.toLowerCase().includes(term),
      ),
    );
  }, [zones, search]);

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "shipping-zones"] });
    queryClient.invalidateQueries({ queryKey: ["shipping-zones"] });
  };

  const openCreate = () => {
    setEditingZone(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEdit = (zone: ShippingZone) => {
    setEditingZone(zone);
    setForm({
      name: zone.name,
      slug: zone.slug,
      cost: String(zone.cost),
      isActive: zone.isActive,
    });
    setFormOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.slug.trim() || !form.cost.trim()) {
      toast.error("Name, slug, and cost required");
      return;
    }

    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      cost: Number(form.cost),
      isActive: form.isActive,
    };

    if (Number.isNaN(payload.cost)) {
      toast.error("Valid cost required");
      return;
    }

    try {
      if (editingZone) {
        await updateMutation.mutateAsync({ id: editingZone.id, data: payload });
        toast.success("Shipping zone updated");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Shipping zone created");
      }
      refresh();
      setFormOpen(false);
    } catch {
      toast.error("Failed to save shipping zone");
    }
  };

  const handleToggle = async (zone: ShippingZone) => {
    try {
      await toggleMutation.mutateAsync({
        id: zone.id,
        isActive: !zone.isActive,
      });
      toast.success(zone.isActive ? "Zone inactive" : "Zone active");
      refresh();
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async () => {
    if (!deleteZone) return;

    try {
      await deleteMutation.mutateAsync(deleteZone.id);
      toast.success("Shipping zone deleted");
      setDeleteZone(null);
      refresh();
    } catch {
      toast.error("Failed to delete shipping zone");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <AdminPageHeader
        title="Shipping"
        description="Manage delivery zones, active status, and delivery cost."
        actionLabel="Add Zone"
        onAction={openCreate}
      />

      <div className="bg-[#0b1322] rounded-xl shadow-sm border border-slate-800 overflow-hidden text-slate-100">
        <div className="p-4 border-b border-slate-800/80 flex items-center gap-3 bg-[#080e18]">
          <div className="relative flex-1 min-w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              className="pl-10 h-11 rounded-xl border-slate-700 bg-slate-900/90 text-white placeholder:text-slate-500 focus:border-[#00a3ff]"
              placeholder="Search by name or slug..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="p-4 space-y-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-12 w-full bg-slate-800/60" />
            ))}
          </div>
        ) : (
          <AdminTable>
            <TableHeader>
              <TableRow className="hover:bg-transparent bg-[#080e18] border-slate-800/80">
                <TableHead className="font-mono font-bold text-slate-400 text-xs uppercase tracking-wider">Zone</TableHead>
                <TableHead className="font-mono font-bold text-slate-400 text-xs uppercase tracking-wider">Slug</TableHead>
                <TableHead className="font-mono font-bold text-slate-400 text-xs uppercase tracking-wider">Delivery Cost</TableHead>
                <TableHead className="font-mono font-bold text-slate-400 text-xs uppercase tracking-wider">Status</TableHead>
                <TableHead className="text-right font-mono font-bold text-slate-400 text-xs uppercase tracking-wider">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredZones.map((zone) => (
                <TableRow
                  key={zone.id}
                  className="group hover:bg-slate-800/40 border-slate-800/60 transition-colors"
                >
                  <TableCell className="font-bold text-white leading-tight">{zone.name}</TableCell>
                  <TableCell className="font-mono text-xs text-slate-400">{zone.slug}</TableCell>
                  <TableCell className="font-mono font-bold text-[#00a3ff]">€{zone.cost}</TableCell>
                  <TableCell>
                    <AdminStatusToggle
                      checked={zone.isActive}
                      onCheckedChange={() => handleToggle(zone)}
                      activeLabel="Active"
                      inactiveLabel="Inactive"
                      disabled={toggleMutation.isPending}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => openEdit(zone)}
                        className="border-slate-700 bg-slate-800/60 hover:bg-slate-700 text-slate-200 h-8 w-8 rounded-lg"
                      >
                        <PencilLine className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 h-8 w-8 rounded-lg"
                        onClick={() => setDeleteZone(zone)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}

              {filteredZones.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-14 text-slate-400 font-mono text-xs"
                  >
                    No shipping zones found.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </AdminTable>
        )}
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-lg rounded-xl">
          <DialogHeader>
            <DialogTitle>
              {editingZone ? "Edit Shipping Zone" : "Create Shipping Zone"}
            </DialogTitle>
            <DialogDescription>
              Set delivery zone name, slug, cost, and active status.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="zone-name">Zone name</Label>
              <Input
                id="zone-name"
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="Inside Dhaka"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zone-slug">Slug</Label>
              <Input
                id="zone-slug"
                value={form.slug}
                onChange={(e) =>
                  setForm((p) => ({ ...p, slug: e.target.value }))
                }
                placeholder="inside_dhaka"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zone-cost">Delivery cost</Label>
              <Input
                id="zone-cost"
                type="number"
                min="0"
                step="0.01"
                value={form.cost}
                onChange={(e) =>
                  setForm((p) => ({ ...p, cost: e.target.value }))
                }
                placeholder="60"
              />
            </div>
            <label className="flex items-center gap-3 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) =>
                  setForm((p) => ({ ...p, isActive: e.target.checked }))
                }
                className="h-4 w-4 rounded border-gray-300 text-emerald-600"
              />
              Active
            </label>
          </div>

          <DialogFooter>
            <Button onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSave}
              disabled={createMutation.isPending || updateMutation.isPending}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {createMutation.isPending || updateMutation.isPending
                ? "Saving..."
                : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AdminDeleteDialog
        open={!!deleteZone}
        title="Delete shipping zone?"
        description={`This action cannot be undone. Zone ${deleteZone ? `\"${deleteZone.name}\"` : ""} will be removed.`}
        confirmLabel="Delete"
        isDeleting={deleteMutation.isPending}
        onOpenChange={(open) => !open && setDeleteZone(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
