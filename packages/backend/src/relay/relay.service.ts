import { EnsureRequestContext, MikroORM } from '@mikro-orm/core';
import { EntityManager, ref } from '@mikro-orm/postgresql';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import {
  Domain,
  HttpRequest,
  SessionStatus,
  TunnelSession,
  UsageQuota,
  User,
} from '@noverlink/backend-shared';

import {
  CloseSessionDto,
  CreateSessionDto,
  CreateSessionResponse,
  HttpRequestBatchDto,
  UpdateStatsDto,
} from './dto';

/** Sessions not seen for this duration are considered stale (3 minutes) */
const STALE_SESSION_THRESHOLD_MS = 3 * 60 * 1000;

/** How often to run the cleanup task (1 minute) */
const CLEANUP_INTERVAL_MS = 60 * 1000;

@Injectable()
export class RelayService {
  private readonly logger = new Logger(RelayService.name);

  constructor(
    // Used by @EnsureRequestContext() decorator via reflection
    readonly orm: MikroORM,
    private readonly em: EntityManager
  ) {}

  async createSession(
    relayId: string,
    dto: CreateSessionDto
  ): Promise<CreateSessionResponse> {
    const { user_id, subdomain, local_port, client_ip, client_version } = dto;

    // Find user
    const user = await this.em.findOne(User, { id: user_id });
    if (!user) {
      throw new NotFoundException(`User ${user_id} not found`);
    }

    // Find domain (should exist, created by TunnelsService.createTicket)
    const domain = await this.em.findOne(Domain, { hostname: subdomain });
    if (!domain) {
      throw new NotFoundException(`Domain ${subdomain} not found`);
    }

    // Create session
    const session = new TunnelSession();
    session.user = ref(user);
    session.domain = ref(domain);
    session.localPort = local_port;
    session.relayId = relayId;
    session.clientIp = client_ip;
    session.clientVersion = client_version;

    this.em.persist(session);
    await this.em.flush();

    this.logger.log(
      `Session created: ${session.id} for user ${user_id} @ ${subdomain}`
    );

    return { session_id: session.id };
  }

  async updateStats(sessionId: string, dto: UpdateStatsDto): Promise<void> {
    const session = await this.em.findOne(TunnelSession, { id: sessionId });

    if (!session) {
      throw new NotFoundException(`Session ${sessionId} not found`);
    }

    session.bytesIn = BigInt(dto.bytes_in);
    session.bytesOut = BigInt(dto.bytes_out);
    session.lastSeenAt = new Date();

    await this.em.flush();

    this.logger.debug(
      `Stats updated for session ${sessionId}: in=${dto.bytes_in}, out=${dto.bytes_out}`
    );
  }

  async closeSession(sessionId: string, dto: CloseSessionDto): Promise<void> {
    const session = await this.em.findOne(TunnelSession, { id: sessionId });

    if (!session) {
      throw new NotFoundException(`Session ${sessionId} not found`);
    }

    session.status = SessionStatus.CLOSED;
    session.disconnectedAt = new Date();
    session.bytesIn = BigInt(dto.bytes_in);
    session.bytesOut = BigInt(dto.bytes_out);

    // Update usage quota
    await this.updateUsageQuota(session, dto.bytes_in, dto.bytes_out);

    await this.em.flush();

    this.logger.log(`Session closed: ${sessionId}`);
  }

  async addRequests(
    sessionId: string,
    dto: HttpRequestBatchDto
  ): Promise<{ stored: number }> {
    const session = await this.em.findOne(TunnelSession, { id: sessionId });

    if (!session) {
      throw new NotFoundException(`Session ${sessionId} not found`);
    }

    let stored = 0;

    for (const req of dto.requests) {
      const httpRequest = new HttpRequest();
      httpRequest.session = ref(session);
      httpRequest.method = req.method;
      httpRequest.path = req.path;
      httpRequest.queryString = req.query_string;
      httpRequest.requestHeaders = this.decodeJson(req.request_headers);
      httpRequest.requestBody = req.request_body
        ? Buffer.from(req.request_body, 'base64')
        : undefined;
      httpRequest.responseStatus = req.response_status;
      httpRequest.responseHeaders = req.response_headers
        ? this.decodeJson(req.response_headers)
        : undefined;
      httpRequest.responseBody = req.response_body
        ? Buffer.from(req.response_body, 'base64')
        : undefined;
      httpRequest.durationMs = req.duration_ms;
      httpRequest.timestamp = new Date(req.timestamp * 1000);
      httpRequest.originalRequestSize = req.original_request_size;
      httpRequest.originalResponseSize = req.original_response_size;
      httpRequest.bodyTruncated =
        (req.original_request_size !== undefined &&
          req.original_request_size > 65536) ||
        (req.original_response_size !== undefined &&
          req.original_response_size > 65536);

      this.em.persist(httpRequest);
      stored++;
    }

    await this.em.flush();

    this.logger.debug(`Stored ${stored} requests for session ${sessionId}`);

    return { stored };
  }

  private decodeJson(base64: string): Record<string, string> {
    try {
      const json = Buffer.from(base64, 'base64').toString('utf-8');
      return JSON.parse(json) as Record<string, string>;
    } catch {
      return {};
    }
  }

  private async updateUsageQuota(
    session: TunnelSession,
    bytesIn: number,
    bytesOut: number
  ): Promise<void> {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    let quota = await this.em.findOne(UsageQuota, {
      user: session.user,
      year,
      month,
    });

    if (!quota) {
      quota = new UsageQuota();
      quota.user = session.user;
      quota.year = year;
      quota.month = month;
      this.em.persist(quota);
    }

    // Update bandwidth (convert bytes to MB)
    const totalMb = (bytesIn + bytesOut) / (1024 * 1024);
    quota.bandwidthUsedMb += totalMb;

    // Calculate tunnel minutes
    if (session.connectedAt && session.disconnectedAt) {
      const minutes =
        (session.disconnectedAt.getTime() - session.connectedAt.getTime()) /
        (1000 * 60);
      quota.tunnelMinutes += minutes;
    }
  }

  /**
   * Scheduled task to cleanup stale sessions.
   * Runs every minute.
   */
  @Interval(CLEANUP_INTERVAL_MS)
  async cleanupStaleSessionsTask(): Promise<void> {
    await this.cleanupStaleSessions();
  }

  /**
   * Cleanup stale sessions that haven't received stats updates.
   * This handles cases where Relay crashes without notifying Backend.
   */
  @EnsureRequestContext()
  async cleanupStaleSessions(): Promise<void> {
    const threshold = new Date(Date.now() - STALE_SESSION_THRESHOLD_MS);

    // Find active sessions that haven't been seen recently
    const staleSessions = await this.em.find(TunnelSession, {
      status: SessionStatus.ACTIVE,
      lastSeenAt: { $lt: threshold },
    });

    if (staleSessions.length === 0) {
      return;
    }

    this.logger.warn(
      `Found ${staleSessions.length} stale session(s), marking as closed`
    );

    for (const session of staleSessions) {
      session.status = SessionStatus.CLOSED;
      session.disconnectedAt = new Date();

      // Update usage quota with final stats
      await this.updateUsageQuota(
        session,
        Number(session.bytesIn),
        Number(session.bytesOut)
      );

      this.logger.log(
        `Closed stale session: ${session.id} (last seen: ${session.lastSeenAt.toISOString()})`
      );
    }

    await this.em.flush();
  }
}
