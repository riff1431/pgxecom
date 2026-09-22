import { IsDateString, IsIn, IsOptional } from 'class-validator';

const RANGE_VALUES = ['7d', '30d', '90d', '180d', '365d'] as const;

export type AnalyticsRangeValue = (typeof RANGE_VALUES)[number];

export class AnalyticsQueryDto {
  @IsOptional()
  @IsIn(RANGE_VALUES)
  range?: AnalyticsRangeValue;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}
