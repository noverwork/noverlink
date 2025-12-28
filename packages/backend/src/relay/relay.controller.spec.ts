import { Test, TestingModule } from '@nestjs/testing';
import { RelayStatus } from '@noverlink/backend-shared';

import { AppConfigService } from '../app-config';
import { RelayAuthGuard } from './guards';
import { RelayController } from './relay.controller';
import { RelayService } from './relay.service';

describe('RelayController', () => {
  let controller: RelayController;
  let relayService: jest.Mocked<RelayService>;

  beforeEach(async () => {
    const mockRelayService = {
      registerRelay: jest.fn(),
      heartbeat: jest.fn(),
      createSession: jest.fn(),
      closeSession: jest.fn(),
      addRequests: jest.fn(),
    };

    const mockAppConfigService = {
      relay: {
        secret: 'test-secret',
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RelayController],
      providers: [
        { provide: RelayService, useValue: mockRelayService },
        { provide: AppConfigService, useValue: mockAppConfigService },
      ],
    })
      .overrideGuard(RelayAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<RelayController>(RelayController);
    relayService = module.get(RelayService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createSession', () => {
    it('should create a session with relay id from header', async () => {
      relayService.createSession.mockResolvedValue({ session_id: 'session-123' });

      const dto = {
        user_id: 'user-123',
        subdomain: 'test-subdomain',
        local_port: 3000,
        client_ip: '192.168.1.1',
        client_version: '1.0.0',
      };

      const result = await controller.createSession('relay-1', dto);

      expect(result).toEqual({ session_id: 'session-123' });
      expect(relayService.createSession).toHaveBeenCalledWith('relay-1', dto);
    });

    it('should pass all dto fields to service', async () => {
      relayService.createSession.mockResolvedValue({ session_id: 'session-456' });

      const dto = {
        user_id: 'user-456',
        subdomain: 'my-tunnel',
        local_port: 8080,
        client_ip: '10.0.0.1',
        client_version: '2.0.0',
      };

      await controller.createSession('relay-2', dto);

      expect(relayService.createSession).toHaveBeenCalledWith('relay-2', {
        user_id: 'user-456',
        subdomain: 'my-tunnel',
        local_port: 8080,
        client_ip: '10.0.0.1',
        client_version: '2.0.0',
      });
    });

    it('should propagate service errors', async () => {
      relayService.createSession.mockRejectedValue(new Error('User not found'));

      await expect(
        controller.createSession('relay-1', {
          user_id: 'unknown',
          subdomain: 'test',
          local_port: 3000,
          client_ip: '127.0.0.1',
        })
      ).rejects.toThrow('User not found');
    });
  });

  describe('closeSession', () => {
    it('should close session with provided stats', async () => {
      relayService.closeSession.mockResolvedValue(undefined);

      const dto = {
        bytes_in: 1024,
        bytes_out: 2048,
      };

      await controller.closeSession('session-123', dto);

      expect(relayService.closeSession).toHaveBeenCalledWith('session-123', dto);
    });

    it('should propagate service errors', async () => {
      relayService.closeSession.mockRejectedValue(new Error('Session not found'));

      await expect(
        controller.closeSession('unknown', { bytes_in: 0, bytes_out: 0 })
      ).rejects.toThrow('Session not found');
    });
  });

  describe('addRequests', () => {
    it('should add requests to session', async () => {
      relayService.addRequests.mockResolvedValue({ stored: 5 });

      const dto = {
        requests: [
          {
            method: 'GET',
            path: '/api/test',
            request_headers: 'e30=', // base64 '{}'
            response_status: 200,
            duration_ms: 100,
            timestamp: 1704067200,
          },
        ],
      };

      const result = await controller.addRequests('session-123', dto);

      expect(result).toEqual({ stored: 5 });
      expect(relayService.addRequests).toHaveBeenCalledWith('session-123', dto);
    });

    it('should handle empty requests array', async () => {
      relayService.addRequests.mockResolvedValue({ stored: 0 });

      const result = await controller.addRequests('session-123', { requests: [] });

      expect(result).toEqual({ stored: 0 });
    });

    it('should propagate service errors', async () => {
      relayService.addRequests.mockRejectedValue(new Error('Session not found'));

      await expect(
        controller.addRequests('unknown', { requests: [] })
      ).rejects.toThrow('Session not found');
    });
  });

  describe('register', () => {
    it('should register relay with relay id from header', async () => {
      relayService.registerRelay.mockResolvedValue({
        relay_id: 'relay-1',
        status: RelayStatus.ONLINE,
      });

      const dto = {
        ws_port: 8444,
        http_port: 9444,
        base_domain: 'noverlink.app',
        ip_address: '10.0.0.1',
        version: '1.0.0',
      };

      const result = await controller.register('relay-1', dto);

      expect(result).toEqual({
        relay_id: 'relay-1',
        status: RelayStatus.ONLINE,
      });
      expect(relayService.registerRelay).toHaveBeenCalledWith('relay-1', dto);
    });

    it('should handle re-registration', async () => {
      relayService.registerRelay.mockResolvedValue({
        relay_id: 'relay-1',
        status: RelayStatus.ONLINE,
      });

      const dto = {
        ws_port: 8444,
        http_port: 9444,
        base_domain: 'noverlink.app',
      };

      await controller.register('relay-1', dto);

      expect(relayService.registerRelay).toHaveBeenCalledWith('relay-1', dto);
    });
  });

  describe('heartbeat', () => {
    it('should send heartbeat with relay id from header', async () => {
      relayService.heartbeat.mockResolvedValue({ status: RelayStatus.ONLINE });

      const dto = { active_sessions: 5 };

      const result = await controller.heartbeat('relay-1', dto);

      expect(result).toEqual({ status: RelayStatus.ONLINE });
      expect(relayService.heartbeat).toHaveBeenCalledWith('relay-1', dto);
    });

    it('should propagate service errors', async () => {
      relayService.heartbeat.mockRejectedValue(new Error('Relay not found'));

      await expect(
        controller.heartbeat('unknown', { active_sessions: 0 })
      ).rejects.toThrow('Relay not found');
    });
  });
});
