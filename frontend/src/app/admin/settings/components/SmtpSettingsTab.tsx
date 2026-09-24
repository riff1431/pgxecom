"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  Mail,
  RefreshCw,
  Send,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  useGetAdminSmtpSettings,
  useImportSmtpFromEnv,
  useTestAdminSmtpSettings,
  useUpdateAdminSmtpSettings,
} from "@/lib/api/settings";

export function SmtpSettingsTab() {
  const queryClient = useQueryClient();
  const { data: smtpData, isLoading } = useGetAdminSmtpSettings();

  const updateMutation = useUpdateAdminSmtpSettings();
  const testMutation = useTestAdminSmtpSettings();
  const importEnvMutation = useImportSmtpFromEnv();

  const [host, setHost] = useState("");
  const [port, setPort] = useState(587);
  const [secure, setSecure] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fromName, setFromName] = useState("");
  const [fromEmail, setFromEmail] = useState("");
  const [isEnabled, setIsEnabled] = useState(true);

  const [testEmail, setTestEmail] = useState("");
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    if (smtpData) {
      setHost(smtpData.host || "");
      setPort(smtpData.port || 587);
      setSecure(Boolean(smtpData.secure));
      setUsername(smtpData.username || "");
      setPassword(smtpData.password || (smtpData.hasPassword ? "••••••••••••" : ""));
      setFromName(smtpData.fromName || "");
      setFromEmail(smtpData.fromEmail || "");
      setIsEnabled(smtpData.isEnabled !== false);
    }
  }, [smtpData]);

  const handlePortChange = (val: number) => {
    setPort(val);
    if (val === 465) {
      setSecure(true);
    } else if (val === 587 || val === 25) {
      setSecure(false);
    }
  };

  const handleSave = async () => {
    if (!host.trim() || !fromEmail.trim() || !fromName.trim()) {
      toast.error("Host, From Name, and From Email are required");
      return;
    }

    try {
      await updateMutation.mutateAsync({
        host: host.trim(),
        port: Number(port),
        secure,
        username: username.trim() || undefined,
        password: password.trim() || undefined,
        fromName: fromName.trim(),
        fromEmail: fromEmail.trim(),
        isEnabled,
      });

      queryClient.invalidateQueries({ queryKey: ["admin", "settings", "smtp"] });
      toast.success("SMTP configuration updated and encrypted successfully");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update SMTP settings");
    }
  };

  const handleSendTestEmail = async () => {
    if (!testEmail.trim()) {
      toast.error("Please enter a recipient email address for testing");
      return;
    }

    setIsTesting(true);
    try {
      const res = await testMutation.mutateAsync({ recipientEmail: testEmail.trim() });
      toast.success(res.message || "Test email delivered successfully!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "SMTP test failed. Check host credentials.");
    } finally {
      setIsTesting(false);
    }
  };

  const handleImportEnv = async () => {
    try {
      await importEnvMutation.mutateAsync();
      queryClient.invalidateQueries({ queryKey: ["admin", "settings", "smtp"] });
      toast.success("Imported SMTP configuration from environment variables");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to import from .env");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-400 font-mono text-xs">
        <RefreshCw className="h-5 w-5 animate-spin mr-2 text-[#00a3ff]" />
        Loading SMTP Settings...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner / Status */}
      <div className="bg-[#080e18] border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-[#00a3ff]/10 border border-[#00a3ff]/20 flex items-center justify-center text-[#00a3ff]">
            <Mail className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Email (SMTP) Engine
              </h3>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase border ${
                  smtpData?.source === "database"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                }`}
              >
                Source: {smtpData?.source === "database" ? "Database" : "Env Fallback"}
              </span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase border ${
                  isEnabled
                    ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                    : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                }`}
              >
                {isEnabled ? "Enabled" : "Disabled"}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Configure transactional email delivery for order receipts, password resets, and notifications.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {smtpData?.source !== "database" && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleImportEnv}
              disabled={importEnvMutation.isPending}
              className="border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-xs font-mono font-bold text-slate-200"
            >
              <Sparkles className="h-3.5 w-3.5 mr-1.5 text-amber-400" />
              Import from .env
            </Button>
          )}
          <Button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="bg-[#00a3ff] hover:bg-[#0091e6] text-slate-950 font-bold font-mono text-xs uppercase px-4"
          >
            {updateMutation.isPending ? "Saving..." : "Save SMTP Settings"}
          </Button>
        </div>
      </div>

      {/* Main Settings Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Form: Connection Details */}
        <div className="lg:col-span-2 bg-[#080e18] border border-slate-800 rounded-xl p-5 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#00a3ff]" />
              Connection & Credentials
            </h4>
            <div className="flex items-center gap-2">
              <Label htmlFor="smtp-enabled-switch" className="text-xs font-mono text-slate-400">
                Active Email Sending
              </Label>
              <Switch
                id="smtp-enabled-switch"
                checked={isEnabled}
                onCheckedChange={setIsEnabled}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-1.5">
              <Label className="text-xs font-mono uppercase text-slate-400 font-semibold">
                SMTP Host
              </Label>
              <Input
                placeholder="smtp.gmail.com or mail.domain.com"
                value={host}
                onChange={(e) => setHost(e.target.value)}
                className="border-slate-800 bg-slate-900/90 text-white placeholder:text-slate-600 focus:border-[#00a3ff] text-xs font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-mono uppercase text-slate-400 font-semibold">
                Port
              </Label>
              <Input
                type="number"
                placeholder="587"
                value={port}
                onChange={(e) => handlePortChange(Number(e.target.value))}
                className="border-slate-800 bg-slate-900/90 text-white placeholder:text-slate-600 focus:border-[#00a3ff] text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2 pt-2">
              <Switch
                id="secure-toggle"
                checked={secure}
                onCheckedChange={setSecure}
              />
              <Label htmlFor="secure-toggle" className="text-xs font-mono text-slate-300 cursor-pointer">
                SSL / TLS (Secure) — usually ON for port 465, OFF for 587
              </Label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-800/80">
            <div className="space-y-1.5">
              <Label className="text-xs font-mono uppercase text-slate-400 font-semibold">
                Username / Auth Account
              </Label>
              <Input
                placeholder="apikey or user@example.com"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="border-slate-800 bg-slate-900/90 text-white placeholder:text-slate-600 focus:border-[#00a3ff] text-xs font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-mono uppercase text-slate-400 font-semibold">
                  Password / App Password
                </Label>
                <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" />
                  AES-256-GCM Encrypted
                </span>
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder={smtpData?.hasPassword ? "••••••••••••" : "Enter SMTP Password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-slate-800 bg-slate-900/90 text-white placeholder:text-slate-600 focus:border-[#00a3ff] text-xs font-mono pr-9"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-800/80">
            <div className="space-y-1.5">
              <Label className="text-xs font-mono uppercase text-slate-400 font-semibold">
                From Display Name
              </Label>
              <Input
                placeholder="PGX Store"
                value={fromName}
                onChange={(e) => setFromName(e.target.value)}
                className="border-slate-800 bg-slate-900/90 text-white placeholder:text-slate-600 focus:border-[#00a3ff] text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-mono uppercase text-slate-400 font-semibold">
                From Email Address
              </Label>
              <Input
                placeholder="noreply@domain.com"
                value={fromEmail}
                onChange={(e) => setFromEmail(e.target.value)}
                className="border-slate-800 bg-slate-900/90 text-white placeholder:text-slate-600 focus:border-[#00a3ff] text-xs font-mono"
              />
            </div>
          </div>
        </div>

        {/* Right Side: Test Email Panel */}
        <div className="bg-[#080e18] border border-slate-800 rounded-xl p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Send className="h-4 w-4 text-[#00a3ff]" />
              Send Live Test Email
            </h4>
            <p className="text-xs text-slate-400">
              Verify your SMTP server configuration and TLS handshake by sending a live test message.
            </p>

            <div className="space-y-1.5 pt-2">
              <Label className="text-xs font-mono uppercase text-slate-400 font-semibold">
                Recipient Email
              </Label>
              <Input
                type="email"
                placeholder="admin@example.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="border-slate-800 bg-slate-900/90 text-white placeholder:text-slate-600 focus:border-[#00a3ff] text-xs font-mono"
              />
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-800/80">
            <Button
              onClick={handleSendTestEmail}
              disabled={isTesting || !isEnabled}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-100 font-mono text-xs font-bold uppercase border border-slate-700 hover:border-[#00a3ff]"
            >
              {isTesting ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin mr-2 text-[#00a3ff]" />
                  Verifying Connection...
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5 mr-2 text-[#00a3ff]" />
                  Send Test Email
                </>
              )}
            </Button>

            {!isEnabled && (
              <p className="text-[11px] text-rose-400 font-mono flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                Enable email sending first to send test emails.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
