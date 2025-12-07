'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import type { ApiError, AuthResponse, LoginDto, RegisterDto, UpdateProfileDto, UserProfile } from '../api';
import { authApi } from '../api';
import { authStore } from '../auth-store';

export const AUTH_QUERY_KEY = ['auth', 'profile'];

function handleAuthSuccess(response: AuthResponse): void {
  authStore.setTokens(response.accessToken, response.refreshToken);
}

export function useLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation<AuthResponse, ApiError, LoginDto>({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      handleAuthSuccess(data);
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
      router.push('/dashboard');
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation<AuthResponse, ApiError, RegisterDto>({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      handleAuthSuccess(data);
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
      router.push('/dashboard');
    },
  });
}

export function useProfile() {
  return useQuery<UserProfile, ApiError>({
    queryKey: AUTH_QUERY_KEY,
    queryFn: authApi.getProfile,
    enabled: authStore.isAuthenticated(),
    retry: false,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation<UserProfile, ApiError, UpdateProfileDto>({
    mutationFn: authApi.updateProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(AUTH_QUERY_KEY, data);
    },
  });
}

export function useRefreshToken() {
  const queryClient = useQueryClient();

  return useMutation<AuthResponse, ApiError, void>({
    mutationFn: async () => {
      const refreshToken = authStore.getRefreshToken();
      if (!refreshToken) {
        throw { message: 'No refresh token', statusCode: 401 };
      }
      return authApi.refresh(refreshToken);
    },
    onSuccess: (data) => {
      handleAuthSuccess(data);
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
    },
    onError: () => {
      authStore.clearTokens();
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return () => {
    authStore.clearTokens();
    queryClient.clear();
    router.push('/login');
  };
}
