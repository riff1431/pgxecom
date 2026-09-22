import { ImagePlus } from "lucide-react";
import type { MutableRefObject } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { resolveImageUrl } from "@/lib/utils";

import {
  SETTING_FIELDS,
  SETTING_GROUPS,
  type SettingGroup,
} from "./setting-config";

interface SettingsTabsEditorProps {
  getFieldValue: (key: string) => string;
  onFieldChange: (key: string, value: string) => void;
  logoInputRef: MutableRefObject<HTMLInputElement | null>;
  onLogoFileSelected: (file?: File | null) => void;
  isUploadingLogo: boolean;
}

export function SettingsTabsEditor({
  getFieldValue,
  onFieldChange,
  logoInputRef,
  onLogoFileSelected,
  isUploadingLogo,
}: SettingsTabsEditorProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-4 md:p-6">
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="social">Social</TabsTrigger>
          <TabsTrigger value="hero">Hero</TabsTrigger>
        </TabsList>

        {SETTING_GROUPS.map((tab: SettingGroup) => (
          <TabsContent key={tab} value={tab} className="space-y-4">
            {tab === "general" ? (
              <div className="border rounded-xl p-4 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-14 w-14 rounded-xl border bg-gray-50 overflow-hidden flex items-center justify-center text-gray-400">
                    {getFieldValue("store_logo") ? (
                      <img
                        src={resolveImageUrl(getFieldValue("store_logo"))}
                        alt={getFieldValue("store_name") || "Store logo"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      "LOGO"
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Store logo</p>
                    <p className="text-xs text-gray-500">
                      Upload new logo and use in storefront navbar/footer.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0] || null;
                      onLogoFileSelected(file);
                      event.currentTarget.value = "";
                    }}
                  />
                  <Button
                    onClick={() => logoInputRef.current?.click()}
                    disabled={isUploadingLogo}
                  >
                    <ImagePlus className="h-4 w-4 mr-2" />
                    {isUploadingLogo ? "Uploading..." : "Upload / Change"}
                  </Button>
                </div>
              </div>
            ) : null}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SETTING_FIELDS.filter((field) => field.group === tab).map(
                (field) =>
                  field.key === "store_logo" ? null : (
                    <div key={field.key} className="space-y-2">
                      <Label htmlFor={field.key}>{field.label}</Label>
                      <Input
                        id={field.key}
                        placeholder={field.placeholder}
                        value={getFieldValue(field.key)}
                        onChange={(event) =>
                          onFieldChange(field.key, event.target.value)
                        }
                      />
                      <p className="text-xs text-gray-400">{field.key}</p>
                    </div>
                  ),
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
