import { env } from '../env';
import { apiClient } from './client';

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  plan: 'free' | 'pro' | 'enterprise';
  maxTunnels: number;
  maxBandwidthMb: number;
  isActive: boolean;
  createdAt: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export const authApi = {
  register(data: RegisterDto): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/register', data);
  },

  login(data: LoginDto): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/login', data);
  },

  refresh(refreshToken: string): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/refresh', { refreshToken });
  },

  getProfile(): Promise<UserProfile> {
    return apiClient.get<UserProfile>('/auth/me');
  },

  // OAuth URLs - redirect user to these
  getGoogleAuthUrl(): string {
    return `${env.apiUrl}/auth/google`;
  },

  getGithubAuthUrl(): string {
    return `${env.apiUrl}/auth/github`;
  },

  // Device code flow (CLI authentication)
  approveDeviceCode(userCode: string): Promise<{ success: boolean }> {
    return apiClient.post<{ success: boolean }>('/auth/device/approve', {
      user_code: userCode,
    });
  },

  denyDeviceCode(userCode: string): Promise<{ success: boolean }> {
    return apiClient.post<{ success: boolean }>('/auth/device/deny', {
      user_code: userCode,
    });
  },
};
