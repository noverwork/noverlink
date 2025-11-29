import { IsNotEmpty, IsString } from 'class-validator';

export class DevicePollDto {
  @IsString()
  @IsNotEmpty()
  device_code!: string;
}

// Response types (not DTOs, but exported here for convenience)
export interface DeviceCodeResponse {
  device_code: string;
  user_code: string;
  verification_uri: string;
  expires_in: number;
  interval: number;
}

export interface DevicePollSuccessResponse {
  auth_token: string;
}

export interface DevicePollPendingResponse {
  error: 'authorization_pending' | 'slow_down' | 'expired_token' | 'access_denied';
}

export type DevicePollResponse = DevicePollSuccessResponse | DevicePollPendingResponse;
