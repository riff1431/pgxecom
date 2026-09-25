"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Copy,
  CreditCard,
  ExternalLink,
  Eye,
  EyeOff,
  Layers,
  Plus,
  Power,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

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
import {
  useActivateAdminStripeProfile,
  useCreateAdminStripeProfile,
  useDeleteAdminStripeProfile,
  useDuplicateAdminStripeProfile,
  useGetAdminStripeProfiles,
  useImportStripeFromEnv,
  useUpdateAdminStripeProfile,
  useVerifyAdminStripeConnection,
} from "@/lib/api/settings";
import type { StripeMode, StripeProfile } from "@/types";

export function StripeSettingsTab() {
  const queryClient = useQueryClient();
  const { data: stripeData, isLoading } = useGetAdminStripeProfiles();

  const createMutation = useCreateAdminStripeProfile();
  const updateMutation = useUpdateAdminStripeProfile();
  const activateMutation = useActivateAdminStripeProfile();
  const duplicateMutation = useDuplicateAdminStripeProfile();
  const deleteMutation = useDeleteAdminStripeProfile();
  const verifyMutation = useVerifyAdminStripeConnection();
  const importEnvMutation = useImportStripeFromEnv();

  // Profile Create / Edit modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<StripeProfile | null>(null);

  const [label, setLabel] = useState("");
  const [mode, setMode] = useState<StripeMode>("TEST");
  const [publishableKey, setPublishableKey] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");
  const [currency, setCurrency] = useState("eur");
  const [showSecret, setShowSecret] = useState(false);
  const [showWebhook, setShowWebhook] = useState(false);

  // Switch Active confirmation dialog
  const [activatingProfile, setActivatingProfile] = useState<StripeProfile | null>(null);

  // Verification testing state
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const refreshProfiles = async () => {
    await Promise.all([
      queryClient.refetchQueries({ queryKey: ["admin", "settings", "stripe"] }),
      queryClient.refetchQueries({ queryKey: ["settings", "stripe"] }),
    ]);
  };

  const openCreateModal = () => {
    setEditingProfile(null);
    setLabel("");
    setMode("TEST");
    setPublishableKey("");
    setSecretKey("");
    setWebhookSecret("");
    setCurrency("eur");
    setShowSecret(false);
    setShowWebhook(false);
    setIsModalOpen(true);
  };

  const openEditModal = (p: StripeProfile) => {
    setEditingProfile(p);
    setLabel(p.label);
    setMode(p.mode);
    setPublishableKey(p.publishableKey);
    setSecretKey("••••••••••••••••••••••••••••••••");
    setWebhookSecret("••••••••••••••••••••••••••••••••");
    setCurrency(p.currency);
    setShowSecret(false);
    setShowWebhook(false);
    setIsModalOpen(true);
  };

  const handleSaveProfile = async () => {
    if (!label.trim()) {
      toast.error("Profile label is required");
      return;
    }

    if (!editingProfile) {
      if (!publishableKey.trim() || !secretKey.trim() || !webhookSecret.trim()) {
        toast.error("All Stripe keys and webhook secret are required for new profiles");
        return;
      }
    }

    // Prefix validation (supports sk_ and rk_ restricted keys)
    if (mode === "TEST") {
      if (publishableKey && !publishableKey.startsWith("pk_test_")) {
        toast.error("Test mode publishable key must start with pk_test_");
        return;
      }
      if (
        secretKey &&
        !secretKey.includes("••••") &&
        !secretKey.startsWith("sk_test_") &&
        !secretKey.startsWith("rk_test_")
      ) {
        toast.error("Test mode secret key must start with sk_test_ or rk_test_");
        return;
      }
    } else {
      if (publishableKey && !publishableKey.startsWith("pk_live_")) {
        toast.error("Live mode publishable key must start with pk_live_");
        return;
      }
      if (
        secretKey &&
        !secretKey.includes("••••") &&
        !secretKey.startsWith("sk_live_") &&
        !secretKey.startsWith("rk_live_")
      ) {
        toast.error("Live mode secret key must start with sk_live_ or rk_live_");
        return;
      }
    }

    if (webhookSecret && !webhookSecret.includes("••••") && !webhookSecret.startsWith("whsec_")) {
      toast.error("Webhook secret must start with whsec_");
      return;
    }

    try {
      if (editingProfile) {
        await updateMutation.mutateAsync({
          id: editingProfile.id,
          data: {
            label: label.trim(),
            mode,
            publishableKey: publishableKey.trim() || undefined,
            secretKey: secretKey.includes("••••") ? undefined : secretKey.trim(),
            webhookSecret: webhookSecret.includes("••••") ? undefined : webhookSecret.trim(),
            currency: currency.trim().toLowerCase(),
          },
        });
        toast.success("Stripe profile updated");
      } else {
        await createMutation.mutateAsync({
          label: label.trim(),
          mode,
          publishableKey: publishableKey.trim(),
          secretKey: secretKey.trim(),
          webhookSecret: webhookSecret.trim(),
          currency: currency.trim().toLowerCase(),
        });
        toast.success("New Stripe profile created");
      }

      await refreshProfiles();
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to save Stripe profile");
    }
  };

  const handleVerify = async (profileId: string) => {
    setVerifyingId(profileId);
    try {
      const res = await verifyMutation.mutateAsync({ profileId });
      toast.success(res.message || "Stripe balance API verified successfully!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Stripe verification failed");
    } finally {
      setVerifyingId(null);
    }
  };

  const handleActivateConfirm = async () => {
    if (!activatingProfile) return;

    try {
      await activateMutation.mutateAsync(activatingProfile.id);
      await refreshProfiles();
      toast.success(`Active Stripe profile switched to "${activatingProfile.label}"`);
      setActivatingProfile(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to activate profile");
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await duplicateMutation.mutateAsync(id);
      await refreshProfiles();
      toast.success("Profile duplicated successfully");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to duplicate profile");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this Stripe profile?")) return;

    try {
      await deleteMutation.mutateAsync(id);
      await refreshProfiles();
      toast.success("Stripe profile deleted");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete profile");
    }
  };

  const handleImportEnv = async () => {
    try {
      await importEnvMutation.mutateAsync();
      await refreshProfiles();
      toast.success("Imported Stripe profile from .env successfully");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to import from .env");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-400 font-mono text-xs">
        <RefreshCw className="h-5 w-5 animate-spin mr-2 text-[#00a3ff]" />
        Loading Stripe Profiles...
      </div>
    );
  }

  const rawData: any = stripeData;
  const profiles: StripeProfile[] = Array.isArray(rawData)
    ? rawData
    : Array.isArray(rawData?.profiles)
    ? rawData.profiles
    : [];

  const activeProfile = profiles.find((p) => p.isActive);
  const usingFallback = rawData?.usingFallback ?? (profiles.length === 0);

  return (
    <div className="space-y-6">
      {/* Top Banner / Profiles Overview */}
      <div className="bg-card border border-border rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-card-foreground shadow-xs">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <CreditCard className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider font-mono">
                Stripe Gateway Profiles
              </h3>
              {usingFallback ? (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase border bg-amber-500/10 text-amber-600 border-amber-500/30">
                  Using .env Fallback
                </span>
              ) : activeProfile ? (
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase border ${
                    activeProfile.mode === "LIVE"
                      ? "bg-rose-500/10 text-rose-600 border-rose-500/30"
                      : "bg-blue-500/10 text-blue-600 border-blue-500/30"
                  }`}
                >
                  Active: {activeProfile.mode} MODE ({activeProfile.label})
                </span>
              ) : null}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Manage multiple Stripe configurations (Test vs Live mode). Exactly one profile is active at a time.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {usingFallback && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleImportEnv}
              disabled={importEnvMutation.isPending}
              className="border-border bg-background hover:bg-muted text-xs font-mono font-bold text-foreground"
            >
              <Sparkles className="h-3.5 w-3.5 mr-1.5 text-amber-500" />
              Import from .env
            </Button>
          )}

          <Button
            onClick={openCreateModal}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold font-mono text-xs uppercase px-4 shadow-xs"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Add Stripe Profile
          </Button>
        </div>
      </div>

      {/* Profiles Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-muted/40 border-b border-border text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Profile</th>
                <th className="py-3 px-4">Mode</th>
                <th className="py-3 px-4">Publishable Key</th>
                <th className="py-3 px-4">Currency</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {profiles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground font-sans">
                    No custom Stripe profiles configured yet. Currently operating via .env fallback.
                  </td>
                </tr>
              ) : (
                profiles.map((p) => (
                  <tr
                    key={p.id}
                    className={`hover:bg-muted/40 transition-colors ${
                      p.isActive ? "bg-primary/5" : ""
                    }`}
                  >
                    <td className="py-3.5 px-4 font-bold text-foreground">
                      <div className="flex items-center gap-2">
                        {p.label}
                        {p.isActive && (
                          <span className="text-[10px] bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                            Active
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${
                          p.mode === "LIVE"
                            ? "bg-rose-500/10 text-rose-600 border-rose-500/30"
                            : "bg-blue-500/10 text-blue-600 border-blue-500/30"
                        }`}
                      >
                        {p.mode}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-foreground/80 font-mono text-[11px]">
                      {p.publishableKey ? (
                        <span>
                          {p.publishableKey.slice(0, 12)}...{p.publishableKey.slice(-6)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">None</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 uppercase font-bold text-foreground/80">
                      {p.currency}
                    </td>
                    <td className="py-3.5 px-4">
                      {p.isActive ? (
                        <span className="text-emerald-600 flex items-center gap-1.5 font-bold">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Live Gateway
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Standby</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleVerify(p.id)}
                        disabled={verifyingId === p.id}
                        className="h-7 px-2.5 text-foreground hover:bg-muted text-[11px]"
                      >
                        {verifyingId === p.id ? (
                          <RefreshCw className="h-3 w-3 animate-spin mr-1 text-primary" />
                        ) : (
                          <ShieldCheck className="h-3.5 w-3.5 mr-1 text-primary" />
                        )}
                        Verify
                      </Button>

                      {!p.isActive && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setActivatingProfile(p)}
                          className="h-7 px-2.5 text-amber-600 hover:text-amber-700 hover:bg-amber-500/10 text-[11px]"
                        >
                          <Power className="h-3.5 w-3.5 mr-1" />
                          Set Active
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDuplicate(p.id)}
                        className="h-7 px-2 text-muted-foreground hover:text-foreground hover:bg-muted text-[11px]"
                      >
                        Duplicate
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditModal(p)}
                        className="h-7 px-2.5 text-primary hover:bg-primary/10 text-[11px]"
                      >
                        Edit
                      </Button>

                      {!p.isActive && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(p.id)}
                          className="h-7 px-2 text-rose-600 hover:text-rose-700 hover:bg-rose-500/10 text-[11px]"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Profile Create / Edit Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-xl bg-card border border-border text-foreground">
          <DialogHeader>
            <DialogTitle className="font-mono text-sm uppercase tracking-wider text-foreground">
              {editingProfile ? `Edit Profile: ${editingProfile.label}` : "Create Stripe Profile"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              API credentials are encrypted at rest with AES-256-GCM.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2 space-y-1.5">
                <Label className="text-xs font-mono uppercase text-foreground/80">Profile Label</Label>
                <Input
                  placeholder="e.g. Primary Production Account"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="border-border bg-background text-foreground text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-mono uppercase text-foreground/80">Mode</Label>
                <div className="flex rounded-md border border-border p-0.5 bg-muted/40">
                  <button
                    type="button"
                    onClick={() => setMode("TEST")}
                    className={`flex-1 text-xs py-1 rounded font-mono font-bold ${
                      mode === "TEST"
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    TEST
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("LIVE")}
                    className={`flex-1 text-xs py-1 rounded font-mono font-bold ${
                      mode === "LIVE"
                        ? "bg-rose-500 text-white shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    LIVE
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-mono uppercase text-foreground/80">
                Publishable Key ({mode === "LIVE" ? "pk_live_..." : "pk_test_..."})
              </Label>
              <Input
                placeholder={mode === "LIVE" ? "pk_live_..." : "pk_test_..."}
                value={publishableKey}
                onChange={(e) => setPublishableKey(e.target.value)}
                className="border-border bg-background text-foreground text-xs font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-mono uppercase text-foreground/80">
                  Secret Key ({mode === "LIVE" ? "sk_live_..." : "sk_test_..."})
                </Label>
                <span className="text-[10px] font-mono text-emerald-600 flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" />
                  AES-256-GCM
                </span>
              </div>
              <div className="relative">
                <Input
                  type={showSecret ? "text" : "password"}
                  placeholder={mode === "LIVE" ? "sk_live_..." : "sk_test_..."}
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  className="border-border bg-background text-foreground text-xs font-mono pr-9"
                />
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-mono uppercase text-foreground/80">
                Webhook Signing Secret (whsec_...)
              </Label>
              <div className="relative">
                <Input
                  type={showWebhook ? "text" : "password"}
                  placeholder="whsec_..."
                  value={webhookSecret}
                  onChange={(e) => setWebhookSecret(e.target.value)}
                  className="border-border bg-background text-foreground text-xs font-mono pr-9"
                />
                <button
                  type="button"
                  onClick={() => setShowWebhook(!showWebhook)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showWebhook ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-mono uppercase text-foreground/80">
                Default Currency Code
              </Label>
              <Input
                placeholder="eur, usd, gbp"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="border-border bg-background text-foreground text-xs font-mono uppercase"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="text-xs font-mono border-border bg-background text-foreground hover:bg-muted"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveProfile}
              disabled={createMutation.isPending || updateMutation.isPending}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold font-mono text-xs uppercase shadow-xs"
            >
              {createMutation.isPending || updateMutation.isPending
                ? "Saving..."
                : editingProfile
                ? "Update Profile"
                : "Create Profile"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog for Switching Active Profile */}
      <Dialog open={!!activatingProfile} onOpenChange={(open) => !open && setActivatingProfile(null)}>
        <DialogContent className="max-w-md bg-card border border-amber-500/40 text-foreground">
          <DialogHeader>
            <DialogTitle className="font-mono text-sm uppercase tracking-wider text-amber-600 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Switch Active Stripe Profile?
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground pt-2 leading-relaxed">
              You are about to switch the live payment gateway to{" "}
              <strong className="text-foreground">"{activatingProfile?.label}"</strong> (
              <span className="font-mono text-amber-600 font-bold">{activatingProfile?.mode} MODE</span>
              ).
              <br />
              <br />
              All new customer wallet top-ups and checkout sessions will immediately use these credentials.
              In-flight webhook events will still be validated safely across both keys.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setActivatingProfile(null)}
              className="text-xs font-mono border-border bg-background text-foreground hover:bg-muted"
            >
              Cancel
            </Button>
            <Button
              onClick={handleActivateConfirm}
              disabled={activateMutation.isPending}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold font-mono text-xs uppercase"
            >
              {activateMutation.isPending ? "Switching..." : "Confirm & Set Active"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
