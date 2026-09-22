export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  authorName?: string;
  tags: string[];
  isPublished: boolean;
  publishedAt?: string;
  metaTitle?: string;
  metaDesc?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface BlogQueryParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface BlogFormValues {
  title: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  authorName?: string;
  tagsInput?: string;
  metaTitle?: string;
  metaDesc?: string;
  isPublished: boolean;
}

export interface BlogUpsertPayload {
  id?: string;
  title: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  authorName?: string;
  tags?: string[];
  metaTitle?: string;
  metaDesc?: string;
  isPublished?: boolean;
}
