"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChangePassword } from "@/lib/api/user";
import { useAuth } from "@/providers/AuthProvider";
import {
    Eye,
    EyeOff,
    Loader2,
    ShieldCheck
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function SettingsPage() {
  const { logout } = useAuth();
  const changePasswordMutation = useChangePassword();

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
        return toast.error("New passwords do not match");
    }

    if (formData.newPassword.length < 6) {
        return toast.error("New password must be at least 6 characters");
    }

    try {
        await changePasswordMutation.mutateAsync({
            currentPassword: formData.currentPassword,
            newPassword: formData.newPassword
        });
        toast.success("Password changed successfully");
        setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to change password");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 text-left">
      <header className="text-left pb-4 border-b border-border">
        <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold block mb-1">
          Security & Access
        </span>
        <h1 className="text-2xl sm:text-3xl font-heading font-black text-foreground uppercase tracking-tight">Account Settings</h1>
        <p className="mt-1 text-muted-foreground font-mono text-xs">Manage credential authentication and password security preferences.</p>
      </header>

      <div className="space-y-6">
        {/* Security Section */}
        <section className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden">
            <div className="px-6 py-5 border-b border-border flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <h2 className="font-heading font-bold text-foreground text-lg uppercase tracking-wide text-left">Password & Authentication</h2>
            </div>
            <div className="p-6 sm:p-8 space-y-6">
                <form onSubmit={handlePasswordChange} className="flex flex-col gap-5 text-left">
                    <div>
                      <label className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-wider block mb-2">Update Password</label>
                      <p className="text-xs text-muted-foreground font-mono mb-4">Ensure your account uses a strong password with at least 6 characters.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="relative">
                            <Input 
                                type={showPassword ? "text" : "password"} 
                                placeholder="Current Password" 
                                value={formData.currentPassword}
                                onChange={e => setFormData({...formData, currentPassword: e.target.value})}
                                className="h-12 rounded-xl border-input bg-muted/30 text-foreground font-mono text-sm focus:border-primary"
                                required
                            />
                            <button 
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                                type="button"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        <Input 
                            type={showPassword ? "text" : "password"} 
                            placeholder="New Password" 
                            value={formData.newPassword}
                            onChange={e => setFormData({...formData, newPassword: e.target.value})}
                            className="h-12 rounded-xl border-input bg-muted/30 text-foreground font-mono text-sm focus:border-primary"
                            required
                        />
                        <Input 
                            type={showPassword ? "text" : "password"} 
                            placeholder="Confirm New Password" 
                            value={formData.confirmPassword}
                            onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                            className="h-12 rounded-xl border-input bg-muted/30 text-foreground font-mono text-sm focus:border-primary"
                            required
                        />
                    </div>
                    <Button 
                        type="submit"
                        disabled={changePasswordMutation.isPending}
                        className="h-12 font-mono font-bold uppercase tracking-wider text-sm bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl w-fit px-8 mt-2 transition-all cursor-pointer shadow-xs"
                    >
                        {changePasswordMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update Password"}
                    </Button>
                </form>
            </div>
        </section>
      </div>
    </div>
  );
}
