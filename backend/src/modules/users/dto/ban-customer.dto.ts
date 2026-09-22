import { IsOptional, IsString } from 'class-validator';

export class BanCustomerDto {
  @IsOptional()
  @IsString()
  reason?: string;
}
