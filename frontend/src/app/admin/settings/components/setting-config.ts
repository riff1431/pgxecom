export type SettingGroup = "general" | "contact" | "social" | "hero";

export interface SettingField {
  key: string;
  label: string;
  group: SettingGroup;
  placeholder: string;
}

export const SETTING_FIELDS: SettingField[] = [
  {
    key: "store_name",
    label: "Store name",
    group: "general",
    placeholder: "FreshMart",
  },
  {
    key: "store_description",
    label: "Store description",
    group: "general",
    placeholder: "Fresh & Organic Products Delivered to Your Doorstep",
  },
  {
    key: "store_logo",
    label: "Store logo",
    group: "general",
    placeholder: "/uploads/logo.png",
  },
  {
    key: "store_phone",
    label: "Store phone",
    group: "contact",
    placeholder: "+8801XXXXXXXXX",
  },
  {
    key: "store_email",
    label: "Store email",
    group: "contact",
    placeholder: "info@store.com",
  },
  {
    key: "store_address",
    label: "Store address",
    group: "contact",
    placeholder: "Dhaka, Bangladesh",
  },
  {
    key: "whatsapp_number",
    label: "WhatsApp number",
    group: "contact",
    placeholder: "+8801XXXXXXXXX",
  },
  {
    key: "facebook_url",
    label: "Facebook URL",
    group: "social",
    placeholder: "https://facebook.com/store",
  },
  {
    key: "instagram_url",
    label: "Instagram URL",
    group: "social",
    placeholder: "https://instagram.com/store",
  },
  {
    key: "hero_title",
    label: "Hero Title",
    group: "hero",
    placeholder: "Fresh & Premium Organic Products",
  },
  {
    key: "hero_subtitle",
    label: "Hero Subtitle",
    group: "hero",
    placeholder: "Discover the finest selection...",
  },
  {
    key: "hero_badge",
    label: "Hero Badge",
    group: "hero",
    placeholder: "100% Organic & Natural",
  },
];

export const SETTING_GROUPS: SettingGroup[] = [
  "general",
  "contact",
  "social",
  "hero",
];
