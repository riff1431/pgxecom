import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import sanitizeHtml from 'sanitize-html';
import slugify from 'slugify';

import { PrismaService } from '../../prisma/prisma.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';

interface BlogQuery {
  page?: number;
  limit?: number;
  search?: string;
}

const sanitizeBlogHtml = sanitizeHtml as unknown as (
  dirty: string,
  options: sanitizeHtml.IOptions,
) => string;

const BLOG_SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    'p',
    'br',
    'strong',
    'em',
    'b',
    'i',
    'u',
    's',
    'h1',
    'h2',
    'h3',
    'h4',
    'blockquote',
    'ul',
    'ol',
    'li',
    'a',
    'img',
    'span',
    'div',
  ],
  allowedAttributes: {
    a: ['href', 'name', 'target', 'rel'],
    img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
    p: ['style'],
    div: ['style'],
    span: ['style'],
  },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowedSchemesByTag: {
    img: ['http', 'https', 'data'],
  },
  allowedStyles: {
    '*': {
      'text-align': [/^left$/, /^right$/, /^center$/, /^justify$/],
      color: [/^#[0-9a-fA-F]{3,8}$/, /^rgb\([0-9\s,.%]+\)$/],
      'background-color': [/^#[0-9a-fA-F]{3,8}$/, /^rgb\([0-9\s,.%]+\)$/],
      'font-size': [/^[0-9.]+(px|em|rem|%)$/],
    },
  },
};

export interface SerializedBlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string | null;
  coverImage?: string | null;
  authorName?: string | null;
  tags: string[];
  isPublished: boolean;
  publishedAt?: string | null;
  metaTitle?: string | null;
  metaDesc?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BlogListResponse {
  posts: SerializedBlogPost[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

@Injectable()
export class BlogService {
  constructor(private prisma: PrismaService) {}

  async findDetailsBySlug(slug: string): Promise<SerializedBlogPost> {
    return this.findBySlug(slug);
  }

  async findPublished(query: BlogQuery): Promise<BlogListResponse> {
    const page = this.toPositiveNumber(query.page, 1);
    const limit = this.toPositiveNumber(query.limit, 10);
    const skip = (page - 1) * limit;
    const where: Prisma.BlogPostWhereInput = { isPublished: true };
    const search = query.search?.trim();

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } },
      ];
    }

    const [posts, total] = await Promise.all([
      this.prisma.blogPost.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
      }),
      this.prisma.blogPost.count({ where }),
    ]);

    return {
      posts: posts.map((post) => this.serializeBlog(post)),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findBySlug(slug: string): Promise<SerializedBlogPost> {
    const post = await this.prisma.blogPost.findUnique({ where: { slug } });
    if (!post || !post.isPublished) {
      throw new NotFoundException('Blog post not found');
    }

    return this.serializeBlog(post);
  }

  async adminFindAll(query: BlogQuery): Promise<BlogListResponse> {
    const page = this.toPositiveNumber(query.page, 1);
    const limit = this.toPositiveNumber(query.limit, 20);
    const skip = (page - 1) * limit;

    const where: Prisma.BlogPostWhereInput = {};
    const search = query.search?.trim();

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } },
      ];
    }

    const [posts, total] = await Promise.all([
      this.prisma.blogPost.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.blogPost.count({ where }),
    ]);

    return {
      posts: posts.map((post) => this.serializeBlog(post)),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async create(data: CreateBlogDto): Promise<SerializedBlogPost> {
    const slug = await this.ensureUniqueSlug(data.title);
    const sanitizedContent = this.sanitizeBlogContent(data.content);

    const post = await this.prisma.blogPost.create({
      data: {
        title: data.title.trim(),
        slug,
        content: sanitizedContent,
        excerpt: data.excerpt,
        coverImage: data.coverImage,
        authorName: data.authorName,
        tags: data.tags || [],
        isPublished: data.isPublished ?? false,
        publishedAt: data.isPublished ? new Date() : null,
        metaTitle: data.metaTitle,
        metaDesc: data.metaDesc,
      },
    });

    return this.serializeBlog(post);
  }

  async update(id: string, data: UpdateBlogDto): Promise<SerializedBlogPost> {
    const currentPost = await this.prisma.blogPost.findUnique({
      where: { id },
    });
    if (!currentPost) {
      throw new NotFoundException('Blog post not found');
    }

    const slug = data.title
      ? await this.ensureUniqueSlug(data.title, id)
      : undefined;
    const sanitizedContent =
      data.content !== undefined
        ? this.sanitizeBlogContent(data.content)
        : undefined;

    const post = await this.prisma.blogPost.update({
      where: { id },
      data: {
        ...(data.title !== undefined ? { title: data.title.trim() } : {}),
        ...(slug ? { slug } : {}),
        ...(sanitizedContent !== undefined
          ? { content: sanitizedContent }
          : {}),
        ...(data.excerpt !== undefined ? { excerpt: data.excerpt } : {}),
        ...(data.coverImage !== undefined
          ? { coverImage: data.coverImage }
          : {}),
        ...(data.authorName !== undefined
          ? { authorName: data.authorName }
          : {}),
        ...(data.tags !== undefined ? { tags: data.tags } : {}),
        ...(data.metaTitle !== undefined ? { metaTitle: data.metaTitle } : {}),
        ...(data.metaDesc !== undefined ? { metaDesc: data.metaDesc } : {}),
        ...(data.isPublished !== undefined
          ? { isPublished: data.isPublished }
          : {}),
        ...(data.isPublished !== undefined
          ? {
              publishedAt: data.isPublished
                ? currentPost.publishedAt || new Date()
                : null,
            }
          : {}),
      },
    });

    return this.serializeBlog(post);
  }

  async setStatus(
    id: string,
    isPublished: boolean,
  ): Promise<SerializedBlogPost> {
    const currentPost = await this.prisma.blogPost.findUnique({
      where: { id },
    });
    if (!currentPost) {
      throw new NotFoundException('Blog post not found');
    }

    const post = await this.prisma.blogPost.update({
      where: { id },
      data: {
        isPublished,
        publishedAt: isPublished ? currentPost.publishedAt || new Date() : null,
      },
    });

    return this.serializeBlog(post);
  }

  async delete(id: string): Promise<{ message: string }> {
    await this.prisma.blogPost.delete({ where: { id } });
    return { message: 'Blog post deleted successfully' };
  }

  private serializeBlog(post: {
    id: string;
    title: string;
    slug: string;
    content: string;
    excerpt: string | null;
    coverImage: string | null;
    authorName: string | null;
    tags: string[];
    isPublished: boolean;
    publishedAt: Date | null;
    metaTitle: string | null;
    metaDesc: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): SerializedBlogPost {
    return {
      id: post.id,
      title: post.title,
      slug: post.slug,
      content: this.sanitizeBlogContent(post.content),
      excerpt: post.excerpt,
      coverImage: post.coverImage,
      authorName: post.authorName,
      tags: post.tags,
      isPublished: post.isPublished,
      publishedAt: post.publishedAt ? post.publishedAt.toISOString() : null,
      metaTitle: post.metaTitle,
      metaDesc: post.metaDesc,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
    };
  }

  private async ensureUniqueSlug(
    source: string,
    excludedId?: string,
  ): Promise<string> {
    const baseSlug =
      slugify(source, { lower: true, strict: true, trim: true }) || 'blog-post';

    let candidate = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await this.prisma.blogPost.findUnique({
        where: { slug: candidate },
      });
      if (!existing || existing.id === excludedId) {
        return candidate;
      }

      counter += 1;
      candidate = `${baseSlug}-${counter}`;
    }
  }

  private toPositiveNumber(
    value: number | undefined,
    fallback: number,
  ): number {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < 1) {
      return fallback;
    }

    return Math.floor(parsed);
  }

  private sanitizeBlogContent(content: string): string {
    return sanitizeBlogHtml(content, BLOG_SANITIZE_OPTIONS);
  }
}
