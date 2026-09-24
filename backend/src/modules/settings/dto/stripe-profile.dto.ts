import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { StripeMode } from '@prisma/client';

export class CreateStripeProfileDto {
  @IsString()
  @IsNotEmpty()
  label: string;

  @IsEnum(StripeMode)
  mode: StripeMode;

  @IsString()
  @IsNotEmpty()
  @Matches(/^pk_(test|live)_[0-9a-zA-Z]+$/, {
    message: 'Publishable key must start with pk_test_ or pk_live_',
  })
  publishableKey: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^(sk|rk)_(test|live)_[0-9a-zA-Z]+$/, {
    message: 'Secret key must start with sk_test_, sk_live_, rk_test_, or rk_live_',
  })
  secretKey: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^whsec_[0-9a-zA-Z]+$/, {
    message: 'Webhook secret must start with whsec_',
  })
  webhookSecret: string;

  @IsString()
  @IsNotEmpty()
  currency: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateStripeProfileDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  label?: string;

  @IsOptional()
  @IsEnum(StripeMode)
  mode?: StripeMode;

  @IsOptional()
  @IsString()
  @Matches(/^pk_(test|live)_[0-9a-zA-Z]+$/, {
    message: 'Publishable key must start with pk_test_ or pk_live_',
  })
  publishableKey?: string;

  @IsOptional()
  @IsString()
  secretKey?: string;

  @IsOptional()
  @IsString()
  webhookSecret?: string;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class VerifyStripeProfileDto {
  @IsOptional()
  @IsString()
  profileId?: string;

  @IsOptional()
  @IsString()
  secretKey?: string;
}
