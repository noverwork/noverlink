import { Body, Controller, Get, Post } from '@nestjs/common';

import { CurrentUser, Public } from '../auth/decorators';
import { BillingService } from './billing.service';
import {
  SubscriptionActiveDto,
  SubscriptionCanceledDto,
  SyncCheckoutDto,
} from './dto';

@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  // Webhook endpoints - called by frontend webhook handler
  @Public()
  @Post('webhook/checkout')
  async webhookCheckout(@Body() dto: SyncCheckoutDto): Promise<{ ok: boolean }> {
    await this.billingService.syncCheckout(dto);
    return { ok: true };
  }

  @Public()
  @Post('webhook/subscription-active')
  async webhookSubscriptionActive(
    @Body() dto: SubscriptionActiveDto
  ): Promise<{ ok: boolean }> {
    await this.billingService.handleSubscriptionActive(dto);
    return { ok: true };
  }

  @Public()
  @Post('webhook/subscription-canceled')
  async webhookSubscriptionCanceled(
    @Body() dto: SubscriptionCanceledDto
  ): Promise<{ ok: boolean }> {
    await this.billingService.handleSubscriptionCanceled(dto);
    return { ok: true };
  }

  // User-facing endpoints
  @Get('subscription')
  async getSubscription(
    @CurrentUser('id') userId: string
  ): Promise<{ subscription: unknown }> {
    const subscription = await this.billingService.getUserSubscription(userId);
    return { subscription };
  }
}
