import { IsString } from 'class-validator';

export class SendCustomerMailDto {
  @IsString()
  subject!: string;

  @IsString()
  message!: string;
}
