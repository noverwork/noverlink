import {
  Body,
  Controller,
  Headers,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { Public } from '../auth/decorators/public.decorator';
import {
  CloseSessionDto,
  CreateSessionDto,
  CreateSessionResponse,
  HeartbeatDto,
  HeartbeatResponse,
  HttpRequestBatchDto,
  RegisterRelayDto,
  RegisterRelayResponse,
  UpdateStatsDto,
} from './dto';
import { RelayAuthGuard } from './guards';
import { RelayService } from './relay.service';

@Controller('relay')
@Public() // Bypass JWT auth - uses relay secret instead
@UseGuards(RelayAuthGuard)
export class RelayController {
  constructor(private readonly relayService: RelayService) {}

  // ─── Relay Server Management ────────────────────────────────────

  @Post('register')
  async register(
    @Headers('x-relay-id') relayId: string,
    @Body() dto: RegisterRelayDto
  ): Promise<RegisterRelayResponse> {
    return this.relayService.registerRelay(relayId, dto);
  }

  @Post('heartbeat')
  async heartbeat(
    @Headers('x-relay-id') relayId: string,
    @Body() dto: HeartbeatDto
  ): Promise<HeartbeatResponse> {
    return this.relayService.heartbeat(relayId, dto);
  }

  // ─── Session Management ─────────────────────────────────────────

  @Post('sessions')
  async createSession(
    @Headers('x-relay-id') relayId: string,
    @Body() dto: CreateSessionDto
  ): Promise<CreateSessionResponse> {
    return this.relayService.createSession(relayId, dto);
  }

  @Patch('sessions/:id/stats')
  async updateStats(
    @Param('id') sessionId: string,
    @Body() dto: UpdateStatsDto
  ): Promise<void> {
    return this.relayService.updateStats(sessionId, dto);
  }

  @Patch('sessions/:id/close')
  async closeSession(
    @Param('id') sessionId: string,
    @Body() dto: CloseSessionDto
  ): Promise<void> {
    return this.relayService.closeSession(sessionId, dto);
  }

  @Post('sessions/:id/requests')
  async addRequests(
    @Param('id') sessionId: string,
    @Body() dto: HttpRequestBatchDto
  ): Promise<{ stored: number }> {
    return this.relayService.addRequests(sessionId, dto);
  }
}
