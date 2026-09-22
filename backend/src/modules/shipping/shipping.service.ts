import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

export interface CreateShippingZonePayload {
  name: string;
  slug: string;
  cost: number;
  isActive?: boolean;
}

export interface UpdateShippingZonePayload {
  name?: string;
  slug?: string;
  cost?: number;
  isActive?: boolean;
}

@Injectable()
export class ShippingService {
  constructor(private prisma: PrismaService) {}

  private serialize(zone: {
    id: string;
    name: string;
    slug: string;
    cost: Prisma.Decimal | number | string;
    isActive: boolean;
  }) {
    return {
      ...zone,
      cost: Number(zone.cost),
    };
  }

  async findAll() {
    const zones = await this.prisma.shippingZone.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });

    return zones.map((zone) => this.serialize(zone));
  }

  async findAdminAll() {
    const zones = await this.prisma.shippingZone.findMany({
      orderBy: { name: 'asc' },
    });

    return zones.map((zone) => this.serialize(zone));
  }

  async create(data: CreateShippingZonePayload) {
    const zone = await this.prisma.shippingZone.create({
      data: {
        name: data.name,
        slug: data.slug,
        cost: new Prisma.Decimal(data.cost),
        isActive: data.isActive ?? true,
      },
    });

    return this.serialize(zone);
  }

  async update(id: string, data: UpdateShippingZonePayload) {
    const zone = await this.prisma.shippingZone.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.slug !== undefined ? { slug: data.slug } : {}),
        ...(data.cost !== undefined
          ? { cost: new Prisma.Decimal(data.cost) }
          : {}),
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
      },
    });

    return this.serialize(zone);
  }

  async remove(id: string) {
    const zone = await this.prisma.shippingZone.delete({ where: { id } });

    return this.serialize(zone);
  }
}
