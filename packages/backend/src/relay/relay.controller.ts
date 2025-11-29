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
  HttpRequestBatchDto,
} from './dto';
import { RelayAuthGuard } from './guards';
import { RelayService } from './relay.service';

@Controller('relay')
@Public() // Bypass JWT auth - uses relay secret instead
@UseGuards(RelayAuthGuard)
export class RelayController {
  constructor(private readonly relayService: RelayService) {}

  @Post('sessions')
  async createSession(
    @Headers('x-relay-id') relayId: string,
    @Body() dto: CreateSessionDto
  ): Promise<CreateSessionResponse> {
    return this.relayService.createSession(relayId, dto);
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
