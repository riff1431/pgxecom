export interface Category {
  id: string;
  name: string;
  namebn?: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  sortOrder: number;
  isActive: boolean;
  parentId?: string | null;
  parent?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  children?: Array<{
    id: string;
    name: string;
    slug: string;
    sortOrder: number;
  }>;
  _count?: {
    products: number;
    children?: number;
  };
}

export interface CategoryTreeNode {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  parentId: string | null;
  children: CategoryTreeNode[];
}

export interface CategoryCascaderOption {
  value: string;
  label: string;
  textLabel: string;
  children?: CategoryCascaderOption[];
}

export interface CategoryMutationInput {
  name: string;
  slug: string;
  description?: string;
  sortOrder: number;
  parentId?: string | null;
}
