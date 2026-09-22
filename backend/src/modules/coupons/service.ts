import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DiscountType, Prisma } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';

interface CouponQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export interface SerializedCoupon {
  id: string;
  code: string;
  description?: string | null;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount?: number | null;
  maxDiscount?: number | null;
  usageLimit?: number | null;
  usedCount: number;
  startsAt?: string | null;
  expiresAt?: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface CouponValidationResult {
  valid: true;
  discountAmount: number;
  coupon: {
    id: string;
    code: string;
    discountType: DiscountType;
    discountValue: number;
  };
}

export interface AdminCouponsListResponse {
  coupons: SerializedCoupon[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

@Injectable()
export class CouponsService {
  constructor(private prisma: PrismaService) {}

  async validateForUser(
    userId: string,
    code: string,
    subtotal: number,
  ): Promise<CouponValidationResult> {
    const coupon = await this.getValidCoupon(code, subtotal);
    await this.ensureCouponUnusedByUser(userId, coupon.id);

    return {
      valid: true,
      discountAmount: this.calculateDiscount(coupon, subtotal),
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: Number(coupon.discountValue),
      },
    };
  }

  async validateForOrder(
    userId: string,
    code: string,
    subtotal: number,
  ): Promise<{ discountAmount: number; couponId: string }> {
    const coupon = await this.getValidCoupon(code, subtotal);
    await this.ensureCouponUnusedByUser(userId, coupon.id);

    return {
      discountAmount: this.calculateDiscount(coupon, subtotal),
      couponId: coupon.id,
    };
  }

  async findAll(query: CouponQuery): Promise<AdminCouponsListResponse> {
    const page = this.toPositiveNumber(query.page, 1);
    const limit = this.toPositiveNumber(query.limit, 10);
    const skip = (page - 1) * limit;

    const where: Prisma.CouponWhereInput = {};
    const search = query.search?.trim();

    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (query.status === 'active') {
      where.isActive = true;
    }

    if (query.status === 'inactive') {
      where.isActive = false;
    }

    const [coupons, total] = await Promise.all([
      this.prisma.coupon.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.coupon.count({ where }),
    ]);

    return {
      coupons: coupons.map((coupon) => this.serializeCoupon(coupon)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async create(data: CreateCouponDto): Promise<SerializedCoupon> {
    const coupon = await this.prisma.coupon.create({
      data: {
        code: data.code.trim().toUpperCase(),
        description: data.description,
        discountType: data.discountType as DiscountType,
        discountValue: data.discountValue,
        minOrderAmount: data.minOrderAmount,
        maxDiscount: data.maxDiscount,
        usageLimit: data.usageLimit,
        startsAt: data.startsAt ? new Date(data.startsAt) : undefined,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
        isActive: data.isActive ?? true,
      },
    });

    return this.serializeCoupon(coupon);
  }

  async update(id: string, data: UpdateCouponDto): Promise<SerializedCoupon> {
    const coupon = await this.prisma.coupon.update({
      where: { id },
      data: {
        ...(data.code ? { code: data.code.trim().toUpperCase() } : {}),
        ...(data.description !== undefined
          ? { description: data.description }
          : {}),
        ...(data.discountType
          ? { discountType: data.discountType as DiscountType }
          : {}),
        ...(data.discountValue !== undefined
          ? { discountValue: data.discountValue }
          : {}),
        ...(data.minOrderAmount !== undefined
          ? { minOrderAmount: data.minOrderAmount }
          : {}),
        ...(data.maxDiscount !== undefined
          ? { maxDiscount: data.maxDiscount }
          : {}),
        ...(data.usageLimit !== undefined ? { usageLimit: data.usageLimit } : {}),
        ...(data.startsAt ? { startsAt: new Date(data.startsAt) } : {}),
        ...(data.expiresAt ? { expiresAt: new Date(data.expiresAt) } : {}),
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
      },
    });

    return this.serializeCoupon(coupon);
  }

  async setStatus(id: string, isActive: boolean): Promise<SerializedCoupon> {
    const coupon = await this.prisma.coupon.update({
      where: { id },
      data: { isActive },
    });

    return this.serializeCoupon(coupon);
  }

  async delete(id: string): Promise<{ message: string }> {
    await this.prisma.coupon.delete({ where: { id } });
    return { message: 'Coupon deleted successfully' };
  }

  private async getValidCoupon(code: string, subtotal: number) {
    const normalizedCode = code.trim().toUpperCase();
    const coupon = await this.prisma.coupon.findUnique({
      where: { code: normalizedCode },
    });

    if (!coupon || !coupon.isActive) {
      throw new NotFoundException('Invalid coupon');
    }

    if (coupon.startsAt && coupon.startsAt > new Date()) {
      throw new BadRequestException('Coupon is not active yet');
    }

    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      throw new BadRequestException('Coupon expired');
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      throw new BadRequestException('Coupon limit reached');
    }

    if (coupon.minOrderAmount && subtotal < Number(coupon.minOrderAmount)) {
      throw new BadRequestException(
        `Minimum order ৳${Number(coupon.minOrderAmount)}`,
      );
    }

    return coupon;
  }

  private async ensureCouponUnusedByUser(userId: string, couponId: string) {
    const existingOrder = await this.prisma.order.findFirst({
      where: { userId, couponId },
      select: { id: true },
    });

    if (existingOrder) {
      throw new BadRequestException('You have already used this coupon');
    }
  }

  private calculateDiscount(
    coupon: {
      discountType: DiscountType;
      discountValue: Prisma.Decimal;
      maxDiscount: Prisma.Decimal | null;
    },
    subtotal: number,
  ) {
    let discount = 0;

    if (coupon.discountType === 'PERCENTAGE') {
      discount = (subtotal * Number(coupon.discountValue)) / 100;
      if (coupon.maxDiscount && discount > Number(coupon.maxDiscount)) {
        discount = Number(coupon.maxDiscount);
      }
    } else {
      discount = Number(coupon.discountValue);
    }

    return discount;
  }

  private serializeCoupon(coupon: {
    id: string;
    code: string;
    description: string | null;
    discountType: DiscountType;
    discountValue: Prisma.Decimal;
    minOrderAmount: Prisma.Decimal | null;
    maxDiscount: Prisma.Decimal | null;
    usageLimit: number | null;
    usedCount: number;
    startsAt: Date | null;
    expiresAt: Date | null;
    isActive: boolean;
    createdAt: Date;
  }): SerializedCoupon {
    return {
      id: coupon.id,
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: Number(coupon.discountValue),
      minOrderAmount: coupon.minOrderAmount ? Number(coupon.minOrderAmount) : null,
      maxDiscount: coupon.maxDiscount ? Number(coupon.maxDiscount) : null,
      usageLimit: coupon.usageLimit,
      usedCount: coupon.usedCount,
      startsAt: coupon.startsAt ? coupon.startsAt.toISOString() : null,
      expiresAt: coupon.expiresAt ? coupon.expiresAt.toISOString() : null,
      isActive: coupon.isActive,
      createdAt: coupon.createdAt.toISOString(),
    };
  }

  private toPositiveNumber(value: number | undefined, fallback: number) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < 1) {
      return fallback;
    }
    return Math.floor(parsed);
  }
}
