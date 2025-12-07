import { ref } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable, Logger } from '@nestjs/common';
import {
  DEFAULT_PLAN_ID,
  Plan,
  Subscription,
  SubscriptionStatus,
  User,
} from '@noverlink/backend-shared';

import type {
  SubscriptionActiveDto,
  SubscriptionCanceledDto,
  SyncCheckoutDto,
} from './dto';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(private readonly em: EntityManager) {}

  async syncCheckout(dto: SyncCheckoutDto): Promise<void> {
    this.logger.log(`Syncing checkout for ${dto.customerEmail}`);

    const user = await this.em.findOne(User, { email: dto.customerEmail });

    if (!user) {
      this.logger.warn(`User not found for email: ${dto.customerEmail}`);
      return;
    }

    // Update user plan based on productId
    const newPlanId = this.getPlanIdFromProductId(dto.productId);
    user.plan = ref(this.em.getReference(Plan, newPlanId));

    // Create subscription record if subscriptionId provided
    if (dto.subscriptionId) {
      let subscription = await this.em.findOne(Subscription, {
        polarSubscriptionId: dto.subscriptionId,
      });

      if (!subscription) {
        subscription = this.em.create(Subscription, {
          polarSubscriptionId: dto.subscriptionId,
          polarCustomerId: dto.customerId || '',
          polarProductId: dto.productId,
          status: SubscriptionStatus.ACTIVE,
          user,
        });
        this.em.persist(subscription);
      }
    }

    await this.em.flush();
    this.logger.log(`Updated user ${user.id} to plan: ${newPlanId}`);
  }

  async handleSubscriptionActive(dto: SubscriptionActiveDto): Promise<void> {
    this.logger.log(`Subscription active: ${dto.subscriptionId}`);

    const subscription = await this.em.findOne(
      Subscription,
      { polarSubscriptionId: dto.subscriptionId },
      { populate: ['user'] }
    );

    if (subscription) {
      subscription.status = SubscriptionStatus.ACTIVE;
      if (dto.currentPeriodEnd) {
        subscription.currentPeriodEnd = new Date(dto.currentPeriodEnd);
      }

      // Update user plan
      const newPlanId = this.getPlanIdFromProductId(dto.productId);
      subscription.user.$.plan = ref(this.em.getReference(Plan, newPlanId));

      await this.em.flush();
    }
  }

  async handleSubscriptionCanceled(
    dto: SubscriptionCanceledDto
  ): Promise<void> {
    this.logger.log(`Subscription canceled: ${dto.subscriptionId}`);

    const subscription = await this.em.findOne(
      Subscription,
      { polarSubscriptionId: dto.subscriptionId },
      { populate: ['user'] }
    );

    if (subscription) {
      subscription.status = SubscriptionStatus.CANCELED;

      // Downgrade user to sandbox plan
      subscription.user.$.plan = ref(
        this.em.getReference(Plan, DEFAULT_PLAN_ID)
      );

      await this.em.flush();
      this.logger.log(
        `Downgraded user ${subscription.user.id} to ${DEFAULT_PLAN_ID} plan`
      );
    }
  }

  async getUserSubscription(userId: string): Promise<Subscription | null> {
    return this.em.findOne(
      Subscription,
      { user: { id: userId }, status: SubscriptionStatus.ACTIVE },
      { orderBy: { createdAt: 'DESC' } }
    );
  }

  /**
   * Map Polar product IDs to plan IDs
   * Returns the plan ID string (e.g., 'sandbox', 'starter', 'pro')
   */
  private getPlanIdFromProductId(productId: string): string {
    // Map Polar product IDs to plans
    // You'll need to update these with your actual product IDs
    if (productId.includes('starter') || productId.includes('hobby')) {
      return 'starter';
    }
    if (productId.includes('pro')) {
      return 'pro';
    }
    if (productId.includes('enterprise')) {
      return 'enterprise';
    }
    return DEFAULT_PLAN_ID;
  }
}
