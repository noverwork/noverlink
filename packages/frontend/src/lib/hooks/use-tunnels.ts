'use client';

import { useQuery } from '@tanstack/react-query';

import type {
  ApiError,
  ListLogsParams,
  ListLogsResponse,
  ListSessionsParams,
  ListSessionsResponse,
  TunnelSession,
  TunnelStats,
} from '../api';
import { tunnelsApi } from '../api';
import { authStore } from '../auth-store';

export const SESSIONS_QUERY_KEY = ['tunnels', 'sessions'];
export const STATS_QUERY_KEY = ['tunnels', 'stats'];

export function useSessions(params: ListSessionsParams = {}) {
  return useQuery<ListSessionsResponse, ApiError>({
    queryKey: [...SESSIONS_QUERY_KEY, params],
    queryFn: () => tunnelsApi.listSessions(params),
    enabled: authStore.isAuthenticated(),
    refetchInterval: 5000, // Poll every 5 seconds for live updates
  });
}

export function useSession(sessionId: string) {
  return useQuery<TunnelSession, ApiError>({
    queryKey: [...SESSIONS_QUERY_KEY, sessionId],
    queryFn: () => tunnelsApi.getSession(sessionId),
    enabled: authStore.isAuthenticated() && !!sessionId,
    refetchInterval: 5000,
  });
}

export function useSessionLogs(sessionId: string, params: ListLogsParams = {}) {
  return useQuery<ListLogsResponse, ApiError>({
    queryKey: [...SESSIONS_QUERY_KEY, sessionId, 'logs', params],
    queryFn: () => tunnelsApi.getSessionLogs(sessionId, params),
    enabled: authStore.isAuthenticated() && !!sessionId,
    refetchInterval: 3000, // Poll more frequently for logs
  });
}

export function useStats() {
  return useQuery<TunnelStats, ApiError>({
    queryKey: STATS_QUERY_KEY,
    queryFn: tunnelsApi.getStats,
    enabled: authStore.isAuthenticated(),
    refetchInterval: 10000, // Poll every 10 seconds
  });
}
