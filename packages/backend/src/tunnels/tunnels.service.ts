import * as crypto from 'node:crypto';

import { Injectable } from '@nestjs/common';
import type { User } from '@noverlink/backend-shared';

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
  subdomain: string | null;
  ticket_id: string;
  exp: number;
  sig?: string;
}

@Injectable()
export class TunnelsService {
  constructor(private readonly appConfigService: AppConfigService) {}

  /**
   * Generate a connection ticket for the CLI
   *
   * The ticket is signed with HMAC-SHA256 and can be verified by the relay
   * without needing to call back to the backend.
   */
  createTicket(user: User, subdomain?: string): TicketResponse {
    const { ticketSecret, relayUrl } = this.appConfigService.tunnel;

    const expiresIn = 60; // 60 seconds
    const ticketId = crypto.randomUUID();

    // Build payload (without signature)
    const payload: TicketPayload = {
      user_id: user.id,
      plan: user.plan,
      max_tunnels: user.maxTunnels,
      subdomain: subdomain || null,
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
}
