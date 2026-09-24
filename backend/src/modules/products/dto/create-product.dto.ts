import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

// Helper to convert empty strings or null to undefined
const emptyStringToUndefined = ({ value }: { value: any }) => {
  if (value === '' || value === null || value === undefined) {
    return undefined;
  }
  return value;
};

// Helper to convert empty string to undefined, otherwise number
const emptyStringToNumber = ({ value }: { value: any }) => {
  if (value === '' || value === null || value === undefined) {
    return undefined;
  }
  const parsed = Number(value);
  return isNaN(parsed) ? undefined : parsed;
};

export class ProductImageDto {
  @IsString()
  url!: string;

  @IsOptional()
  @Transform(emptyStringToUndefined)
  @IsString()
  alt?: string;

  @IsOptional()
  @Transform(emptyStringToNumber)
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class ProductVariantDto {
  @IsString()
  name!: string;

  @Transform(emptyStringToNumber)
  @IsNumber()
  @Min(0)
  price!: number;

  @IsOptional()
  @Transform(emptyStringToNumber)
  @IsNumber()
  @Min(0)
  comparePrice?: number;

  @IsOptional()
  @Transform(emptyStringToNumber)
  @IsInt()
  @Min(0)
  stock?: number;

  @IsOptional()
  @Transform(emptyStringToUndefined)
  @IsString()
  sku?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CreateProductDto {
  @IsString()
  name!: string;

  @IsOptional()
  @Transform(emptyStringToUndefined)
  @IsString()
  namebn?: string;

  @IsString()
  slug!: string;

  @IsOptional()
  @Transform(emptyStringToUndefined)
  @IsString()
  description?: string;

  @IsOptional()
  @Transform(emptyStringToUndefined)
  @IsString()
  shortDesc?: string;

  @IsOptional()
  @Transform(emptyStringToUndefined)
  @IsString()
  sku?: string;

  @Transform(emptyStringToNumber)
  @IsNumber()
  @Min(0)
  price!: number;

  @IsOptional()
  @Transform(emptyStringToNumber)
  @IsNumber()
  @Min(0)
  comparePrice?: number;

  @IsOptional()
  @Transform(emptyStringToNumber)
  @IsNumber()
  @Min(0)
  costPrice?: number;

  @IsOptional()
  @Transform(emptyStringToNumber)
  @IsInt()
  @Min(0)
  stock?: number;

  @IsOptional()
  @Transform(emptyStringToNumber)
  @IsInt()
  @Min(0)
  lowStockAlert?: number;

  @IsOptional()
  @Transform(emptyStringToUndefined)
  @IsString()
  weight?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsBoolean()
  isHot?: boolean;

  @IsOptional()
  @Transform(emptyStringToUndefined)
  @IsString()
  metaTitle?: string;

  @IsOptional()
  @Transform(emptyStringToUndefined)
  @IsString()
  metaDesc?: string;

  @IsString()
  categoryId!: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductImageDto)
  images?: ProductImageDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductVariantDto)
  variants?: ProductVariantDto[];
}
