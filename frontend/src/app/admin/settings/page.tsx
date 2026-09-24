"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { AdminDeleteDialog } from "@/components/admin/AdminDeleteDialog";

import {
  useBulkUpsertAdminSettings,
  useCreateAdminSetting,
  useDeleteAdminSetting,
  useGetAdminSettings,
  useUpdateAdminSetting,
  useUploadAdminSettingImage,
} from "@/lib/api/settings";
import type { Setting } from "@/types";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, Globe, Mail } from "lucide-react";

import { SETTING_FIELDS } from "./components/setting-config";
import { SettingFormDialog } from "./components/SettingFormDialog";
import { SettingsHeader } from "./components/SettingsHeader";
import { SettingsTableSection } from "./components/SettingsTableSection";
import { SettingsTabsEditor } from "./components/SettingsTabsEditor";
import { SmtpSettingsTab } from "./components/SmtpSettingsTab";
import { StripeSettingsTab } from "./components/StripeSettingsTab";

export default function AdminSettingsPage() {
  const queryClient = useQueryClient();
  const [mainTab, setMainTab] = useState("storefront");
  const [search, setSearch] = useState("");
  const [group, setGroup] = useState<string>("all");

  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const logoInputRef = useRef<HTMLInputElement | null>(null);

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [editingSetting, setEditingSetting] = useState<Setting | null>(null);
  const [settingToDelete, setSettingToDelete] = useState<Setting | null>(null);

  const [keyInput, setKeyInput] = useState("");
  const [valueInput, setValueInput] = useState("");
  const [groupInput, setGroupInput] = useState("general");

  const { data: settings = [], isLoading } = useGetAdminSettings({
    search,
    group: group === "all" ? undefined : group,
  });

  const createMutation = useCreateAdminSetting();
  const updateMutation = useUpdateAdminSetting();
  const deleteMutation = useDeleteAdminSetting();
  const bulkUpsertMutation = useBulkUpsertAdminSettings();
  const uploadMutation = useUploadAdminSettingImage();

  const settingsMap = useMemo(
    () => new Map(settings.map((item) => [item.key, item.value])),
    [settings],
  );

  const getFieldValue = (key: string) => {
    return formValues[key] ?? settingsMap.get(key) ?? "";
  };

  const refreshSettingsQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "settings"] });
    queryClient.invalidateQueries({ queryKey: ["settings", "public"] });
  };

  const clearFilters = () => {
    setSearch("");
    setGroup("all");
  };

  const openCreateDialog = () => {
    setEditingSetting(null);
    setKeyInput("");
    setValueInput("");
    setGroupInput("general");
    setIsFormDialogOpen(true);
  };

  const openEditDialog = (setting: Setting) => {
    setEditingSetting(setting);
    setKeyInput(setting.key);
    setValueInput(setting.value);
    setGroupInput(setting.group || "general");
    setIsFormDialogOpen(true);
  };

  const handleSaveBulk = async () => {
    try {
      const payload = SETTING_FIELDS.map((field) => ({
        key: field.key,
        value: getFieldValue(field.key),
        group: field.group,
      }));

      await bulkUpsertMutation.mutateAsync({ items: payload });
      refreshSettingsQueries();
      toast.success("Store settings updated");
    } catch {
      toast.error("Failed to save settings");
    }
  };

  const handleLogoUpload = async (file?: File | null) => {
    if (!file) return;

    try {
      const uploaded = await uploadMutation.mutateAsync(file);
      const logoUrl = uploaded.url;

      setFormValues((prev) => ({
        ...prev,
        store_logo: logoUrl,
      }));

      await bulkUpsertMutation.mutateAsync({
        items: [{ key: "store_logo", value: logoUrl, group: "general" }],
      });

      refreshSettingsQueries();
      toast.success("Store logo updated");
    } catch {
      toast.error("Failed to upload logo");
    }
  };

  const handleSaveSingle = async () => {
    if (!keyInput.trim()) {
      toast.error("Setting key required");
      return;
    }

    try {
      if (editingSetting) {
        await updateMutation.mutateAsync({
          key: editingSetting.key,
          data: {
            value: valueInput,
            group: groupInput,
          },
        });
        toast.success("Setting updated");
      } else {
        await createMutation.mutateAsync({
          key: keyInput.trim(),
          value: valueInput,
          group: groupInput,
        });
        toast.success("Setting created");
      }

      refreshSettingsQueries();
      setIsFormDialogOpen(false);
    } catch {
      toast.error("Failed to save setting");
    }
  };

  const handleDelete = async () => {
    if (!settingToDelete) return;

    try {
      await deleteMutation.mutateAsync(settingToDelete.key);
      refreshSettingsQueries();
      toast.success("Setting deleted");
      setSettingToDelete(null);
    } catch {
      toast.error("Failed to delete setting");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-mono uppercase">
            System & Store Settings
          </h1>
          <p className="text-slate-400 font-medium text-xs mt-1">
            Configure dynamic SMTP email delivery, Stripe payment gateways, and storefront branding.
          </p>
        </div>
      </div>

      <Tabs value={mainTab} onValueChange={setMainTab} className="space-y-6">
        <TabsList className="bg-[#080e18] border border-slate-800 p-1 rounded-xl">
          <TabsTrigger
            value="storefront"
            className="data-[state=active]:bg-[#00a3ff] data-[state=active]:text-slate-950 font-mono text-xs font-bold uppercase flex items-center gap-2 px-4 py-2"
          >
            <Globe className="h-4 w-4" />
            Storefront
          </TabsTrigger>
          <TabsTrigger
            value="smtp"
            className="data-[state=active]:bg-[#00a3ff] data-[state=active]:text-slate-950 font-mono text-xs font-bold uppercase flex items-center gap-2 px-4 py-2"
          >
            <Mail className="h-4 w-4" />
            Email (SMTP)
          </TabsTrigger>
          <TabsTrigger
            value="stripe"
            className="data-[state=active]:bg-[#00a3ff] data-[state=active]:text-slate-950 font-mono text-xs font-bold uppercase flex items-center gap-2 px-4 py-2"
          >
            <CreditCard className="h-4 w-4" />
            Payment (Stripe)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="storefront" className="space-y-6 mt-0">
          <SettingsHeader
            onAddSetting={openCreateDialog}
            onSaveSettings={handleSaveBulk}
            isSaving={bulkUpsertMutation.isPending}
          />

          <SettingsTabsEditor
            getFieldValue={getFieldValue}
            onFieldChange={(key, value) =>
              setFormValues((prev) => ({
                ...prev,
                [key]: value,
              }))
            }
            logoInputRef={logoInputRef}
            onLogoFileSelected={handleLogoUpload}
            isUploadingLogo={uploadMutation.isPending}
          />

          <SettingsTableSection
            settings={settings}
            isLoading={isLoading}
            search={search}
            group={group}
            onSearchChange={setSearch}
            onGroupChange={setGroup}
            onClearFilters={clearFilters}
            onEdit={openEditDialog}
            onDelete={setSettingToDelete}
          />
        </TabsContent>

        <TabsContent value="smtp" className="mt-0">
          <SmtpSettingsTab />
        </TabsContent>

        <TabsContent value="stripe" className="mt-0">
          <StripeSettingsTab />
        </TabsContent>
      </Tabs>

      <SettingFormDialog
        open={isFormDialogOpen}
        onOpenChange={setIsFormDialogOpen}
        editingSetting={editingSetting}
        keyInput={keyInput}
        valueInput={valueInput}
        groupInput={groupInput}
        onKeyChange={setKeyInput}
        onValueChange={setValueInput}
        onGroupChange={setGroupInput}
        onSave={handleSaveSingle}
        isSaving={createMutation.isPending || updateMutation.isPending}
      />

      <AdminDeleteDialog
        open={!!settingToDelete}
        title="Delete Setting?"
        description={`This action cannot be undone.${settingToDelete ? ` Setting \"${settingToDelete.key}\" will be permanently removed.` : ""}`}
        confirmLabel="Delete"
        isDeleting={deleteMutation.isPending}
        onOpenChange={(open) => {
          if (!open) {
            setSettingToDelete(null);
          }
        }}
        onConfirm={handleDelete}
      />
    </div>
  );
}
