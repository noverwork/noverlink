import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBase64,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

// ─── Create Session ────────────────────────────────────────────

export class CreateSessionDto {
  @IsString()
  @IsNotEmpty()
  user_id!: string;

  @IsString()
  @IsNotEmpty()
  subdomain!: string;

  @IsInt()
  @Min(1)
  @Max(65535)
  local_port!: number;

  @IsString()
  @IsOptional()
  client_ip?: string;

  @IsString()
  @IsOptional()
  client_version?: string;
}

export interface CreateSessionResponse {
  session_id: string;
}

// ─── Close Session ─────────────────────────────────────────────

export class CloseSessionDto {
  @IsInt()
  @Min(0)
  bytes_in!: number;

  @IsInt()
  @Min(0)
  bytes_out!: number;
}

// ─── HTTP Request Batch ────────────────────────────────────────

export class HttpRequestDto {
  @IsString()
  @IsNotEmpty()
  method!: string;

  @IsString()
  path!: string;

  @IsString()
  @IsOptional()
  query_string?: string;

  /** Base64-encoded request headers JSON */
  @IsString()
  @IsBase64()
  request_headers!: string;

  /** Base64-encoded request body (truncated to 64KB) */
  @IsString()
  @IsBase64()
  @IsOptional()
  request_body?: string;

  @IsInt()
  @Min(100)
  @Max(599)
  response_status!: number;

  /** Base64-encoded response headers JSON */
  @IsString()
  @IsBase64()
  @IsOptional()
  response_headers?: string;

  /** Base64-encoded response body (truncated to 64KB) */
  @IsString()
  @IsBase64()
  @IsOptional()
  response_body?: string;

  @IsInt()
  @Min(0)
  duration_ms!: number;

  /** Unix timestamp in seconds */
  @IsInt()
  timestamp!: number;

  /** Original request size before truncation */
  @IsInt()
  @Min(0)
  @IsOptional()
  original_request_size?: number;

  /** Original response size before truncation */
  @IsInt()
  @Min(0)
  @IsOptional()
  original_response_size?: number;
}

export class HttpRequestBatchDto {
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMaxSize(100)
  @Type(() => HttpRequestDto)
  requests!: HttpRequestDto[];
}
