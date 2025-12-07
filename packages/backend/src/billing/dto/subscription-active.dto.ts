import { IsDateString, IsOptional, IsString } from 'class-validator';

export class SubscriptionActiveDto {
  @IsString()
  subscriptionId!: string;

  @IsString()
  customerId!: string;

  @IsString()
  productId!: string;

  @IsString()
  status!: string;

  @IsDateString()
  @IsOptional()
  currentPeriodEnd?: string;
}
