import { Test, TestingModule } from '@nestjs/testing';

import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';

describe('BillingController', () => {
  let controller: BillingController;
  let billingService: jest.Mocked<BillingService>;

  beforeEach(async () => {
    const mockBillingService = {
      syncCheckout: jest.fn(),
      handleSubscriptionActive: jest.fn(),
      handleSubscriptionCanceled: jest.fn(),
      getUserSubscription: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BillingController],
      providers: [
        { provide: BillingService, useValue: mockBillingService },
      ],
    }).compile();

    controller = module.get<BillingController>(BillingController);
    billingService = module.get(BillingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('webhookCheckout', () => {
    it('should call syncCheckout and return ok', async () => {
      billingService.syncCheckout.mockResolvedValue(undefined);

      const dto = {
        customerEmail: 'test@example.com',
        productId: 'prod_123',
        subscriptionId: 'sub_456',
        customerId: 'cus_789',
      };

      const result = await controller.webhookCheckout(dto);

      expect(result).toEqual({ ok: true });
      expect(billingService.syncCheckout).toHaveBeenCalledWith(dto);
    });

    it('should propagate errors from service', async () => {
      billingService.syncCheckout.mockRejectedValue(new Error('DB error'));

      await expect(
        controller.webhookCheckout({
          customerEmail: 'test@example.com',
          productId: 'prod_123',
        })
      ).rejects.toThrow('DB error');
    });
  });

  describe('webhookSubscriptionActive', () => {
    it('should call handleSubscriptionActive and return ok', async () => {
      billingService.handleSubscriptionActive.mockResolvedValue(undefined);

      const dto = {
        subscriptionId: 'sub_123',
        productId: 'prod_pro',
        currentPeriodEnd: '2025-12-31',
      };

      const result = await controller.webhookSubscriptionActive(dto);

      expect(result).toEqual({ ok: true });
      expect(billingService.handleSubscriptionActive).toHaveBeenCalledWith(dto);
    });
  });

  describe('webhookSubscriptionCanceled', () => {
    it('should call handleSubscriptionCanceled and return ok', async () => {
      billingService.handleSubscriptionCanceled.mockResolvedValue(undefined);

      const dto = {
        subscriptionId: 'sub_123',
      };

      const result = await controller.webhookSubscriptionCanceled(dto);

      expect(result).toEqual({ ok: true });
      expect(billingService.handleSubscriptionCanceled).toHaveBeenCalledWith(dto);
    });
  });

  describe('getSubscription', () => {
    it('should return user subscription', async () => {
      const mockSubscription = {
        id: 'sub-id',
        polarSubscriptionId: 'polar_123',
        status: 'active',
      };
      billingService.getUserSubscription.mockResolvedValue(mockSubscription as never);

      const result = await controller.getSubscription('user-123');

      expect(result).toEqual({ subscription: mockSubscription });
      expect(billingService.getUserSubscription).toHaveBeenCalledWith('user-123');
    });

    it('should return null subscription if none exists', async () => {
      billingService.getUserSubscription.mockResolvedValue(null);

      const result = await controller.getSubscription('user-123');

      expect(result).toEqual({ subscription: null });
    });
  });
});
