import { IsOptional, IsString } from 'class-validator';

export class CreateSettingDto {
  @IsString()
  key!: string;

  @IsString()
  value!: string;

  @IsOptional()
  @IsString()
  group?: string;
}
