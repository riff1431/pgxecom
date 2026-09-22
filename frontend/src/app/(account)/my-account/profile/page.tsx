"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useRequestEmailChange, useUpdateProfile, useUploadAvatar, useVerifyEmailChange } from "@/lib/api/user";
import { useAuth } from "@/providers/AuthProvider";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Camera,
  Check,
  Info,
  Loader2,
  Mail,
  ShieldCheck,
  Smartphone,
  User as UserIcon,
  X
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");

  const updateProfileMutation = useUpdateProfile();
  const requestEmailMutation = useRequestEmailChange();
  const verifyEmailMutation = useVerifyEmailChange();
  const uploadAvatarMutation = useUploadAvatar();

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { url } = await uploadAvatarMutation.mutateAsync(file);
      const updatedUser = await updateProfileMutation.mutateAsync({ avatar: url });
      updateUser(updatedUser);
      toast.success("Profile picture updated");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to upload image");
    }
  };

  const handleUpdateName = async () => {
    try {
      const updatedUser = await updateProfileMutation.mutateAsync({ name });
      updateUser(updatedUser);
      setIsEditingName(false);
      toast.success("Name updated successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update name");
    }
  };

  const handleRequestEmailChange = async () => {
    try {
      await requestEmailMutation.mutateAsync(newEmail);
      setStep("otp");
      toast.success("Verification code sent to your new email");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to request email change");
    }
  };

  const handleVerifyEmail = async () => {
    try {
      const updatedUser = await verifyEmailMutation.mutateAsync(otp);
      updateUser(updatedUser);
      setShowEmailModal(false);
      setStep("email");
      setNewEmail("");
      setOtp("");
      toast.success("Email updated successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Invalid verification code");
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto py-0 px-0">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-12"
      >
        <header className="text-left">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Account Profile</h1>
          <p className="mt-2 text-gray-500 font-medium">Manage your personal information and contact details.</p>
        </header>

        {/* Profile Card */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
          <div className="h-40 bg-gradient-to-r from-emerald-500 to-teal-600"></div>
          
          <div className="px-2 pb-2 -mt-20">
            <div className="flex flex-col md:flex-row md:items-end gap-6 mb-10">
              <div className="relative group">
                <Avatar className="w-40 h-40 border-8 border-white shadow-xl rounded-[2.5rem]">
                  <AvatarImage src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${user.avatar}`} className="object-cover" />
                  <AvatarFallback className="bg-emerald-100 text-emerald-600 text-4xl font-black">
                    {user.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                
                <input 
                  type="file" 
                  ref={avatarInputRef}
                  onChange={handleAvatarUpload}
                  accept="image/*"
                  className="hidden"
                />

                <button 
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={uploadAvatarMutation.isPending}
                  className="absolute bottom-2 right-2 p-3 bg-white hover:bg-gray-50 text-gray-900 rounded-2xl shadow-lg border border-gray-100 transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploadAvatarMutation.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
                  ) : (
                    <Camera className="w-5 h-5 text-gray-900" />
                  )}
                </button>
              </div>
              
              <div className="flex-1 mb-2 text-left">
                <div className="flex items-center gap-3">
                  <h2 className="text-3xl font-bold text-gray-900">{user.name}</h2>
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-full uppercase tracking-wider border border-emerald-100">
                    {user.role}
                  </span>
                </div>
                <p className="text-gray-500 font-medium mt-1">Customer since {new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Name Field */}
              <div className="space-y-2 group text-left">
                <label className="text-sm font-bold text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                <div className="flex items-center gap-3">
                  {isEditingName ? (
                    <div className="flex-1 flex gap-2">
                      <Input 
                        value={name} 
                        onChange={(e) => setName(e.target.value)}
                        className="h-14 rounded-2xl border-emerald-200 focus:ring-emerald-500 transition-all"
                      />
                      <Button onClick={handleUpdateName} className="h-14 w-14 rounded-2xl bg-emerald-600 shadow-emerald-100 shadow-lg p-0">
                        <Check className="w-6 h-6" />
                      </Button>
                      <Button onClick={() => setIsEditingName(false)} variant="outline" className="h-14 w-14 rounded-2xl border-gray-200 text-gray-400 p-0">
                        <X className="w-6 h-6" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-between h-14 px-6 bg-gray-50/50 rounded-2xl border border-transparent hover:border-gray-200 transition-all group-hover:bg-white text-left">
                      <div className="flex items-center gap-4">
                        <div className="bg-white p-2 rounded-xl shadow-sm"><UserIcon className="w-5 h-5 text-gray-400" /></div>
                        <span className="text-gray-900 font-bold">{user.name}</span>
                      </div>
                      <button 
                        onClick={() => setIsEditingName(true)}
                        className="text-emerald-600 font-bold text-sm hover:underline"
                      >
                        Edit
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Phone Field (Read Only) */}
              <div className="space-y-2 text-left">
                <label className="text-sm font-bold text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                <div className="flex items-center justify-between h-14 px-6 bg-gray-100/50 rounded-2xl border border-gray-100 cursor-not-allowed">
                  <div className="flex items-center gap-4">
                    <div className="bg-white p-2 rounded-xl shadow-sm"><Smartphone className="w-5 h-5 text-gray-400" /></div>
                    <span className="text-gray-500 font-bold">{user.phone}</span>
                  </div>
                  <Info className="w-4 h-4 text-gray-300" />
                </div>
                <p className="text-[10px] text-gray-400 mt-1 ml-1">* Phone number cannot be changed for security reasons.</p>
              </div>

              {/* Email Field */}
              <div className="space-y-2 col-span-full text-left">
                <label className="text-sm font-bold text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                <div className="flex items-center justify-between h-14 px-6 bg-gray-50/50 rounded-2xl border border-transparent hover:border-gray-200 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="bg-white p-2 rounded-xl shadow-sm"><Mail className="w-5 h-5 text-gray-400" /></div>
                    <div className="flex flex-col">
                        <span className="text-gray-900 font-bold leading-tight">{user.email}</span>
                        {user.isVerified && <span className="text-[10px] text-emerald-600 font-black tracking-widest flex items-center gap-1 uppercase">Verified <ShieldCheck className="w-2.5 h-2.5" /></span>}
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowEmailModal(true)}
                    className="text-emerald-600 font-bold text-sm hover:underline"
                  >
                    Change Email
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Email Change Modal */}
      <Dialog open={showEmailModal} onOpenChange={setShowEmailModal}>
        <DialogContent className="sm:max-w-[480px] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
          <div className="h-2 bg-emerald-500"></div>
          <div className="p-8">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl font-black">Change Email Address</DialogTitle>
              <DialogDescription className="text-base font-medium">
                {step === "email" 
                  ? "Enter your new email address. We'll send a code to verify it." 
                  : "Enter the 6-digit verification code sent to your new email."}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {step === "email" ? (
                <div className="space-y-2 text-left">
                  <label className="text-sm font-bold text-gray-700 ml-1">New Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input 
                      placeholder="new@example.com" 
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="h-14 pl-12 rounded-2xl border-gray-200 focus:ring-emerald-500 transition-all font-bold"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2 text-center">
                  <label className="text-sm font-bold text-gray-700 block mb-4 uppercase tracking-widest text-emerald-600">Verification Code</label>
                  <Input 
                    placeholder="000000" 
                    value={otp}
                    maxLength={6}
                    onChange={(e) => setOtp(e.target.value)}
                    className="h-20 text-center text-4xl font-black tracking-[1rem] rounded-2xl border-gray-200 focus:ring-emerald-500 transition-all text-gray-900"
                  />
                </div>
              )}

              <Button 
                onClick={step === "email" ? handleRequestEmailChange : handleVerifyEmail}
                disabled={requestEmailMutation.isPending || verifyEmailMutation.isPending}
                className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 rounded-2xl text-lg font-bold shadow-lg shadow-emerald-100 group"
              >
                {step === "email" ? "Send Verification Code" : "Verify & Update Email"}
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              {step === "otp" && (
                <button 
                  onClick={() => setStep("email")}
                  className="w-full text-center text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
                >
                  Change Email Address
                </button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
