import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

interface CategoryListParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

interface CategoryInput {
  name: string;
  namebn?: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  sortOrder?: number;
  isActive?: boolean;
  parentId?: string | null;
}

interface CategoryUpdateInput {
  name?: string;
  namebn?: string;
  slug?: string;
  description?: string;
  image?: string;
  icon?: string;
  sortOrder?: number;
  isActive?: boolean;
  parentId?: string | null;
}

interface CategoryTreeItem {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  parentId: string | null;
}

export interface CategoryTreeNode extends CategoryTreeItem {
  children: CategoryTreeNode[];
}

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  private buildTree(categories: CategoryTreeItem[]): CategoryTreeNode[] {
    const nodes = new Map<string, CategoryTreeNode>();
    const roots: CategoryTreeNode[] = [];

    for (const category of categories) {
      nodes.set(category.id, {
        ...category,
        children: [],
      });
    }

    for (const category of categories) {
      const node = nodes.get(category.id);
      if (!node) continue;

      if (category.parentId) {
        const parent = nodes.get(category.parentId);
        if (parent) {
          parent.children.push(node);
          continue;
        }
      }

      roots.push(node);
    }

    return roots;
  }

  private async validateParent(
    parentId?: string | null,
    categoryId?: string,
  ): Promise<void> {
    if (parentId === undefined) {
      return;
    }

    if (parentId === null || parentId === '') {
      return;
    }

    if (categoryId && parentId === categoryId) {
      throw new BadRequestException('A category cannot be its own parent.');
    }

    const parent = await this.prisma.category.findUnique({
      where: { id: parentId },
      select: { id: true },
    });

    if (!parent) {
      throw new NotFoundException('Parent category not found.');
    }

    if (!categoryId) {
      return;
    }

    let currentParentId: string | null = parent.id;
    while (currentParentId) {
      if (currentParentId === categoryId) {
        throw new BadRequestException(
          'Invalid parent assignment. A child category cannot become an ancestor of its parent.',
        );
      }

      const ancestor = await this.prisma.category.findUnique({
        where: { id: currentParentId },
      });

      const nextParentId: string | null =
        ancestor && 'parentId' in ancestor
          ? ((ancestor as { parentId?: string | null }).parentId ?? null)
          : null;

      currentParentId = nextParentId ?? null;
    }
  }

  async findAll(params?: CategoryListParams) {
    const { page = 1, limit = 10, search, isActive } = params || {};
    const skip = (page - 1) * limit;

    const where: Prisma.CategoryWhereInput = {};
    if (isActive !== undefined) {
      where.isActive = isActive;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.category.findMany({
        where,
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        include: {
          parent: { select: { id: true, name: true, slug: true } },
          _count: { select: { products: true } },
        },
        skip,
        take: Number(limit),
      }),
      this.prisma.category.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPage: Math.ceil(total / limit),
      },
    };
  }

  async findBySlug(slug: string) {
    return this.prisma.category.findUnique({
      where: { slug },
      include: {
        parent: { select: { id: true, name: true, slug: true } },
        children: {
          where: { isActive: true },
          select: { id: true, name: true, slug: true, sortOrder: true },
          orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        },
        _count: { select: { products: true } },
      },
    });
  }

  async findTree(params?: { isActive?: boolean }) {
    const where: Prisma.CategoryWhereInput = {};

    if (params?.isActive !== undefined) {
      where.isActive = params.isActive;
    }

    const categories = await this.prisma.$queryRaw<CategoryTreeItem[]>`
      SELECT id, name, slug, "sortOrder", "parentId"
      FROM categories
      ${
        params?.isActive !== undefined
          ? Prisma.sql`WHERE "isActive" = ${params.isActive}`
          : Prisma.empty
      }
      ORDER BY "sortOrder" ASC, name ASC
    `;

    return this.buildTree(categories);
  }

  async create(data: CategoryInput) {
    await this.validateParent(data.parentId);

    const existingSlug = await this.prisma.category.findUnique({
      where: { slug: data.slug },
      select: { id: true, name: true },
    });

    if (existingSlug) {
      throw new BadRequestException(
        `A category with slug "${data.slug}" already exists (${existingSlug.name}). Please use a unique slug.`,
      );
    }

    return this.prisma.category.create({ data });
  }

  async update(id: string, data: CategoryUpdateInput) {
    if (Object.prototype.hasOwnProperty.call(data, 'parentId')) {
      await this.validateParent(data.parentId, id);
    }

    if (data.slug) {
      const existingSlug = await this.prisma.category.findUnique({
        where: { slug: data.slug },
        select: { id: true, name: true },
      });

      if (existingSlug && existingSlug.id !== id) {
        throw new BadRequestException(
          `A category with slug "${data.slug}" already exists (${existingSlug.name}). Please use a unique slug.`,
        );
      }
    }

    return this.prisma.category.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const category = await tx.category.findUnique({
        where: { id },
        select: { id: true },
      });

      if (!category) {
        throw new NotFoundException('Category not found.');
      }

      const [productCount, childCountRows] = await Promise.all([
        tx.product.count({ where: { categoryId: id } }),
        tx.$queryRaw<Array<{ count: number }>>`
          SELECT COUNT(*)::int AS count
          FROM categories
          WHERE "parentId" = ${id}
        `,
      ]);

      const childCount = Number(childCountRows[0]?.count ?? 0);

      if (productCount > 0) {
        throw new BadRequestException(
          'Cannot delete category with active products. Remove products first.',
        );
      }

      if (childCount > 0) {
        throw new BadRequestException(
          'Cannot delete category with child categories. Reassign or remove child categories first.',
        );
      }

      return tx.category.delete({ where: { id } });
    });
  }
}
