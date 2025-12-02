import { apiClient } from './client';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface TunnelSession {
  id: string;
  subdomain: string;
  publicUrl: string;
  localPort: number;
  status: 'active' | 'closed';
  connectedAt: string;
  disconnectedAt: string | null;
  bytesIn: string;
  bytesOut: string;
  clientIp: string | null;
  clientVersion?: string;
  requestCount?: number;
}

export interface TunnelLog {
  id: string;
  method: string;
  path: string;
  queryString: string | null;
  status: number | null;
  durationMs: number | null;
  timestamp: string;
}

export interface TunnelStats {
  activeSessions: number;
  totalRequests: number;
  bandwidthMb: number;
  tunnelMinutes: number;
}

export interface ListSessionsResponse {
  sessions: TunnelSession[];
  hasMore: boolean;
  nextCursor: string | null;
}

export interface ListLogsResponse {
  logs: TunnelLog[];
  hasMore: boolean;
  nextCursor: string | null;
}

export interface ListSessionsParams {
  status?: 'active' | 'closed';
  cursor?: string;
  limit?: number;
}

export interface ListLogsParams {
  cursor?: string;
  limit?: number;
  method?: string;
}

// ─── API ─────────────────────────────────────────────────────────────────────

export const tunnelsApi = {
  listSessions(params: ListSessionsParams = {}): Promise<ListSessionsResponse> {
    const searchParams = new URLSearchParams();
    if (params.status) searchParams.set('status', params.status);
    if (params.cursor) searchParams.set('cursor', params.cursor);
    if (params.limit) searchParams.set('limit', String(params.limit));

    const query = searchParams.toString();
    const queryString = query ? `?${query}` : '';
    return apiClient.get<ListSessionsResponse>(`/tunnels/sessions${queryString}`);
  },

  getSession(sessionId: string): Promise<TunnelSession> {
    return apiClient.get<TunnelSession>(`/tunnels/sessions/${sessionId}`);
  },

  getSessionLogs(
    sessionId: string,
    params: ListLogsParams = {}
  ): Promise<ListLogsResponse> {
    const searchParams = new URLSearchParams();
    if (params.cursor) searchParams.set('cursor', params.cursor);
    if (params.limit) searchParams.set('limit', String(params.limit));
    if (params.method) searchParams.set('method', params.method);

    const query = searchParams.toString();
    const queryString = query ? `?${query}` : '';
    return apiClient.get<ListLogsResponse>(`/tunnels/sessions/${sessionId}/logs${queryString}`);
  },

  getStats(): Promise<TunnelStats> {
    return apiClient.get<TunnelStats>('/tunnels/stats');
  },
};
