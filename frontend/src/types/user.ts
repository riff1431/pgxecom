export interface User {
  id: string;
  name: string;
  email: string;
  isVerified?: boolean;
  phone?: string;
  role: "ADMIN" | "CUSTOMER";
  avatar?: string;
  isBanned?: boolean;
  bannedAt?: string | null;
  banReason?: string | null;
  createdAt: string;
}

export interface AdminCustomer extends User {
  role: "CUSTOMER";
  _count: {
    orders: number;
  };
}

export interface AdminCustomerDetails extends User {
  role: "CUSTOMER";
  isVerified: boolean;
  _count: {
    orders: number;
    addresses: number;
  };
}

export interface Address {
  id: string;
  label?: string;
  name: string;
  phone: string;
  street: string;
  addressLine1?: string;
  addressLine2?: string;
  area?: string;
  city: string;
  zone?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  isDefault: boolean;
}
