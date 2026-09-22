import { IsString, Length } from 'class-validator';

export class VerifyEmailChangeDto {
  @IsString()
  @Length(6, 6)
  otp!: string;
}
