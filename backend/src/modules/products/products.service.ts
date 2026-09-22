import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

interface ProductImageInput {
  url: string;
}

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    sort?: string;
    featured?: boolean;
    hot?: boolean;
  }) {
    const {
      page = 1,
      limit = 12,
      category,
      search,
      sort,
      featured,
      hot,
    } = query;
    const skip = (page - 1) * limit;

    const where: any = { isActive: true };
    if (category) {
      const selectedCategory = await this.prisma.category.findUnique({
        where: { slug: category },
        select: { id: true },
      });

      if (selectedCategory) {
        const descendantRows = await this.prisma.$queryRaw<
          Array<{ id: string }>
        >`
          WITH RECURSIVE category_tree AS (
            SELECT id
            FROM categories
            WHERE id = ${selectedCategory.id}

            UNION ALL

            SELECT c.id
            FROM categories c
            INNER JOIN category_tree ct ON c."parentId" = ct.id
          )
          SELECT id FROM category_tree
        `;

        const categoryIds = descendantRows.map((row) => row.id);
        where.categoryId = { in: categoryIds };
      } else {
        where.category = { slug: category };
      }
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { namebn: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (featured !== undefined) where.isFeatured = featured;
    if (hot !== undefined) where.isHot = hot;

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'price_asc') orderBy = { price: 'asc' };
    if (sort === 'price_desc') orderBy = { price: 'desc' };
    if (sort === 'newest') orderBy = { createdAt: 'desc' };
    if (sort === 'name') orderBy = { name: 'asc' };

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          images: { orderBy: { sortOrder: 'asc' } },
          variants: { where: { isActive: true }, orderBy: { price: 'asc' } },
          _count: { select: { reviews: true } },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findBySlug(slug: string) {
    return this.prisma.product.findUnique({
      where: { slug },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        images: { orderBy: { sortOrder: 'asc' } },
        variants: { where: { isActive: true }, orderBy: { price: 'asc' } },
        reviews: {
          where: { isApproved: true },
          include: { user: { select: { name: true, avatar: true } } },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: { select: { reviews: true } },
      },
    });
  }

  async findById(id: string) {
    return this.prisma.product.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        images: { orderBy: { sortOrder: 'asc' } },
        variants: { orderBy: { price: 'asc' } },
        _count: { select: { reviews: true } },
      },
    });
  }

  async findFeatured() {
    return this.prisma.product.findMany({
      where: { isActive: true, isFeatured: true },
      take: 12,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        images: { orderBy: { sortOrder: 'asc' }, take: 1 },
        variants: { where: { isActive: true }, orderBy: { price: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Admin methods
  async adminFindAll(query: {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
    isActive?: boolean;
  }) {
    const { page = 1, limit = 20, search, categoryId, isActive } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (categoryId) {
      where.categoryId = categoryId;
    }
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: {
          category: { select: { id: true, name: true } },
          images: { orderBy: { sortOrder: 'asc' }, take: 1 },
          _count: { select: { orderItems: true, reviews: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      products,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async create(data: CreateProductDto, files: Express.Multer.File[]) {
    const { images, variants, ...productData } = data;

    // Combine existing image URLs (if any) with newly uploaded files
    const newImages =
      files?.map((file) => ({ url: `/uploads/${file.filename}` })) || [];
    // frontend might send images as {url: string}[]
    const existingImages = Array.isArray(images) ? images : [];
    const allImages = [...existingImages, ...newImages];

    return this.prisma.product.create({
      data: {
        ...productData,
        images: {
          create: allImages.map((img: ProductImageInput, i: number) => ({
            url: img.url,
            sortOrder: i,
          })),
        },
        variants: variants ? { create: variants } : undefined,
      },
      include: {
        category: true,
        images: true,
        variants: true,
      },
    });
  }

  async update(
    id: string,
    data: UpdateProductDto,
    files: Express.Multer.File[],
  ) {
    const { images, variants, ...productData } = data;

    const newImages =
      files?.map((file) => ({ url: `/uploads/${file.filename}` })) || [];
    const existingImages = Array.isArray(images) ? images : [];
    const allImages = [...existingImages, ...newImages];

    return this.prisma.$transaction(async (tx) => {
      // Delete existing images to replace with the new set (existing + new files)
      await tx.productImage.deleteMany({ where: { productId: id } });

      return tx.product.update({
        where: { id },
        data: {
          ...productData,
          images: {
            create: allImages.map((img: ProductImageInput, i: number) => ({
              url: img.url,
              sortOrder: i,
            })),
          },
          // For variants, we might need more complex sync, but I'll skip for now as not requested
        },
        include: {
          category: true,
          images: true,
          variants: true,
        },
      });
    });
  }

  async delete(id: string) {
    return this.prisma.product.delete({ where: { id } });
  }

  async toggleActive(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    return this.prisma.product.update({
      where: { id },
      data: { isActive: !product?.isActive },
    });
  }
}
