import { Body, Controller, Post } from '@nestjs/common';

import { ContactService } from './contact.service';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';

@Controller('contact')
export class ContactController {
  constructor(private contactService: ContactService) {}

  @Post()
  submit(@Body() data: CreateContactMessageDto) {
    return this.contactService.submit(data);
  }
}
