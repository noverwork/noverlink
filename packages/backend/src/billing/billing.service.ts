import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable, Logger } from '@nestjs/common';
import {
  Subscription,
  SubscriptionStatus,
  User,
  UserPlan,
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
    const newPlan = this.getPlanFromProductId(dto.productId);
    user.plan = newPlan;
    user.maxTunnels = this.getTunnelLimit(newPlan);

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
    this.logger.log(`Updated user ${user.id} to plan: ${newPlan}`);
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
      const newPlan = this.getPlanFromProductId(dto.productId);
      subscription.user.$.plan = newPlan;
      subscription.user.$.maxTunnels = this.getTunnelLimit(newPlan);

      await this.em.flush();
    }
  }

  async handleSubscriptionCanceled(dto: SubscriptionCanceledDto): Promise<void> {
    this.logger.log(`Subscription canceled: ${dto.subscriptionId}`);

    const subscription = await this.em.findOne(
      Subscription,
      { polarSubscriptionId: dto.subscriptionId },
      { populate: ['user'] }
    );

    if (subscription) {
      subscription.status = SubscriptionStatus.CANCELED;

      // Downgrade user to free plan
      subscription.user.$.plan = UserPlan.FREE;
      subscription.user.$.maxTunnels = 1;

      await this.em.flush();
      this.logger.log(`Downgraded user ${subscription.user.id} to FREE plan`);
    }
  }

  async getUserSubscription(userId: string): Promise<Subscription | null> {
    return this.em.findOne(
      Subscription,
      { user: { id: userId }, status: SubscriptionStatus.ACTIVE },
      { orderBy: { createdAt: 'DESC' } }
    );
  }

  private getPlanFromProductId(productId: string): UserPlan {
    // Map Polar product IDs to plans
    // You'll need to update these with your actual product IDs
    if (productId.includes('hobbyist') || productId.includes('hobby')) {
      return UserPlan.HOBBYIST;
    }
    if (productId.includes('pro')) {
      return UserPlan.PRO;
    }
    if (productId.includes('enterprise')) {
      return UserPlan.ENTERPRISE;
    }
    return UserPlan.FREE;
  }

  private getTunnelLimit(plan: UserPlan): number {
    switch (plan) {
      case UserPlan.HOBBYIST:
        return 5;
      case UserPlan.PRO:
        return 999; // Effectively unlimited
      case UserPlan.ENTERPRISE:
        return 999;
      default:
        return 1;
    }
  }
}
