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
    <div className="max-w-4xl mx-auto">
      <header className="mb-12 text-left">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Account Settings</h1>
        <p className="mt-2 text-gray-500 font-medium">Privacy, security, and notification preferences.</p>
      </header>

      <div className="space-y-6">
        {/* Security Section */}
        <section className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/30 overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-50 flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
                <h2 className="font-bold text-gray-900 text-xl text-left">Login & Security</h2>
            </div>
            <div className="p-8 space-y-6">
                <form onSubmit={handlePasswordChange} className="flex flex-col gap-4 text-left">
                    <label className="text-sm font-bold text-gray-700 ml-1">Change Password</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="relative">
                            <Input 
                                type={showPassword ? "text" : "password"} 
                                placeholder="Current Password" 
                                value={formData.currentPassword}
                                onChange={e => setFormData({...formData, currentPassword: e.target.value})}
                                className="h-14 rounded-2xl border-gray-100 focus:ring-emerald-500 bg-gray-50/50"
                                required
                            />
                            <button 
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                                type="button"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                        <Input 
                            type={showPassword ? "text" : "password"} 
                            placeholder="New Password" 
                            value={formData.newPassword}
                            onChange={e => setFormData({...formData, newPassword: e.target.value})}
                            className="h-14 rounded-2xl border-gray-100 focus:ring-emerald-500 bg-gray-50/50"
                            required
                        />
                        <Input 
                            type={showPassword ? "text" : "password"} 
                            placeholder="Confirm New Password" 
                            value={formData.confirmPassword}
                            onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                            className="h-14 rounded-2xl border-gray-100 focus:ring-emerald-500 bg-gray-50/50"
                            required
                        />
                    </div>
                    <Button 
                        type="submit"
                        disabled={changePasswordMutation.isPending}
                        className="h-14 font-bold bg-emerald-600 hover:bg-emerald-700 rounded-2xl w-fit px-8 mt-2"
                    >
                        {changePasswordMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Update Password"}
                    </Button>
                </form>
            </div>
        </section>
      </div>
    </div>
  );
}
