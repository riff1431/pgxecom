"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useCreateAddress,
  useDeleteAddress,
  useGetAddresses,
  useUpdateAddress,
} from "@/lib/api/user";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Briefcase,
  CheckCircle2,
  Edit2,
  Home,
  Loader2,
  MapPin,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function AddressesPage() {
  const queryClient = useQueryClient();
  const { data: addresses, isLoading } = useGetAddresses();
  const createMutation = useCreateAddress();
  const updateMutation = useUpdateAddress();
  const deleteMutation = useDeleteAddress();

  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);
  const [addressToDelete, setAddressToDelete] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    label: "HOME",
    name: "", // Recipient Name
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",
    isDefault: false,
  });

  const handleOpenAdd = () => {
    setEditingAddress(null);
    setFormData({
      label: "HOME",
      name: "",
      phone: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      zipCode: "",
      country: "United States",
      isDefault: false,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (addr: any) => {
    setEditingAddress(addr);
    setFormData({
      label: addr.label,
      name: addr.name || "",
      phone: addr.phone,
      addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2 || "",
      city: addr.city,
      state: addr.state,
      zipCode: addr.zipCode,
      country: addr.country || "United States",
      isDefault: addr.isDefault,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAddress) {
        await updateMutation.mutateAsync({
          id: editingAddress.id,
          data: formData,
        });
        toast.success("Address updated");
      } else {
        await createMutation.mutateAsync(formData);
        toast.success("Address added");
      }
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      setShowModal(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  const handleDelete = async () => {
    if (!addressToDelete) return;
    try {
      await deleteMutation.mutateAsync(addressToDelete);
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      toast.success("Address removed");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete");
    } finally {
      setAddressToDelete(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800 text-left">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#00a3ff] font-bold block mb-1">
            Logistics & Delivery
          </span>
          <h1 className="text-2xl sm:text-3xl font-mono font-black text-white uppercase tracking-tight">
            Shipping Addresses
          </h1>
          <p className="mt-1 text-slate-400 font-mono text-xs">
            Manage your global delivery destinations for swift checkout.
          </p>
        </div>
        <Button
          onClick={handleOpenAdd}
          className="h-11 px-5 bg-[#00a3ff] hover:bg-cyan-500 text-white rounded-xl font-mono font-bold text-xs uppercase tracking-wider gap-2 shadow-lg shadow-[#00a3ff]/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Address
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading ? (
          [1, 2].map((i) => (
            <div
              key={i}
              className="h-56 bg-slate-900/60 animate-pulse rounded-2xl border border-slate-800"
            ></div>
          ))
        ) : addresses?.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-[#080d16] rounded-2xl border border-dashed border-slate-800">
            <MapPin className="w-12 h-12 text-slate-600 mx-auto mb-3 opacity-60" />
            <h3 className="text-lg font-mono font-bold text-white uppercase">
              No addresses saved
            </h3>
            <p className="text-slate-400 font-mono text-xs mt-1">
              Add your delivery address to enable 1-click international checkout.
            </p>
          </div>
        ) : (
          addresses?.map((address: any) => (
            <motion.div
              key={address.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`group bg-[#080d16] p-6 rounded-2xl border transition-all relative overflow-hidden text-left ${
                address.isDefault
                  ? "border-[#00a3ff]/50 shadow-lg shadow-[#00a3ff]/10"
                  : "border-slate-800 hover:border-slate-700 shadow-md"
              }`}
            >
              {address.isDefault && (
                <div className="absolute top-0 right-0 p-3">
                  <div className="bg-[#00a3ff]/15 text-[#00a3ff] px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 border border-[#00a3ff]/30">
                    <CheckCircle2 className="w-3 h-3" /> Default
                  </div>
                </div>
              )}

              <div className="flex items-start gap-4">
                <div
                  className={`p-3 rounded-xl transition-colors ${address.isDefault ? "bg-[#00a3ff]/10 text-[#00a3ff]" : "bg-slate-900 text-slate-400 group-hover:text-[#00a3ff]"}`}
                >
                  {address.label?.toLowerCase() === "home" ? (
                    <Home className="w-5 h-5" />
                  ) : (
                    <Briefcase className="w-5 h-5" />
                  )}
                </div>
                <div className="flex-1 pr-12">
                  <h3 className="font-mono font-bold text-white text-base uppercase tracking-tight">
                    {address.label || "ADDRESS"}
                  </h3>
                  <p className="text-xs font-mono font-bold text-[#00a3ff] mb-2 mt-0.5">
                    {address.name}
                  </p>
                  <div className="text-slate-400 font-sans text-xs leading-relaxed space-y-0.5">
                    <p>{address.addressLine1}</p>
                    {address.addressLine2 && <p>{address.addressLine2}</p>}
                    <p>
                      {address.city}, {address.state} {address.zipCode}
                    </p>
                    <p className="font-mono text-slate-300 font-semibold">{address.country}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <div className="text-xs font-mono text-slate-400">
                  {address.phone}
                </div>
                <div className="flex gap-1.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpenEdit(address)}
                    className="h-8 w-8 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setAddressToDelete(address.id)}
                    className="h-8 w-8 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-[560px] bg-[#0b1322] border border-slate-800 text-white rounded-2xl p-0 overflow-hidden shadow-2xl">
          <div className="h-1.5 bg-[#00a3ff]"></div>
          <div className="p-6 sm:p-8">
            <DialogHeader className="mb-6 text-left">
              <DialogTitle className="text-xl font-mono font-black uppercase text-white">
                {editingAddress ? "Edit Shipping Address" : "Add New Address"}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400 font-mono mt-1">
                Enter recipient delivery information for international shipping.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5 text-left">
                <Label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Recipient Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Full Name"
                  className="h-11 rounded-xl border-slate-700 bg-slate-900 text-white font-mono text-sm focus:border-[#00a3ff]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 text-left">
                  <Label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Type</Label>
                  <div className="flex gap-2">
                    {["HOME", "OFFICE"].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, label: type })
                        }
                        className={`flex-1 py-2 rounded-xl border font-mono font-bold text-xs uppercase tracking-wider transition-all ${
                          formData.label === type
                            ? "border-[#00a3ff] bg-[#00a3ff]/15 text-[#00a3ff]"
                            : "border-slate-800 text-slate-400 hover:border-slate-700"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5 text-left">
                  <Label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Contact Phone</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="+1 (555) 000-0000"
                    className="h-11 rounded-xl border-slate-700 bg-slate-900 text-white font-mono text-sm focus:border-[#00a3ff]"
                    required
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="space-y-1.5 text-left">
                  <Label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Address Line 1</Label>
                  <Input
                    value={formData.addressLine1}
                    onChange={(e) =>
                      setFormData({ ...formData, addressLine1: e.target.value })
                    }
                    placeholder="Street address, P.O. box"
                    className="h-11 rounded-xl border-slate-700 bg-slate-900 text-white font-mono text-sm focus:border-[#00a3ff]"
                    required
                  />
                </div>
                <div className="space-y-1.5 text-left">
                  <Label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                    Address Line 2 (Optional)
                  </Label>
                  <Input
                    value={formData.addressLine2}
                    onChange={(e) =>
                      setFormData({ ...formData, addressLine2: e.target.value })
                    }
                    placeholder="Apartment, suite, unit, building, floor"
                    className="h-11 rounded-xl border-slate-700 bg-slate-900 text-white font-mono text-sm focus:border-[#00a3ff]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5 text-left">
                  <Label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">City</Label>
                  <Input
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    placeholder="City"
                    className="h-11 rounded-xl border-slate-700 bg-slate-900 text-white font-mono text-sm focus:border-[#00a3ff]"
                    required
                  />
                </div>
                <div className="space-y-1.5 text-left">
                  <Label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">State/Prov</Label>
                  <Input
                    value={formData.state}
                    onChange={(e) =>
                      setFormData({ ...formData, state: e.target.value })
                    }
                    placeholder="State"
                    className="h-11 rounded-xl border-slate-700 bg-slate-900 text-white font-mono text-sm focus:border-[#00a3ff]"
                    required
                  />
                </div>
                <div className="space-y-1.5 text-left">
                  <Label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Postal Code</Label>
                  <Input
                    value={formData.zipCode}
                    onChange={(e) =>
                      setFormData({ ...formData, zipCode: e.target.value })
                    }
                    placeholder="ZIP"
                    className="h-11 rounded-xl border-slate-700 bg-slate-900 text-white font-mono text-sm focus:border-[#00a3ff]"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5 text-left">
                <Label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Country</Label>
                <Input
                  value={formData.country}
                  onChange={(e) =>
                    setFormData({ ...formData, country: e.target.value })
                  }
                  placeholder="Country (e.g., United States, Germany, UK)"
                  className="h-11 rounded-xl border-slate-700 bg-slate-900 text-white font-mono text-sm focus:border-[#00a3ff]"
                  required
                />
              </div>

              <div className="flex items-center space-x-2 py-2">
                <Checkbox
                  id="default"
                  checked={formData.isDefault}
                  onCheckedChange={(val) =>
                    setFormData({ ...formData, isDefault: !!val })
                  }
                  className="border-slate-600 data-[state=checked]:bg-[#00a3ff] data-[state=checked]:border-[#00a3ff]"
                />
                <label
                  htmlFor="default"
                  className="text-xs font-mono text-slate-300 cursor-pointer"
                >
                  Set as default shipping destination
                </label>
              </div>

              <div className="flex gap-3 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowModal(false)}
                  className="flex-1 h-11 rounded-xl border-slate-700 bg-slate-900 text-slate-300 font-mono text-xs uppercase tracking-wider hover:bg-slate-800 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    createMutation.isPending || updateMutation.isPending
                  }
                  className="flex-[2] h-11 bg-[#00a3ff] hover:bg-cyan-500 text-white rounded-xl font-mono font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#00a3ff]/20"
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : editingAddress ? (
                    "Save Changes"
                  ) : (
                    "Save Address"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!addressToDelete}
        onOpenChange={(open) => !open && setAddressToDelete(null)}
      >
        <AlertDialogContent className="bg-[#0b1322] border border-slate-800 text-white p-6 sm:p-8 rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-mono font-black uppercase text-white">
              Delete Address
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400 font-mono text-xs mt-1">
              This will permanently remove this shipping destination from your profile.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 gap-3">
            <AlertDialogCancel className="h-11 rounded-xl border-slate-700 bg-slate-900 text-slate-300 font-mono text-xs uppercase tracking-wider hover:bg-slate-800 hover:text-white flex-1">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="h-11 rounded-xl bg-red-600 hover:bg-red-700 text-white font-mono text-xs uppercase tracking-wider font-bold flex-1"
            >
              Confirm Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
