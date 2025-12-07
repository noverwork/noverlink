import { Test, TestingModule } from '@nestjs/testing';
import { Plan, SessionStatus, User } from '@noverlink/backend-shared';
import type { Request } from 'express';

import { AuthService } from '../auth/auth.service';
import { CliAuthGuard } from './guards/cli-auth.guard';
import { TunnelsController } from './tunnels.controller';
import { TunnelsService } from './tunnels.service';

describe('TunnelsController', () => {
  let controller: TunnelsController;
  let tunnelsService: jest.Mocked<TunnelsService>;

  const mockPlan = {
    id: 'sandbox',
    name: 'Sandbox',
    baseDomain: 'noverlink-free.app',
    maxTunnels: 1,
    maxBandwidthMb: 1000,
  } as unknown as Plan;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    plan: { $: mockPlan, id: 'sandbox' },
  } as unknown as User;

  const mockTicketResponse = {
    ticket: 'base64-encoded-ticket',
    relay_url: 'wss://relay.noverlink.io',
    expires_in: 60,
  };

  const mockDomain = {
    $: {
      hostname: 'test-subdomain',
      baseDomain: 'noverlink-free.app',
      publicUrl: 'https://test-subdomain.noverlink-free.app',
    },
  };

  const mockSession = {
    id: 'session-123',
    domain: mockDomain,
    localPort: 3000,
    status: SessionStatus.ACTIVE,
    connectedAt: new Date('2024-01-15T10:00:00Z'),
    disconnectedAt: null,
    bytesIn: BigInt(1000),
    bytesOut: BigInt(2000),
    clientIp: '192.168.1.1',
    clientVersion: '0.1.0',
  };

  beforeEach(async () => {
    const mockTunnelsService = {
      createTicket: jest.fn(),
      listSessions: jest.fn(),
      getSession: jest.fn(),
      getSessionLogs: jest.fn(),
      getStats: jest.fn(),
      getSessionRequestCount: jest.fn(),
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
      expect(tunnelsService.createTicket).toHaveBeenCalledWith(
        mockUser,
        undefined
      );
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

  // ─── Session Query Endpoint Tests ─────────────────────────────

  describe('listSessions', () => {
    it('should return formatted session list', async () => {
      tunnelsService.listSessions.mockResolvedValue({
        sessions: [mockSession as never],
        nextCursor: null,
      });

      const result = await controller.listSessions(mockUser, {});

      expect(result.sessions).toHaveLength(1);
      expect(result.sessions[0]).toEqual({
        id: 'session-123',
        subdomain: 'test-subdomain',
        baseDomain: 'noverlink-free.app',
        publicUrl: 'https://test-subdomain.noverlink-free.app',
        localPort: 3000,
        status: SessionStatus.ACTIVE,
        connectedAt: '2024-01-15T10:00:00.000Z',
        disconnectedAt: null,
        bytesIn: '1000',
        bytesOut: '2000',
        clientIp: '192.168.1.1',
      });
      expect(result.hasMore).toBe(false);
    });

    it('should pass query parameters to service', async () => {
      tunnelsService.listSessions.mockResolvedValue({
        sessions: [],
        nextCursor: null,
      });

      await controller.listSessions(mockUser, {
        status: SessionStatus.ACTIVE,
        cursor: 'some-cursor',
        limit: 50,
      });

      expect(tunnelsService.listSessions).toHaveBeenCalledWith(
        'user-123',
        SessionStatus.ACTIVE,
        'some-cursor',
        50
      );
    });
  });

  describe('getSession', () => {
    it('should return formatted session detail', async () => {
      tunnelsService.getSession.mockResolvedValue(mockSession as never);
      tunnelsService.getSessionRequestCount.mockResolvedValue(150);

      const result = await controller.getSession(mockUser, 'session-123');

      expect(result).toEqual({
        id: 'session-123',
        subdomain: 'test-subdomain',
        baseDomain: 'noverlink-free.app',
        publicUrl: 'https://test-subdomain.noverlink-free.app',
        localPort: 3000,
        status: SessionStatus.ACTIVE,
        connectedAt: '2024-01-15T10:00:00.000Z',
        disconnectedAt: null,
        bytesIn: '1000',
        bytesOut: '2000',
        clientIp: '192.168.1.1',
        clientVersion: '0.1.0',
        requestCount: 150,
      });
    });
  });

  describe('getSessionLogs', () => {
    const mockLogs = [
      {
        id: 'log-1',
        method: 'GET',
        path: '/api/users',
        queryString: null,
        responseStatus: 200,
        durationMs: 45,
        timestamp: new Date('2024-01-15T10:00:00Z'),
      },
    ];

    it('should return formatted logs', async () => {
      tunnelsService.getSessionLogs.mockResolvedValue({
        logs: mockLogs as never[],
        nextCursor: null,
      });

      const result = await controller.getSessionLogs(
        mockUser,
        'session-123',
        {}
      );

      expect(result.logs).toHaveLength(1);
      expect(result.logs[0]).toEqual({
        id: 'log-1',
        method: 'GET',
        path: '/api/users',
        queryString: null,
        status: 200,
        durationMs: 45,
        timestamp: '2024-01-15T10:00:00.000Z',
      });
      expect(result.hasMore).toBe(false);
    });

    it('should pass method filter to service', async () => {
      tunnelsService.getSessionLogs.mockResolvedValue({
        logs: [],
        nextCursor: null,
      });

      await controller.getSessionLogs(mockUser, 'session-123', {
        method: 'POST',
        limit: 100,
      });

      expect(tunnelsService.getSessionLogs).toHaveBeenCalledWith(
        'user-123',
        'session-123',
        undefined,
        100,
        'POST'
      );
    });
  });

  describe('getStats', () => {
    it('should return stats from service', async () => {
      const mockStats = {
        activeSessions: 2,
        totalRequests: 1500,
        bandwidthMb: 250,
        tunnelMinutes: 4320,
      };
      tunnelsService.getStats.mockResolvedValue(mockStats);

      const result = await controller.getStats(mockUser);

      expect(result).toEqual(mockStats);
      expect(tunnelsService.getStats).toHaveBeenCalledWith('user-123');
    });
  });
});
