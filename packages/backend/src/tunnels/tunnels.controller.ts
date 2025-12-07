import type { Loaded } from '@mikro-orm/core';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { User } from '@noverlink/backend-shared';
import type { Request } from 'express';

import { CurrentUser, Public } from '../auth/decorators';
import { ListLogsQueryDto, ListSessionsQueryDto } from './dto';
import { CliAuthGuard } from './guards/cli-auth.guard';
import { type TicketResponse, TunnelsService } from './tunnels.service';

interface CreateTicketDto {
  subdomain?: string;
}

// Extend Request to include user from CLI auth (with plan populated)
interface AuthenticatedRequest extends Request {
  user: Loaded<User, 'plan'>;
}

@Controller('tunnels')
export class TunnelsController {
  constructor(private readonly tunnelsService: TunnelsService) {}

  // ─── Session Query Endpoints (JWT Auth) ────────────────────────

  /**
   * List tunnel sessions for the current user
   */
  @Get('sessions')
  async listSessions(
    @CurrentUser() user: Loaded<User, never>,
    @Query() query: ListSessionsQueryDto
  ) {
    const { sessions, nextCursor } = await this.tunnelsService.listSessions(
      user.id,
      query.status,
      query.cursor,
      query.limit
    );

    return {
      sessions: sessions.map((s) => {
        const domain = s.domain.$;
        return {
          id: s.id,
          subdomain: domain.hostname,
          baseDomain: domain.baseDomain,
          publicUrl: domain.publicUrl,
          localPort: s.localPort,
          status: s.status,
          connectedAt: s.connectedAt.toISOString(),
          disconnectedAt: s.disconnectedAt?.toISOString() ?? null,
          bytesIn: s.bytesIn.toString(),
          bytesOut: s.bytesOut.toString(),
          clientIp: s.clientIp,
        };
      }),
      nextCursor,
      hasMore: nextCursor !== null,
    };
  }

  /**
   * Get a single session by ID
   */
  @Get('sessions/:id')
  async getSession(
    @CurrentUser() user: Loaded<User, never>,
    @Param('id') sessionId: string
  ) {
    const s = await this.tunnelsService.getSession(user.id, sessionId);
    const requestCount = await this.tunnelsService.getSessionRequestCount(
      sessionId
    );

    const domain = s.domain.$;

    return {
      id: s.id,
      subdomain: domain.hostname,
      baseDomain: domain.baseDomain,
      publicUrl: domain.publicUrl,
      localPort: s.localPort,
      status: s.status,
      connectedAt: s.connectedAt.toISOString(),
      disconnectedAt: s.disconnectedAt?.toISOString() ?? null,
      bytesIn: s.bytesIn.toString(),
      bytesOut: s.bytesOut.toString(),
      clientIp: s.clientIp,
      clientVersion: s.clientVersion,
      requestCount,
    };
  }

  /**
   * Get HTTP request logs for a session
   */
  @Get('sessions/:id/logs')
  async getSessionLogs(
    @CurrentUser() user: Loaded<User, never>,
    @Param('id') sessionId: string,
    @Query() query: ListLogsQueryDto
  ) {
    const { logs, nextCursor } = await this.tunnelsService.getSessionLogs(
      user.id,
      sessionId,
      query.cursor,
      query.limit,
      query.method
    );

    return {
      logs: logs.map((l) => ({
        id: l.id,
        method: l.method,
        path: l.path,
        queryString: l.queryString,
        status: l.responseStatus,
        durationMs: l.durationMs,
        timestamp: l.timestamp.toISOString(),
      })),
      nextCursor,
      hasMore: nextCursor !== null,
    };
  }

  /**
   * Get aggregate stats for the current user
   */
  @Get('stats')
  async getStats(@CurrentUser() user: Loaded<User, never>) {
    return this.tunnelsService.getStats(user.id);
  }

  // ─── CLI Token Endpoints ───────────────────────────────────────

  /**
   * Get a connection ticket for the relay
   *
   * This endpoint uses CLI token authentication (nv_xxx)
   * instead of JWT authentication.
   */
  @Public() // Skip JWT guard, we use CliAuthGuard instead
  @UseGuards(CliAuthGuard)
  @Post('ticket')
  async createTicket(
    @Body() dto: CreateTicketDto,
    @Req() req: AuthenticatedRequest
  ): Promise<TicketResponse> {
    return this.tunnelsService.createTicket(req.user, dto.subdomain);
  }
}
