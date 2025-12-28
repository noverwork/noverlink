import { MikroORM } from '@mikro-orm/core';
import { EntityManager, ref } from '@mikro-orm/postgresql';
import { Logger, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  Domain,
  HttpRequest,
  Plan,
  RelayServer,
  RelayStatus,
  SessionStatus,
  TunnelSession,
  UsageQuota,
  User,
} from '@noverlink/backend-shared';

import { RelayService } from './relay.service';

describe('RelayService', () => {
  let service: RelayService;
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

  const mockDomain = {
    id: 'domain-123',
    hostname: 'test-subdomain',
    user: mockUser,
  } as unknown as Domain;

  beforeEach(async () => {
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'debug').mockImplementation();

    const mockEm: Record<string, jest.Mock> = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      persist: jest.fn(),
      flush: jest.fn(),
      fork: jest.fn(),
    };

    // Mock fork to return the same em for @EnsureRequestContext() decorator
    mockEm.fork.mockReturnValue(mockEm);

    const mockOrm = {
      em: mockEm,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RelayService,
        { provide: MikroORM, useValue: mockOrm },
        { provide: EntityManager, useValue: mockEm },
      ],
    }).compile();

    service = module.get<RelayService>(RelayService);
    em = module.get(EntityManager);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('createSession', () => {
    it('should create a new tunnel session', async () => {
      em.findOne.mockImplementation(async (entity) => {
        if (entity === User) return mockUser;
        if (entity === Domain) return mockDomain;
        return null;
      });

      const result = await service.createSession('relay-1', {
        user_id: 'user-123',
        subdomain: 'test-subdomain',
        local_port: 3000,
        client_ip: '192.168.1.1',
        client_version: '1.0.0',
      });

      expect(result).toHaveProperty('session_id');
      expect(em.persist).toHaveBeenCalled();
      expect(em.flush).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user not found', async () => {
      em.findOne.mockResolvedValue(null);

      await expect(
        service.createSession('relay-1', {
          user_id: 'unknown-user',
          subdomain: 'test',
          local_port: 3000,
          client_ip: '192.168.1.1',
        })
      ).rejects.toThrow(new NotFoundException('User unknown-user not found'));
    });

    it('should throw NotFoundException if domain not found', async () => {
      em.findOne.mockImplementation(async (entity) => {
        if (entity === User) return mockUser;
        return null;
      });

      await expect(
        service.createSession('relay-1', {
          user_id: 'user-123',
          subdomain: 'unknown-subdomain',
          local_port: 3000,
          client_ip: '192.168.1.1',
        })
      ).rejects.toThrow(
        new NotFoundException('Domain unknown-subdomain not found')
      );
    });

    it('should set all session properties correctly', async () => {
      em.findOne.mockImplementation(async (entity) => {
        if (entity === User) return mockUser;
        if (entity === Domain) return mockDomain;
        return null;
      });

      let persistedSession: TunnelSession | null = null;
      em.persist.mockImplementation((entity) => {
        persistedSession = entity as TunnelSession;
        return em;
      });

      await service.createSession('relay-1', {
        user_id: 'user-123',
        subdomain: 'test-subdomain',
        local_port: 8080,
        client_ip: '10.0.0.1',
        client_version: '2.0.0',
      });

      expect(persistedSession).toBeTruthy();
      expect(persistedSession?.localPort).toBe(8080);
      expect(persistedSession?.relayId).toBe('relay-1');
      expect(persistedSession?.clientIp).toBe('10.0.0.1');
      expect(persistedSession?.clientVersion).toBe('2.0.0');
    });
  });

  describe('closeSession', () => {
    it('should close session and update usage quota', async () => {
      const mockSession = {
        id: 'session-123',
        status: SessionStatus.ACTIVE,
        user: ref(mockUser),
        connectedAt: new Date('2025-01-01T10:00:00Z'),
        disconnectedAt: null as Date | null,
        bytesIn: BigInt(0),
        bytesOut: BigInt(0),
      };
      em.findOne.mockImplementation(async (entity) => {
        if (entity === TunnelSession) return mockSession;
        if (entity === UsageQuota) return null;
        return null;
      });
      em.persist.mockImplementation(() => em);

      await service.closeSession('session-123', {
        bytes_in: 1024000,
        bytes_out: 2048000,
      });

      expect(mockSession.status).toBe(SessionStatus.CLOSED);
      expect(mockSession.disconnectedAt).toBeInstanceOf(Date);
      expect(mockSession.bytesIn).toBe(BigInt(1024000));
      expect(mockSession.bytesOut).toBe(BigInt(2048000));
      expect(em.flush).toHaveBeenCalled();
    });

    it('should throw NotFoundException if session not found', async () => {
      em.findOne.mockResolvedValue(null);

      await expect(
        service.closeSession('unknown-session', {
          bytes_in: 0,
          bytes_out: 0,
        })
      ).rejects.toThrow(
        new NotFoundException('Session unknown-session not found')
      );
    });

    it('should create new usage quota if not exists', async () => {
      const mockSession = {
        id: 'session-123',
        status: SessionStatus.ACTIVE,
        user: ref(mockUser),
        connectedAt: new Date('2025-01-01T10:00:00Z'),
      };
      em.findOne.mockImplementation(async (entity) => {
        if (entity === TunnelSession) return mockSession;
        if (entity === UsageQuota) return null;
        return null;
      });

      em.persist.mockImplementation(() => em);

      await service.closeSession('session-123', {
        bytes_in: 1048576, // 1 MB
        bytes_out: 2097152, // 2 MB
      });

      expect(em.persist).toHaveBeenCalled();
    });

    it('should update existing usage quota', async () => {
      const existingQuota = {
        user: ref(mockUser),
        year: 2025,
        month: 1,
        bandwidthUsedMb: 10,
        tunnelMinutes: 30,
      };
      const mockSession = {
        id: 'session-123',
        status: SessionStatus.ACTIVE,
        user: ref(mockUser),
        connectedAt: new Date('2025-01-01T10:00:00Z'),
      };
      em.findOne.mockImplementation(async (entity) => {
        if (entity === TunnelSession) return mockSession;
        if (entity === UsageQuota) return existingQuota;
        return null;
      });

      await service.closeSession('session-123', {
        bytes_in: 1048576, // 1 MB
        bytes_out: 2097152, // 2 MB
      });

      // 3 MB added to existing 10 MB
      expect(existingQuota.bandwidthUsedMb).toBeCloseTo(13, 1);
    });
  });

  describe('addRequests', () => {
    it('should store HTTP requests for session', async () => {
      const mockSession = { id: 'session-123' };
      em.findOne.mockResolvedValue(mockSession);

      const persistedRequests: HttpRequest[] = [];
      em.persist.mockImplementation((entity) => {
        persistedRequests.push(entity as HttpRequest);
        return em;
      });

      const result = await service.addRequests('session-123', {
        requests: [
          {
            method: 'GET',
            path: '/api/test',
            query_string: 'foo=bar',
            request_headers: Buffer.from(
              '{"content-type":"application/json"}'
            ).toString('base64'),
            response_status: 200,
            duration_ms: 150,
            timestamp: 1704067200,
          },
          {
            method: 'POST',
            path: '/api/data',
            request_headers: Buffer.from('{}').toString('base64'),
            request_body: Buffer.from('{"test":true}').toString('base64'),
            response_status: 201,
            response_headers: Buffer.from('{}').toString('base64'),
            response_body: Buffer.from('{"id":1}').toString('base64'),
            duration_ms: 250,
            timestamp: 1704067300,
          },
        ],
      });

      expect(result).toEqual({ stored: 2 });
      expect(persistedRequests).toHaveLength(2);
      expect(em.flush).toHaveBeenCalled();
    });

    it('should throw NotFoundException if session not found', async () => {
      em.findOne.mockResolvedValue(null);

      await expect(
        service.addRequests('unknown-session', { requests: [] })
      ).rejects.toThrow(
        new NotFoundException('Session unknown-session not found')
      );
    });

    it('should decode base64 request/response bodies', async () => {
      const mockSession = { id: 'session-123' };
      em.findOne.mockResolvedValue(mockSession);

      let persistedRequest: HttpRequest | null = null;
      em.persist.mockImplementation((entity) => {
        persistedRequest = entity as HttpRequest;
        return em;
      });

      await service.addRequests('session-123', {
        requests: [
          {
            method: 'POST',
            path: '/api/test',
            request_headers: Buffer.from('{}').toString('base64'),
            request_body: Buffer.from('request body data').toString('base64'),
            response_status: 200,
            response_body: Buffer.from('response body data').toString('base64'),
            duration_ms: 100,
            timestamp: 1704067200,
          },
        ],
      });

      expect(persistedRequest).toBeTruthy();
      expect(persistedRequest?.requestBody?.toString()).toBe(
        'request body data'
      );
      expect(persistedRequest?.responseBody?.toString()).toBe(
        'response body data'
      );
    });

    it('should handle requests without optional fields', async () => {
      const mockSession = { id: 'session-123' };
      em.findOne.mockResolvedValue(mockSession);

      let persistedRequest: HttpRequest | null = null;
      em.persist.mockImplementation((entity) => {
        persistedRequest = entity as HttpRequest;
        return em;
      });

      await service.addRequests('session-123', {
        requests: [
          {
            method: 'GET',
            path: '/health',
            request_headers: Buffer.from('{}').toString('base64'),
            response_status: 200,
            duration_ms: 10,
            timestamp: 1704067200,
          },
        ],
      });

      expect(persistedRequest).toBeTruthy();
      expect(persistedRequest?.requestBody).toBeUndefined();
      expect(persistedRequest?.responseBody).toBeUndefined();
      expect(persistedRequest?.queryString).toBeUndefined();
    });

    it('should mark body as truncated when original size exceeds limit', async () => {
      const mockSession = { id: 'session-123' };
      em.findOne.mockResolvedValue(mockSession);

      let persistedRequest: HttpRequest | null = null;
      em.persist.mockImplementation((entity) => {
        persistedRequest = entity as HttpRequest;
        return em;
      });

      await service.addRequests('session-123', {
        requests: [
          {
            method: 'POST',
            path: '/upload',
            request_headers: Buffer.from('{}').toString('base64'),
            response_status: 200,
            duration_ms: 500,
            timestamp: 1704067200,
            original_request_size: 100000, // > 65536
            original_response_size: 50000,
          },
        ],
      });

      expect(persistedRequest?.bodyTruncated).toBe(true);
      expect(persistedRequest?.originalRequestSize).toBe(100000);
    });

    it('should convert timestamp to Date object', async () => {
      const mockSession = { id: 'session-123' };
      em.findOne.mockResolvedValue(mockSession);

      let persistedRequest: HttpRequest | null = null;
      em.persist.mockImplementation((entity) => {
        persistedRequest = entity as HttpRequest;
        return em;
      });

      await service.addRequests('session-123', {
        requests: [
          {
            method: 'GET',
            path: '/test',
            request_headers: Buffer.from('{}').toString('base64'),
            response_status: 200,
            duration_ms: 10,
            timestamp: 1704067200, // 2024-01-01 00:00:00 UTC
          },
        ],
      });

      expect(persistedRequest?.timestamp).toEqual(new Date(1704067200 * 1000));
    });

    it('should handle invalid JSON in headers gracefully', async () => {
      const mockSession = { id: 'session-123' };
      em.findOne.mockResolvedValue(mockSession);

      let persistedRequest: HttpRequest | null = null;
      em.persist.mockImplementation((entity) => {
        persistedRequest = entity as HttpRequest;
        return em;
      });

      await service.addRequests('session-123', {
        requests: [
          {
            method: 'GET',
            path: '/test',
            request_headers: Buffer.from('not valid json').toString('base64'),
            response_status: 200,
            duration_ms: 10,
            timestamp: 1704067200,
          },
        ],
      });

      expect(persistedRequest?.requestHeaders).toEqual({});
    });
  });

  describe('registerRelay', () => {
    it('should register a new relay', async () => {
      em.findOne.mockResolvedValue(null);

      let persistedRelay: RelayServer | null = null;
      em.persist.mockImplementation((entity) => {
        persistedRelay = entity as RelayServer;
        return em;
      });

      const result = await service.registerRelay('relay-1', {
        ws_port: 8444,
        http_port: 9444,
        base_domain: 'noverlink.app',
        ip_address: '10.0.0.1',
        version: '1.0.0',
      });

      expect(result).toEqual({
        relay_id: 'relay-1',
        status: RelayStatus.ONLINE,
      });
      expect(persistedRelay).toBeTruthy();
      expect(persistedRelay?.relayId).toBe('relay-1');
      expect(persistedRelay?.wsPort).toBe(8444);
      expect(persistedRelay?.httpPort).toBe(9444);
      expect(persistedRelay?.baseDomain).toBe('noverlink.app');
      expect(persistedRelay?.status).toBe(RelayStatus.ONLINE);
      expect(em.persist).toHaveBeenCalled();
      expect(em.flush).toHaveBeenCalled();
    });

    it('should update existing relay on re-registration', async () => {
      const existingRelay = {
        relayId: 'relay-1',
        wsPort: 8000,
        httpPort: 9000,
        baseDomain: 'old.domain',
        status: RelayStatus.OFFLINE,
        lastHeartbeatAt: new Date('2025-01-01'),
      } as unknown as RelayServer;

      em.findOne.mockResolvedValue(existingRelay);

      const result = await service.registerRelay('relay-1', {
        ws_port: 8444,
        http_port: 9444,
        base_domain: 'noverlink.app',
        version: '2.0.0',
      });

      expect(result.status).toBe(RelayStatus.ONLINE);
      expect(existingRelay.wsPort).toBe(8444);
      expect(existingRelay.httpPort).toBe(9444);
      expect(existingRelay.baseDomain).toBe('noverlink.app');
      expect(existingRelay.status).toBe(RelayStatus.ONLINE);
      expect(em.persist).not.toHaveBeenCalled(); // Existing entity, no need to persist
      expect(em.flush).toHaveBeenCalled();
    });
  });

  describe('heartbeat', () => {
    it('should update relay heartbeat and session count', async () => {
      const existingRelay = {
        relayId: 'relay-1',
        status: RelayStatus.ONLINE,
        lastHeartbeatAt: new Date('2025-01-01'),
        activeSessions: 0,
      } as unknown as RelayServer;

      em.findOne.mockResolvedValue(existingRelay);

      const result = await service.heartbeat('relay-1', {
        active_sessions: 5,
      });

      expect(result).toEqual({ status: RelayStatus.ONLINE });
      expect(existingRelay.activeSessions).toBe(5);
      expect(existingRelay.lastHeartbeatAt.getTime()).toBeGreaterThan(
        new Date('2025-01-01').getTime()
      );
      expect(em.flush).toHaveBeenCalled();
    });

    it('should throw NotFoundException if relay not found', async () => {
      em.findOne.mockResolvedValue(null);

      await expect(
        service.heartbeat('unknown-relay', { active_sessions: 0 })
      ).rejects.toThrow(new NotFoundException('Relay unknown-relay not found'));
    });

    it('should set relay status to online on heartbeat', async () => {
      const existingRelay = {
        relayId: 'relay-1',
        status: RelayStatus.OFFLINE,
        lastHeartbeatAt: new Date('2025-01-01'),
        activeSessions: 0,
      } as unknown as RelayServer;

      em.findOne.mockResolvedValue(existingRelay);

      await service.heartbeat('relay-1', { active_sessions: 2 });

      expect(existingRelay.status).toBe(RelayStatus.ONLINE);
    });
  });

  describe('setRelayOffline', () => {
    it('should set relay status to offline', async () => {
      const existingRelay = {
        relayId: 'relay-1',
        status: RelayStatus.ONLINE,
        activeSessions: 5,
      } as unknown as RelayServer;

      em.findOne.mockResolvedValue(existingRelay);

      await service.setRelayOffline('relay-1');

      expect(existingRelay.status).toBe(RelayStatus.OFFLINE);
      expect(existingRelay.activeSessions).toBe(0);
      expect(em.flush).toHaveBeenCalled();
    });

    it('should do nothing if relay not found', async () => {
      em.findOne.mockResolvedValue(null);

      await service.setRelayOffline('unknown-relay');

      expect(em.flush).not.toHaveBeenCalled();
    });
  });

  // Note: cleanupStaleRelays is tested via integration tests as it uses
  // @EnsureRequestContext() decorator which requires a full MikroORM instance
});
