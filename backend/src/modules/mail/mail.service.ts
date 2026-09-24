import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DynamicSettingsService } from '../settings/dynamic-settings.service';
import { SettingsService } from '../settings/settings.service';

interface ContactFormNotificationPayload {
  toEmail?: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(
    private configService: ConfigService,
    private settingsService: SettingsService,
    private dynamicSettingsService: DynamicSettingsService,
  ) {}

  private async deliverMail(options: {
    to: string;
    subject: string;
    html: string;
    replyTo?: string;
  }) {
    try {
      const { transporter, from, isEnabled } =
        await this.dynamicSettingsService.createMailTransporter();

      if (!isEnabled) {
        this.logger.warn(`SMTP is disabled in settings. Skipping email to ${options.to}`);
        return;
      }

      await transporter.sendMail({
        from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        ...(options.replyTo ? { replyTo: options.replyTo } : {}),
      });
      this.logger.log(`Email successfully delivered to ${options.to} [${options.subject}]`);
    } catch (err: any) {
      this.logger.error(`Failed to send email to ${options.to}: ${err.message}`);
    }
  }

  async sendOrderConfirmation(email: string, order: any) {
    const settings = await this.settingsService.findPublic();
    const html = this.getInvoiceHtml(order, settings, {
      title: 'Order Confirmation',
      message: 'Thank you for your order! We have received your request and are currently processing it.',
    });

    await this.deliverMail({
      to: email,
      subject: `Order Confirmed - ${order.orderNumber}`,
      html,
    });
  }

  async sendOrderStatusUpdate(email: string, order: any) {
    const statusMessages: Record<string, string> = {
      CONFIRMED: 'Your order has been confirmed and is being prepared.',
      PROCESSING: 'Your order is being processed.',
      SHIPPED: 'Your order has been shipped! It is on its way to you.',
      DELIVERED: 'Your order has been delivered. Enjoy!',
      CANCELLED: 'Your order has been cancelled.',
      RETURNED: 'Your order has been returned.',
    };

    const settings = await this.settingsService.findPublic();
    const html = this.getInvoiceHtml(order, settings, {
      title: 'Order Status Update',
      message: statusMessages[order.status] || `Your order status has been updated to ${order.status}.`,
    });

    await this.deliverMail({
      to: email,
      subject: `Order Update - ${order.orderNumber} - ${order.status}`,
      html,
    });
  }

  private getInvoiceHtml(order: any, settings: any, context: { title: string; message: string }) {
    const getSetting = (key: string, fallback: string) =>
      settings?.find((s: any) => s.key === key)?.value || fallback;

    const storeName = getSetting('store_name', 'FreshMart');
    const storeLogo = settings?.find((s: any) => s.key === 'store_logo')?.value;
    const storeEmail = getSetting('store_email', 'info@freshmart.com');
    const storePhone = getSetting('store_phone', '+880 1234-567890');
    const storeAddress = getSetting('store_address', 'Dhaka, Bangladesh');

    const logoUrl = this.resolveImageUrl(storeLogo);
    const invoiceNumber = order.invoice?.invoiceNumber || order.orderNumber;
    const formattedDate = new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(order.createdAt));

    const customerName = order.guestName || order.user?.name || 'Customer';
    const addr =
      typeof order.shippingAddress === 'string'
        ? JSON.parse(order.shippingAddress)
        : order.shippingAddress;
    const customerAddress = addr?.street
      ? `${addr.street}, ${addr.area}, ${addr.city}`
      : 'Address not provided';
    const customerPhone = order.guestPhone || order.user?.phone || '-';

