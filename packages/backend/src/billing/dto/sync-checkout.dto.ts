import { IsEmail, IsOptional, IsString } from 'class-validator';

export class SyncCheckoutDto {
  @IsString()
  @IsOptional()
  customerId?: string;

  @IsEmail()
  customerEmail!: string;

  @IsString()
  productId!: string;

  @IsString()
  @IsOptional()
  subscriptionId?: string;
}
