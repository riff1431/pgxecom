import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  // ─── Public Queries ───────────────────────────────────────────────

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
    const product = await this.prisma.product.findUnique({
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

    if (!product) {
      throw new NotFoundException(`Product with slug "${slug}" not found`);
    }

    return product;
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

  // ─── Admin Queries & Mutations ────────────────────────────────────

  async findById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        images: { orderBy: { sortOrder: 'asc' } },
        variants: { orderBy: { price: 'asc' } },
        _count: { select: { reviews: true } },
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }

    return product;
  }

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
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async create(data: CreateProductDto) {
    const { images, variants, ...productData } = data;

    // Verify category exists
    const categoryExists = await this.prisma.category.findUnique({
      where: { id: productData.categoryId },
      select: { id: true },
    });
    if (!categoryExists) {
      throw new BadRequestException('Selected category does not exist');
    }

    // Check slug uniqueness
    const existingSlug = await this.prisma.product.findUnique({
      where: { slug: productData.slug },
      select: { id: true, name: true },
    });
    if (existingSlug) {
      throw new ConflictException(
        `A product with slug "${productData.slug}" already exists ("${existingSlug.name}"). Please use a different slug.`,
      );
    }

    // Check SKU uniqueness if provided
    if (productData.sku) {
      const existingSku = await this.prisma.product.findUnique({
        where: { sku: productData.sku },
        select: { id: true, name: true },
      });
      if (existingSku) {
        throw new ConflictException(
          `A product with SKU "${productData.sku}" already exists ("${existingSku.name}"). Please use a unique SKU.`,
        );
      }
    }

    // Sanitize image URLs and order
    const imageList = Array.isArray(images)
      ? images
          .filter((img) => img && typeof img.url === 'string' && img.url.trim() !== '')
          .map((img, index) => ({
            url: img.url.trim(),
            alt: img.alt?.trim() || null,
            sortOrder: img.sortOrder ?? index,
          }))
      : [];

    // Sanitize variants
    const variantList = Array.isArray(variants)
      ? variants
          .filter((v) => v && typeof v.name === 'string' && v.name.trim() !== '')
          .map((v) => ({
            name: v.name.trim(),
            price: v.price,
            comparePrice: v.comparePrice ?? null,
            stock: v.stock ?? 0,
            sku: v.sku?.trim() || null,
            isActive: v.isActive ?? true,
          }))
      : [];

    return this.prisma.product.create({
      data: {
        name: productData.name.trim(),
        slug: productData.slug.trim(),
        namebn: productData.namebn?.trim() || null,
        description: productData.description?.trim() || null,
        shortDesc: productData.shortDesc?.trim() || null,
        sku: productData.sku?.trim() || null,
        price: productData.price,
        comparePrice: productData.comparePrice ?? null,
        costPrice: productData.costPrice ?? null,
        stock: productData.stock ?? 0,
        lowStockAlert: productData.lowStockAlert ?? 5,
        weight: productData.weight?.trim() || null,
        isActive: productData.isActive ?? true,
        isFeatured: productData.isFeatured ?? false,
        isHot: productData.isHot ?? false,
        metaTitle: productData.metaTitle?.trim() || null,
        metaDesc: productData.metaDesc?.trim() || null,
        categoryId: productData.categoryId,
        images: imageList.length > 0 ? { create: imageList } : undefined,
        variants: variantList.length > 0 ? { create: variantList } : undefined,
      },
      include: {
        category: true,
        images: { orderBy: { sortOrder: 'asc' } },
        variants: { orderBy: { price: 'asc' } },
      },
    });
  }

  async update(id: string, data: UpdateProductDto) {
    const existing = await this.prisma.product.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }

    const { images, variants, ...productData } = data;

    // Check category if provided
    if (productData.categoryId) {
      const categoryExists = await this.prisma.category.findUnique({
        where: { id: productData.categoryId },
        select: { id: true },
      });
      if (!categoryExists) {
        throw new BadRequestException('Selected category does not exist');
      }
    }

    // Check slug uniqueness
    if (productData.slug) {
      const existingSlug = await this.prisma.product.findUnique({
        where: { slug: productData.slug },
        select: { id: true, name: true },
      });
      if (existingSlug && existingSlug.id !== id) {
        throw new ConflictException(
          `A product with slug "${productData.slug}" already exists ("${existingSlug.name}"). Please use a different slug.`,
        );
      }
    }

    // Check SKU uniqueness
    if (productData.sku) {
      const existingSku = await this.prisma.product.findUnique({
        where: { sku: productData.sku },
        select: { id: true, name: true },
      });
      if (existingSku && existingSku.id !== id) {
        throw new ConflictException(
          `A product with SKU "${productData.sku}" already exists ("${existingSku.name}"). Please use a unique SKU.`,
        );
      }
    }

    return this.prisma.$transaction(async (tx) => {
      // If images array is provided, replace existing images
      if (images !== undefined) {
        await tx.productImage.deleteMany({ where: { productId: id } });

        const imageList = Array.isArray(images)
          ? images
              .filter((img) => img && typeof img.url === 'string' && img.url.trim() !== '')
              .map((img, index) => ({
                productId: id,
                url: img.url.trim(),
                alt: img.alt?.trim() || null,
                sortOrder: img.sortOrder ?? index,
              }))
          : [];

        if (imageList.length > 0) {
          await tx.productImage.createMany({
            data: imageList,
          });
        }
      }

      // If variants array is provided, replace existing variants
      if (variants !== undefined) {
        await tx.productVariant.deleteMany({ where: { productId: id } });

        const variantList = Array.isArray(variants)
          ? variants
              .filter((v) => v && typeof v.name === 'string' && v.name.trim() !== '')
              .map((v) => ({
                productId: id,
                name: v.name.trim(),
                price: v.price,
                comparePrice: v.comparePrice ?? null,
                stock: v.stock ?? 0,
                sku: v.sku?.trim() || null,
                isActive: v.isActive ?? true,
              }))
          : [];

        if (variantList.length > 0) {
          await tx.productVariant.createMany({
            data: variantList,
          });
        }
      }

      // Build product update fields
      const updateFields: any = {};
      if (productData.name !== undefined) updateFields.name = productData.name.trim();
      if (productData.slug !== undefined) updateFields.slug = productData.slug.trim();
      if (productData.namebn !== undefined) updateFields.namebn = productData.namebn?.trim() || null;
      if (productData.description !== undefined) updateFields.description = productData.description?.trim() || null;
      if (productData.shortDesc !== undefined) updateFields.shortDesc = productData.shortDesc?.trim() || null;
      if (productData.sku !== undefined) updateFields.sku = productData.sku?.trim() || null;
      if (productData.price !== undefined) updateFields.price = productData.price;
      if (productData.comparePrice !== undefined) updateFields.comparePrice = productData.comparePrice ?? null;
      if (productData.costPrice !== undefined) updateFields.costPrice = productData.costPrice ?? null;
      if (productData.stock !== undefined) updateFields.stock = productData.stock ?? 0;
      if (productData.lowStockAlert !== undefined) updateFields.lowStockAlert = productData.lowStockAlert ?? 5;
      if (productData.weight !== undefined) updateFields.weight = productData.weight?.trim() || null;
      if (productData.isActive !== undefined) updateFields.isActive = productData.isActive;
      if (productData.isFeatured !== undefined) updateFields.isFeatured = productData.isFeatured;
      if (productData.isHot !== undefined) updateFields.isHot = productData.isHot;
      if (productData.metaTitle !== undefined) updateFields.metaTitle = productData.metaTitle?.trim() || null;
      if (productData.metaDesc !== undefined) updateFields.metaDesc = productData.metaDesc?.trim() || null;
      if (productData.categoryId !== undefined) updateFields.categoryId = productData.categoryId;

      return tx.product.update({
        where: { id },
        data: updateFields,
        include: {
          category: true,
          images: { orderBy: { sortOrder: 'asc' } },
          variants: { orderBy: { price: 'asc' } },
        },
      });
    });
  }

  async delete(id: string) {
    const existing = await this.prisma.product.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }

    return this.prisma.product.delete({ where: { id } });
  }

  async toggleActive(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }

    return this.prisma.product.update({
      where: { id },
      data: { isActive: !product.isActive },
    });
  }
}
