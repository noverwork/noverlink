import * as crypto from 'node:crypto';

import { type FilterQuery, type Loaded, ref } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/postgresql';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Domain,
  HttpRequest,
  SessionStatus,
  TunnelSession,
  UsageQuota,
  User,
} from '@noverlink/backend-shared';

import { AppConfigService } from '../app-config';

export interface TicketResponse {
  ticket: string;
  relay_url: string;
  expires_in: number;
}

interface TicketPayload {
  user_id: string;
  plan: string;
  max_tunnels: number;
  subdomain: string;
  base_domain: string;
  ticket_id: string;
  exp: number;
  sig?: string;
}

// Word lists for random subdomain generation (similar to petname)
const ADJECTIVES = [
  'happy',
  'sunny',
  'lazy',
  'quick',
  'calm',
  'bold',
  'cool',
  'warm',
  'wild',
  'wise',
  'kind',
  'neat',
  'fair',
  'keen',
  'soft',
  'safe',
];
const NOUNS = [
  'cat',
  'dog',
  'fox',
  'owl',
  'bee',
  'ant',
  'elk',
  'bat',
  'cod',
  'eel',
  'jay',
  'ram',
  'yak',
  'hen',
  'pig',
  'cow',
];

@Injectable()
export class TunnelsService {
  constructor(
    private readonly em: EntityManager,
    private readonly appConfigService: AppConfigService
  ) {}

  /**
   * Generate a connection ticket for the CLI
   *
   * The ticket is signed with HMAC-SHA256 and can be verified by the relay
   * without needing to call back to the backend.
   */
  async createTicket(
    user: Loaded<User, 'plan'>,
    requestedSubdomain?: string
  ): Promise<TicketResponse> {
    const { ticketSecret, relayUrl } = this.appConfigService.tunnel;

    // Get plan details (baseDomain, maxTunnels)
    const plan = user.plan.$;
    const baseDomain = plan.baseDomain;

    // Allocate subdomain
    const subdomain = await this.allocateSubdomain(
      user,
      baseDomain,
      requestedSubdomain
    );

    const expiresIn = 60; // 60 seconds
    const ticketId = crypto.randomUUID();

    // Build payload (without signature)
    const payload: TicketPayload = {
      user_id: user.id,
      plan: plan.id,
      max_tunnels: plan.maxTunnels,
      subdomain,
      base_domain: baseDomain,
      ticket_id: ticketId,
      exp: Math.floor(Date.now() / 1000) + expiresIn,
    };

    // Sign the payload
    const payloadJson = JSON.stringify(payload);
    const signature = crypto
      .createHmac('sha256', ticketSecret)
      .update(payloadJson)
      .digest('hex');

    // Add signature to payload
    const signedPayload: TicketPayload = { ...payload, sig: signature };

    // Encode as base64url
    const ticket = Buffer.from(JSON.stringify(signedPayload)).toString(
      'base64url'
    );

    return {
      ticket,
      relay_url: relayUrl,
      expires_in: expiresIn,
    };
  }

  /**
   * Allocate a subdomain for the tunnel
   *
   * If user specifies a subdomain:
   *   - Check if reserved by another user → reject
   *   - Check if currently in use (active session) → reject
   *   - Otherwise → allow and create/update Domain entity
   *
   * If no subdomain specified:
   *   - Generate random subdomain that's not reserved and not in use
   *   - Create Domain entity for tracking
   */
  private async allocateSubdomain(
    user: Loaded<User, never>,
    baseDomain: string,
    requested?: string
  ): Promise<string> {
    const subdomain = requested
      ? await this.validateRequestedSubdomain(user, requested, baseDomain)
      : await this.generateAvailableSubdomain(baseDomain);

    // Ensure Domain entity exists
    await this.ensureDomainEntity(user, subdomain, baseDomain);

    return subdomain;
  }

  private async validateRequestedSubdomain(
    user: Loaded<User, never>,
    subdomain: string,
    baseDomain: string
  ): Promise<string> {
    // Check if subdomain exists on this base domain
    const domain = await this.em.findOne(Domain, {
      hostname: subdomain,
      baseDomain,
    });

    if (domain) {
      // Reserved by another user
      if (domain.user.id !== user.id && domain.isReserved) {
        throw new BadRequestException(
          `Subdomain '${subdomain}' is reserved by another user`
        );
      }
    }

    // Check if subdomain has active session on this base domain
    const activeSession = await this.em.findOne(TunnelSession, {
      domain: { hostname: subdomain, baseDomain },
      status: SessionStatus.ACTIVE,
    });

    if (activeSession) {
      throw new BadRequestException(
        `Subdomain '${subdomain}' is currently in use`
      );
    }

    return subdomain;
  }

  private async generateAvailableSubdomain(
    baseDomain: string
  ): Promise<string> {
    const maxAttempts = 50;

    for (let i = 0; i < maxAttempts; i++) {
      const subdomain = this.generateRandomSubdomain();

      // Check not reserved by someone else on this base domain
      const domain = await this.em.findOne(Domain, {
        hostname: subdomain,
        baseDomain,
        isReserved: true,
      });
      if (domain) continue;

      // Check not in use on this base domain
      const activeSession = await this.em.findOne(TunnelSession, {
        domain: { hostname: subdomain, baseDomain },
        status: SessionStatus.ACTIVE,
      });
      if (activeSession) continue;

      return subdomain;
    }

    // Fallback: timestamp-based
    return `tunnel-${Date.now() % 100000}`;
  }

