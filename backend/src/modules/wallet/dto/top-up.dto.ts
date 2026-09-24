import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class TopUpDto {
  @ApiProperty({
    description: 'Amount in EUR to top up (minimum 1)',
    example: 1,
  })
  @IsNumber()
  @Min(1, { message: 'Minimum top-up amount is 1 EUR' })
  amount: number;

  @ApiProperty({
    description: 'Optional custom redirect return URL upon successful checkout',
    required: false,
    example: 'http://localhost:3000/my-account/wallet',
  })
  @IsOptional()
  @IsString()
  returnUrl?: string;
}
