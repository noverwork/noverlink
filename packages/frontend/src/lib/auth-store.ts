import { apiClient } from './api';

const ACCESS_TOKEN_KEY = 'noverlink_access_token';
const REFRESH_TOKEN_KEY = 'noverlink_refresh_token';

export const authStore = {
  getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  setTokens(accessToken: string, refreshToken: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    apiClient.setAccessToken(accessToken);
  },

  clearTokens(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    apiClient.setAccessToken(null);
  },

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  },

  /**
   * Initialize auth state from localStorage
   * Call this on app load
   */
  init(): void {
    const token = this.getAccessToken();
    if (token) {
      apiClient.setAccessToken(token);
    }
  },
};
