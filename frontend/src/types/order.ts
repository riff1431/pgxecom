import type { Product } from "./product";

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "RETURNED";

export interface OrderStatusHistory {
  id: string;
  status: OrderStatus;
  note?: string;
  changedBy?: string;
  createdAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  product?: Product;
  variantId?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  productName: string;
  variantName?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  guestName?: string;
  guestPhone?: string;
  guestEmail?: string;
  shippingAddress: Record<string, string>;
  status: OrderStatus;
  paymentMethod: string;
  paymentStatus: string;
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  couponId?: string;
  coupon?: {
    code: string;
  };
  notes?: string;
  items: OrderItem[];
  statusHistory?: OrderStatusHistory[];
  createdAt: string;
  updatedAt: string;
}
