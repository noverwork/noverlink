import { Test, TestingModule } from '@nestjs/testing';

import { AppConfigService } from '../app-config';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { PolarWebhookGuard } from './guards';

// Polar webhook payload type (simplified for testing)
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

    const mockConfigService = {
      polar: { webhookSecret: 'test-secret' },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BillingController],
      providers: [
        { provide: BillingService, useValue: mockBillingService },
        { provide: AppConfigService, useValue: mockConfigService },
      ],
    })
      .overrideGuard(PolarWebhookGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<BillingController>(BillingController);
    billingService = module.get(BillingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handlePolarWebhook', () => {
    it('should handle checkout.updated with succeeded status', async () => {
      billingService.syncCheckout.mockResolvedValue(undefined);

      const payload: PolarWebhookPayload = {
        type: 'checkout.updated',
        data: {
          status: 'succeeded',
          customerId: 'cus_123',
          customerEmail: 'test@example.com',
          productId: 'prod_123',
          subscriptionId: 'sub_456',
        },
      };

      const mockReq = { polarPayload: payload } as never;
      const result = await controller.handlePolarWebhook(mockReq);

      expect(result).toEqual({ ok: true });
      expect(billingService.syncCheckout).toHaveBeenCalledWith({
        customerId: 'cus_123',
        customerEmail: 'test@example.com',
        productId: 'prod_123',
        subscriptionId: 'sub_456',
      });
    });

    it('should not call syncCheckout for non-succeeded checkout', async () => {
      const payload: PolarWebhookPayload = {
        type: 'checkout.updated',
        data: {
          status: 'pending',
          productId: 'prod_123',
        },
      };

      const mockReq = { polarPayload: payload } as never;
      const result = await controller.handlePolarWebhook(mockReq);

      expect(result).toEqual({ ok: true });
      expect(billingService.syncCheckout).not.toHaveBeenCalled();
    });

    it('should handle subscription.active', async () => {
      billingService.handleSubscriptionActive.mockResolvedValue(undefined);

      const payload: PolarWebhookPayload = {
        type: 'subscription.active',
        data: {
          id: 'sub_123',
          customerId: 'cus_123',
          productId: 'prod_pro',
          status: 'active',
          currentPeriodEnd: new Date('2025-12-31'),
        },
      };

      const mockReq = { polarPayload: payload } as never;
      const result = await controller.handlePolarWebhook(mockReq);

      expect(result).toEqual({ ok: true });
      expect(billingService.handleSubscriptionActive).toHaveBeenCalledWith({
        subscriptionId: 'sub_123',
        customerId: 'cus_123',
        productId: 'prod_pro',
        status: 'active',
        currentPeriodEnd: '2025-12-31T00:00:00.000Z',
      });
    });

    it('should handle subscription.canceled', async () => {
      billingService.handleSubscriptionCanceled.mockResolvedValue(undefined);

      const payload: PolarWebhookPayload = {
        type: 'subscription.canceled',
        data: {
          id: 'sub_123',
        },
      };

      const mockReq = { polarPayload: payload } as never;
      const result = await controller.handlePolarWebhook(mockReq);

      expect(result).toEqual({ ok: true });
      expect(billingService.handleSubscriptionCanceled).toHaveBeenCalledWith({
        subscriptionId: 'sub_123',
      });
    });

    it('should handle subscription.revoked', async () => {
      billingService.handleSubscriptionCanceled.mockResolvedValue(undefined);

      const payload: PolarWebhookPayload = {
        type: 'subscription.revoked',
        data: {
          id: 'sub_123',
        },
      };

      const mockReq = { polarPayload: payload } as never;
      const result = await controller.handlePolarWebhook(mockReq);

      expect(result).toEqual({ ok: true });
      expect(billingService.handleSubscriptionCanceled).toHaveBeenCalledWith({
        subscriptionId: 'sub_123',
      });
    });

    it('should handle unknown webhook types gracefully', async () => {
      const payload: PolarWebhookPayload = {
        type: 'unknown.event',
        data: {},
      };

      const mockReq = { polarPayload: payload } as never;
      const result = await controller.handlePolarWebhook(mockReq);

      expect(result).toEqual({ ok: true });
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
