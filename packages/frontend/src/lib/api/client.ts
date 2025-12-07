import { env } from '../env';

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

// Token management callbacks - set by auth-store to avoid circular deps
let getRefreshToken: (() => string | null) | null = null;
let onTokensRefreshed: ((accessToken: string, refreshToken: string) => void) | null = null;
let onAuthFailed: (() => void) | null = null;

export function setTokenCallbacks(callbacks: {
  getRefreshToken: () => string | null;
  onTokensRefreshed: (accessToken: string, refreshToken: string) => void;
  onAuthFailed: () => void;
}): void {
  getRefreshToken = callbacks.getRefreshToken;
  onTokensRefreshed = callbacks.onTokensRefreshed;
  onAuthFailed = callbacks.onAuthFailed;
}

export class ApiClient {
  private baseUrl: string;
  private accessToken: string | null = null;
  private refreshPromise: Promise<boolean> | null = null;

  constructor(baseUrl: string = env.apiUrl) {
    this.baseUrl = baseUrl;
  }

  setAccessToken(token: string | null): void {
    this.accessToken = token;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  private async refreshTokens(): Promise<boolean> {
    // If already refreshing, wait for that to complete
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.doRefresh();
    const result = await this.refreshPromise;
    this.refreshPromise = null;
    return result;
  }

  private async doRefresh(): Promise<boolean> {
    const refreshToken = getRefreshToken?.();
    if (!refreshToken) {
      return false;
    }

    try {
      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      this.accessToken = data.accessToken;
      onTokensRefreshed?.(data.accessToken, data.refreshToken);
      return true;
    } catch {
      return false;
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    isRetry = false
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.accessToken) {
      (headers as Record<string, string>)['Authorization'] =
        `Bearer ${this.accessToken}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    // Handle 401 - try to refresh token once
    if (response.status === 401 && !isRetry && !endpoint.includes('/auth/refresh')) {
      const refreshed = await this.refreshTokens();
      if (refreshed) {
        // Retry the original request with new token
        return this.request<T>(endpoint, options, true);
      }
      // Refresh failed - clear auth state
      onAuthFailed?.();
    }

    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({
        message: 'An unknown error occurred',
        statusCode: response.status,
      }));
      throw error;
    }

    return response.json();
  }

  get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Singleton instance
export const apiClient = new ApiClient();
