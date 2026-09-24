import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus, PaymentMethod, PaymentStatus, Prisma } from '@prisma/client';
import { CouponsService } from 'modules/coupons/service';
import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { WalletService } from '../wallet/wallet.service';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
    private couponsService: CouponsService,
    private walletService: WalletService,
  ) {}

  async create(data: {
    userId?: string;
    addressId?: string;
    guestName?: string;
    guestPhone?: string;
    guestEmail?: string;
    shippingAddress?: Prisma.InputJsonValue;
    zone: string;
    items: Array<{ productId: string; variantId?: string; quantity: number }>;
    couponCode?: string;
    notes?: string;
    paymentMethod?: string;
  }) {
    // Generate order number
    const orderNumber = await this.generateOrderNumber();

    if (!data.zone) throw new BadRequestException('Shipping zone is required');

    // Get shipping cost
    const shippingZone = await this.prisma.shippingZone.findUnique({
      where: { slug: data.zone },
    });
    if (!shippingZone) throw new BadRequestException('Invalid shipping zone');

    // Calculate items
    const orderItems: any[] = [];
    let subtotal = 0;

    for (const item of data.items) {
      const product = await this.prisma.product.findUnique({
        where: { id: item.productId },
        include: { variants: true },
      });
      if (!product)
        throw new NotFoundException(`Product not found: ${item.productId}`);

      let unitPrice = Number(product.price);
      let variantName: string | null = null;

      if (product.variants && product.variants.length > 0 && !item.variantId) {
        throw new BadRequestException(
          `Product ${product.name} requires a variant selection`,
        );
      }

      if (item.variantId) {
        const variant = product.variants.find((v) => v.id === item.variantId);
        if (!variant)
          throw new NotFoundException(`Variant not found: ${item.variantId}`);
        unitPrice = Number(variant.price);
        variantName = variant.name;
      }

      const totalPrice = unitPrice * item.quantity;
      subtotal += totalPrice;

      orderItems.push({
        productId: item.productId,
        variantId: item.variantId || null,
        quantity: item.quantity,
        unitPrice,
        totalPrice,
        productName: product.name,
        variantName,
      });
    }

    // Apply coupon
    let discount = 0;
    let couponId: string | null = null;

    if (data.couponCode) {
      if (!data.userId) {
        throw new BadRequestException('Login is required to use coupons');
      }

      const validation = await this.couponsService.validateForOrder(
        data.userId,
        data.couponCode,
        subtotal,
      );
      discount = validation.discountAmount;
      couponId = validation.couponId;
    }

    const shippingCost = Number(shippingZone.cost);
    const total = subtotal - discount + shippingCost;

    const requestedPaymentMethod = (data.paymentMethod as PaymentMethod) || PaymentMethod.WALLET;

    if (requestedPaymentMethod === PaymentMethod.WALLET) {
      if (!data.userId) {
        throw new BadRequestException('You must be logged in to complete checkout with your Universal Wallet.');
      }
      // Check wallet balance first before creating order
      const { balance } = await this.walletService.getBalance(data.userId);
      if (balance < total) {
        throw new BadRequestException(
          `Insufficient wallet balance. Total: €${total.toFixed(2)}, Available Balance: €${balance.toFixed(2)}. Please top up your wallet to proceed.`,
        );
      }
    }

    const order = await this.prisma.$transaction(async (tx) => {
      // Create order
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId: data.userId || null,
          addressId: data.addressId || null,
          guestName: data.guestName,
          guestPhone: data.guestPhone,
          guestEmail: data.guestEmail,
          shippingAddress: data.shippingAddress,
          subtotal,
          shippingCost,
          discount,
          total,
          couponId,
          notes: data.notes,
          paymentMethod: requestedPaymentMethod,
          paymentStatus: requestedPaymentMethod === PaymentMethod.WALLET ? PaymentStatus.PAID : PaymentStatus.UNPAID,
          items: { create: orderItems },
          statusHistory: {
            create: {
              status: 'PENDING',
              note: requestedPaymentMethod === PaymentMethod.WALLET ? 'Order placed and paid via PGX Universal Wallet' : 'Order placed',
            },
          },
          invoice: {
            create: {
              invoiceNumber: this.generateInvoiceNumber(orderNumber),
            },
          },
        },
        include: {
          items: { include: { product: { include: { images: { take: 1 } } } } },
          invoice: true,
        },
      });

      if (couponId) {
        await tx.coupon.update({
          where: { id: couponId },
          data: { usedCount: { increment: 1 } },
        });
      }

      // Decrease stock
      for (const item of data.items) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { decrement: item.quantity } },
          });
        }
        // Always decrement product stock, even if variant was ordered, to keep totals accurate
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return order;
    });

    // If paid with wallet, atomically debit the wallet funds
    if (requestedPaymentMethod === PaymentMethod.WALLET && data.userId) {
      try {
        await this.walletService.deductFunds(
          data.userId,
          total,
          order.orderNumber,
          `PGX Store Order Payment #${order.orderNumber}`,
        );
      } catch (debitErr: any) {
        // Rollback order status to CANCELLED if wallet debit fails unexpectedly
        await this.prisma.order.update({
          where: { id: order.id },
          data: {
            status: OrderStatus.CANCELLED,
            paymentStatus: PaymentStatus.UNPAID,
            statusHistory: {
              create: { status: OrderStatus.CANCELLED, note: `Wallet debit failed: ${debitErr.message}` },
            },
          },
        });
        throw new BadRequestException(debitErr.message || 'Failed to debit wallet balance for order payment');
      }
    }

    // Send confirmation email
    const email =
      data.guestEmail ||
      (data.userId
        ? (await this.prisma.user.findUnique({ where: { id: data.userId } }))
            ?.email
        : null);
    if (email) {
      try {
        await this.mailService.sendOrderConfirmation(email, order as any);
      } catch (error) {
        console.error('Failed to send order confirmation email:', error);
      }
    }

    return order;
  }

  async trackOrder(orderNumber: string, phone: string) {
    const order = await this.prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: { include: { product: { include: { images: { take: 1 } } } } },
        statusHistory: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!order) throw new NotFoundException('Order not found');

    // Verify phone
    const orderPhone =
      order.guestPhone ||
      (order.userId
        ? (await this.prisma.user.findUnique({ where: { id: order.userId } }))
            ?.phone
        : null);
    if (orderPhone !== phone) throw new NotFoundException('Order not found');

    return order;
  }

  async findByUser(
    userId: string,
    query: { page?: number; limit?: number; status?: string },
  ) {
    const { page = 1, limit = 10, status } = query;
    const skip = (page - 1) * limit;
    const where: any = { userId };
    if (status) where.status = status;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          items: { include: { product: { include: { images: { take: 1 } } } } },
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      orders,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  // Admin methods
  async adminFindAll(query: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }) {
    const { page = 1, limit = 20, status, search } = query;
    const skip = (page - 1) * limit;
    const where: any = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { guestName: { contains: search, mode: 'insensitive' } },
        { guestPhone: { contains: search } },
      ];
    }

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true, phone: true } },
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

  async adminFindById(id: string) {
    return this.prisma.order.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        items: { include: { product: { include: { images: { take: 1 } } } } },
        statusHistory: { orderBy: { createdAt: 'asc' } },
        coupon: true,
      },
    });
  }

  async updateStatus(
    id: string,
    status: OrderStatus,
    note?: string,
    adminId?: string,
  ) {
    const oldOrder = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!oldOrder) throw new NotFoundException('Order not found');

    const updateData: any = {
      status,
      statusHistory: {
        create: { status, note, changedBy: adminId },
      },
    };

    if (status === 'DELIVERED') {
      updateData.paymentStatus = 'PAID';
    }

    const order = await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.update({
        where: { id },
        data: updateData,
        include: {
          user: { select: { email: true, name: true } },
          items: true,
        },
      });

      // Handle stock re-adjustments upon cancellation/returns
      const isNowCancelled = status === 'CANCELLED' || status === 'RETURNED';
      const wasAlreadyCancelled =
        oldOrder.status === 'CANCELLED' || oldOrder.status === 'RETURNED';

      if (isNowCancelled && !wasAlreadyCancelled) {
        for (const item of oldOrder.items) {
          if (item.variantId) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: { stock: { increment: item.quantity } },
            });
          }
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      } else if (!isNowCancelled && wasAlreadyCancelled) {
        // Transitioning BACK from a cancelled state
        for (const item of oldOrder.items) {
          if (item.variantId) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: { stock: { decrement: item.quantity } },
            });
          }
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });
        }
      }

      return order;
    });

    // Refund wallet balance if order was paid with WALLET and is cancelled or returned
    const isNowCancelled = status === 'CANCELLED' || status === 'RETURNED';
    const wasAlreadyCancelled =
      oldOrder.status === 'CANCELLED' || oldOrder.status === 'RETURNED';

    if (
      isNowCancelled &&
      !wasAlreadyCancelled &&
      oldOrder.paymentMethod === PaymentMethod.WALLET &&
      oldOrder.paymentStatus === PaymentStatus.PAID &&
      oldOrder.userId
    ) {
      try {
        await this.walletService.refundFunds(
          oldOrder.userId,
          Number(oldOrder.total),
          oldOrder.orderNumber,
          `PGX Store Order Refund #${oldOrder.orderNumber} (${status})`,
        );
        await this.prisma.order.update({
          where: { id },
          data: { paymentStatus: PaymentStatus.REFUNDED },
        });
      } catch (refundErr) {
        console.error(`Failed to refund wallet for cancelled order ${oldOrder.orderNumber}:`, refundErr);
      }
    }

    // Send status update email
    const email = order.guestEmail || order.user?.email;
    if (email) {
      try {
        await this.mailService.sendOrderStatusUpdate(email, order as any);
      } catch (error) {
        console.error('Failed to send order status update email:', error);
      }
    }

    return order;
  }

  async adminGetInvoice(orderId: string) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: {
          user: { select: { id: true, name: true, email: true, phone: true } },
          items: true,
          invoice: true,
          coupon: true,
        },
      });

      if (!order) throw new NotFoundException('Order not found');

      if (!order.invoice) {
        const invoiceNumber = this.generateInvoiceNumber(order.orderNumber);

        const invoice = await tx.invoice.create({
          data: {
            orderId: order.id,
            invoiceNumber,
          },
        });

        return { ...order, invoice };
      }

      return order;
    });
  }

  private generateInvoiceNumber(orderNumber: string): string {
    const date = new Date();
    const hash =
      orderNumber.split('-').length > 1
        ? orderNumber.split('-').pop()
        : Math.floor(Math.random() * 1000)
            .toString()
            .padStart(4, '0');
    return `INV-${date.getFullYear()}${String(date.getMonth() + 1).padStart(
      2,
      '0',
    )}${String(date.getDate()).padStart(2, '0')}-${hash}`;
  }

  private async generateOrderNumber(): Promise<string> {
    const date = new Date();
    const prefix = `ORD-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;

    const lastOrder = await this.prisma.order.findFirst({
      where: { orderNumber: { startsWith: prefix } },
      orderBy: { orderNumber: 'desc' },
    });

    let seq = 1;
    if (lastOrder) {
      const lastSeq = parseInt(
        lastOrder.orderNumber.split('-').pop() || '0',
        10,
      );
      seq = lastSeq + 1;
    }

    return `${prefix}-${String(seq).padStart(4, '0')}`;
  }
}
