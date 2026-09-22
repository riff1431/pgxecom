import { IsBoolean } from 'class-validator';

export class SetCouponStatusDto {
  @IsBoolean()
  isActive!: boolean;
}
