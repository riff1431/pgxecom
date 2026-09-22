import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { BanCustomerDto } from './dto/ban-customer.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateAddressDto } from './dto/create-address.dto';
import { RequestEmailChangeDto } from './dto/request-email-change.dto';
import { SendCustomerMailDto } from './dto/send-customer-mail.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { VerifyEmailChangeDto } from './dto/verify-email-change.dto';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Put('profile')
  updateProfile(@Req() req: any, @Body() data: UpdateProfileDto) {
    return this.usersService.updateProfile(req.user.id, data);
  }

  @Post('email-change/request')
  requestEmailChange(@Req() req: any, @Body() data: RequestEmailChangeDto) {
    return this.usersService.requestEmailChange(req.user.id, data.email);
  }

  @Post('email-change/verify')
  verifyEmailChange(@Req() req: any, @Body() data: VerifyEmailChangeDto) {
    return this.usersService.verifyEmailChange(req.user.id, data.otp);
  }

  @Get('addresses')
  getAddresses(@Req() req: any) {
    return this.usersService.getAddresses(req.user.id);
  }

  @Post('addresses')
  createAddress(@Req() req: any, @Body() data: CreateAddressDto) {
    return this.usersService.createAddress(req.user.id, data);
  }

  @Put('addresses/:id')
  updateAddress(
    @Req() req: any,
    @Param('id') id: string,
    @Body() data: UpdateAddressDto,
  ) {
    return this.usersService.updateAddress(req.user.id, id, data);
  }

  @Delete('addresses/:id')
  deleteAddress(@Param('id') id: string) {
    return this.usersService.deleteAddress(id);
  }

  @Post('password/change')
  changePassword(@Req() req: any, @Body() data: ChangePasswordDto) {
    return this.usersService.changePassword(req.user.id, data);
  }
}

@Controller('admin/customers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminCustomersController {
  constructor(private usersService: UsersService) {}

  @Get()
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    return this.usersService.adminFindAll({ page, limit, search, status });
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.usersService.adminFindById(id);
  }

  @Get(':id/orders')
  findOrders(
    @Param('id') id: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.usersService.adminFindCustomerOrders(id, {
      page,
      limit,
      status,
      search,
    });
  }

  @Put(':id/ban')
  banCustomer(@Param('id') id: string, @Body() data: BanCustomerDto) {
    return this.usersService.adminBanCustomer(id, data?.reason);
  }

  @Put(':id/unban')
  unbanCustomer(@Param('id') id: string) {
    return this.usersService.adminUnbanCustomer(id);
  }

  @Post(':id/mail')
  sendMail(@Param('id') id: string, @Body() data: SendCustomerMailDto) {
    return this.usersService.adminSendMailToCustomer(id, data);
  }
}
