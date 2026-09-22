import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateAddressDto } from './dto/create-address.dto';
import { SendCustomerMailDto } from './dto/send-customer-mail.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async updateProfile(userId: string, data: UpdateProfileDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        role: true,
      },
    });
    return user;
  }

  async requestEmailChange(userId: string, newEmail: string) {
    // Check if new email is taken
    const existing = await this.prisma.user.findUnique({
      where: { email: newEmail },
    });
    if (existing) throw new BadRequestException('Email already in use');

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        tempEmail: newEmail,
        emailVerificationCode: otp,
      },
    });

    // Send OTP to new email
    try {
      await this.mailService.sendEmailVerificationCode(newEmail, otp);
    } catch (error) {
      // Ignore mail delivery failures to avoid blocking the change flow.
    }

    return { message: 'OTP sent to your new email' };
  }

  async verifyEmailChange(userId: string, otp: string) {
    const trimmedOtp = otp.trim();
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user || user.emailVerificationCode !== trimmedOtp || !user.tempEmail) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        email: user.tempEmail,
        tempEmail: null,
        emailVerificationCode: null,
        isVerified: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        role: true,
      },
    });
  }

  async getAddresses(userId: string) {
    return this.prisma.address.findMany({
      where: { userId },
      orderBy: { isDefault: 'desc' },
    });
  }

  async createAddress(userId: string, data: CreateAddressDto) {
    if (data.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }
    return this.prisma.address.create({
      data: { ...data, street: data.addressLine1, userId },
    });
  }

  async updateAddress(userId: string, id: string, data: UpdateAddressDto) {
    if (data.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }
    return this.prisma.address.update({
      where: { id },
      data: { ...data, street: data.addressLine1 },
    });
  }

  async deleteAddress(id: string) {
    return this.prisma.address.delete({ where: { id } });
  }

  async changePassword(userId: string, data: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found');

    const bcrypt = require('bcryptjs');
    const isMatch = await bcrypt.compare(data.currentPassword, user.password);
    if (!isMatch)
      throw new BadRequestException('Current password does not match');

    const hashedPassword = await bcrypt.hash(data.newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: 'Password changed successfully' };
  }

  // Admin
  async adminFindAll(query: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }) {
    const page = this.toPositiveNumber(query.page, 1);
    const limit = this.toPositiveNumber(query.limit, 20);
    const skip = (page - 1) * limit;
    const where: Prisma.UserWhereInput = { role: 'CUSTOMER' };

    if (query.status === 'banned') {
      where.isBanned = true;
    }
    if (query.status === 'active') {
      where.isBanned = false;
    }

    const search = query.search?.trim();
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          createdAt: true,
          isBanned: true,
          bannedAt: true,
          banReason: true,
          _count: { select: { orders: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async adminFindById(id: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        id,
        role: 'CUSTOMER',
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        createdAt: true,
        isVerified: true,
        isBanned: true,
        bannedAt: true,
        banReason: true,
        _count: {
          select: {
            orders: true,
            addresses: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Customer not found');
    }

    return user;
  }

  async adminFindCustomerOrders(
    userId: string,
    query: { page?: number; limit?: number; status?: string; search?: string },
  ) {
    const customer = await this.prisma.user.findFirst({
      where: { id: userId, role: 'CUSTOMER' },
      select: { id: true },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const page = this.toPositiveNumber(query.page, 1);
    const limit = this.toPositiveNumber(query.limit, 10);
    const skip = (page - 1) * limit;
    const where: Prisma.OrderWhereInput = { userId };

    const status = query.status?.trim();
    if (status && status !== 'all') {
      where.status = status as Prisma.EnumOrderStatusFilter;
    }

    const search = query.search?.trim();
    if (search) {
      where.orderNumber = { contains: search, mode: 'insensitive' };
    }

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          items: true,
          _count: { select: { items: true } },
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      orders,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async adminBanCustomer(id: string, reason?: string) {
    const customer = await this.prisma.user.findFirst({
      where: { id, role: 'CUSTOMER' },
      select: { id: true },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        isBanned: true,
        bannedAt: new Date(),
        banReason: reason?.trim() || null,
      },
      select: {
        id: true,
        isBanned: true,
        bannedAt: true,
        banReason: true,
      },
    });
  }

  async adminUnbanCustomer(id: string) {
    const customer = await this.prisma.user.findFirst({
      where: { id, role: 'CUSTOMER' },
      select: { id: true },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        isBanned: false,
        bannedAt: null,
        banReason: null,
      },
      select: {
        id: true,
        isBanned: true,
        bannedAt: true,
        banReason: true,
      },
    });
  }

  async adminSendMailToCustomer(id: string, payload: SendCustomerMailDto) {
    const customer = await this.prisma.user.findFirst({
      where: { id, role: 'CUSTOMER' },
      select: { id: true, name: true, email: true },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    await this.mailService.sendAdminCustomerMessage(
      customer.email,
      customer.name,
      payload.subject,
      payload.message,
    );

    return { message: 'Email sent successfully' };
  }

  private toPositiveNumber(value: number | undefined, fallback: number) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < 1) {
      return fallback;
    }
    return Math.floor(parsed);
  }
}
