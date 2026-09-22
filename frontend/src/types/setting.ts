export interface Setting {
  id: string;
  key: string;
  value: string;
  group: string;
}

export interface SettingQueryParams {
  group?: string;
  search?: string;
}

export interface CreateSettingPayload {
  key: string;
  value: string;
  group?: string;
}

export interface UpdateSettingPayload {
  value?: string;
  group?: string;
}

export interface BulkUpsertSettingsPayload {
  items: Array<{
    key: string;
    value: string;
    group?: string;
  }>;
}
