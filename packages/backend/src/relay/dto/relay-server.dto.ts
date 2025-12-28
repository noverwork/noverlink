import { RelayStatus } from '@noverlink/backend-shared';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

// ─── Register Relay ─────────────────────────────────────────────

export class RegisterRelayDto {
  @IsInt()
  @Min(1)
  @Max(65535)
  ws_port!: number;

  @IsInt()
  @Min(1)
  @Max(65535)
  http_port!: number;

  @IsString()
  @IsNotEmpty()
  base_domain!: string;

  @IsString()
  @IsOptional()
  ip_address?: string;

  @IsString()
  @IsOptional()
  version?: string;
}

export interface RegisterRelayResponse {
  relay_id: string;
  status: RelayStatus;
}

// ─── Heartbeat ──────────────────────────────────────────────────

export class HeartbeatDto {
  @IsInt()
  @Min(0)
  active_sessions!: number;
}

export interface HeartbeatResponse {
  status: RelayStatus;
}
