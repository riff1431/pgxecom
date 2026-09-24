import {
  IsBoolean,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class UpdateSmtpSettingsDto {
  @IsString()
  @IsNotEmpty()
  host: string;

  @IsInt()
  @Min(1)
  @Max(65535)
  port: number;

  @IsBoolean()
  secure: boolean;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsString()
  @IsNotEmpty()
  fromName: string;

  @IsEmail()
  @IsNotEmpty()
  fromEmail: string;

  @IsBoolean()
  isEnabled: boolean;
}

export class TestSmtpDto {
  @IsEmail()
  @IsNotEmpty()
  recipientEmail: string;
}
