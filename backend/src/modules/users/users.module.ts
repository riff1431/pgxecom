import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController, AdminCustomersController } from './users.controller';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [MailModule],
  controllers: [UsersController, AdminCustomersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
