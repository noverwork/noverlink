import { EntityManager } from '@mikro-orm/postgresql';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  Subscription,
  SubscriptionStatus,
  User,
  UserPlan,
} from '@noverlink/backend-shared';

import { BillingService } from './billing.service';

describe('BillingService', () => {
  let service: BillingService;
  let em: jest.Mocked<EntityManager>;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    plan: UserPlan.FREE,
    maxTunnels: 1,
  } as unknown as User;

  beforeEach(async () => {
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    jest.spyOn(Logger.prototype, 'debug').mockImplementation();

    const mockEm = {
      findOne: jest.fn(),
      create: jest.fn(),
      persist: jest.fn(),
      flush: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillingService,
        { provide: EntityManager, useValue: mockEm },
      ],
    }).compile();

    service = module.get<BillingService>(BillingService);
    em = module.get(EntityManager);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('syncCheckout', () => {
    it('should update user plan and create subscription for new checkout', async () => {
      em.findOne.mockImplementation(async (entity) => {
        if (entity === User) return { ...mockUser };
        if (entity === Subscription) return null;
        return null;
      });
      em.create.mockImplementation((_, data) => data);

      await service.syncCheckout({
        customerEmail: 'test@example.com',
        productId: 'prod_hobbyist_monthly',
        subscriptionId: 'sub_123',
        customerId: 'cus_456',
      });

      expect(em.findOne).toHaveBeenCalledWith(User, { email: 'test@example.com' });
      expect(em.create).toHaveBeenCalledWith(Subscription, expect.objectContaining({
        polarSubscriptionId: 'sub_123',
        polarCustomerId: 'cus_456',
        polarProductId: 'prod_hobbyist_monthly',
        status: SubscriptionStatus.ACTIVE,
      }));
      expect(em.persist).toHaveBeenCalled();
      expect(em.flush).toHaveBeenCalled();
    });

    it('should do nothing if user not found', async () => {
      em.findOne.mockResolvedValue(null);

      await service.syncCheckout({
        customerEmail: 'unknown@example.com',
        productId: 'prod_hobbyist',
      });

      expect(em.create).not.toHaveBeenCalled();
      expect(em.flush).not.toHaveBeenCalled();
    });

    it('should not create duplicate subscription if already exists', async () => {
      const existingSubscription = { polarSubscriptionId: 'sub_123' };
      em.findOne.mockImplementation(async (entity) => {
        if (entity === User) return { ...mockUser };
        if (entity === Subscription) return existingSubscription;
        return null;
      });

      await service.syncCheckout({
        customerEmail: 'test@example.com',
        productId: 'prod_pro',
        subscriptionId: 'sub_123',
      });

      expect(em.create).not.toHaveBeenCalled();
      expect(em.flush).toHaveBeenCalled();
    });

    it('should map hobbyist product to HOBBYIST plan', async () => {
      const user = { ...mockUser };
      em.findOne.mockImplementation(async (entity) => {
        if (entity === User) return user;
        return null;
      });

      await service.syncCheckout({
        customerEmail: 'test@example.com',
        productId: 'noverlink-hobbyist-plan',
      });

      expect(user.plan).toBe(UserPlan.HOBBYIST);
      expect(user.maxTunnels).toBe(5);
    });

    it('should map pro product to PRO plan', async () => {
      const user = { ...mockUser };
      em.findOne.mockImplementation(async (entity) => {
        if (entity === User) return user;
        return null;
      });

      await service.syncCheckout({
        customerEmail: 'test@example.com',
        productId: 'noverlink-pro-plan',
      });

      expect(user.plan).toBe(UserPlan.PRO);
      expect(user.maxTunnels).toBe(999);
    });

    it('should map enterprise product to ENTERPRISE plan', async () => {
      const user = { ...mockUser };
      em.findOne.mockImplementation(async (entity) => {
        if (entity === User) return user;
        return null;
      });

      await service.syncCheckout({
        customerEmail: 'test@example.com',
        productId: 'noverlink-enterprise-plan',
      });

      expect(user.plan).toBe(UserPlan.ENTERPRISE);
      expect(user.maxTunnels).toBe(999);
    });

    it('should default to FREE plan for unknown product', async () => {
      // getPlanFromProductId returns FREE for products that don't match known patterns
      // Verify by checking the user is updated to FREE plan
      const user = { ...mockUser };
      em.findOne.mockImplementation(async (entity) => {
        if (entity === User) return user;
        return null;
      });

      await service.syncCheckout({
        customerEmail: 'test@example.com',
        productId: 'totally-random-xyz-123', // Does not contain 'hobby', 'pro', or 'enterprise'
      });

      expect(user.plan).toBe(UserPlan.FREE);
      expect(user.maxTunnels).toBe(1);
    });
  });

  describe('handleSubscriptionActive', () => {
    it('should activate subscription and update user plan', async () => {
      const subscription = {
        polarSubscriptionId: 'sub_123',
        status: SubscriptionStatus.CANCELED,
        user: { $: { plan: UserPlan.FREE, maxTunnels: 1 } },
      };
      em.findOne.mockResolvedValue(subscription);

      await service.handleSubscriptionActive({
        subscriptionId: 'sub_123',
        customerId: 'cus_123',
        productId: 'prod_pro_monthly',
        status: 'active',
        currentPeriodEnd: '2025-12-31T23:59:59Z',
      });

      expect(subscription.status).toBe(SubscriptionStatus.ACTIVE);
      expect(subscription.user.$.plan).toBe(UserPlan.PRO);
      expect(subscription.user.$.maxTunnels).toBe(999);
      expect(em.flush).toHaveBeenCalled();
    });

    it('should update current period end date', async () => {
      const subscription = {
        polarSubscriptionId: 'sub_123',
        status: SubscriptionStatus.ACTIVE,
        user: { $: { plan: UserPlan.FREE, maxTunnels: 1 } },
        currentPeriodEnd: null as Date | null,
      };
      em.findOne.mockResolvedValue(subscription);

      await service.handleSubscriptionActive({
        subscriptionId: 'sub_123',
        customerId: 'cus_123',
        productId: 'prod_hobbyist',
        status: 'active',
        currentPeriodEnd: '2025-06-15T12:00:00Z',
      });

      expect(subscription.currentPeriodEnd).toEqual(new Date('2025-06-15T12:00:00Z'));
    });

    it('should do nothing if subscription not found', async () => {
      em.findOne.mockResolvedValue(null);

      await service.handleSubscriptionActive({
        subscriptionId: 'sub_unknown',
        customerId: 'cus_unknown',
        productId: 'prod_pro',
        status: 'active',
      });

      expect(em.flush).not.toHaveBeenCalled();
    });
  });

  describe('handleSubscriptionCanceled', () => {
    it('should cancel subscription and downgrade user to FREE', async () => {
      const subscription = {
        polarSubscriptionId: 'sub_123',
        status: SubscriptionStatus.ACTIVE,
        user: { id: 'user-123', $: { plan: UserPlan.PRO, maxTunnels: 999 } },
      };
      em.findOne.mockResolvedValue(subscription);

      await service.handleSubscriptionCanceled({
        subscriptionId: 'sub_123',
      });

      expect(subscription.status).toBe(SubscriptionStatus.CANCELED);
      expect(subscription.user.$.plan).toBe(UserPlan.FREE);
      expect(subscription.user.$.maxTunnels).toBe(1);
      expect(em.flush).toHaveBeenCalled();
    });

    it('should do nothing if subscription not found', async () => {
      em.findOne.mockResolvedValue(null);

      await service.handleSubscriptionCanceled({
        subscriptionId: 'sub_unknown',
      });

      expect(em.flush).not.toHaveBeenCalled();
    });
  });

  describe('getUserSubscription', () => {
    it('should return active subscription for user', async () => {
      const mockSubscription = {
        id: 'sub-id',
        polarSubscriptionId: 'polar_123',
        status: SubscriptionStatus.ACTIVE,
      };
      em.findOne.mockResolvedValue(mockSubscription);

      const result = await service.getUserSubscription('user-123');

      expect(result).toBe(mockSubscription);
      expect(em.findOne).toHaveBeenCalledWith(
        Subscription,
        { user: { id: 'user-123' }, status: SubscriptionStatus.ACTIVE },
        { orderBy: { createdAt: 'DESC' } }
      );
    });

    it('should return null if no active subscription', async () => {
      em.findOne.mockResolvedValue(null);

      const result = await service.getUserSubscription('user-123');

      expect(result).toBeNull();
    });
  });
});
