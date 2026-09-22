import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { BulkUpsertSettingsDto } from './dto/bulk-upsert-settings.dto';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) { }

  async findPublic() {
    return this.prisma.storeSetting.findMany({
      where: {
        OR: [
          { group: 'general' },
          { group: 'contact' },
          { group: 'social' },
          { group: 'hero' },
        ],
      },
      orderBy: [{ group: 'asc' }, { key: 'asc' }],
    });
  }

  async findAll(query?: { group?: string; search?: string }) {
    const where: {
      group?: string;
      OR?: Array<
        | { key: { contains: string; mode: 'insensitive' } }
        | { value: { contains: string; mode: 'insensitive' } }
      >;
    } = {};

    if (query?.group) {
      where.group = query.group;
    }

    if (query?.search) {
      where.OR = [
        { key: { contains: query.search, mode: 'insensitive' } },
        { value: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.storeSetting.findMany({
      where,
      orderBy: [{ group: 'asc' }, { key: 'asc' }],
    });
  }

  async findOneByKey(key: string) {
    const setting = await this.prisma.storeSetting.findUnique({
      where: { key },
    });
    if (!setting) {
      throw new NotFoundException('Setting not found');
    }

    return setting;
  }

  async create(data: CreateSettingDto) {
    return this.prisma.storeSetting.create({
      data: {
        key: data.key.trim(),
        value: data.value,
        group: data.group?.trim() || 'general',
      },
    });
  }

  async updateByKey(key: string, data: UpdateSettingDto) {
    await this.findOneByKey(key);

    return this.prisma.storeSetting.update({
      where: { key },
      data: {
        ...(data.value !== undefined ? { value: data.value } : {}),
        ...(data.group !== undefined
          ? { group: data.group.trim() || 'general' }
          : {}),
      },
    });
  }

  async deleteByKey(key: string) {
    await this.findOneByKey(key);
    await this.prisma.storeSetting.delete({ where: { key } });

    return { message: 'Setting deleted successfully' };
  }

  async bulkUpsert(data: BulkUpsertSettingsDto) {
    const operations = data.items.map((item) =>
      this.prisma.storeSetting.upsert({
        where: { key: item.key.trim() },
        update: {
          value: item.value,
          group: item.group?.trim() || 'general',
        },
        create: {
          key: item.key.trim(),
          value: item.value,
          group: item.group?.trim() || 'general',
        },
      }),
    );

    return this.prisma.$transaction(operations);
  }
}
