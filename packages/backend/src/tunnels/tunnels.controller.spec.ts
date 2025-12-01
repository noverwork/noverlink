import { Test, TestingModule } from '@nestjs/testing';
import { User, UserPlan } from '@noverlink/backend-shared';
import type { Request } from 'express';

import { AuthService } from '../auth/auth.service';
import { CliAuthGuard } from './guards/cli-auth.guard';
import { TunnelsController } from './tunnels.controller';
import { TunnelsService } from './tunnels.service';

describe('TunnelsController', () => {
  let controller: TunnelsController;
  let tunnelsService: jest.Mocked<TunnelsService>;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    plan: UserPlan.FREE,
    maxTunnels: 1,
  } as unknown as User;

  const mockTicketResponse = {
    ticket: 'base64-encoded-ticket',
    relay_url: 'wss://relay.noverlink.io',
    expires_in: 60,
  };

  beforeEach(async () => {
    const mockTunnelsService = {
      createTicket: jest.fn(),
    };

    const mockAuthService = {
      validateCliToken: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TunnelsController],
      providers: [
        { provide: TunnelsService, useValue: mockTunnelsService },
        { provide: AuthService, useValue: mockAuthService },
      ],
    })
      .overrideGuard(CliAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<TunnelsController>(TunnelsController);
    tunnelsService = module.get(TunnelsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createTicket', () => {
    it('should create ticket without subdomain', async () => {
      tunnelsService.createTicket.mockResolvedValue(mockTicketResponse);

      const mockRequest = { user: mockUser } as Request & { user: User };

      const result = await controller.createTicket({}, mockRequest);

      expect(result).toBe(mockTicketResponse);
      expect(tunnelsService.createTicket).toHaveBeenCalledWith(mockUser, undefined);
    });

    it('should create ticket with requested subdomain', async () => {
      tunnelsService.createTicket.mockResolvedValue({
        ...mockTicketResponse,
        ticket: 'custom-subdomain-ticket',
      });

      const mockRequest = { user: mockUser } as Request & { user: User };

      const result = await controller.createTicket(
        { subdomain: 'my-custom-subdomain' },
        mockRequest
      );

      expect(result).toHaveProperty('ticket', 'custom-subdomain-ticket');
      expect(tunnelsService.createTicket).toHaveBeenCalledWith(
        mockUser,
        'my-custom-subdomain'
      );
    });

    it('should return ticket response with relay_url and expires_in', async () => {
      tunnelsService.createTicket.mockResolvedValue(mockTicketResponse);

      const mockRequest = { user: mockUser } as Request & { user: User };

      const result = await controller.createTicket({}, mockRequest);

      expect(result).toHaveProperty('ticket');
      expect(result).toHaveProperty('relay_url', 'wss://relay.noverlink.io');
      expect(result).toHaveProperty('expires_in', 60);
    });

    it('should propagate service errors', async () => {
      tunnelsService.createTicket.mockRejectedValue(
        new Error('Subdomain already in use')
      );

      const mockRequest = { user: mockUser } as Request & { user: User };

      await expect(
        controller.createTicket({ subdomain: 'taken-subdomain' }, mockRequest)
      ).rejects.toThrow('Subdomain already in use');
    });

    it('should pass user from authenticated request', async () => {
      tunnelsService.createTicket.mockResolvedValue(mockTicketResponse);

      const differentUser = {
        ...mockUser,
        id: 'different-user-456',
        email: 'different@example.com',
      };

      const mockRequest = { user: differentUser } as Request & { user: User };

      await controller.createTicket({}, mockRequest);

      expect(tunnelsService.createTicket).toHaveBeenCalledWith(
        differentUser,
        undefined
      );
    });
  });
});
