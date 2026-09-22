import { IsBoolean } from 'class-validator';

export class ToggleShippingZoneDto {
  @IsBoolean()
  isActive!: boolean;
}
