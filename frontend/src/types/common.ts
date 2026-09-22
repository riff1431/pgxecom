export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    page: number;
    totalPage: number;
    total: number;
    limit: number;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    totalPage: number;
    total: number;
    limit: number;
  };
}

export interface CartItem {
  productId: string;
  variantId?: string;
  name: string;
  variantName?: string;
  price: number;
  comparePrice?: number;
  image?: string;
  quantity: number;
  stock: number;
}

export interface Banner {
  id: string;
  title?: string;
  subtitle?: string;
  image: string;
  mobileImage?: string;
  link?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface Coupon {
  id: string;
  code: string;
  description?: string;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  expiresAt?: string;
  isActive: boolean;
}

export interface AdminCoupon extends Coupon {
  startsAt?: string | null;
  createdAt: string;
}

export interface CouponValidationResult {
  valid: true;
  discountAmount: number;
  coupon: {
    id: string;
    code: string;
    discountType: "PERCENTAGE" | "FIXED_AMOUNT";
    discountValue: number;
  };
}

export interface CouponFormValues {
  code: string;
  description?: string;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  usageLimit?: number;
  startsAt?: string;
  expiresAt?: string;
  isActive: boolean;
}

export interface CouponUpsertPayload extends CouponFormValues {
  id?: string;
}
