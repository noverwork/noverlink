import * as crypto from 'node:crypto';

import { type Loaded, ref } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/postgresql';
import { BadRequestException, Injectable } from '@nestjs/common';
import {
  Domain,
  SessionStatus,
  TunnelSession,
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
  ticket_id: string;
  exp: number;
  sig?: string;
}

// Word lists for random subdomain generation (similar to petname)
const ADJECTIVES = [
  'happy', 'sunny', 'lazy', 'quick', 'calm', 'bold', 'cool', 'warm',
  'wild', 'wise', 'kind', 'neat', 'fair', 'keen', 'soft', 'safe',
];
const NOUNS = [
  'cat', 'dog', 'fox', 'owl', 'bee', 'ant', 'elk', 'bat',
  'cod', 'eel', 'jay', 'ram', 'yak', 'hen', 'pig', 'cow',
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
    user: Loaded<User, never>,
    requestedSubdomain?: string
  ): Promise<TicketResponse> {
    const { ticketSecret, relayUrl } = this.appConfigService.tunnel;

    // Allocate subdomain
    const subdomain = await this.allocateSubdomain(user, requestedSubdomain);

    const expiresIn = 60; // 60 seconds
    const ticketId = crypto.randomUUID();

    // Build payload (without signature)
    const payload: TicketPayload = {
      user_id: user.id,
      plan: user.plan,
      max_tunnels: user.maxTunnels,
      subdomain,
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
    requested?: string
  ): Promise<string> {
    const subdomain = requested
      ? await this.validateRequestedSubdomain(user, requested)
      : await this.generateAvailableSubdomain();

    // Ensure Domain entity exists
    await this.ensureDomainEntity(user, subdomain);

    return subdomain;
  }

  private async validateRequestedSubdomain(
    user: Loaded<User, never>,
    subdomain: string
  ): Promise<string> {
    // Check if subdomain exists
    const domain = await this.em.findOne(Domain, { hostname: subdomain });

    if (domain) {
      // Reserved by another user
      if (domain.user.id !== user.id && domain.isReserved) {
        throw new BadRequestException(
          `Subdomain '${subdomain}' is reserved by another user`
        );
      }
    }

    // Check if subdomain has active session
    const activeSession = await this.em.findOne(TunnelSession, {
      domain: { hostname: subdomain },
      status: SessionStatus.ACTIVE,
    });

    if (activeSession) {
      throw new BadRequestException(`Subdomain '${subdomain}' is currently in use`);
    }

    return subdomain;
  }

  private async generateAvailableSubdomain(): Promise<string> {
    const maxAttempts = 50;

    for (let i = 0; i < maxAttempts; i++) {
      const subdomain = this.generateRandomSubdomain();

      // Check not reserved by someone else
      const domain = await this.em.findOne(Domain, {
        hostname: subdomain,
        isReserved: true,
      });
      if (domain) continue;

      // Check not in use
      const activeSession = await this.em.findOne(TunnelSession, {
        domain: { hostname: subdomain },
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
    subdomain: string
  ): Promise<Domain> {
    let domain = await this.em.findOne(Domain, { hostname: subdomain });

    if (!domain) {
      // Create new domain
      domain = this.em.create(Domain, {
        user: user.id,
        hostname: subdomain,
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
    const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
    return `${adj}-${noun}`;
  }
}
