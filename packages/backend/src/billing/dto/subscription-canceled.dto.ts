import { IsString } from 'class-validator';

export class SubscriptionCanceledDto {
  @IsString()
  subscriptionId!: string;
}
