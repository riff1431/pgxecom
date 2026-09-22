export interface ShippingZone {
  id: string;
  name: string;
  slug: string;
  cost: number;
  isActive: boolean;
}

export interface CreateShippingZonePayload {
  name: string;
  slug: string;
  cost: number;
  isActive?: boolean;
}

export interface UpdateShippingZonePayload {
  name?: string;
  slug?: string;
  cost?: number;
  isActive?: boolean;
}
