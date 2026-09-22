import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';

@Injectable()
export class ContactService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async submit(data: CreateContactMessageDto) {
    const storeEmailSetting = await this.prisma.storeSetting.findUnique({
      where: { key: 'store_email' },
      select: { value: true },
    });

    const toEmail = storeEmailSetting?.value || undefined;

    await this.mailService.sendContactFormNotification({
      toEmail,
      name: data.name,
      email: data.email,
      phone: data.phone,
      subject: data.subject,
      message: data.message,
    });

    return {
      message: 'Contact message sent successfully',
    };
  }
}
