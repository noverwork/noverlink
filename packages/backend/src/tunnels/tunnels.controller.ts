import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import type { User } from '@noverlink/backend-shared';
import type { Request } from 'express';

import { Public } from '../auth/decorators';
import { CliAuthGuard } from './guards/cli-auth.guard';
import { type TicketResponse,TunnelsService } from './tunnels.service';

interface CreateTicketDto {
  subdomain?: string;
}

// Extend Request to include user from CLI auth
interface AuthenticatedRequest extends Request {
  user: User;
}

@Controller('tunnels')
export class TunnelsController {
  constructor(private readonly tunnelsService: TunnelsService) {}

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