    const itemsHtml = order.items
      .map(
        (item: any, idx: number) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; border-left: 1px solid #e5e7eb; border-right: 1px solid #e5e7eb; text-align: center; color: #4b5563;">${idx + 1
          }</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; border-right: 1px solid #e5e7eb;">
          <div style="font-weight: bold; color: #111827;">${item.productName}</div>
          ${item.variantName
            ? `<div style="font-size: 12px; color: #6b7280; margin-top: 2px;">${item.variantName}</div>`
            : ''
          }
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; border-right: 1px solid #e5e7eb; text-align: center; color: #4b5563;">${item.quantity
          }</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; border-right: 1px solid #e5e7eb; text-align: right; color: #4b5563;">৳${Number(
            item.unitPrice,
          ).toFixed(2)}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; border-right: 1px solid #e5e7eb; text-align: right; color: #111827; font-weight: bold;">৳${Number(
            item.totalPrice,
          ).toFixed(2)}</td>
      </tr>
    `,
      )
      .join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          @media screen and (max-width: 600px) {
            .container { padding: 10px !important; }
            .content { padding: 15px !important; }
            .stack { display: block !important; width: 100% !important; box-sizing: border-box !important; }
            .stack-padding { padding-bottom: 20px !important; }
            .mobile-center { text-align: center !important; }
            .mobile-hide { display: none !important; }
            .invoice-title { font-size: 24px !important; text-align: center !important; padding: 15px !important; }
            .grid-item { width: 100% !important; padding-right: 0 !important; margin-bottom: 15px !important; }
            .summary-table { width: 100% !important; margin-top: 20px !important; }
          }
        </style>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f9fafb;">
        <div class="container" style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #111827; background-color: #f9fafb; padding: 40px 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            
            <!-- Hero Header -->
            <div style="padding: 40px 40px 20px 40px; text-align: center; background: #ffffff;">
             <div style="width: 56px; height: 56px; background-color: #fb923c; border-radius: 12px; color: #ffffff; display: inline-block; line-height: 56px; font-size: 24px; font-weight: bold; margin-bottom: 16px;">${storeName.charAt(0)}</div>
              <h1 style="margin: 0; font-size: 32px; font-weight: 800; color: #111827; letter-spacing: -0.025em;">${context.title}</h1>
              <p style="margin: 12px 0 0 0; color: #4b5563; font-size: 16px; line-height: 1.5;">${context.message}</p>
            </div>

            <div class="content" style="padding: 0 40px 40px 40px;">
              
              <!-- Customer information Grid -->
              <div style="margin-top: 40px;">
                <h2 style="font-size: 20px; font-weight: 700; color: #111827; margin-bottom: 24px;">Customer information</h2>
                
                <table style="width: 100%; border-collapse: collapse;">
                  <!-- Row 1 -->
                  <tr>
                    <td class="stack grid-item" style="width: 50%; vertical-align: top; padding-right: 20px; padding-bottom: 24px;">
                      <div style="color: #9ca3af; font-size: 12px; font-weight: 600; text-transform: uppercase; margin-bottom: 8px;">Shipping address</div>
                      <div style="color: #111827; font-size: 14px; line-height: 1.5;">${customerAddress}</div>
                    </td>
                    <td class="stack grid-item" style="width: 50%; vertical-align: top; padding-bottom: 24px;">
                      <div style="color: #9ca3af; font-size: 12px; font-weight: 600; text-transform: uppercase; margin-bottom: 8px;">Billing address</div>
                      <div style="color: #111827; font-size: 14px; line-height: 1.5;">${customerAddress}</div>
                    </td>
                  </tr>
                  <!-- Row 2 -->
                  <tr>
                    <td class="stack grid-item" style="width: 50%; vertical-align: top; padding-right: 20px; padding-bottom: 24px;">
                      <div style="color: #9ca3af; font-size: 12px; font-weight: 600; text-transform: uppercase; margin-bottom: 8px;">Shipping method</div>
                      <div style="color: #111827; font-size: 14px; line-height: 1.5;">Standard Shipping (৳${Number(order.shippingCost).toFixed(2)})</div>
                    </td>
                    <td class="stack grid-item" style="width: 50%; vertical-align: top; padding-bottom: 24px;">
                      <div style="color: #9ca3af; font-size: 12px; font-weight: 600; text-transform: uppercase; margin-bottom: 8px;">Payment method</div>
                      <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="color: #111827; font-size: 14px; font-weight: 500;">${order.paymentMethod.replace(/_/g, ' ')}</span>
                      </div>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Order Details Table -->
              <div style="margin-top: 32px; border-top: 1px solid #f3f4f6; padding-top: 32px;">
                <h3 style="font-size: 16px; font-weight: 700; color: #111827; margin-bottom: 16px;">Order Summary</h3>
                <div style="overflow-x: auto;">
                  <table style="width: 100%; border-collapse: collapse; min-width: 450px;">
                    <thead>
                      <tr style="border-bottom: 1px solid #f3f4f6;">
                        <th style="padding: 12px 0; text-align: left; font-size: 12px; font-weight: 600; color: #9ca3af; text-transform: uppercase;">Item</th>
                        <th style="padding: 12px 0; text-align: center; font-size: 12px; font-weight: 600; color: #9ca3af; text-transform: uppercase; width: 60px;">Qty</th>
                        <th style="padding: 12px 0; text-align: right; font-size: 12px; font-weight: 600; color: #9ca3af; text-transform: uppercase; width: 100px;">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${order.items.map(item => `
                        <tr style="border-bottom: 1px solid #f3f4f6;">
                          <td style="padding: 16px 0;">
                            <div style="font-weight: 600; color: #111827; font-size: 14px;">${item.productName}</div>
                            ${item.variantName ? `<div style="color: #6b7280; font-size: 12px; margin-top: 2px;">${item.variantName}</div>` : ''}
                          </td>
                          <td style="padding: 16px 0; text-align: center; color: #4b5563; font-size: 14px;">${item.quantity}</td>
                          <td style="padding: 16px 0; text-align: right; font-weight: 600; color: #111827; font-size: 14px;">৳${Number(item.totalPrice).toFixed(2)}</td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Totals Section -->
              <div style="margin-top: 24px;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="width: 60%;"></td>
                    <td style="width: 40%;">
                      <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Subtotal</td>
                          <td style="padding: 8px 0; text-align: right; color: #111827; font-size: 14px; font-weight: 500;">৳${Number(order.subtotal).toFixed(2)}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Shipping</td>
                          <td style="padding: 8px 0; text-align: right; color: #111827; font-size: 14px; font-weight: 500;">৳${Number(order.shippingCost).toFixed(2)}</td>
                        </tr>
                        ${Number(order.discount) > 0 ? `
                        <tr>
                          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Discount</td>
                          <td style="padding: 8px 0; text-align: right; color: #dc2626; font-size: 14px; font-weight: 500;">-৳${Number(order.discount).toFixed(2)}</td>
                        </tr>
                        ` : ''}
                        <tr style="border-top: 2px solid #f3f4f6;">
                          <td style="padding: 16px 0; color: #111827; font-size: 16px; font-weight: 700;">Total</td>
                          <td style="padding: 16px 0; text-align: right; color: #fb923c; font-size: 20px; font-weight: 800;">৳${Number(order.total).toFixed(2)}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Support Section Mockup to match Design image -->
              <div style="margin-top: 48px; padding-top: 32px; border-top: 1px solid #f3f4f6; text-align: center;">
                <h3 style="font-size: 20px; font-weight: 700; color: #111827; margin-bottom: 24px;">Need help with your order?</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td class="stack" style="width: 33.33%; padding: 0 10px;">
                      <div style="background-color: #f8fafc; padding: 16px; border-radius: 12px;">
                        <div style="font-size: 12px; font-weight: 700; color: #111827; margin-bottom: 4px;">Chat With Us</div>
                        <div style="font-size: 11px; color: #6b7280;">Quick response</div>
                      </div>
                    </td>
                    <td class="stack" style="width: 33.33%; padding: 0 10px;">
                      <div style="background-color: #f8fafc; padding: 16px; border-radius: 12px;">
                        <div style="font-size: 12px; font-weight: 700; color: #111827; margin-bottom: 4px;">Email Support</div>
                        <div style="font-size: 11px; color: #6b7280;">${storeEmail}</div>
                      </div>
                    </td>
                    <td class="stack" style="width: 33.33%; padding: 0 10px;">
                      <div style="background-color: #f8fafc; padding: 16px; border-radius: 12px;">
                        <div style="font-size: 12px; font-weight: 700; color: #111827; margin-bottom: 4px;">Call Us</div>
                        <div style="font-size: 11px; color: #6b7280;">${storePhone}</div>
                      </div>
                    </td>
                  </tr>
                </table>
              </div>

            </div>

            <!-- Footer -->
            <div style="background-color: #111827; padding: 32px; text-align: center;">
              <p style="margin: 0; color: #9ca3af; font-size: 13px;">Follow us for more updates</p>
              <div style="margin-top: 16px;">
                <span style="color: #ffffff; margin: 0 8px; font-size: 12px;">Instagram</span>
                <span style="color: #ffffff; margin: 0 8px; font-size: 12px;">Facebook</span>
              </div>
              <p style="margin-top: 24px; color: #4b5563; font-size: 11px;">
                © ${new Date().getFullYear()} ${storeName}. All rights reserved.<br>
                ${storeAddress}
              </p>
            </div>

          </div>
        </div>
      </body>
      </html>
    `;
  }

  async sendPasswordReset(email: string, name: string, resetUrl: string) {
    await this.deliverMail({
      to: email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset</h2>
          <p>Hi ${name},</p>
          <p>You requested a password reset. Click the button below to reset your password:</p>
          <a href="${resetUrl}" style="display: inline-block; background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 16px 0;">Reset Password</a>
          <p>This link expires in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `,
    });
  }

  async sendEmailVerificationCode(email: string, code: string) {
    await this.deliverMail({
      to: email,
      subject: 'Email Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Verify Your New Email</h2>
          <p>You requested to change your email address. Use the verification code below to confirm this change:</p>
          <div style="background: #f4f4f5; padding: 24px; border-radius: 12px; font-size: 32px; font-weight: bold; text-align: center; letter-spacing: 8px; color: #16a34a; margin: 20px 0;">
            ${code}
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this change, please contact support immediately.</p>
        </div>
      `,
    });
  }

  async sendAdminCustomerMessage(
    email: string,
    name: string,
    subject: string,
    message: string,
  ) {
    await this.deliverMail({
      to: email,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #16a34a;">Message From FreshMart Support</h2>
          <p>Hi ${name},</p>
          <div style="background: #f4f4f5; padding: 16px; border-radius: 8px; white-space: pre-wrap;">
            ${message}
          </div>
          <p style="margin-top: 16px; color: #52525b; font-size: 14px;">
            If you have any questions, please reply to this email.
          </p>
        </div>
      `,
    });
  }

  async sendContactFormNotification(payload: ContactFormNotificationPayload) {
    const smtpConfig = await this.dynamicSettingsService.getSmtpConfig();
    const fallbackEmail =
      smtpConfig.fromEmail ||
      this.configService.get<string>('MAIL_FROM') ||
      this.configService.get<string>('SMTP_USER');

    const recipient = payload.toEmail || fallbackEmail;

    if (!recipient) {
      return;
    }

    await this.deliverMail({
      to: recipient,
      replyTo: payload.email,
      subject: `[Contact] ${payload.subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto;">
          <h2 style="color: #16a34a;">New Contact Message</h2>
          <p><strong>Name:</strong> ${payload.name}</p>
          <p><strong>Email:</strong> ${payload.email}</p>
          <p><strong>Phone:</strong> ${payload.phone || '-'}</p>
          <p><strong>Subject:</strong> ${payload.subject}</p>
          <div style="background: #f4f4f5; padding: 16px; border-radius: 8px; white-space: pre-wrap;">
            ${payload.message}
          </div>
        </div>
      `,
    });
  }

  private resolveImageUrl(url?: string | null): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;

    const base =
      this.configService.get('BACKEND_URL') ||
      'http://localhost:4000';
    if (!base) return url;

    const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base;
    const normalizedPath = url.startsWith('/') ? url : `/${url}`;
    return `${normalizedBase}${normalizedPath}`;
  }
}
