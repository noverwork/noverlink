import { Controller, Get, Logger, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';

import { CurrentUser, Public } from '../auth/decorators';
import { BillingService } from './billing.service';
import { PolarWebhookGuard } from './guards';

// Polar webhook payload type (simplified for our use case)
interface PolarWebhookPayload {
  type: string;
  data: {
    id?: string;
    status?: string;
    customerId?: string | null;
    customerEmail?: string | null;
    productId?: string;
    subscriptionId?: string | null;
    currentPeriodEnd?: Date | null;
  };
}

interface PolarRequest extends Request {
  polarPayload: PolarWebhookPayload;
}

@Controller('billing')
export class BillingController {
  private readonly logger = new Logger(BillingController.name);

  constructor(private readonly billingService: BillingService) {}

  // Unified Polar webhook endpoint - signature verified by guard
  @Public()
  @UseGuards(PolarWebhookGuard)
  @Post('webhook/polar')
  async handlePolarWebhook(@Req() req: PolarRequest): Promise<{ ok: boolean }> {
    const payload = req.polarPayload;

    this.logger.log(`Received Polar webhook: ${payload.type}`);

    switch (payload.type) {
      case 'checkout.updated':
        if (payload.data.status === 'succeeded' && payload.data.productId && payload.data.customerEmail) {
          await this.billingService.syncCheckout({
            customerId: payload.data.customerId ?? undefined,
            customerEmail: payload.data.customerEmail,
            productId: payload.data.productId,
            subscriptionId: payload.data.subscriptionId ?? undefined,
          });
        }
        break;

      case 'subscription.active':
        if (payload.data.id && payload.data.productId && payload.data.status) {
          await this.billingService.handleSubscriptionActive({
            subscriptionId: payload.data.id,
            customerId: payload.data.customerId ?? '',
            productId: payload.data.productId,
            status: payload.data.status,
            currentPeriodEnd: payload.data.currentPeriodEnd?.toISOString(),
          });
        }
        break;

      case 'subscription.canceled':
      case 'subscription.revoked':
        if (payload.data.id) {
          await this.billingService.handleSubscriptionCanceled({
            subscriptionId: payload.data.id,
          });
        }
        break;

      default:
        this.logger.debug(`Unhandled webhook type: ${payload.type}`);
    }

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
