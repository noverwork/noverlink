import { Environment } from '@noverlink/shared';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsIP,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';

import { EnvField } from './env.constant';

export class AppEnvSchema {
  @IsEnum(Environment)
  [EnvField.NodeEnv]!: Environment;

  @IsString()
  [EnvField.LogLevel]!: string;

  @IsIP()
  [EnvField.AppBind]!: string;

  @IsNumber()
  @Max(65535)
  @Min(1001)
  [EnvField.AppPort]!: number;

  @IsString()
  [EnvField.DBClientUrl]!: string;

  @IsBoolean()
  @Transform(({ key, obj }) => {
    return obj[key] === 'true';
  })
  [EnvField.DBDebug]!: boolean;

  // JWT Configuration
  @IsString()
  @MinLength(32)
  [EnvField.JwtSecret]!: string;

  @IsString()
  [EnvField.JwtExpiresIn]!: string;

  @IsString()
  @MinLength(32)
  [EnvField.JwtRefreshSecret]!: string;

  @IsString()
  [EnvField.JwtRefreshExpiresIn]!: string;

  // OAuth - Google (optional for local dev)
  @IsOptional()
  @IsString()
  [EnvField.GoogleClientId]?: string;

  @IsOptional()
  @IsString()
  [EnvField.GoogleClientSecret]?: string;

  @IsOptional()
  @ValidateIf((o) => o[EnvField.GoogleCallbackUrl]?.length > 0)
  @IsUrl({ require_tld: false })
  [EnvField.GoogleCallbackUrl]?: string;

  // OAuth - GitHub (optional for local dev)
  @IsOptional()
  @IsString()
  [EnvField.GithubClientId]?: string;

  @IsOptional()
  @IsString()
  [EnvField.GithubClientSecret]?: string;

  @IsOptional()
  @ValidateIf((o) => o[EnvField.GithubCallbackUrl]?.length > 0)
  @IsUrl({ require_tld: false })
  [EnvField.GithubCallbackUrl]?: string;

  // Frontend URL for OAuth redirects
  @IsUrl({ require_tld: false })
  [EnvField.FrontendUrl]!: string;

  // Tunnel/Relay
  @IsString()
  @MinLength(16)
  [EnvField.TicketSecret]!: string;

  @IsUrl({ require_tld: false, protocols: ['ws', 'wss'] })
  [EnvField.RelayUrl]!: string;

  @IsString()
  @MinLength(16)
  [EnvField.RelaySecret]!: string;

  // Polar.sh (optional for local dev)
  @IsOptional()
  @ValidateIf((o) => o[EnvField.PolarWebhookSecret]?.length > 0)
  @IsString()
  @MinLength(16)
  [EnvField.PolarWebhookSecret]?: string;
}
