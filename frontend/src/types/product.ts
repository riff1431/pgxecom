import type { Category } from "./category";

export interface Product {
  id: string;
  name: string;
  namebn?: string;
  slug: string;
  description?: string;
  shortDesc?: string;
  sku?: string;
  price: number;
  comparePrice?: number;
  costPrice?: number;
  stock: number;
  lowStockAlert?: number;
  weight?: string;
  isActive: boolean;
  isFeatured: boolean;
  isHot: boolean;
  metaTitle?: string;
  metaDesc?: string;
  categoryId: string;
  category: Category;
  images: ProductImage[];
  variants: ProductVariant[];
  reviews?: Review[];
  _count?: { reviews: number };
  createdAt: string;
  updatedAt: string;
}

export interface ProductImage {
  id: string;
  url: string;
  alt?: string;
  sortOrder: number;
}

export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  comparePrice?: number;
  stock: number;
  sku?: string;
  isActive: boolean;
}

export interface Review {
  id: string;
  rating: number;
  comment?: string;
  user: { name: string; avatar?: string };
  createdAt: string;
}
