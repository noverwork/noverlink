import { Environment } from '@noverlink/shared';
import {
  IsBoolean,
  IsBooleanString,
  IsEnum,
  IsIP,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

import { Transform } from 'class-transformer';
import { EnvField } from './env.constant';

export class AppEnvSchema {
  @IsEnum(Environment)
  [EnvField.NodeEnv]!: Environment;

  @IsOptional()
  @IsString()
  [EnvField.LogLevel]?: string;

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
}