  /**
   * Ensure Domain entity exists for this subdomain
   * - If doesn't exist → create new (non-reserved)
   * - If exists but belongs to different user (non-reserved) → reassign to current user
   * - If exists and belongs to current user → do nothing
   */
  private async ensureDomainEntity(
    user: Loaded<User, never>,
    subdomain: string,
    baseDomain: string
  ): Promise<Domain> {
    let domain = await this.em.findOne(Domain, {
      hostname: subdomain,
      baseDomain,
    });

    if (!domain) {
      // Create new domain
      domain = this.em.create(Domain, {
        user: user.id,
        hostname: subdomain,
        baseDomain,
        isReserved: false,
      });
      await this.em.persistAndFlush(domain);
    } else if (domain.user.id !== user.id && !domain.isReserved) {
      // Reassign non-reserved domain to current user
      domain.user = ref(this.em.getReference(User, user.id));
      await this.em.persistAndFlush(domain);
    }

    return domain;
  }

  private generateRandomSubdomain(): string {
    const adj = ADJECTIVES[crypto.randomInt(ADJECTIVES.length)];
    const noun = NOUNS[crypto.randomInt(NOUNS.length)];
    return `${adj}-${noun}`;
  }

  // ─── Session Query Methods ─────────────────────────────────────

  /**
   * List tunnel sessions for a user with cursor-based pagination
   */
  async listSessions(
    userId: string,
    status?: SessionStatus,
    cursor?: string,
    limit = 20
  ): Promise<{
    sessions: Loaded<TunnelSession, 'domain'>[];
    nextCursor: string | null;
  }> {
    const where: FilterQuery<TunnelSession> = { user: userId };
    if (status) {
      where.status = status;
    }

    // Decode cursor for pagination
    if (cursor) {
      try {
        const decoded = JSON.parse(
          Buffer.from(cursor, 'base64url').toString()
        ) as { id: string; t: string };
        where.$or = [
          { connectedAt: { $lt: new Date(decoded.t) } },
          { connectedAt: new Date(decoded.t), id: { $lt: decoded.id } },
        ];
      } catch {
        throw new BadRequestException('Invalid cursor format');
      }
    }

    const sessions = await this.em.find(TunnelSession, where, {
      populate: ['domain'],
      orderBy: { connectedAt: 'DESC', id: 'DESC' },
      limit: limit + 1, // Fetch one extra to check hasMore
    });

    const hasMore = sessions.length > limit;
    if (hasMore) {
      sessions.pop();
    }

    const nextCursor =
      hasMore && sessions.length > 0
        ? Buffer.from(
            JSON.stringify({
              id: sessions[sessions.length - 1].id,
              t: sessions[sessions.length - 1].connectedAt.toISOString(),
            })
          ).toString('base64url')
        : null;

    return { sessions, nextCursor };
  }

  /**
   * Get a single session by ID (with ownership check)
   */
  async getSession(
    userId: string,
    sessionId: string
  ): Promise<Loaded<TunnelSession, 'domain'>> {
    const session = await this.em.findOne(
      TunnelSession,
      { id: sessionId, user: userId },
      { populate: ['domain'] }
    );

    if (!session) {
      throw new NotFoundException(`Session ${sessionId} not found`);
    }

    return session;
  }

  /**
   * Get HTTP request logs for a session with cursor-based pagination
   */
  async getSessionLogs(
    userId: string,
    sessionId: string,
    cursor?: string,
    limit = 50,
    method?: string
  ): Promise<{ logs: HttpRequest[]; nextCursor: string | null }> {
    // Verify session ownership
    const session = await this.em.findOne(TunnelSession, {
      id: sessionId,
      user: userId,
    });

    if (!session) {
      throw new NotFoundException(`Session ${sessionId} not found`);
    }

    const where: FilterQuery<HttpRequest> = { session: sessionId };
    if (method) {
      where.method = method.toUpperCase();
    }

    // Decode cursor for pagination
    if (cursor) {
      try {
        const decoded = JSON.parse(
          Buffer.from(cursor, 'base64url').toString()
        ) as { id: string; t: string };
        where.$or = [
          { timestamp: { $lt: new Date(decoded.t) } },
          { timestamp: new Date(decoded.t), id: { $lt: decoded.id } },
        ];
      } catch {
        throw new BadRequestException('Invalid cursor format');
      }
    }

    const logs = await this.em.find(HttpRequest, where, {
      orderBy: { timestamp: 'DESC', id: 'DESC' },
      limit: limit + 1,
    });

    const hasMore = logs.length > limit;
    if (hasMore) {
      logs.pop();
    }

    const nextCursor =
      hasMore && logs.length > 0
        ? Buffer.from(
            JSON.stringify({
              id: logs[logs.length - 1].id,
              t: logs[logs.length - 1].timestamp.toISOString(),
            })
          ).toString('base64url')
        : null;

    return { logs, nextCursor };
  }

  /**
   * Get aggregate stats for a user
   */
  async getStats(userId: string): Promise<{
    activeSessions: number;
    totalRequests: number;
    bandwidthMb: number;
    tunnelMinutes: number;
  }> {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    const [activeSessions, quota] = await Promise.all([
      this.em.count(TunnelSession, {
        user: userId,
        status: SessionStatus.ACTIVE,
      }),
      this.em.findOne(UsageQuota, { user: userId, year, month }),
    ]);

    return {
      activeSessions,
      totalRequests: quota?.requestCount ?? 0,
      bandwidthMb: quota?.bandwidthUsedMb ?? 0,
      tunnelMinutes: quota?.tunnelMinutes ?? 0,
    };
  }

  /**
   * Get request count for a session
   */
  async getSessionRequestCount(sessionId: string): Promise<number> {
    return this.em.count(HttpRequest, { session: sessionId });
  }
}
