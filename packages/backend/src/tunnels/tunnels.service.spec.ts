import * as crypto from 'node:crypto';

import { EntityManager } from '@mikro-orm/postgresql';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  Domain,
  HttpRequest,
  Plan,
  SessionStatus,
  TunnelSession,
  User,
} from '@noverlink/backend-shared';

import { AppConfigService } from '../app-config';
import { TunnelsService } from './tunnels.service';

describe('TunnelsService', () => {
  let service: TunnelsService;
  let em: jest.Mocked<EntityManager>;

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

  beforeEach(async () => {
    const mockEm = {
      findOne: jest.fn(),
      find: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      persistAndFlush: jest.fn(),
      getReference: jest.fn(),
    };

    const mockAppConfigService = {
      tunnel: {
        ticketSecret: 'test-secret-key-for-hmac-signing-12345',
        relayUrl: 'wss://relay.noverlink.io',
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TunnelsService,
        { provide: EntityManager, useValue: mockEm },
        { provide: AppConfigService, useValue: mockAppConfigService },
      ],
    }).compile();

    service = module.get<TunnelsService>(TunnelsService);
    em = module.get(EntityManager);
  });

  describe('createTicket', () => {
    it('should create a valid ticket with HMAC signature', async () => {
      em.findOne.mockResolvedValue(null);
      em.create.mockImplementation((_, data) => data);
      em.persistAndFlush.mockResolvedValue(undefined);

      const result = await service.createTicket(mockUser as never);

      expect(result).toHaveProperty('ticket');
      expect(result).toHaveProperty('relay_url', 'wss://relay.noverlink.io');
      expect(result).toHaveProperty('expires_in', 60);
      expect(result.ticket).toBeTruthy();
    });

    it('should include correct payload in ticket', async () => {
      em.findOne.mockResolvedValue(null);
      em.create.mockImplementation((_, data) => data);
      em.persistAndFlush.mockResolvedValue(undefined);

      const result = await service.createTicket(mockUser as never);

      // Decode the base64url ticket
      const decoded = Buffer.from(result.ticket, 'base64url').toString('utf-8');
      const payload = JSON.parse(decoded);

      expect(payload.user_id).toBe('user-123');
      expect(payload.plan).toBe('sandbox');
      expect(payload.max_tunnels).toBe(1);
      expect(payload.sig).toBeTruthy();
      expect(payload.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
    });

    it('should verify HMAC signature is correct', async () => {
      em.findOne.mockResolvedValue(null);
      em.create.mockImplementation((_, data) => data);
      em.persistAndFlush.mockResolvedValue(undefined);

      const result = await service.createTicket(mockUser as never);

      const decoded = Buffer.from(result.ticket, 'base64url').toString('utf-8');
      const payload = JSON.parse(decoded);
      const { sig, ...payloadWithoutSig } = payload;

      // Recalculate signature
      const expectedSig = crypto
        .createHmac('sha256', 'test-secret-key-for-hmac-signing-12345')
        .update(JSON.stringify(payloadWithoutSig))
        .digest('hex');

      expect(sig).toBe(expectedSig);
    });

    it('should use requested subdomain when provided', async () => {
      em.findOne.mockResolvedValue(null);
      em.create.mockImplementation((_, data) => data);
      em.persistAndFlush.mockResolvedValue(undefined);

      const result = await service.createTicket(
        mockUser as never,
        'my-custom-subdomain'
      );

      const decoded = Buffer.from(result.ticket, 'base64url').toString('utf-8');
      const payload = JSON.parse(decoded);

      expect(payload.subdomain).toBe('my-custom-subdomain');
    });

    it('should reject subdomain reserved by another user', async () => {
      const anotherUser = { id: 'another-user', isReserved: true };
      em.findOne.mockImplementation(async (entity, _query) => {
        if (entity === Domain) {
          return {
            hostname: 'reserved-subdomain',
            user: anotherUser,
            isReserved: true,
          };
        }
        return null;
      });

      await expect(
        service.createTicket(mockUser as never, 'reserved-subdomain')
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject subdomain currently in use', async () => {
      em.findOne.mockImplementation(async (entity, _query) => {
        if (entity === Domain) {
          return null;
        }
        if (entity === TunnelSession) {
          return { status: SessionStatus.ACTIVE };
        }
        return null;
      });

      await expect(
        service.createTicket(mockUser as never, 'in-use-subdomain')
      ).rejects.toThrow(BadRequestException);
    });

    it('should generate random subdomain when none specified', async () => {
      em.findOne.mockResolvedValue(null);
      em.create.mockImplementation((_, data) => data);
      em.persistAndFlush.mockResolvedValue(undefined);

      const result = await service.createTicket(mockUser as never);

      const decoded = Buffer.from(result.ticket, 'base64url').toString('utf-8');
      const payload = JSON.parse(decoded);

      // Random subdomain should match pattern: adjective-noun
      expect(payload.subdomain).toMatch(/^[a-z]+-[a-z]+$/);
    });
  });

  describe('subdomain generation', () => {
    it('should generate unique subdomains on collision', async () => {
      let callCount = 0;
      em.findOne.mockImplementation(async (entity, _query) => {
        if (entity === Domain && callCount < 2) {
          callCount++;
          return { isReserved: true }; // First two attempts collide
        }
        return null;
      });
      em.create.mockImplementation((_, data) => data);
      em.persistAndFlush.mockResolvedValue(undefined);

      const result = await service.createTicket(mockUser as never);

      expect(result).toHaveProperty('ticket');
      expect(callCount).toBe(2); // Should have retried
    });

    it('should fall back to timestamp-based subdomain after max attempts', async () => {
      em.findOne.mockImplementation(async (entity, _query) => {
        if (entity === Domain) {
          // Return a reserved domain owned by another user to trigger collision
          return {
            isReserved: true,
            user: { id: 'another-user' },
          };
        }
        return null;
      });
      em.create.mockImplementation((_, data) => data);
      em.persistAndFlush.mockResolvedValue(undefined);

      const result = await service.createTicket(mockUser as never);

      const decoded = Buffer.from(result.ticket, 'base64url').toString('utf-8');
      const payload = JSON.parse(decoded);

      expect(payload.subdomain).toMatch(/^tunnel-\d+$/);
    });
  });

  describe('domain entity management', () => {
    it('should create new domain entity if not exists', async () => {
      em.findOne.mockResolvedValue(null);
      em.create.mockImplementation((_, data) => data);
      em.persistAndFlush.mockResolvedValue(undefined);

      await service.createTicket(mockUser as never, 'new-subdomain');

      expect(em.create).toHaveBeenCalledWith(
        Domain,
        expect.objectContaining({
          user: 'user-123',
          hostname: 'new-subdomain',
          isReserved: false,
        })
      );
      expect(em.persistAndFlush).toHaveBeenCalled();
    });

    it('should allow user to use their own reserved subdomain', async () => {
      const ownDomain = {
        hostname: 'my-reserved',
        user: { id: 'user-123' },
        isReserved: true,
      };
      em.findOne.mockImplementation(async (entity) => {
        if (entity === Domain) return ownDomain;
        return null;
      });
      em.create.mockImplementation((_, data) => data);
      em.persistAndFlush.mockResolvedValue(undefined);

      const result = await service.createTicket(
        mockUser as never,
        'my-reserved'
      );

      expect(result).toHaveProperty('ticket');
    });
  });

  // ─── Session Query Tests ─────────────────────────────────────

  describe('listSessions', () => {
    const mockDomain = {
      $: { hostname: 'test-subdomain' },
    };

    const mockSessions = [
      {
        id: 'session-1',
        domain: mockDomain,
        localPort: 3000,
        status: SessionStatus.ACTIVE,
        connectedAt: new Date('2024-01-15T10:00:00Z'),
        bytesIn: BigInt(1000),
        bytesOut: BigInt(2000),
      },
      {
        id: 'session-2',
        domain: mockDomain,
        localPort: 8080,
        status: SessionStatus.CLOSED,
        connectedAt: new Date('2024-01-14T10:00:00Z'),
        bytesIn: BigInt(500),
        bytesOut: BigInt(1000),
      },
    ];

    it('should return sessions for user', async () => {
      em.find.mockResolvedValue(mockSessions);

      const result = await service.listSessions('user-123');

      expect(em.find).toHaveBeenCalledWith(
        TunnelSession,
        { user: 'user-123' },
        expect.objectContaining({
          populate: ['domain'],
          orderBy: { connectedAt: 'DESC', id: 'DESC' },
          limit: 21,
        })
      );
      expect(result.sessions).toHaveLength(2);
      expect(result.nextCursor).toBeNull();
    });

    it('should filter by status when provided', async () => {
      em.find.mockResolvedValue([mockSessions[0]]);

      await service.listSessions('user-123', SessionStatus.ACTIVE);

      expect(em.find).toHaveBeenCalledWith(
        TunnelSession,
        { user: 'user-123', status: SessionStatus.ACTIVE },
        expect.any(Object)
      );
    });

    it('should return nextCursor when hasMore', async () => {
      const manySessions = Array(21)
        .fill(null)
        .map((_, i) => ({
          ...mockSessions[0],
          id: `session-${i}`,
          connectedAt: new Date(Date.now() - i * 86400000), // Each day earlier
        }));
      em.find.mockResolvedValue(manySessions);

      const result = await service.listSessions(
        'user-123',
        undefined,
        undefined,
        20
      );

      expect(result.sessions).toHaveLength(20);
      expect(result.nextCursor).toBeTruthy();
    });

    it('should decode cursor for pagination', async () => {
      const cursor = Buffer.from(
        JSON.stringify({
          id: 'session-5',
          t: '2024-01-10T10:00:00Z',
        })
      ).toString('base64url');

      em.find.mockResolvedValue([]);

      await service.listSessions('user-123', undefined, cursor);

      expect(em.find).toHaveBeenCalledWith(
        TunnelSession,
        expect.objectContaining({
          user: 'user-123',
          $or: expect.any(Array),
        }),
        expect.any(Object)
      );
    });

    it('should throw on invalid cursor format', async () => {
      await expect(
        service.listSessions('user-123', undefined, 'invalid-cursor')
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getSession', () => {
    const mockDomain = {
      $: { hostname: 'test-subdomain' },
    };

    const mockSession = {
      id: 'session-123',
      domain: mockDomain,
      localPort: 3000,
      status: SessionStatus.ACTIVE,
      connectedAt: new Date(),
      bytesIn: BigInt(1000),
      bytesOut: BigInt(2000),
    };

    it('should return session when found and owned by user', async () => {
      em.findOne.mockResolvedValue(mockSession);

      const result = await service.getSession('user-123', 'session-123');

      expect(result).toEqual(mockSession);
      expect(em.findOne).toHaveBeenCalledWith(
        TunnelSession,
        { id: 'session-123', user: 'user-123' },
        { populate: ['domain'] }
      );
    });

    it('should throw NotFoundException when session not found', async () => {
      em.findOne.mockResolvedValue(null);

      await expect(
        service.getSession('user-123', 'non-existent')
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when session belongs to another user', async () => {
      em.findOne.mockResolvedValue(null); // Query with user filter returns null

      await expect(
        service.getSession('user-123', 'other-user-session')
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getSessionLogs', () => {
    const mockSession = { id: 'session-123' };
    const mockLogs = [
      {
        id: 'log-1',
        method: 'GET',
        path: '/api/users',
        responseStatus: 200,
        durationMs: 45,
        timestamp: new Date('2024-01-15T10:00:00Z'),
      },
      {
        id: 'log-2',
        method: 'POST',
        path: '/api/data',
        responseStatus: 201,
        durationMs: 120,
        timestamp: new Date('2024-01-15T09:00:00Z'),
      },
    ];

    it('should return logs for session', async () => {
      em.findOne.mockResolvedValue(mockSession);
      em.find.mockResolvedValue(mockLogs);

      const result = await service.getSessionLogs('user-123', 'session-123');

      expect(em.findOne).toHaveBeenCalledWith(TunnelSession, {
        id: 'session-123',
        user: 'user-123',
      });
      expect(em.find).toHaveBeenCalledWith(
        HttpRequest,
        { session: 'session-123' },
        expect.objectContaining({
          orderBy: { timestamp: 'DESC', id: 'DESC' },
          limit: 51,
        })
      );
      expect(result.logs).toHaveLength(2);
    });

    it('should throw NotFoundException if session not owned by user', async () => {
      em.findOne.mockResolvedValue(null);

      await expect(
        service.getSessionLogs('user-123', 'other-session')
      ).rejects.toThrow(NotFoundException);
    });

    it('should filter by method when provided', async () => {
      em.findOne.mockResolvedValue(mockSession);
      em.find.mockResolvedValue([mockLogs[0]]);

      await service.getSessionLogs(
        'user-123',
        'session-123',
        undefined,
        50,
        'get'
      );

      expect(em.find).toHaveBeenCalledWith(
        HttpRequest,
        { session: 'session-123', method: 'GET' },
        expect.any(Object)
      );
    });
  });

  describe('getStats', () => {
    it('should return aggregate stats for user', async () => {
      const mockQuota = {
        requestCount: 1500,
        bandwidthUsedMb: 250,
        tunnelMinutes: 4320,
      };
      em.count.mockResolvedValue(2);
      em.findOne.mockResolvedValue(mockQuota);

      const result = await service.getStats('user-123');

      expect(result).toEqual({
        activeSessions: 2,
        totalRequests: 1500,
        bandwidthMb: 250,
        tunnelMinutes: 4320,
      });
      expect(em.count).toHaveBeenCalledWith(TunnelSession, {
        user: 'user-123',
        status: SessionStatus.ACTIVE,
      });
    });

    it('should return zeros when no quota exists', async () => {
      em.count.mockResolvedValue(0);
      em.findOne.mockResolvedValue(null);

      const result = await service.getStats('user-123');

      expect(result).toEqual({
        activeSessions: 0,
        totalRequests: 0,
        bandwidthMb: 0,
        tunnelMinutes: 0,
      });
    });
  });

  describe('getSessionRequestCount', () => {
    it('should return request count for session', async () => {
      em.count.mockResolvedValue(150);

      const result = await service.getSessionRequestCount('session-123');

      expect(result).toBe(150);
      expect(em.count).toHaveBeenCalledWith(HttpRequest, {
        session: 'session-123',
      });
    });
  });
});
