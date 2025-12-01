import * as crypto from 'node:crypto';

import { EntityManager } from '@mikro-orm/postgresql';
import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Domain, SessionStatus, TunnelSession, User, UserPlan } from '@noverlink/backend-shared';

import { AppConfigService } from '../app-config';
import { TunnelsService } from './tunnels.service';

describe('TunnelsService', () => {
  let service: TunnelsService;
  let em: jest.Mocked<EntityManager>;
  let appConfigService: jest.Mocked<AppConfigService>;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    plan: UserPlan.FREE,
    maxTunnels: 1,
  } as unknown as User;

  beforeEach(async () => {
    const mockEm = {
      findOne: jest.fn(),
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
    appConfigService = module.get(AppConfigService);
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
      expect(payload.plan).toBe(UserPlan.FREE);
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

      const result = await service.createTicket(mockUser as never, 'my-custom-subdomain');

      const decoded = Buffer.from(result.ticket, 'base64url').toString('utf-8');
      const payload = JSON.parse(decoded);

      expect(payload.subdomain).toBe('my-custom-subdomain');
    });

    it('should reject subdomain reserved by another user', async () => {
      const anotherUser = { id: 'another-user', isReserved: true };
      em.findOne.mockImplementation(async (entity, query) => {
        if (entity === Domain) {
          return { hostname: 'reserved-subdomain', user: anotherUser, isReserved: true };
        }
        return null;
      });

      await expect(
        service.createTicket(mockUser as never, 'reserved-subdomain')
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject subdomain currently in use', async () => {
      em.findOne.mockImplementation(async (entity, query) => {
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
      em.findOne.mockImplementation(async (entity, query) => {
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
      em.findOne.mockImplementation(async (entity, query) => {
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

      expect(em.create).toHaveBeenCalledWith(Domain, expect.objectContaining({
        user: 'user-123',
        hostname: 'new-subdomain',
        isReserved: false,
      }));
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

      const result = await service.createTicket(mockUser as never, 'my-reserved');

      expect(result).toHaveProperty('ticket');
    });
  });
});
