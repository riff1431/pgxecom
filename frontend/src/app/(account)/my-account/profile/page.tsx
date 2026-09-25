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
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <header className="text-left pb-4 border-b border-border">
          <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold block mb-1">
            Personal Credentials
          </span>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-foreground uppercase tracking-tight">Athlete Profile</h1>
          <p className="mt-1 text-muted-foreground font-mono text-xs">Manage your athlete identity, email credentials and profile avatar.</p>
        </header>

        {/* Profile Card */}
        <div className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden">
          <div className="h-32 bg-linear-to-r from-card via-primary/10 to-muted relative">
            <div className="absolute inset-0 bg-[radial-gradient(currentColor_1px,transparent_1px)] [background-size:16px_16px] text-primary/20 pointer-events-none"></div>
          </div>
          
          <div className="px-6 pb-6 -mt-16">
            <div className="flex flex-col sm:flex-row sm:items-end gap-6 mb-8">
              <div className="relative group">
                <Avatar className="w-28 h-28">
                  <AvatarImage src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${user.avatar}`} className="object-cover" />
                  <AvatarFallback className="bg-primary/10 text-primary text-3xl font-mono font-black">
                    {user.name?.charAt(0)?.toUpperCase() || "U"}
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
                  className="absolute bottom-1 right-1 p-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-md transition-all hover:scale-105 disabled:opacity-50 cursor-pointer"
                  title="Upload avatar"
                >
                  {uploadAvatarMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin text-primary-foreground" />
                  ) : (
                    <Camera className="w-4 h-4 text-primary-foreground" />
                  )}
                </button>
              </div>
              
              <div className="flex-1 mb-1 text-left">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-2xl font-heading font-bold text-foreground">{user.name}</h2>
                  <span className="px-2.5 py-0.5 bg-primary/10 text-primary text-[10px] font-mono font-bold rounded-md uppercase tracking-wider border border-primary/20">
                    {user.role || "MEMBER"}
                  </span>
                </div>
                <p className="text-muted-foreground font-mono text-xs mt-1">Athlete since {new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name Field */}
              <div className="space-y-2 group text-left">
                <label className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest ml-1">Full Name</label>
                <div className="flex items-center gap-2">
                  {isEditingName ? (
                    <div className="flex-1 flex gap-2">
                      <Input 
                        value={name} 
                        onChange={(e) => setName(e.target.value)}
                        className="h-12 rounded-xl border-input bg-muted/30 text-foreground focus:border-primary transition-all font-mono"
                      />
                      <Button onClick={handleUpdateName} className="h-12 w-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground p-0 cursor-pointer">
                        <Check className="w-5 h-5" />
                      </Button>
                      <Button onClick={() => setIsEditingName(false)} variant="outline" className="h-12 w-12 rounded-xl border-border bg-background text-muted-foreground hover:text-foreground p-0 cursor-pointer">
                        <X className="w-5 h-5" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-between h-12 px-4 bg-muted/30 rounded-xl border border-border hover:border-primary/40 transition-all text-left">
                      <div className="flex items-center gap-3">
                        <UserIcon className="w-4 h-4 text-primary" />
                        <span className="text-foreground font-medium text-sm">{user.name}</span>
                      </div>
                      <button 
                        onClick={() => setIsEditingName(true)}
                        className="text-primary font-mono text-xs font-bold hover:text-primary/80 uppercase tracking-wider cursor-pointer"
                      >
                        Edit
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Phone Field */}
              <div className="space-y-2 text-left">
                <label className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest ml-1">Contact Phone</label>
                <div className="flex items-center justify-between h-12 px-4 bg-muted/20 rounded-xl border border-border/80 cursor-not-allowed">
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground font-mono text-sm">{user.phone || "Not provided"}</span>
                  </div>
                  <Info className="w-4 h-4 text-muted-foreground" />
                </div>
                <p className="text-[10px] text-muted-foreground mt-1 ml-1 font-mono">* Primary phone locked for account security verification.</p>
              </div>

              {/* Email Field */}
              <div className="space-y-2 col-span-full text-left">
                <label className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest ml-1">Email Credentials</label>
                <div className="flex items-center justify-between h-14 px-4 bg-muted/30 rounded-xl border border-border hover:border-primary/40 transition-all">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-primary" />
                    <div className="flex flex-col">
                      <span className="text-foreground font-mono font-bold text-sm leading-tight">{user.email}</span>
                      {user.isVerified && (
                        <span className="text-[10px] text-emerald-500 dark:text-emerald-400 font-mono font-bold tracking-wider flex items-center gap-1 uppercase mt-0.5">
                          Verified Athlete <ShieldCheck className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowEmailModal(true)}
                    className="text-primary font-mono text-xs font-bold hover:text-primary/80 uppercase tracking-wider cursor-pointer"
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
        <DialogContent className="sm:max-w-[480px] bg-card border border-border text-foreground rounded-2xl p-0 overflow-hidden shadow-xl">
          <div className="h-1.5 bg-primary"></div>
          <div className="p-6 sm:p-8">
            <DialogHeader className="mb-6 text-left">
              <DialogTitle className="text-xl font-heading font-black uppercase text-foreground">Change Email Address</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground font-mono mt-1">
                {step === "email" 
                  ? "Enter your new email address. We'll send a 6-digit confirmation code." 
                  : "Enter the 6-digit verification code sent to your new email."}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5">
              {step === "email" ? (
                <div className="space-y-2 text-left">
                  <label className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-wider ml-1">New Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      placeholder="athlete@domain.com" 
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="h-12 pl-11 rounded-xl border-input bg-muted/30 text-foreground font-mono text-sm focus:border-primary"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2 text-center">
                  <label className="text-xs font-mono font-bold block mb-3 uppercase tracking-widest text-primary">Verification Code</label>
                  <Input 
                    placeholder="000000" 
                    value={otp}
                    maxLength={6}
                    onChange={(e) => setOtp(e.target.value)}
                    className="h-16 text-center text-3xl font-mono font-black tracking-[0.8rem] rounded-xl border-input bg-muted/30 text-foreground focus:border-primary"
                  />
                </div>
              )}

              <Button 
                onClick={step === "email" ? handleRequestEmailChange : handleVerifyEmail}
                disabled={requestEmailMutation.isPending || verifyEmailMutation.isPending}
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-mono font-bold uppercase tracking-wider text-sm transition-all cursor-pointer shadow-xs"
              >
                {step === "email" ? "Send Verification Code" : "Verify & Update Email"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              
              {step === "otp" && (
                <button 
                  onClick={() => setStep("email")}
                  className="w-full text-center text-xs font-mono text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider cursor-pointer"
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
