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

export interface SmtpSettings {
  id: string | null;
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password?: string;
  hasPassword?: boolean;
  fromName: string;
  fromEmail: string;
  isEnabled: boolean;
  updatedAt: string | null;
  source: 'database' | 'environment';
}

export interface UpdateSmtpSettingsPayload {
  host: string;
  port: number;
  secure: boolean;
  username?: string;
  password?: string;
  fromName: string;
  fromEmail: string;
  isEnabled: boolean;
}

export interface TestSmtpPayload {
  recipientEmail: string;
}

export type StripeMode = 'TEST' | 'LIVE';

export interface StripeProfile {
  id: string;
  label: string;
  mode: StripeMode;
  publishableKey: string;
  secretKeyMasked: string;
  webhookSecretMasked: string;
  currency: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StripeProfilesResponse {
  profiles: StripeProfile[];
  activeProfileId: string | null;
  usingFallback: boolean;
}

export interface CreateStripeProfilePayload {
  label: string;
  mode: StripeMode;
  publishableKey: string;
  secretKey: string;
  webhookSecret: string;
  currency: string;
  isActive?: boolean;
}

export interface UpdateStripeProfilePayload {
  label?: string;
  mode?: StripeMode;
  publishableKey?: string;
  secretKey?: string;
  webhookSecret?: string;
  currency?: string;
  isActive?: boolean;
}

export interface VerifyStripePayload {
  profileId?: string;
  secretKey?: string;
}

export interface VerifyStripeResponse {
  success: boolean;
  livemode: boolean;
  message: string;
}

export interface SettingsAuditLog {
  id: string;
  actorId: string | null;
  actorEmail: string | null;
  action: string;
  entityType: 'SMTP' | 'STRIPE';
  entityId: string | null;
  details: any;
  createdAt: string;
}
