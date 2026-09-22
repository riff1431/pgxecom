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
    country: "Bangladesh",
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
      country: "Bangladesh",
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
      country: addr.country,
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
    <div className="max-w-4xl mx-auto py-12 px-4">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 text-left">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">
            Shipping Addresses
          </h1>
          <p className="mt-2 text-gray-500 font-medium">
            Manage your delivery locations for faster checkout.
          </p>
        </div>
        <Button
          onClick={handleOpenAdd}
          className="h-14 px-8 bg-emerald-600 hover:bg-emerald-700 rounded-2xl shadow-xl shadow-emerald-100 font-bold gap-2 transition-all hover:scale-105"
        >
          <Plus className="w-5 h-5" /> Add New Address
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading ? (
          [1, 2].map((i) => (
            <div
              key={i}
              className="h-64 bg-gray-100 animate-pulse rounded-[2.5rem]"
            ></div>
          ))
        ) : addresses?.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-gray-50 rounded-[2.5rem] border border-dashed border-gray-200">
            <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900">
              No addresses found
            </h3>
            <p className="text-gray-500 mt-2">
              You haven't saved any shipping addresses yet.
            </p>
          </div>
        ) : (
          addresses?.map((address: any) => (
            <motion.div
              key={address.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`group bg-white p-8 rounded-[2.5rem] border transition-all relative overflow-hidden text-left ${
                address.isDefault
                  ? "border-emerald-200 shadow-emerald-50/50 shadow-xl"
                  : "border-gray-100 shadow-xl shadow-gray-200/30"
              }`}
            >
              {address.isDefault && (
                <div className="absolute top-0 right-0 p-4">
                  <div className="bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Default
                  </div>
                </div>
              )}

              <div className="flex items-start gap-4 mt-2">
                <div
                  className={`p-3 rounded-2xl transition-colors ${address.isDefault ? "bg-emerald-50" : "bg-gray-50 group-hover:bg-emerald-50"}`}
                >
                  {address.label?.toLowerCase() === "home" ? (
                    <Home className="w-6 h-6 text-emerald-600" />
                  ) : (
                    <Briefcase className="w-6 h-6 text-emerald-600" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg uppercase tracking-tight">
                    {address.label || "ADDRESS"}
                  </h3>
                  <p className="text-sm font-black text-emerald-600 mb-2">
                    {address.name}
                  </p>
                  <div className="text-gray-500 font-medium mt-1 leading-relaxed">
                    <p>{address.addressLine1}</p>
                    {address.addressLine2 && <p>{address.addressLine2}</p>}
                    <p>
                      {address.city}, {address.state}
                    </p>
                    <p>
                      {address.zipCode}, {address.country}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-between">
                <div className="text-sm font-bold text-gray-400">
                  {address.phone}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpenEdit(address)}
                    className="h-10 w-10 rounded-xl hover:bg-emerald-50 hover:text-emerald-600"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setAddressToDelete(address.id)}
                    className="h-10 w-10 rounded-xl hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-[600px] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
          <div className="p-8">
            <DialogHeader className="mb-8">
              <DialogTitle className="text-2xl font-black">
                {editingAddress ? "Edit Shipping Address" : "Add New Address"}
              </DialogTitle>
              <DialogDescription>
                Please provide your full delivery details below.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2 text-left">
                <Label className="font-bold ml-1">Recipient Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Full Name"
                  className="h-14 rounded-2xl border-gray-100 bg-gray-50/50"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 text-left">
                  <Label className="font-bold ml-1">Type</Label>
                  <div className="flex gap-2">
                    {["HOME", "OFFICE"].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, label: type })
                        }
                        className={`flex-1 py-3 rounded-2xl border-2 font-black text-sm transition-all ${
                          formData.label === type
                            ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                            : "border-gray-100 text-gray-400 hover:border-gray-200"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2 text-left">
                  <Label className="font-bold ml-1">Contact Phone</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="01XXXXXXXXX"
                    className="h-14 rounded-2xl border-gray-100 bg-gray-50/50"
                    required
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2 text-left">
                  <Label className="font-bold ml-1">Address Line 1</Label>
                  <Input
                    value={formData.addressLine1}
                    onChange={(e) =>
                      setFormData({ ...formData, addressLine1: e.target.value })
                    }
                    placeholder="House, Road, Area"
                    className="h-14 rounded-2xl border-gray-100 bg-gray-50/50"
                    required
                  />
                </div>
                <div className="space-y-2 text-left">
                  <Label className="font-bold ml-1">
                    Address Line 2 (Optional)
                  </Label>
                  <Input
                    value={formData.addressLine2}
                    onChange={(e) =>
                      setFormData({ ...formData, addressLine2: e.target.value })
                    }
                    placeholder="Apartment, Studio, Floor"
                    className="h-14 rounded-2xl border-gray-100 bg-gray-50/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2 text-left">
                  <Label className="font-bold ml-1">City</Label>
                  <Input
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    className="h-14 rounded-2xl border-gray-100 bg-gray-50/50"
                    required
                  />
                </div>
                <div className="space-y-2 text-left">
                  <Label className="font-bold ml-1">State/Province</Label>
                  <Input
                    value={formData.state}
                    onChange={(e) =>
                      setFormData({ ...formData, state: e.target.value })
                    }
                    className="h-14 rounded-2xl border-gray-100 bg-gray-50/50"
                    required
                  />
                </div>
                <div className="space-y-2 text-left">
                  <Label className="font-bold ml-1">ZIP / Postal</Label>
                  <Input
                    value={formData.zipCode}
                    onChange={(e) =>
                      setFormData({ ...formData, zipCode: e.target.value })
                    }
                    className="h-14 rounded-2xl border-gray-100 bg-gray-50/50"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 p-2">
                <Checkbox
                  id="default"
                  checked={formData.isDefault}
                  onCheckedChange={(val) =>
                    setFormData({ ...formData, isDefault: !!val })
                  }
                />
                <label
                  htmlFor="default"
                  className="text-sm font-bold text-gray-500 cursor-pointer"
                >
                  Set as default shipping address
                </label>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowModal(false)}
                  className="flex-1 h-14 rounded-2xl border-gray-100 font-bold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    createMutation.isPending || updateMutation.isPending
                  }
                  className="flex-[2] h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold shadow-lg shadow-emerald-100"
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
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
        <AlertDialogContent className=" border-none p-8">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black">
              Are you absolutely sure?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500 font-medium">
              This action cannot be undone. This will permanently delete your
              shipping address.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 gap-3">
            <AlertDialogCancel className="h-14 rounded-2xl border-gray-100 font-bold flex-1">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="h-14 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold flex-1 shadow-lg shadow-red-100"
            >
              Delete Address
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
