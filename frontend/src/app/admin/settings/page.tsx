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

import { SETTING_FIELDS } from "./components/setting-config";
import { SettingFormDialog } from "./components/SettingFormDialog";
import { SettingsHeader } from "./components/SettingsHeader";
import { SettingsTableSection } from "./components/SettingsTableSection";
import { SettingsTabsEditor } from "./components/SettingsTabsEditor";

export default function AdminSettingsPage() {
  const queryClient = useQueryClient();
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

  const refreshSettingsQueries = async () => {
    await Promise.all([
      queryClient.refetchQueries({ queryKey: ["admin", "settings"], type: "active" }),
      queryClient.refetchQueries({ queryKey: ["settings", "public"], type: "active" }),
    ]);
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
      await refreshSettingsQueries();
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

      await refreshSettingsQueries();
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

      await refreshSettingsQueries();
      setIsFormDialogOpen(false);
    } catch {
      toast.error("Failed to save setting");
    }
  };

  const handleDelete = async () => {
    if (!settingToDelete) return;

    try {
      await deleteMutation.mutateAsync(settingToDelete.key);
      await refreshSettingsQueries();
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
            Storefront Settings
          </h1>
          <p className="text-slate-400 font-medium text-xs mt-1">
            Configure store branding, general details, logos, social links, and SEO metadata.
          </p>
        </div>
      </div>

      <div className="space-y-6">
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
      </div>

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
